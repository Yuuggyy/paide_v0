import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://neniholrngfuvbvhfprh.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getCurrentUser = () => supabase.auth.getUser();

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, directions(*), centres(*)')
    .eq('id', userId)
    .single();
  return { data, error };
};

// Change password
export const changePassword = (newPassword) =>
  supabase.auth.updateUser({ password: newPassword });
