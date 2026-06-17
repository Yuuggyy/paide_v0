// API Admin — utilise la SERVICE ROLE KEY (bypass RLS total)
// VITE_SUPABASE_SERVICE_KEY doit être dans .env et dans Netlify env vars

import { createClient } from '@supabase/supabase-js';

// Client service_role — bypass complet de la RLS
// auth.persistSession: false obligatoire pour éviter que le client
// utilise la session de l'utilisateur connecté au lieu de la service_role
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ─────────────────────────────────────────────
// Créer un utilisateur Auth + mettre à jour son profil
// ─────────────────────────────────────────────
export const createUserWithLogin = async ({
  email, password, full_name, role,
  centre_id = null,
  coordination_id = null,
  sous_coordination_id = null,
}) => {

  // 1. Créer dans Auth (email_confirm: true = pas besoin de validation email)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (authError) return { error: authError };
  const userId = authData.user.id;

  // 2. Attendre un court instant que le trigger handle_new_user crée le profil
  await new Promise(r => setTimeout(r, 500));

  // 3. Mettre à jour le profil avec les vraies valeurs
  // Utiliser UPSERT pour garantir que le profil existe même si le trigger a échoué
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      full_name,
      role,
      centre_id,
      coordination_id,
      sous_coordination_id,
      email,
    }, { onConflict: 'id' });

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
// Supprimer tous les utilisateurs Auth liés à un centre
// À appeler AVANT de supprimer le centre
// ─────────────────────────────────────────────
export const deleteUsersOfCentre = async (centreId) => {
  const { data: profiles, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('centre_id', centreId);

  if (fetchError) return { error: fetchError };
  if (!profiles || profiles.length === 0) return { error: null };

  for (const p of profiles) {
    await supabaseAdmin.auth.admin.deleteUser(p.id);
  }

  return { error: null };
};

// ─────────────────────────────────────────────
// Réinitialiser le mot de passe
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
