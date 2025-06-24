// Contenido para: lib/supabaseClient.ts
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Este será el User ID que tu aplicación usará por defecto.
// Podrías hacerlo configurable o incluso permitir que el usuario lo ingrese si es solo para uso personal.
// Por ahora, lo leeremos de una variable de entorno o usaremos uno fijo.
const APP_DEFAULT_USER_ID = process.env.NEXT_PUBLIC_APP_DEFAULT_USER_ID || "user_anaco_cachatina_01";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Make sure to set them in .env.local");
}

if (!APP_DEFAULT_USER_ID) {
  console.warn("APP_DEFAULT_USER_ID is not set. Using a generic ID. Consider setting NEXT_PUBLIC_APP_DEFAULT_USER_ID in .env.local");
}

// Configuración global para incluir el header X-App-User-Id
const supabaseOptions: SupabaseClientOptions<"public"> = {
  global: {
    headers: {
      'X-App-User-Id': APP_DEFAULT_USER_ID,
    },
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Exporta el DEFAULT_USER_ID para que pueda ser usado en la aplicación
export const getDefaultUserId = () => APP_DEFAULT_USER_ID;