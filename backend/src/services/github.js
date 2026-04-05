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
   * Récupère les membres d'une organisation
   * @param {string} org - Nom de l'organisation
   * @returns {Promise<Array>} Liste des membres
   */
  async getOrgMembers(org) {
    try {
      const response = await this.client.get(`/orgs/${org}/members`);
      return response.data;
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
}

export default GitHubService;