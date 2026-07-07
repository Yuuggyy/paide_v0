-- ============================================
-- PAIDE V0 — Hiérarchie Coordination > Sous-Coordination > Centre
-- Exécuter dans Supabase → SQL Editor (après tous les scripts précédents)
-- ============================================

-- 1) Lien centre -> sous-coordination (tous les centres passent par une sous-coordination)
ALTER TABLE public.centres
  ADD COLUMN IF NOT EXISTS sous_coordination_id UUID REFERENCES public.sous_coordinations(id) ON DELETE SET NULL;

-- 2) Fonctions helper pour la RLS
CREATE OR REPLACE FUNCTION get_user_coordination_id()
RETURNS UUID AS $$
  SELECT coordination_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_sous_coordination_id()
RETURNS UUID AS $$
  SELECT sous_coordination_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 3) RLS centres — chacun ne voit que son périmètre
DROP POLICY IF EXISTS "centres_select_all" ON public.centres;
DROP POLICY IF EXISTS "centres_select_scoped" ON public.centres;
CREATE POLICY "centres_select_scoped" ON public.centres FOR SELECT USING (
  get_user_role() = 'national'
  OR (get_user_role() = 'centre' AND id = get_user_centre_id())
  OR (get_user_role() = 'sous_coordination' AND sous_coordination_id = get_user_sous_coordination_id())
  OR (get_user_role() = 'coordination' AND sous_coordination_id IN (
        SELECT id FROM public.sous_coordinations WHERE coordination_id = get_user_coordination_id()
      ))
);

-- 4) RLS agents — même logique via le centre
DROP POLICY IF EXISTS "agents_select" ON public.agents;
DROP POLICY IF EXISTS "agents_select_scoped" ON public.agents;
CREATE POLICY "agents_select_scoped" ON public.agents FOR SELECT USING (
  get_user_role() = 'national'
  OR (get_user_role() = 'centre' AND centre_id = get_user_centre_id())
  OR (get_user_role() = 'sous_coordination' AND EXISTS (
        SELECT 1 FROM public.centres c
        WHERE c.id = agents.centre_id AND c.sous_coordination_id = get_user_sous_coordination_id()
      ))
  OR (get_user_role() = 'coordination' AND EXISTS (
        SELECT 1 FROM public.centres c
        JOIN public.sous_coordinations sc ON sc.id = c.sous_coordination_id
        WHERE c.id = agents.centre_id AND sc.coordination_id = get_user_coordination_id()
      ))
);

-- Les policies insert/update/delete des agents restent inchangées
-- (national + admin du centre concerné uniquement — coordination et sous-coordination restent en lecture seule).

-- NOTE IMPORTANTE :
-- Les centres déjà existants ont sous_coordination_id = NULL tant qu'ils ne sont pas
-- rattachés manuellement. Tant qu'un centre n'a pas de sous-coordination assignée,
-- il n'apparaîtra pour aucun profil "coordination" ou "sous_coordination" (seul le
-- national le voit). Va dans Centres → Modifier pour assigner chaque centre existant
-- à sa sous-coordination.
