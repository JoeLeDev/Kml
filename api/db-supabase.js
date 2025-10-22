// Base de données alternative avec Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

function getSupabase() {
  if (!supabase && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export async function getKmlFile() {
  try {
    const client = getSupabase();
    if (!client) {
      console.error('Supabase non configuré');
      return null;
    }

    const { data, error } = await client
      .from('kml_files')
      .select('*')
      .eq('name', 'members.kml')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du fichier KML:', error);
    return null;
  }
}

export async function saveKmlFile(kmlData) {
  try {
    const client = getSupabase();
    if (!client) {
      console.error('Supabase non configuré');
      return false;
    }

    const { error } = await client
      .from('kml_files')
      .upsert({
        name: 'members.kml',
        content: kmlData.content,
        points: kmlData.points,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier KML:', error);
    return false;
  }
}

export async function deleteKmlFile() {
  try {
    const client = getSupabase();
    if (!client) {
      console.error('Supabase non configuré');
      return false;
    }

    const { error } = await client
      .from('kml_files')
      .delete()
      .eq('name', 'members.kml');

    if (error) {
      console.error('Erreur Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier KML:', error);
    return false;
  }
}
