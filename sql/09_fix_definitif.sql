-- ============================================
-- PAIDE V0 - FIX DÉFINITIF ET COMPLET
-- Exécuter dans Supabase > SQL Editor
-- ============================================

-- ÉTAPE 1 : Trigger infaillible qui lit les metadata Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, role,
    centre_id, coordination_id, sous_coordination_id
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
    email                = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ÉTAPE 2 : Ajouter colonnes manquantes si besoin
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coordination_id UUID,
  ADD COLUMN IF NOT EXISTS sous_coordination_id UUID;

-- ÉTAPE 3 : Corriger TOUS les profils existants
-- en lisant les metadata stockées dans auth.users
UPDATE public.profiles p
SET
  centre_id = NULLIF((u.raw_user_meta_data->>'centre_id'), '')::UUID,
  role      = COALESCE(u.raw_user_meta_data->>'role', p.role),
  full_name = COALESCE(u.raw_user_meta_data->>'full_name', p.full_name)
FROM auth.users u
WHERE u.id = p.id
  AND u.raw_user_meta_data->>'centre_id' IS NOT NULL
  AND u.raw_user_meta_data->>'centre_id' != '';

-- ÉTAPE 4 : Voir l'état de tous les profils
SELECT 
  p.id,
  p.email,
  p.role,
  p.centre_id,
  c.name AS nom_centre,
  p.full_name
FROM public.profiles p
LEFT JOIN public.centres c ON c.id = p.centre_id
ORDER BY p.created_at DESC;
