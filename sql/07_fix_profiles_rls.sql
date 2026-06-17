-- ============================================
-- PAIDE V0 - FIX: Profils orphelins sans centre_id
-- À exécuter dans Supabase > SQL Editor
-- ============================================

-- 1. Vérifier les profils sans centre_id avec rôle 'centre'
SELECT id, full_name, role, centre_id, email
FROM public.profiles
WHERE role = 'centre' AND centre_id IS NULL;

-- 2. Permettre au service_role de mettre à jour tous les profils
-- (la policy actuelle bloque si auth.uid() != id)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid() OR get_user_role() = 'national'
  );

-- 3. Permettre au service_role d'insérer/updater via upsert
DROP POLICY IF EXISTS "profiles_insert_national" ON public.profiles;

CREATE POLICY "profiles_insert_national" ON public.profiles
  FOR INSERT WITH CHECK (
    get_user_role() = 'national' OR auth.uid() = id OR auth.uid() IS NULL
  );

-- 4. Vérifier l'état final
SELECT id, full_name, role, centre_id
FROM public.profiles
ORDER BY created_at DESC
LIMIT 20;
