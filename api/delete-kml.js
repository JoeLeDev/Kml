import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Supprimer le fichier de Vercel KV
    await kv.del('kml_file');
    
    console.log('Fichier KML supprimé de Vercel KV');
    
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
