import express from 'express';
import GitHubService from '../services/github.js';
import { calculateStudentMetrics } from '../services/metrics.js';
import { getCacheKey, getFromCache, setCache } from '../services/cache.js';

const router = express.Router();

/**
 * GET /api/students
 * Récupère la liste des étudiants avec leurs métriques
 */
router.get('/', async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    
    // Utiliser le PAT s'il est configuré, sinon utiliser le token OAuth
    const accessToken = req.session.pat || req.user.accessToken;
    const github = new GitHubService(accessToken);
    
    // Récupérer l'organisation depuis les paramètres ou utiliser celle sélectionnée
    const org = req.query.org || req.session.selectedOrg || 'Epitech';
    
    // Vérifier le cache
    const cacheKey = getCacheKey('students', { org, accessToken: accessToken.slice(0, 10) });
    let students = getFromCache(cacheKey);
    
    if (!students) {
      // Récupérer tous les membres de l'organisation
      const members = await github.getOrgMembers(org, 200);
    
    // Récupérer les détails et métriques pour chaque étudiant
    let students = await Promise.all(
      members.map(async (member) => {
        try {
          // Récupérer les infos utilisateur
          const user = await github.getUser(member.login);
          
          // Récupérer les repos
          const repos = await github.getUserRepos(member.login);
          
          // Récupérer les commits de tous les repos (limité aux 5 derniers repos pour éviter les rate limits)
          const recentRepos = repos.slice(0, 5);
          const commitsPromises = recentRepos.map(repo => 
            github.getRepoCommits(member.login, repo.name)
          );
          const commitsArrays = await Promise.all(commitsPromises);
          const allCommits = commitsArrays.flat();
          
          // Calculer les métriques
          const metrics = calculateStudentMetrics(user, repos, allCommits);
          
          return metrics;
        } catch (error) {
          console.error(`Erreur pour l'étudiant ${member.login}:`, error.message);
          // Retourner des données minimales en cas d'erreur
          return {
            username: member.login,
            displayName: member.login,
            avatarUrl: member.avatar_url,
            profileUrl: member.html_url,
            error: true,
            totalRepos: 0,
            totalCommits: 0,
            commitsLastWeek: 0,
            activityRate: 0,
            isInactive: true,
            isRush: false,
            activityScore: 0
          };
        }
      })
    );
    
      // Trier par score d'activité (descendant)
      students = students.sort((a, b) => b.activityScore - a.activityScore);
      
      // Sauvegarder dans le cache
      setCache(cacheKey, students);
      console.log(`[Cache] Données étudiants mises en cache pour ${org}`);
    } else {
      console.log(`[Cache] Données étudiants récupérées depuis le cache pour ${org}`);
    }
    
    // Filtrer par recherche si spécifié (après le cache)
    let filteredStudents = students;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filteredStudents = students.filter(student => 
        student.username.toLowerCase().includes(searchLower) ||
        student.displayName.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const total = filteredStudents.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      organization: org,
      search: search || undefined,
      cached: !!getFromCache(cacheKey),
      students: paginatedStudents
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des étudiants',
      message: error.message
    });
  }
});

/**
 * GET /api/students/:username
 * Récupère les détails d'un étudiant spécifique
 */
router.get('/:username', async (req, res) => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { username } = req.params;
    // Utiliser le PAT s'il est configuré, sinon utiliser le token OAuth
    const accessToken = req.session.pat || req.user.accessToken;
    const github = new GitHubService(accessToken);
    
    // Récupérer les infos utilisateur
    const user = await github.getUser(username);
    
    // Récupérer les repos
    const repos = await github.getUserRepos(username);
    
    // Récupérer les commits de tous les repos
    const commitsPromises = repos.map(repo => 
      github.getRepoCommits(username, repo.name)
    );
    const commitsArrays = await Promise.all(commitsPromises);
    const allCommits = commitsArrays.flat();
    
    // Calculer les métriques
    const metrics = calculateStudentMetrics(user, repos, allCommits);
    
    // Ajouter les détails des repos
    const reposDetails = repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at
    }));
    
    res.json({
      success: true,
      student: {
        ...metrics,
        bio: user.bio,
        location: user.location,
        company: user.company,
        repos: reposDetails
      }
    });
    
  } catch (error) {
    console.error(`Erreur pour l'étudiant ${req.params.username}:`, error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'étudiant',
      message: error.message
    });
  }
});

export default router;