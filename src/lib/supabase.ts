import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// Read connection details from environment variables (EXPO_PUBLIC_* are safe to
// expose in the client). Falls back to the project's publishable values so the
// app keeps working even before you create a local .env file.
// NOTE: the anon/"publishable" key is PUBLIC by design (like a Stripe publishable
// key). Your data is protected by Row Level Security on the database, not by
// hiding this key. See .env.example to override these per environment.
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://dlyqfcfagmameiwotubb.supabase.co'
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_5bYkzQdZRJ9wZzdno492rA_eiTQ7NaC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // 👈 This prevents the fatal URL parsing crash
  },
})
