import {
  supabase,
} from './supabase.service';

export async function adminLogin(
  email: string,
  password: string,
) {
  const {
    data,
    error,
  } =
    await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error(
      'Login failed',
    );
  }

  // CHECK ADMIN TABLE
  const {
    data: admin,
    error:
      adminError,
  } = await supabase
    .from(
      'admin_users',
    )
    .select('*')
    .eq(
      'auth_user_id',
      data.user.id,
    )
    .single();

  if (
    adminError ||
    !admin
  ) {
    throw new Error(
      'Unauthorized admin',
    );
  }

  if (!admin.active) {
    throw new Error(
      'Admin account disabled',
    );
  }

  return admin;
}

export async function adminLogout() {
  await supabase.auth.signOut();
}

export async function getCurrentAdmin() {
  const {
    data: sessionData,
  } =
    await supabase.auth.getSession();

  const session =
    sessionData.session;

  if (!session) {
    return null;
  }

  const {
    data: admin,
  } = await supabase
    .from(
      'admin_users',
    )
    .select('*')
    .eq(
      'auth_user_id',
      session.user.id,
    )
    .single();

  return admin;
}