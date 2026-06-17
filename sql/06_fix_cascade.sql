-- ============================================
-- PAIDE V0 - FIX: Cascade delete sur rapports_agents
-- À exécuter dans Supabase > SQL Editor
-- ============================================

-- Supprimer l'ancienne contrainte
ALTER TABLE public.rapports_agents
  DROP CONSTRAINT IF EXISTS rapports_agents_centre_id_fkey;

-- Recréer avec ON DELETE CASCADE
ALTER TABLE public.rapports_agents
  ADD CONSTRAINT rapports_agents_centre_id_fkey
  FOREIGN KEY (centre_id)
  REFERENCES public.centres(id)
  ON DELETE CASCADE;

-- Vérification (optionnel)
SELECT conname, confdeltype
FROM pg_constraint
WHERE conname = 'rapports_agents_centre_id_fkey';
