export default function handler(req, res) {
  // Vérifier que c'est une requête GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Récupérer la clé API depuis les variables d'environnement
  const apiKey = process.env.YOUR_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Clé API non trouvée dans les variables d\'environnement' 
    });
  }

  // Retourner la clé API
  res.status(200).json({ apiKey });
}
