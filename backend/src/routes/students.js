import express from 'express';
import GitHubService from '../services/github.js';
import { calculateStudentMetrics } from '../services/metrics.js';

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

    const { accessToken } = req.user;
    const github = new GitHubService(accessToken);
    
    // Récupérer l'organisation depuis les paramètres ou utiliser une valeur par défaut
    const org = req.query.org || 'Epitech';
    
    // Récupérer les membres de l'organisation
    const members = await github.getOrgMembers(org);
    
    // Limiter le nombre d'étudiants pour éviter les rate limits
    const limitedMembers = members.slice(0, 50);
    
    // Récupérer les détails et métriques pour chaque étudiant
    const students = await Promise.all(
      limitedMembers.map(async (member) => {
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
    const sortedStudents = students.sort((a, b) => b.activityScore - a.activityScore);
    
    res.json({
      success: true,
      count: sortedStudents.length,
      organization: org,
      students: sortedStudents
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
    const { accessToken } = req.user;
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