import { getDatabase } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const db = getDatabase();
    
    // Supprimer le fichier de la base de données
    const result = db.prepare('DELETE FROM kml_files WHERE name = ?').run('members.kml');
    
    if (result.changes > 0) {
      console.log('Fichier KML supprimé de la base de données');
      
      res.status(200).json({
        success: true,
        message: 'Fichier KML supprimé avec succès',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        error: 'Fichier KML non trouvé',
        message: 'Aucun fichier à supprimer'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la suppression du fichier KML:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du fichier',
      message: error.message
    });
  }
}
