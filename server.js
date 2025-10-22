const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Servir les fichiers statiques
app.use(express.static('.'));

// Route pour obtenir la clé API
app.get('/api-key', (req, res) => {
    const apiKey = process.env.YOUR_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Clé API non trouvée dans les variables d\'environnement' });
    }
    res.json({ apiKey });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📁 Ouvrez http://localhost:${PORT}/map.html dans votre navigateur`);
});
