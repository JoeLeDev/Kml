import { createClient } from 'redis';

let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await redisClient.connect();
  }
  return redisClient;
}

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Supprimer le fichier de Redis
    const client = await getRedisClient();
    await client.del('kml_file');
    
    console.log('Fichier KML supprimé de Redis');
    
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
