export default async function handler(req, res) {
  try {
    // Vérifier que l'API fonctionne
    res.status(200).json({
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
