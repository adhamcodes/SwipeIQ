import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dlyqfcfagmameiwotubb.supabase.co'
const supabaseAnonKey = 'sb_publishable_5bYkzQdZRJ9wZzdno492rA_eiTQ7NaC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // 👈 This prevents the fatal URL parsing crash
  },
})