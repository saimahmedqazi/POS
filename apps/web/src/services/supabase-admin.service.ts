import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env
    .VITE_SUPABASE_URL;

const serviceRoleKey =
  import.meta.env
    .VITE_SUPABASE_SERVICE_ROLE_KEY;

if (
  !supabaseUrl ||
  !serviceRoleKey
) {
  throw new Error(
    'Missing Supabase admin environment variables',
  );
}

declare global {
  interface Window {
    __supabaseAdmin__?: SupabaseClient;
  }
}

export const supabaseAdmin =
  window.__supabaseAdmin__ ||
  createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession:
          false,

        autoRefreshToken:
          false,

        detectSessionInUrl:
          false,
      },
    },
  );

if (
  !window.__supabaseAdmin__
) {
  window.__supabaseAdmin__ =
    supabaseAdmin;
}