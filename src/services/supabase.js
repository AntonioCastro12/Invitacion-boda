import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isDemoMode = import.meta.env.VITE_DEMO_MODE !== "false" && !isSupabaseConfigured;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

export function requireSupabase() {
  if (!supabase) throw new Error("Supabase no está configurado. Revisa las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
  return supabase;
}
