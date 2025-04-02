import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, //  Ensure session persistence
    autoRefreshToken: true, //  Automatically refresh expired tokens
    detectSessionInUrl: true, //  Fix OAuth-related session issues
  },
});

export default supabase;
