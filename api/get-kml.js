import { getDatabase } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const db = getDatabase();
    
    // Récupérer le fichier KML depuis la base de données
    const kmlFile = db.prepare('SELECT * FROM kml_files WHERE name = ? ORDER BY updated_at DESC LIMIT 1').get('members.kml');
    
    if (kmlFile) {
      res.status(200).json({
        success: true,
        data: {
          id: kmlFile.id,
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
        message: 'Aucun fichier KML trouvé dans la base de données'
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
