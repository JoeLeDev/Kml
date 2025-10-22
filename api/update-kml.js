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

    // Log de l'opération
    console.log(`Fichier KML reçu: ${placemarks} points trouvés`);

    // Retourner les données pour que le client les sauvegarde
    res.status(200).json({
      success: true,
      message: 'Fichier KML traité avec succès',
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
