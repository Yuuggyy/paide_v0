-- ============================================
-- PAIDE V0 - FIX DÉFINITIF : Trigger handle_new_user
-- Ce trigger lit les metadata du compte Auth pour remplir
-- automatiquement role, centre_id, full_name dans profiles
-- À exécuter UNE SEULE FOIS dans Supabase > SQL Editor
-- ============================================

-- 1. Réécrire le trigger pour lire TOUTES les metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    centre_id,
    coordination_id,
    sous_coordination_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'centre'),
    NULLIF(NEW.raw_user_meta_data->>'centre_id', '')::UUID,
    NULLIF(NEW.raw_user_meta_data->>'coordination_id', '')::UUID,
    NULLIF(NEW.raw_user_meta_data->>'sous_coordination_id', '')::UUID
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name            = EXCLUDED.full_name,
    role                 = EXCLUDED.role,
    centre_id            = EXCLUDED.centre_id,
    coordination_id      = EXCLUDED.coordination_id,
    sous_coordination_id = EXCLUDED.sous_coordination_id,
    email                = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Ajouter les colonnes manquantes si elles n'existent pas encore
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coordination_id UUID REFERENCES public.directions(id),
  ADD COLUMN IF NOT EXISTS sous_coordination_id UUID REFERENCES public.directions(id);

-- 4. Corriger les profils existants avec centre_id NULL
-- (met à jour les profils qui ont le centre_id dans auth.users metadata)
UPDATE public.profiles p
SET
  centre_id = (
    SELECT (raw_user_meta_data->>'centre_id')::UUID
    FROM auth.users u
    WHERE u.id = p.id
      AND raw_user_meta_data->>'centre_id' IS NOT NULL
      AND raw_user_meta_data->>'centre_id' != ''
  )
WHERE p.role = 'centre' AND p.centre_id IS NULL;

-- 5. Vérification finale
SELECT id, email, role, centre_id, full_name
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
