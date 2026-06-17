-- Migration : champs supplémentaires fiche agent complète
-- Exécuter dans Supabase SQL Editor

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS telephone TEXT,
  ADD COLUMN IF NOT EXISTS date_naissance DATE,
  ADD COLUMN IF NOT EXISTS lieu_naissance TEXT,
  ADD COLUMN IF NOT EXISTS nationalite TEXT DEFAULT 'Congo (RDC)',
  ADD COLUMN IF NOT EXISTS niveau_etude TEXT,
  ADD COLUMN IF NOT EXISTS specialite TEXT,
  ADD COLUMN IF NOT EXISTS annees_experience INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nom_urgence TEXT,
  ADD COLUMN IF NOT EXISTS tel_urgence TEXT;

-- Ajouter le type 'diplome' aux fichiers agents si pas encore là
ALTER TABLE public.fichiers_agents
  DROP CONSTRAINT IF EXISTS fichiers_agents_format_check;

ALTER TABLE public.fichiers_agents
  ADD CONSTRAINT fichiers_agents_format_check
  CHECK (format IN ('pdf', 'jpg', 'jpeg', 'png'));
