import {
  supabase,
} from './supabase.service';

type CreateRetailerPayload =
  {
    customerLocalId: string;

    businessName: string;

    phone: string;

    password: string;
  };

function normalizePhone(
  phone: string,
) {
  let normalized =
    phone.replace(
      /\D/g,
      '',
    );

  // 923XXXXXXXXX
  if (
    normalized.startsWith(
      '92',
    )
  ) {
    normalized =
      '0' +
      normalized.slice(2);
  }

  // 3XXXXXXXXX
  if (
    normalized.startsWith(
      '3',
    )
  ) {
    normalized =
      '0' + normalized;
  }

  return normalized;
}

function validatePhone(
  phone: string,
) {
  const normalized =
    normalizePhone(
      phone,
    );

  return /^03\d{9}$/.test(
    normalized,
  );
}
export async function createRetailerAccount(
  payload: CreateRetailerPayload,
) {
  const normalizedPhone =
    normalizePhone(
      payload.phone,
    );

  if (
    !validatePhone(
      normalizedPhone,
    )
  ) {
    throw new Error(
      'Invalid phone number',
    );
  }

  if (
    payload.password
      .trim()
      .length < 6
  ) {
    throw new Error(
      'Password must be at least 6 characters',
    );
  }

  const authEmail =
    `${normalizedPhone}@retailer.local`;

  // CHECK EXISTING RETAILER
  const {
    data: existingRetailer,
  } = await supabase
    .from(
      'retailers',
    )
    .select('id')
    .eq(
      'phone',
      normalizedPhone,
    )
    .maybeSingle();

  if (
    existingRetailer
  ) {
    throw new Error(
      'Retailer already exists for this phone number',
    );
  }

  // CREATE AUTH USER
  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.signUp(
      {
        email:
          authEmail,

        password:
          payload.password,
      },
    );

  if (authError) {
    throw authError;
  }

  if (
    !authData.user
  ) {
    throw new Error(
      'Failed creating retailer auth',
    );
  }

  // CREATE RETAILER RECORD
  const {
    data,
    error,
  } = await supabase
    .from(
      'retailers',
    )
    .insert({
      customer_local_id:
        payload.customerLocalId,

      auth_user_id:
        authData.user.id,

      business_name:
        payload.businessName,

      phone:
        normalizedPhone,

      active: true,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    retailerId:
      data.id,

    normalizedPhone,
  };
}