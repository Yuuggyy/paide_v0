-- ============================================
-- PAIDE MANAGER V0 - SCHEMA SQL SUPABASE
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ROLES / NIVEAUX HIÉRARCHIQUES
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (name, label) VALUES
  ('national', 'Direction Nationale'),
  ('coordination', 'Coordination Provinciale'),
  ('sous_coordination', 'Sous-Coordination Provinciale'),
  ('centre', 'Admin Centre')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- DIRECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.directions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL REFERENCES public.roles(name),
  province TEXT,
  parent_id UUID REFERENCES public.directions(id),
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CENTRES
-- ============================================
CREATE TABLE IF NOT EXISTS public.centres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  lieu_affectation TEXT NOT NULL,
  province TEXT,
  adresse TEXT,
  telephone TEXT,
  email TEXT,
  direction_id UUID REFERENCES public.directions(id),
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  status TEXT DEFAULT 'actif' CHECK (status IN ('actif', 'inactif', 'suspendu')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
  -- Identification personnelle
  noms TEXT NOT NULL,
  sexe TEXT CHECK (sexe IN ('Masculin', 'Féminin')),
  email TEXT,
  adresse_electronique TEXT,
  -- Identification administrative
  matricule TEXT UNIQUE,
  grade TEXT,
  fonction TEXT,
  salaire NUMERIC(10,2) DEFAULT 0,
  prime NUMERIC(10,2) DEFAULT 0,
  date_embauche DATE,
  type_piece_identite TEXT,
  numero_piece_identite TEXT,
  status TEXT DEFAULT 'actif' CHECK (status IN ('actif', 'inactif', 'suspendu')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FICHIERS AGENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.fichiers_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  type_fichier TEXT NOT NULL,
  nom_fichier TEXT NOT NULL,
  url_fichier TEXT NOT NULL,
  format TEXT CHECK (format IN ('pdf', 'jpg', 'jpeg', 'png')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FILIERES
-- ============================================
CREATE TABLE IF NOT EXISTS public.filieres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'actif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RAPPORTS / RENSEIGNEMENTS AGENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.rapports_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  centre_id UUID NOT NULL REFERENCES public.centres(id),
  type_rapport TEXT NOT NULL CHECK (type_rapport IN ('retard', 'suspension', 'avertissement', 'felicitation', 'autre')),
  description TEXT,
  date_rapport DATE DEFAULT CURRENT_DATE,
  severite TEXT CHECK (severite IN ('faible', 'moyen', 'élevé')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CALENDRIER DES COURS
-- ============================================
CREATE TABLE IF NOT EXISTS public.calendrier_cours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
  filiere_id UUID REFERENCES public.filieres(id),
  titre TEXT NOT NULL,
  instructeur TEXT,
  jour_semaine TEXT CHECK (jour_semaine IN ('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche')),
  heure_debut TIME,
  heure_fin TIME,
  salle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROFILS UTILISATEURS
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT REFERENCES public.roles(name) DEFAULT 'centre',
  direction_id UUID REFERENCES public.directions(id),
  centre_id UUID REFERENCES public.centres(id),
  province TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_centres_updated BEFORE UPDATE ON public.centres FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_agents_updated BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_filieres_updated BEFORE UPDATE ON public.filieres FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_calendrier_updated BEFORE UPDATE ON public.calendrier_cours FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_directions_updated BEFORE UPDATE ON public.directions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
