// Base de données simple avec stockage en mémoire (pour Vercel)
// Cette solution utilise une variable globale pour stocker les données
// En production, on utiliserait plutôt Vercel KV ou Supabase

let kmlData = null;

export function getKmlFile() {
  return kmlData;
}

export function saveKmlFile(data) {
  kmlData = {
    ...data,
    updated_at: new Date().toISOString()
  };
  return true;
}

export function deleteKmlFile() {
  kmlData = null;
  return true;
}

// Note: Cette solution ne persiste pas entre les redémarrages de Vercel
// Pour une vraie persistance, utilisez Vercel KV ou Supabase
