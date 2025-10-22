import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérifier que le fichier est présent
    if (!req.body || !req.body.kmlFile) {
      return res.status(400).json({ error: 'Aucun fichier KML fourni' });
    }

    // Chemin vers le fichier KML
    const kmlPath = path.join(process.cwd(), 'public', 'data', 'members.kml');
    
    // Sauvegarder l'ancien fichier (backup)
    if (fs.existsSync(kmlPath)) {
      const backupPath = path.join(process.cwd(), 'public', 'data', `members.backup.${Date.now()}.kml`);
      fs.copyFileSync(kmlPath, backupPath);
    }

    // Écrire le nouveau fichier
    fs.writeFileSync(kmlPath, req.body.kmlFile);

    // Analyser le fichier pour compter les points
    const kmlText = req.body.kmlFile;
    const placemarks = (kmlText.match(/<Placemark>/g) || []).length;

    // Log de l'opération
    console.log(`Fichier KML mis à jour: ${placemarks} points trouvés`);

    res.status(200).json({
      success: true,
      message: 'Fichier KML mis à jour avec succès',
      points: placemarks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du fichier KML:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du fichier',
      message: error.message
    });
  }
}
