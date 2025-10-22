import { getDatabase } from './db.js';

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

    // Sauvegarder dans la base de données
    const db = getDatabase();
    
    // Vérifier s'il existe déjà un fichier
    const existing = db.prepare('SELECT id FROM kml_files WHERE name = ?').get(fileName || 'members.kml');
    
    if (existing) {
      // Mettre à jour le fichier existant
      db.prepare(`
        UPDATE kml_files 
        SET content = ?, points = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE name = ?
      `).run(kmlContent, placemarks, fileName || 'members.kml');
      
      console.log(`Fichier KML mis à jour dans la base de données: ${placemarks} points`);
    } else {
      // Créer un nouveau fichier
      db.prepare(`
        INSERT INTO kml_files (name, content, points) 
        VALUES (?, ?, ?)
      `).run(fileName || 'members.kml', kmlContent, placemarks);
      
      console.log(`Nouveau fichier KML créé dans la base de données: ${placemarks} points`);
    }

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
