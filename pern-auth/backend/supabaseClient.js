const { createClient } = require("@supabase/supabase-js");
require("dotenv").config(); // Load environment variables from .env file

const supabaseUrl = "https://ngfysnytrokkfttepllq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZnlzbnl0cm9ra2Z0dGVwbGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTU5MDQsImV4cCI6MjA1NzE3MTkwNH0.xXYJPYjMf7k3tYJeNJau4iMr8rB8E7FWUhJs3ybHTbw";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
