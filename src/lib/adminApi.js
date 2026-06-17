// API Admin — SERVICE ROLE KEY (bypass RLS total)
// VITE_SUPABASE_SERVICE_KEY dans .env et Netlify env vars

import { createClient } from '@supabase/supabase-js';

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
// Créer un utilisateur Auth + profil complet
// Le trigger handle_new_user lit les metadata et remplit profiles automatiquement
// ─────────────────────────────────────────────
export const createUserWithLogin = async ({
  email, password, full_name, role,
  centre_id = null,
  coordination_id = null,
  sous_coordination_id = null,
}) => {

  // Passer TOUTES les infos dans user_metadata
  // Le trigger Supabase les lit et les écrit dans profiles directement
  const metadata = {
    full_name,
    role,
    ...(centre_id            && { centre_id }),
    ...(coordination_id      && { coordination_id }),
    ...(sous_coordination_id && { sous_coordination_id }),
  };

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (authError) return { error: authError };

  // Le trigger a déjà créé le profil avec les bonnes valeurs
  // On fait quand même un upsert de sécurité pour garantir la cohérence
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email,
      full_name,
      role,
      centre_id:            centre_id            || null,
      coordination_id:      coordination_id      || null,
      sous_coordination_id: sous_coordination_id || null,
    }, { onConflict: 'id' });

  if (profileError) return { error: profileError };
  return { data: { id: authData.user.id, email } };
};

// ─────────────────────────────────────────────
// Supprimer un utilisateur Auth
// ─────────────────────────────────────────────
export const deleteUserAuth = async (userId) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  return { error };
};

// ─────────────────────────────────────────────
// Supprimer tous les utilisateurs Auth liés à un centre
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
