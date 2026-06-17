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
// Si l'email existe déjà → on rattache simplement le profil existant au centre
export const createUserWithLogin = async ({ email, password, full_name, role, centre_id, coordination_id, sous_coordination_id }) => {

  let userId = null;

  // 1. Tenter de créer l'utilisateur dans Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role }
  });

  if (authError) {
    // Si l'email est déjà enregistré → récupérer l'utilisateur existant
    const isAlreadyExists =
      authError.message?.toLowerCase().includes('already been registered') ||
      authError.message?.toLowerCase().includes('already exists') ||
      authError.code === 'email_exists';

    if (isAlreadyExists) {
      // Chercher l'utilisateur existant par email dans les profiles
      const { data: existingProfile, error: searchError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (searchError || !existingProfile) {
        // Essayer via auth.admin.listUsers
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const existingUser = usersData?.users?.find(u => u.email === email);
        if (!existingUser) return { error: authError }; // vraie erreur
        userId = existingUser.id;
      } else {
        userId = existingProfile.id;
      }
    } else {
      // Autre erreur Auth — la remonter
      return { error: authError };
    }
  } else {
    userId = authData.user.id;
  }

  // 2. Mettre à jour le profil avec le rôle et les IDs
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name,
      role,
      centre_id:            centre_id            || null,
      coordination_id:      coordination_id      || null,
      sous_coordination_id: sous_coordination_id || null,
    })
    .eq('id', userId);

  if (profileError) return { error: profileError };

  return { data: { id: userId, email } };
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
