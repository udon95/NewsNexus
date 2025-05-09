require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true, //  Ensure session persistence
      autoRefreshToken: true, //  Automatically refresh expired tokens
      detectSessionInUrl: true, //  Fix OAuth-related session issues
    },
  }
);

module.exports = supabase;
