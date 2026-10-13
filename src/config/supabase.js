const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Faltan credenciales de Supabase en las variables de entorno (.env)');
    }

    supabaseClient = createClient(url, key);
    console.log('[Supabase] Cliente inicializado correctamente');
  }
  return supabaseClient;
};

module.exports = { getSupabaseClient };