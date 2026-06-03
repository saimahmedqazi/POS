import {
  supabase,
} from './supabase';

function normalizePhone(
  phone: string,
) {
  return phone.replace(
    /\D/g,
    '',
  );
}

export async function signInRetailer(
  phone: string,
  password: string,
) {
  const normalizedPhone =
    normalizePhone(
      phone,
    );

  const email =
    `${normalizedPhone}@retailer.local`;

  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword(
    {
      email,
      password,
    },
  );

  if (error) {
    throw error;
  }

  const {
    data: retailer,
    error: retailerError,
  } = await supabase
    .from(
      'retailers',
    )
    .select(
      'id, disabled'
    )
    .eq(
      'auth_user_id',
      data.user.id,
    )
    .single();

  if (
    retailerError ||
    !retailer
  ) {
    await supabase.auth.signOut();

    throw new Error(
      'Retailer account not found',
    );
  }

  if (
    retailer.disabled
  ) {
    await supabase.auth.signOut();

    throw new Error(
      'Retailer account disabled',
    );
  }

  return data;
}

export async function signOutRetailer() {
  await supabase.auth.signOut();
}

export async function getCurrentSession() {
  const {
    data,
  } = await supabase.auth.getSession();

  return data.session;
}