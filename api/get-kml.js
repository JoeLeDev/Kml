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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer le fichier KML depuis Redis
    const client = await getRedisClient();
    const kmlFileData = await client.get('kml_file');
    
    if (kmlFileData) {
      const kmlFile = JSON.parse(kmlFileData);
      res.status(200).json({
        success: true,
        data: {
          name: kmlFile.name,
          content: kmlFile.content,
          points: kmlFile.points,
          createdAt: kmlFile.created_at,
          updatedAt: kmlFile.updated_at
        }
      });
    } else {
      res.status(404).json({
        error: 'Fichier KML non trouvé',
        message: 'Aucun fichier KML trouvé dans Redis'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la récupération du fichier KML:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du fichier',
      message: error.message
    });
  }
}
