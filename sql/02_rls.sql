-- ============================================
-- PAIDE MANAGER V0 - ROW LEVEL SECURITY
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichiers_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rapports_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendrier_cours ENABLE ROW LEVEL SECURITY;

-- Fonction helper : récupérer le rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Fonction helper : récupérer le centre_id de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_user_centre_id()
RETURNS UUID AS $$
  SELECT centre_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- POLICIES : PROFILES
-- ============================================
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid() OR get_user_role() = 'national');
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_national" ON public.profiles FOR INSERT WITH CHECK (get_user_role() = 'national' OR auth.uid() = id);

-- ============================================
-- POLICIES : DIRECTIONS
-- ============================================
CREATE POLICY "directions_select_all" ON public.directions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "directions_insert_national" ON public.directions FOR INSERT WITH CHECK (get_user_role() = 'national');
CREATE POLICY "directions_update_national" ON public.directions FOR UPDATE USING (get_user_role() = 'national');
CREATE POLICY "directions_delete_national" ON public.directions FOR DELETE USING (get_user_role() = 'national');

-- ============================================
-- POLICIES : CENTRES
-- ============================================
-- Tout utilisateur connecté peut voir les centres
CREATE POLICY "centres_select_all" ON public.centres FOR SELECT USING (auth.uid() IS NOT NULL);

-- Seule la direction nationale peut créer/modifier le lieu_affectation
CREATE POLICY "centres_insert_national" ON public.centres FOR INSERT WITH CHECK (get_user_role() = 'national');
CREATE POLICY "centres_update_national" ON public.centres FOR UPDATE USING (get_user_role() = 'national');
CREATE POLICY "centres_delete_national" ON public.centres FOR DELETE USING (get_user_role() = 'national');

-- ============================================
-- POLICIES : AGENTS
-- ============================================
-- Admin centre voit ses propres agents, national voit tout
CREATE POLICY "agents_select" ON public.agents FOR SELECT USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "agents_insert" ON public.agents FOR INSERT WITH CHECK (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "agents_update" ON public.agents FOR UPDATE USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "agents_delete" ON public.agents FOR DELETE USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);

-- ============================================
-- POLICIES : FICHIERS AGENTS
-- ============================================
CREATE POLICY "fichiers_select" ON public.fichiers_agents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.agents a WHERE a.id = agent_id AND (get_user_role() = 'national' OR a.centre_id = get_user_centre_id()))
);
CREATE POLICY "fichiers_insert" ON public.fichiers_agents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.agents a WHERE a.id = agent_id AND (get_user_role() = 'national' OR a.centre_id = get_user_centre_id()))
);
CREATE POLICY "fichiers_delete" ON public.fichiers_agents FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.agents a WHERE a.id = agent_id AND (get_user_role() = 'national' OR a.centre_id = get_user_centre_id()))
);

-- ============================================
-- POLICIES : FILIERES
-- ============================================
CREATE POLICY "filieres_select" ON public.filieres FOR SELECT USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "filieres_insert" ON public.filieres FOR INSERT WITH CHECK (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "filieres_update" ON public.filieres FOR UPDATE USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "filieres_delete" ON public.filieres FOR DELETE USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);

-- ============================================
-- POLICIES : RAPPORTS AGENTS
-- ============================================
CREATE POLICY "rapports_select" ON public.rapports_agents FOR SELECT USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "rapports_insert" ON public.rapports_agents FOR INSERT WITH CHECK (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "rapports_delete" ON public.rapports_agents FOR DELETE USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);

-- ============================================
-- POLICIES : CALENDRIER
-- ============================================
CREATE POLICY "calendrier_select" ON public.calendrier_cours FOR SELECT USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "calendrier_insert" ON public.calendrier_cours FOR INSERT WITH CHECK (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "calendrier_update" ON public.calendrier_cours FOR UPDATE USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
CREATE POLICY "calendrier_delete" ON public.calendrier_cours FOR DELETE USING (
  get_user_role() = 'national' OR centre_id = get_user_centre_id()
);
