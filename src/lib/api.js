import { supabase } from './supabaseClient';

// ==================== CENTRES ====================
export const getCentres = async () => {
  const { data, error } = await supabase
    .from('centres')
    .select('*')
    .order('name');
  return { data, error };
};

export const getCentreById = async (id) => {
  const { data, error } = await supabase
    .from('centres')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const createCentre = async (centre) => {
  const user = (await supabase.auth.getUser()).data.user;
  const profile = (await supabase.from('profiles').select('full_name').eq('id', user.id).single()).data;
  const { data, error } = await supabase
    .from('centres')
    .insert({ ...centre, created_by: user.id, created_by_name: profile?.full_name })
    .select()
    .single();
  return { data, error };
};

export const updateCentre = async (id, updates) => {
  const { data, error } = await supabase
    .from('centres')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteCentre = async (id) => {
  const { error } = await supabase.from('centres').delete().eq('id', id);
  return { error };
};

// ==================== AGENTS ====================
export const getAgentsByCentre = async (centreId) => {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('centre_id', centreId)
    .order('noms');
  return { data, error };
};

export const getAgentById = async (id) => {
  const { data, error } = await supabase
    .from('agents')
    .select('*, fichiers_agents(*)')
    .eq('id', id)
    .single();
  return { data, error };
};

export const createAgent = async (agent) => {
  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase
    .from('agents')
    .insert({ ...agent, created_by: user.id })
    .select()
    .single();
  return { data, error };
};

export const updateAgent = async (id, updates) => {
  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteAgent = async (id) => {
  const { error } = await supabase.from('agents').delete().eq('id', id);
  return { error };
};

// ==================== FICHIERS AGENTS ====================
export const uploadFichierAgent = async (agentId, file, typeFichier) => {
  const ext = file.name.split('.').pop().toLowerCase();
  const fileName = `${agentId}/${typeFichier}_${Date.now()}.${ext}`;
  const bucket = typeFichier === 'carte_service' ? 'cartes-service' : 'agents-files';

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
  if (uploadError) return { error: uploadError };

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('fichiers_agents')
    .insert({
      agent_id: agentId,
      type_fichier: typeFichier,
      nom_fichier: file.name,
      url_fichier: urlData.publicUrl,
      format: ext
    })
    .select()
    .single();
  return { data, error };
};

export const deleteFichierAgent = async (fichierId, urlFichier) => {
  const path = urlFichier.split('/').slice(-2).join('/');
  await supabase.storage.from('agents-files').remove([path]);
  const { error } = await supabase.from('fichiers_agents').delete().eq('id', fichierId);
  return { error };
};

// ==================== FILIERES ====================
export const getFilieresByCentre = async (centreId) => {
  const { data, error } = await supabase
    .from('filieres')
    .select('*')
    .eq('centre_id', centreId)
    .order('nom');
  return { data, error };
};

export const createFiliere = async (filiere) => {
  const { data, error } = await supabase
    .from('filieres')
    .insert(filiere)
    .select()
    .single();
  return { data, error };
};

export const updateFiliere = async (id, updates) => {
  const { data, error } = await supabase
    .from('filieres')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteFiliere = async (id) => {
  const { error } = await supabase.from('filieres').delete().eq('id', id);
  return { error };
};

// ==================== RAPPORTS ====================
export const getRapportsByCentre = async (centreId) => {
  const { data, error } = await supabase
    .from('rapports_agents')
    .select('*, agents(noms, matricule)')
    .eq('centre_id', centreId)
    .order('date_rapport', { ascending: false });
  return { data, error };
};

export const createRapport = async (rapport) => {
  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase
    .from('rapports_agents')
    .insert({ ...rapport, created_by: user.id })
    .select()
    .single();
  return { data, error };
};

// ==================== CALENDRIER ====================
export const getCalendrierByCentre = async (centreId) => {
  const { data, error } = await supabase
    .from('calendrier_cours')
    .select('*, filieres(nom)')
    .eq('centre_id', centreId)
    .order('jour_semaine');
  return { data, error };
};

export const createCours = async (cours) => {
  const { data, error } = await supabase
    .from('calendrier_cours')
    .insert(cours)
    .select()
    .single();
  return { data, error };
};

export const updateCours = async (id, updates) => {
  const { data, error } = await supabase
    .from('calendrier_cours')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteCours = async (id) => {
  const { error } = await supabase.from('calendrier_cours').delete().eq('id', id);
  return { error };
};
