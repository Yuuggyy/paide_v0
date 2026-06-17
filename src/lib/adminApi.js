// API Admin — utilise la SERVICE ROLE KEY (bypass RLS)
// VITE_SUPABASE_SERVICE_KEY doit être dans le .env

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY
);

// ─────────────────────────────────────────────
// Créer un utilisateur Auth + profil
// Retourne { data, error }
// ─────────────────────────────────────────────
export const createUserWithLogin = async ({
  email, password, full_name, role,
  centre_id = null,
  coordination_id = null,
  sous_coordination_id = null,
}) => {

  // 1. Créer dans Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (authError) return { error: authError };
  const userId = authData.user.id;

  // 2. Mettre à jour le profil
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ full_name, role, centre_id, coordination_id, sous_coordination_id })
    .eq('id', userId);

  if (profileError) return { error: profileError };
  return { data: { id: userId, email } };
};

// ─────────────────────────────────────────────
// Supprimer un utilisateur Auth par son id
// ─────────────────────────────────────────────
export const deleteUserAuth = async (userId) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  return { error };
};

// ─────────────────────────────────────────────
// Trouver et supprimer tous les utilisateurs Auth liés à un centre
// À appeler AVANT de supprimer le centre lui-même
// ─────────────────────────────────────────────
export const deleteUsersOfCentre = async (centreId) => {
  // Récupérer tous les profils liés à ce centre
  const { data: profiles, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('centre_id', centreId);

  if (fetchError) return { error: fetchError };
  if (!profiles || profiles.length === 0) return { error: null };

  // Supprimer chaque utilisateur Auth
  for (const p of profiles) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(p.id);
    if (error) {
      // On log mais on continue — le centre doit quand même être supprimé
      console.warn(`Impossible de supprimer l'utilisateur ${p.id} :`, error.message);
    }
  }

  return { error: null };
};

// ─────────────────────────────────────────────
// Réinitialiser le mot de passe d'un utilisateur
// ─────────────────────────────────────────────
export const resetUserPassword = async (userId, newPassword) => {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  return { error };
};

// ─────────────────────────────────────────────
// Lister tous les utilisateurs Auth
// ─────────────────────────────────────────────
export const listAllUsers = async () => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  return { data: data?.users || [], error };
};
