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