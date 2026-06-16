-- ============================================
-- PAIDE MANAGER V0 - SEED : Admin National
-- ============================================
-- IMPORTANT : Exécuter APRÈS avoir créé l'utilisateur admin@paide.com
-- dans Supabase Auth (Authentication > Users > Invite user)
-- avec le mot de passe : PaideNotre2026
-- Puis récupérer l'UUID de cet utilisateur et remplacer 'ADMIN_UUID_ICI'

-- Insérer le profil admin national
-- Remplacer 'ADMIN_UUID_ICI' par l'UUID réel de auth.users
/*
INSERT INTO public.profiles (id, full_name, role, email)
VALUES (
  'ADMIN_UUID_ICI',
  'Directeur National PAIDE',
  'national',
  'admin@paide.com'
)
ON CONFLICT (id) DO NOTHING;
*/

-- OU utiliser cette fonction pour créer automatiquement le profil
-- après inscription (à placer dans un trigger Supabase Auth)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'centre')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur la création d'utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE : Buckets pour les fichiers agents
-- ============================================
-- À exécuter dans le dashboard Supabase > Storage
-- Créer un bucket "agents-files" avec accès privé
-- Créer un bucket "cartes-service" avec accès privé
