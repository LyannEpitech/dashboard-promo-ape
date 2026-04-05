import { Router } from 'express';
import { Octokit } from '@octokit/rest';
import { saveUserPat, getUserPat, removeUserPat } from '../services/patStorage.js';

const router = Router();

// POST /api/pat - Enregistrer un PAT
router.post('/', async (req, res) => {
  try {
    console.log('PAT: Requête reçue, authentification:', req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { pat } = req.body;
    console.log('PAT: Token reçu (début):', pat ? pat.substring(0, 10) + '...' : 'undefined');

    if (!pat) {
      return res.status(400).json({ error: 'PAT requis' });
    }

    // Validation du format PAT (ghp_xxxx ou github_pat_xxx)
    const patRegex = /^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})$/;
    if (!patRegex.test(pat)) {
      console.log('PAT: Format invalide');
      return res.status(400).json({ 
        error: 'Format invalide. Le PAT doit commencer par ghp_ ou github_pat_' 
      });
    }

    // Vérifier la validité du PAT avec GitHub
    const octokit = new Octokit({ auth: pat });
    
    try {
      console.log('PAT: Vérification avec GitHub...');
      const { data: user } = await octokit.rest.users.getAuthenticated();
      console.log('PAT: Utilisateur authentifié:', user.login);
      
      // Récupérer les organisations accessibles
      const { data: orgs } = await octokit.rest.orgs.listForAuthenticatedUser();
      console.log('PAT: Orgs récupérées:', orgs.length);
      
      // Stocker le PAT en session (chiffré serait mieux en production)
      req.session.pat = pat;
      req.session.patUser = {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url
      };
      
      // Sauvegarder explicitement la session
      req.session.pat = pat;
      req.session.patUser = {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url
      };
      
      // Sauvegarder dans le stockage persistant
      saveUserPat(req.user.id, {
        pat,
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url
        },
        orgs: orgs.map(org => ({
          login: org.login,
          name: org.name,
          avatar_url: org.avatar_url
        }))
      });
      
      req.session.save((err) => {
        if (err) {
          console.error('PAT: Erreur sauvegarde session:', err);
          return res.status(500).json({ error: 'Erreur sauvegarde session' });
        }
        console.log('PAT: Session sauvegardée avec succès');
      });
      
      res.json({
        success: true,
        message: 'PAT enregistré avec succès',
        user: {
          login: user.login,
          name: user.name
        },
        orgs: orgs.map(org => ({
          login: org.login,
          name: org.name,
          avatar_url: org.avatar_url,
          description: org.description
        }))
      });
    } catch (githubError) {
      console.error('Erreur validation PAT:', githubError.message);
      return res.status(401).json({ 
        error: 'PAT invalide ou expiré',
        details: githubError.message
      });
    }

  } catch (error) {
    console.error('Erreur enregistrement PAT:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/pat/orgs - Lister les orgs accessibles
router.get('/orgs', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    let pat = req.session.pat;
    
    // Si pas en session, essayer depuis le stockage persistant
    if (!pat && req.user.id) {
      const storedPat = getUserPat(req.user.id);
      if (storedPat) {
        pat = storedPat.pat;
        req.session.pat = pat;
        req.session.patUser = storedPat.user;
      }
    }
    
    if (!pat) {
      return res.status(400).json({ error: 'Aucun PAT enregistré' });
    }

    const octokit = new Octokit({ auth: pat });
    const { data: orgs } = await octokit.rest.orgs.listForAuthenticatedUser();

    res.json({
      orgs: orgs.map(org => ({
        login: org.login,
        name: org.name,
        avatar_url: org.avatar_url,
        description: org.description
      }))
    });

  } catch (error) {
    console.error('Erreur récupération orgs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/pat/select-org - Sélectionner une org
router.post('/select-org', (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { org } = req.body;

    if (!org) {
      return res.status(400).json({ error: 'Organisation requise' });
    }

    req.session.selectedOrg = org;

    res.json({
      success: true,
      message: `Organisation ${org} sélectionnée`,
      selectedOrg: org
    });

  } catch (error) {
    console.error('Erreur sélection org:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/pat/status - Vérifier le statut PAT
router.get('/status', (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Essayer de récupérer depuis la session d'abord
    let hasPat = !!req.session.pat;
    let selectedOrg = req.session.selectedOrg;
    let patUser = req.session.patUser;

    // Si pas en session, essayer depuis le stockage persistant
    if (!hasPat && req.user.id) {
      const storedPat = getUserPat(req.user.id);
      if (storedPat) {
        hasPat = true;
        patUser = storedPat.user;
        // Restaurer dans la session
        req.session.pat = storedPat.pat;
        req.session.patUser = storedPat.user;
      }
    }

    res.json({
      hasPat,
      selectedOrg,
      patUser: patUser ? {
        login: patUser.login,
        name: patUser.name
      } : null
    });

  } catch (error) {
    console.error('Erreur statut PAT:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;