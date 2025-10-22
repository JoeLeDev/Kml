import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const kmlPath = path.join(process.cwd(), 'public', 'data', 'members.kml');
    
    if (!fs.existsSync(kmlPath)) {
      return res.status(200).json({
        points: 0,
        lastModified: 'Jamais',
        fileSize: '0 KB',
        exists: false
      });
    }

    const stats = fs.statSync(kmlPath);
    const kmlContent = fs.readFileSync(kmlPath, 'utf8');
    const points = (kmlContent.match(/<Placemark>/g) || []).length;

    // Formater la taille de fichier
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    res.status(200).json({
      points: points,
      lastModified: stats.mtime.toLocaleString('fr-FR'),
      fileSize: formatFileSize(stats.size),
      exists: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques',
      message: error.message
    });
  }
}
