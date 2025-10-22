import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer le fichier KML depuis Vercel KV
    const kmlFile = await kv.get('kml_file');
    
    if (kmlFile) {
      res.status(200).json({
        success: true,
        data: {
          name: kmlFile.name,
          content: kmlFile.content,
          points: kmlFile.points,
          createdAt: kmlFile.created_at,
          updatedAt: kmlFile.updated_at
        }
      });
    } else {
      res.status(404).json({
        error: 'Fichier KML non trouvé',
        message: 'Aucun fichier KML trouvé dans Vercel KV'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la récupération du fichier KML:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du fichier',
      message: error.message
    });
  }
}
