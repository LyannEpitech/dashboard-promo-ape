import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAT_STORAGE_FILE = path.join(__dirname, '..', '..', 'data', 'pats.json');

// S'assurer que le dossier data existe
const dataDir = path.dirname(PAT_STORAGE_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Charger les PATs existants
function loadPats() {
  try {
    if (fs.existsSync(PAT_STORAGE_FILE)) {
      const data = fs.readFileSync(PAT_STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur chargement PATs:', error);
  }
  return {};
}

// Sauvegarder les PATs
function savePats(pats) {
  try {
    fs.writeFileSync(PAT_STORAGE_FILE, JSON.stringify(pats, null, 2));
  } catch (error) {
    console.error('Erreur sauvegarde PATs:', error);
  }
}

// Récupérer le PAT d'un utilisateur
export function getUserPat(userId) {
  const pats = loadPats();
  return pats[userId] || null;
}

// Sauvegarder le PAT d'un utilisateur
export function saveUserPat(userId, patData) {
  const pats = loadPats();
  pats[userId] = {
    ...patData,
    updatedAt: new Date().toISOString()
  };
  savePats(pats);
}

// Supprimer le PAT d'un utilisateur
export function removeUserPat(userId) {
  const pats = loadPats();
  delete pats[userId];
  savePats(pats);
}

// Lister tous les PATs (pour debug)
export function listPats() {
  return loadPats();
}