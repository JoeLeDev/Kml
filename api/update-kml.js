export default async function handler(req, res) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérifier que le fichier est présent
    if (!req.body || !req.body.kmlContent) {
      return res.status(400).json({ error: 'Aucun contenu KML fourni' });
    }

    // Pour Vercel, on ne peut pas écrire directement sur le système de fichiers
    // On va retourner les données pour que le client les sauvegarde
    const kmlContent = req.body.kmlContent;
    const placemarks = (kmlContent.match(/<Placemark>/g) || []).length;

    // Log de l'opération
    console.log(`Fichier KML reçu: ${placemarks} points trouvés`);

    res.status(200).json({
      success: true,
      message: 'Fichier KML reçu avec succès',
      points: placemarks,
      kmlContent: kmlContent,
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
