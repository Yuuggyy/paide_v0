// API Admin pour créer des utilisateurs avec login
// Nécessite la SERVICE ROLE KEY dans le .env
// VITE_SUPABASE_SERVICE_KEY=...

import { createClient } from '@supabase/supabase-js';

// Client admin (service role) — bypass RLS
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY
);

// Créer un utilisateur avec login + profil
export const createUserWithLogin = async ({ email, password, full_name, role, centre_id, coordination_id, sous_coordination_id }) => {
  // 1. Créer l'utilisateur dans Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // pas besoin de confirmation email
    user_metadata: { full_name, role }
  });

  if (authError) return { error: authError };

  // 2. Mettre à jour le profil avec le rôle et les IDs
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name,
      role,
      centre_id: centre_id || null,
      coordination_id: coordination_id || null,
      sous_coordination_id: sous_coordination_id || null,
    })
    .eq('id', authData.user.id);

  if (profileError) return { error: profileError };

  return { data: authData.user };
};

// Supprimer un utilisateur Auth
export const deleteUserAuth = async (userId) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  return { error };
};

// Réinitialiser le mot de passe d'un utilisateur
export const resetUserPassword = async (userId, newPassword) => {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });
  return { error };
};

// Lister tous les utilisateurs Auth
export const listAllUsers = async () => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  return { data: data?.users || [], error };
};
