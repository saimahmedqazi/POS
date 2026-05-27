import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env
    .VITE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env
    .VITE_SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseAnonKey
) {
  throw new Error(
    'Supabase environment variables missing',
  );
}

declare global {
  interface Window {
    __supabase__?: SupabaseClient;
  }
}

export const supabase =
  window.__supabase__ ||
  createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession:
          true,

        autoRefreshToken:
          true,

        detectSessionInUrl:
          false,
      },
    },
  );

if (
  !window.__supabase__
) {
  window.__supabase__ =
    supabase;
}