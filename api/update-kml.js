import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérifier que le contenu est présent
    if (!req.body) {
      return res.status(400).json({ error: 'Aucune donnée fournie' });
    }

    const { kmlContent, fileName } = req.body;

    if (!kmlContent) {
      return res.status(400).json({ error: 'Aucun contenu KML fourni' });
    }

    // Analyser le fichier pour compter les points
    const placemarks = (kmlContent.match(/<Placemark>/g) || []).length;

    // Sauvegarder dans Vercel KV
    const kmlData = {
      name: fileName || 'members.kml',
      content: kmlContent,
      points: placemarks,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set('kml_file', kmlData);
    
    console.log(`Fichier KML sauvegardé dans Vercel KV: ${placemarks} points`);

    // Retourner les données
    res.status(200).json({
      success: true,
      message: 'Fichier KML sauvegardé avec succès',
      points: placemarks,
      fileName: fileName || 'members.kml',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors du traitement du fichier KML:', error);
    res.status(500).json({
      error: 'Erreur lors du traitement du fichier',
      message: error.message
    });
  }
}
