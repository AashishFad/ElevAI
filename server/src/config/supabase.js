const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
      console.warn('[Supabase] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in environment variables.');
    }
    supabaseAdmin = createClient(
      env.supabaseUrl || 'https://placeholder.supabase.co',
      env.supabaseServiceRoleKey || 'placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return supabaseAdmin;
}

module.exports = {
  getSupabaseAdmin,
};
