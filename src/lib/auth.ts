import { supabase } from './supabase';

// 1. Create a brand new account
export async function signUpWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

// 2. Log into an existing account
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

// 3. Check if the user is already logged in when the app opens
export async function checkActiveSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ? true : false;
}

// 4. Log out of the account
export async function logOut() {
  await supabase.auth.signOut();
}