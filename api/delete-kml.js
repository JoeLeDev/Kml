import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const filePath = path.join(dataDir, 'members.kml');

    // Vérifier si le fichier existe
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Fichier KML non trouvé' });
      }
      throw error;
    }

    // Supprimer le fichier
    await fs.unlink(filePath);
    
    console.log('Fichier KML supprimé du serveur');

    res.status(200).json({
      success: true,
      message: 'Fichier KML supprimé avec succès',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du fichier KML:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du fichier',
      message: error.message
    });
  }
}
