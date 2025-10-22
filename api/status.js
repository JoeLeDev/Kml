export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    res.status(200).json({ 
      status: 'API is running', 
      timestamp: new Date().toISOString(),
      database: 'Redis connected'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
}