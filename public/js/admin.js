// Variables globales
let currentFile = null;

// Sélecteurs DOM
const $ = id => document.getElementById(id);
const dropArea = $('dropArea');
const kmlFileInput = $('kmlFile');
const uploadBtn = $('uploadBtn');
const previewBtn = $('previewBtn');
const downloadBtn = $('downloadBtn');
const logDiv = $('log');
const previewCard = $('previewCard');
const kmlPreview = $('kmlPreview');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadCurrentStats();
});

// Configuration des événements
function setupEventListeners() {
  // Drag and drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  dropArea.addEventListener('drop', handleDrop, false);
  kmlFileInput.addEventListener('change', handleFileSelect);
  uploadBtn.addEventListener('click', uploadKml);
  previewBtn.addEventListener('click', previewKml);
  downloadBtn.addEventListener('click', downloadKml);
}

// Gestion du drag and drop
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropArea.classList.add('highlight');
}

function unhighlight() {
  dropArea.classList.remove('highlight');
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length > 0) {
    selectFile(files[0]);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    selectFile(files[0]);
  }
}

function selectFile(file) {
  currentFile = file;
  $('fileNameDisplay').textContent = `Fichier sélectionné: ${file.name} (${formatFileSize(file.size)})`;
  uploadBtn.disabled = false;
  previewBtn.disabled = false;
  addLog(`Fichier sélectionné: ${file.name} (${formatFileSize(file.size)})`, 'info');
}

// Upload du fichier KML vers la base de données
async function uploadKml() {
  if (!currentFile) return;

  try {
    addLog('Traitement du fichier...', 'info');
    
    // Lire le contenu du fichier
    const fileContent = await readFileAsText(currentFile);
    
    // Traiter le fichier directement côté client
    const points = (fileContent.match(/<Placemark>/g) || []).length;
    addLog(`✅ Fichier traité! ${points} points trouvés`, 'success');
    
    // Sauvegarder dans la base de données
    const response = await fetch('/api/update-kml', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        kmlContent: fileContent,
        fileName: currentFile.name
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      addLog(`✅ Fichier KML sauvegardé dans la base de données: ${result.points} points`, 'success');
      
      // Mettre à jour les statistiques
      document.getElementById('totalPoints').textContent = result.points;
      document.getElementById('lastModified').textContent = new Date().toLocaleString('fr-FR');
      document.getElementById('fileSize').textContent = formatFileSize(fileContent.length);
      
      // Ouvrir la carte mise à jour
      setTimeout(() => {
        window.open('/', '_blank');
      }, 1000);
    } else {
      const error = await response.json();
      addLog(`❌ Erreur serveur: ${error.error}`, 'error');
    }
    
  } catch (error) {
    addLog(`❌ Erreur lors du traitement: ${error.message}`, 'error');
  }
}

// Lire le fichier comme texte
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// Prévisualisation du fichier
function previewKml() {
  if (!currentFile) return;

  addLog('Prévisualisation du fichier...', 'info');
  readFileAsText(currentFile).then(text => {
    kmlPreview.value = text;
    previewCard.classList.remove('hidden');
    addLog('Prévisualisation chargée.', 'success');
  }).catch(error => {
    addLog(`❌ Erreur de prévisualisation: ${error.message}`, 'error');
  });
}

// Télécharger le fichier KML depuis la base de données
async function downloadKml() {
  try {
    addLog('Téléchargement du fichier KML...', 'info');
    
    const response = await fetch('/api/get-kml');
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        // Créer un blob et télécharger
        const blob = new Blob([result.data.content], { type: 'application/vnd.google-earth.kml+xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        addLog(`✅ Fichier ${result.data.name} téléchargé`, 'success');
      } else {
        addLog('❌ Aucun fichier KML trouvé dans la base de données', 'error');
      }
    } else {
      addLog('❌ Erreur lors du téléchargement', 'error');
    }
  } catch (error) {
    addLog(`❌ Erreur lors du téléchargement: ${error.message}`, 'error');
  }
}

// Supprimer le fichier KML de la base de données
async function deleteKml() {
  if (confirm('Êtes-vous sûr de vouloir supprimer le fichier KML ? Cette action effacera toutes les données de la carte.')) {
    try {
      addLog('🗑️ Suppression du fichier KML...', 'info');
      
      // Supprimer le fichier de la base de données
      const response = await fetch('/api/delete-kml', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await response.json();
        addLog(`✅ ${result.message}`, 'success');
        
        // Réinitialiser l'interface
        currentFile = null;
        document.getElementById('kmlFile').value = '';
        document.getElementById('uploadBtn').disabled = true;
        document.getElementById('previewBtn').disabled = true;
        document.getElementById('previewCard').classList.add('hidden');
        
        // Mettre à jour les statistiques
        document.getElementById('totalPoints').textContent = '0';
        document.getElementById('lastModified').textContent = 'Jamais';
        document.getElementById('fileSize').textContent = '0 KB';
        
        // Ouvrir la carte vide
        setTimeout(() => {
          window.open('/', '_blank');
        }, 1000);
        
      } else {
        const error = await response.json();
        addLog(`❌ Erreur lors de la suppression: ${error.error}`, 'error');
      }
      
    } catch (error) {
      addLog(`❌ Erreur lors de la suppression: ${error.message}`, 'error');
    }
  }
}

// Réinitialiser l'interface
function resetKml() {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser le fichier KML ?')) {
    currentFile = null;
    document.getElementById('kmlFile').value = '';
    document.getElementById('uploadBtn').disabled = true;
    document.getElementById('previewBtn').disabled = true;
    document.getElementById('previewCard').classList.add('hidden');
    addLog('🔄 Fichier réinitialisé', 'info');
  }
}

// Charger les statistiques depuis la base de données
async function loadCurrentStats() {
  try {
    // Essayer de charger depuis la base de données
    const response = await fetch('/api/get-kml');
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        document.getElementById('totalPoints').textContent = result.data.points;
        document.getElementById('fileSize').textContent = formatFileSize(result.data.content.length);
        document.getElementById('lastModified').textContent = new Date(result.data.updatedAt).toLocaleString('fr-FR');
        addLog('Statistiques chargées depuis la base de données.', 'info');
      } else {
        document.getElementById('totalPoints').textContent = '0';
        document.getElementById('fileSize').textContent = '0 KB';
        document.getElementById('lastModified').textContent = 'Jamais';
        addLog('Aucun fichier KML trouvé dans la base de données.', 'warning');
      }
    } else {
      // Fallback sur localStorage
      const savedData = localStorage.getItem('kmlData');
      if (savedData) {
        const kmlData = JSON.parse(savedData);
        document.getElementById('totalPoints').textContent = kmlData.points || 0;
        document.getElementById('fileSize').textContent = formatFileSize(kmlData.kmlText?.length || 0);
        document.getElementById('lastModified').textContent = kmlData.lastModified || 'N/A';
        addLog('Statistiques chargées depuis le cache local.', 'info');
      } else {
        document.getElementById('totalPoints').textContent = '0';
        document.getElementById('fileSize').textContent = '0 KB';
        document.getElementById('lastModified').textContent = 'Jamais';
        addLog('Aucune donnée KML trouvée.', 'warning');
      }
    }
  } catch (error) {
    addLog(`❌ Erreur lors du chargement des stats: ${error.message}`, 'error');
  }
}

// Ajouter un message au journal
function addLog(message, type = 'info') {
  const entry = document.createElement('div');
  entry.classList.add('log-entry', `log-${type}`);
  entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  logDiv.prepend(entry); // Ajouter au début pour voir les plus récents
  if (logDiv.children.length > 50) { // Limiter le nombre d'entrées
    logDiv.removeChild(logDiv.lastChild);
  }
}

// Formater la taille du fichier
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Exposer les fonctions globalement pour les boutons HTML
window.uploadKml = uploadKml;
window.previewKml = previewKml;
window.downloadKml = downloadKml;
window.deleteKml = deleteKml;
window.resetKml = resetKml;
