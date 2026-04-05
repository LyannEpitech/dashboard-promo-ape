import express from 'express';
import GitHubService from '../services/github.js';

const router = express.Router();

/**
 * GET /api/projects
 * Récupère la liste des projets/repos avec les étudiants qui contribuent
 */
router.get('/', async (req, res) => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Utiliser le PAT s'il est configuré, sinon utiliser le token OAuth
    const accessToken = req.session.pat || req.user.accessToken;
    const github = new GitHubService(accessToken);
    
    const org = req.query.org || req.session.selectedOrg || 'Epitech';
    
    // Récupérer tous les repos de l'organisation
    const repos = await github.getOrgRepos(org);
    
    // Pour chaque repo, récupérer les contributeurs
    const projectsWithContributors = await Promise.all(
      repos.slice(0, 50).map(async (repo) => {
        try {
          // Récupérer les contributeurs
          const contributors = await github.getRepoContributors(org, repo.name);
          
          // Récupérer les commits récents
          const commits = await github.getRepoCommits(org, repo.name);
          
          return {
            id: repo.id,
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updatedAt: repo.updated_at,
            contributors: contributors.map(c => ({
              username: c.login,
              avatarUrl: c.avatar_url,
              contributions: c.contributions
            })),
            totalCommits: commits.length,
            recentCommits: commits.slice(0, 5).map(c => ({
              message: c.commit.message,
              author: c.commit.author.name,
              date: c.commit.author.date,
              sha: c.sha.substring(0, 7)
            }))
          };
        } catch (error) {
          console.error(`Erreur pour le repo ${repo.name}:`, error.message);
          return {
            id: repo.id,
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            language: repo.language,
            error: true,
            contributors: [],
            totalCommits: 0
          };
        }
      })
    );
    
    // Trier par nombre de contributeurs
    const sortedProjects = projectsWithContributors.sort((a, b) => 
      b.contributors.length - a.contributors.length
    );
    
    res.json({
      success: true,
      count: sortedProjects.length,
      organization: org,
      projects: sortedProjects
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des projets',
      message: error.message
    });
  }
});

export default router;