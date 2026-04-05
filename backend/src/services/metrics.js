/**
 * Calcule les métriques d'un étudiant à partir de ses données GitHub
 */

/**
 * Calcule le nombre de commits sur une période
 * @param {Array} commits - Liste des commits
 * @param {number} days - Nombre de jours à regarder en arrière
 * @returns {number} Nombre de commits
 */
export function countCommitsInLastDays(commits, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate >= cutoffDate;
  }).length;
}

/**
 * Trouve la date du dernier commit
 * @param {Array} commits - Liste des commits
 * @returns {Date|null} Date du dernier commit
 */
export function getLastCommitDate(commits) {
  if (!commits || commits.length === 0) return null;
  
  const sortedCommits = commits.sort((a, b) => {
    return new Date(b.commit.author.date) - new Date(a.commit.author.date);
  });
  
  return new Date(sortedCommits[0].commit.author.date);
}

/**
 * Calcule le nombre de jours depuis le dernier commit
 * @param {Date|null} lastCommitDate - Date du dernier commit
 * @returns {number} Nombre de jours
 */
export function getDaysSinceLastCommit(lastCommitDate) {
  if (!lastCommitDate) return Infinity;
  
  const now = new Date();
  const diffTime = now - lastCommitDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Détecte un rush de commits (plus de 50% des commits sur les dernières 24h)
 * @param {Array} commits - Liste des commits
 * @returns {boolean} True si rush détecté
 */
export function detectRush(commits) {
  if (!commits || commits.length === 0) return false;
  
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  
  const recentCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate >= last24Hours;
  });
  
  return (recentCommits.length / commits.length) > 0.5;
}

/**
 * Calcule le taux d'activité (commits par semaine)
 * @param {Array} commits - Liste des commits
 * @param {number} weeks - Nombre de semaines
 * @returns {number} Commits par semaine
 */
export function calculateActivityRate(commits, weeks = 4) {
  if (!commits || commits.length === 0) return 0;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));
  
  const recentCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate >= cutoffDate;
  });
  
  return recentCommits.length / weeks;
}

/**
 * Calcule toutes les métriques pour un étudiant
 * @param {Object} user - Données utilisateur
 * @param {Array} repos - Liste des repos
 * @param {Array} allCommits - Tous les commits
 * @returns {Object} Métriques calculées
 */
export function calculateStudentMetrics(user, repos, allCommits) {
  const lastCommitDate = getLastCommitDate(allCommits);
  const daysSinceLastCommit = getDaysSinceLastCommit(lastCommitDate);
  const commitsLastWeek = countCommitsInLastDays(allCommits, 7);
  const isRush = detectRush(allCommits);
  const activityRate = calculateActivityRate(allCommits);
  
  return {
    username: user.login,
    displayName: user.name || user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    
    // Repos
    totalRepos: repos.length,
    publicRepos: user.public_repos,
    
    // Commits
    totalCommits: allCommits.length,
    commitsLastWeek,
    lastCommitDate: lastCommitDate?.toISOString() || null,
    daysSinceLastCommit,
    
    // Activité
    activityRate: Math.round(activityRate * 10) / 10, // Arrondi à 1 décimale
    
    // Alertes
    isInactive: daysSinceLastCommit >= 3,
    isRush,
    
    // Score d'activité (0-100)
    activityScore: Math.min(100, Math.round(activityRate * 10))
  };
}