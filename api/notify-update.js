export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Ici, vous pourriez implémenter un système de notification en temps réel
    // Pour l'instant, on retourne juste un succès
    console.log('Notification de mise à jour envoyée');
    
    res.status(200).json({
      success: true,
      message: 'Notification envoyée',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de la notification',
      message: error.message
    });
  }
}
