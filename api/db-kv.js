// Base de données alternative avec Vercel KV (Redis)
import { kv } from '@vercel/kv';

export async function getKmlFile() {
  try {
    const data = await kv.get('kml_file');
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du fichier KML:', error);
    return null;
  }
}

export async function saveKmlFile(kmlData) {
  try {
    await kv.set('kml_file', kmlData);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier KML:', error);
    return false;
  }
}

export async function deleteKmlFile() {
  try {
    await kv.del('kml_file');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier KML:', error);
    return false;
  }
}
