-- ============================================
-- PAIDE V0 — Tables Coordinations
-- Exécuter après 01_schema.sql
-- ============================================

-- Table coordinations provinciales
CREATE TABLE IF NOT EXISTS public.coordinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  province TEXT,
  status TEXT DEFAULT 'actif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table sous-coordinations provinciales
CREATE TABLE IF NOT EXISTS public.sous_coordinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  zone TEXT,
  coordination_id UUID REFERENCES public.coordinations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'actif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter coordination_id et sous_coordination_id dans profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coordination_id UUID REFERENCES public.coordinations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sous_coordination_id UUID REFERENCES public.sous_coordinations(id) ON DELETE SET NULL;

-- RLS coordinations
ALTER TABLE public.coordinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sous_coordinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coord_select_all" ON public.coordinations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "coord_insert_national" ON public.coordinations FOR INSERT WITH CHECK (get_user_role() = 'national');
CREATE POLICY "coord_update_national" ON public.coordinations FOR UPDATE USING (get_user_role() = 'national');
CREATE POLICY "coord_delete_national" ON public.coordinations FOR DELETE USING (get_user_role() = 'national');

CREATE POLICY "sous_coord_select_all" ON public.sous_coordinations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "sous_coord_insert_national" ON public.sous_coordinations FOR INSERT WITH CHECK (get_user_role() = 'national');
CREATE POLICY "sous_coord_update_national" ON public.sous_coordinations FOR UPDATE USING (get_user_role() = 'national');
CREATE POLICY "sous_coord_delete_national" ON public.sous_coordinations FOR DELETE USING (get_user_role() = 'national');
