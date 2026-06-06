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
  console.warn(
    'Supabase environment variables missing. Cloud features will be disabled.',
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
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
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