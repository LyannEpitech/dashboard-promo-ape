import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Service pour interagir avec l'API GitHub
 */
class GitHubService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: GITHUB_API_BASE,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  /**
   * Récupère les membres d'une organisation (avec pagination)
   * @param {string} org - Nom de l'organisation
   * @param {number} maxMembers - Nombre maximum de membres à récupérer (défaut: 100)
   * @returns {Promise<Array>} Liste des membres
   */
  async getOrgMembers(org, maxMembers = 100) {
    try {
      let allMembers = [];
      let page = 1;
      const perPage = 100; // Maximum autorisé par GitHub
      
      while (allMembers.length < maxMembers) {
        const response = await this.client.get(`/orgs/${org}/members`, {
          params: {
            page: page,
            per_page: perPage
          }
        });
        
        const members = response.data;
        if (members.length === 0) {
          break; // Plus de membres à récupérer
        }
        
        allMembers = allMembers.concat(members);
        
        if (members.length < perPage) {
          break; // Dernière page
        }
        
        page++;
        
        // Sécurité: éviter les boucles infinies
        if (page > 10) {
          console.warn(`Limite de pagination atteinte pour ${org}`);
          break;
        }
      }
      
      return allMembers.slice(0, maxMembers);
    } catch (error) {
      console.error(`Erreur lors de la récupération des membres de ${org}:`, error.message);
      throw error;
    }
  }

  /**
   * Récupère les informations d'un utilisateur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise<Object>} Informations utilisateur
   */
  async getUser(username) {
    try {
      const response = await this.client.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${username}:`, error.message);
      throw error;
    }
  }

  /**
   * Récupère les repos d'un utilisateur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise<Array>} Liste des repos
   */
  async getUserRepos(username) {
    try {
      const response = await this.client.get(`/users/${username}/repos`, {
        params: {
          sort: 'updated',
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des repos de ${username}:`, error.message);
      throw error;
    }
  }

  /**
   * Récupère les commits d'un repo
   * @param {string} owner - Propriétaire
   * @param {string} repo - Nom du repo
   * @returns {Promise<Array>} Liste des commits
   */
  async getRepoCommits(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/commits`, {
        params: {
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des commits de ${owner}/${repo}:`, error.message);
      return []; // Retourne tableau vide si erreur (repo vide ou autre)
    }
  }

  /**
   * Récupère les événements d'un utilisateur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise<Array>} Liste des événements
   */
  async getUserEvents(username) {
    try {
      const response = await this.client.get(`/users/${username}/events`, {
        params: {
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des événements de ${username}:`, error.message);
      return [];
    }
  }

  /**
   * Récupère les repos d'une organisation
   * @param {string} org - Nom de l'organisation
   * @returns {Promise<Array>} Liste des repos
   */
  async getOrgRepos(org) {
    try {
      let allRepos = [];
      let page = 1;
      const perPage = 100;
      
      while (allRepos.length < 100) {
        const response = await this.client.get(`/orgs/${org}/repos`, {
          params: {
            page: page,
            per_page: perPage,
            sort: 'updated'
          }
        });
        
        const repos = response.data;
        if (repos.length === 0) break;
        
        allRepos = allRepos.concat(repos);
        if (repos.length < perPage) break;
        page++;
        if (page > 10) break;
      }
      
      return allRepos.slice(0, 100);
    } catch (error) {
      console.error(`Erreur lors de la récupération des repos de ${org}:`, error.message);
      throw error;
    }
  }

  /**
   * Récupère les contributeurs d'un repo
   * @param {string} owner - Propriétaire
   * @param {string} repo - Nom du repo
   * @returns {Promise<Array>} Liste des contributeurs
   */
  async getRepoContributors(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/contributors`, {
        params: {
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des contributeurs de ${owner}/${repo}:`, error.message);
      return [];
    }
  }
}

export default GitHubService;