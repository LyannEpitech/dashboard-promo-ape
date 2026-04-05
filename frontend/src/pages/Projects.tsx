import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './Projects.css';

interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
  contributors: Array<{
    username: string;
    avatarUrl: string;
    contributions: number;
  }>;
  totalCommits: number;
  recentCommits: Array<{
    message: string;
    author: string;
    date: string;
    sha: string;
  }>;
}

interface ProjectsProps {
  user?: {
    username: string;
    displayName: string;
  };
}

function Projects({ user }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [availableOrgs, setAvailableOrgs] = useState<any[]>([]);

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchProjects();
    }
  }, [selectedOrg]);

  const fetchOrgs = async () => {
    try {
      const response = await fetch('/api/pat/orgs', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAvailableOrgs(data.orgs || []);
        if (data.orgs && data.orgs.length > 0) {
          setSelectedOrg(data.orgs[0].login);
        }
      }
    } catch (err) {
      console.error('Erreur récupération orgs:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/projects?org=${selectedOrg}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des projets');
      }
      
      const data = await response.json();
      
      if (!data.projects || !Array.isArray(data.projects)) {
        console.error('Format de réponse invalide:', data);
        throw new Error(data.message || 'Format de réponse invalide');
      }
      
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="projects-page">
      <Navbar user={user} />
      <div className="projects-container">
        <h2>Vue transversale par projet</h2>
        
        <div className="org-selector-row">
          <label>Organisation:</label>
          <select 
            value={selectedOrg} 
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            {/* Option par défaut si aucune org disponible */}
            {availableOrgs.length === 0 && selectedOrg && (
              <option value={selectedOrg}>{selectedOrg}</option>
            )}
            {availableOrgs.map(org => (
              <option key={org.login} value={org.login}>
                {org.name || org.login}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-banner">{error}</div>}
        
        {loading ? (
          <div className="loading">Chargement des projets...</div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            {!availableOrgs.length && (
              <button onClick={() => window.location.href = '/config/pat'}>
                Configurer un PAT
              </button>
            )}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>Aucun projet trouvé pour cette organisation.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      {project.name}
                    </a>
                  </h3>
                  {project.language && (
                    <span className="project-language">{project.language}</span>
                  )}
                </div>
                
                <p className="project-description">
                  {project.description || 'Pas de description'}
                </p>
                
                <div className="project-stats">
                  <span>⭐ {project.stars}</span>
                  <span>🍴 {project.forks}</span>
                  <span>👥 {(project.contributors || []).length} contributeurs</span>
                  <span>📝 {project.totalCommits} commits</span>
                </div>
                
                {project.contributors && project.contributors.length > 0 && (
                  <div className="project-contributors">
                    <h4>Contributeurs:</h4>
                    <div className="contributors-list">
                      {project.contributors.slice(0, 5).map(contributor => (
                        <div key={contributor.username} className="contributor">
                          <img 
                            src={contributor.avatarUrl} 
                            alt={contributor.username}
                            className="contributor-avatar"
                          />
                          <span className="contributor-name">{contributor.username}</span>
                          <span className="contributor-count">{contributor.contributions}</span>
                        </div>
                      ))}
                      {project.contributors.length > 5 && (
                        <span className="more-contributors">
                          +{project.contributors.length - 5} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {project.recentCommits && project.recentCommits.length > 0 && (
                  <div className="project-commits">
                    <h4>Commits récents:</h4>
                    <ul>
                      {project.recentCommits.map((commit, index) => (
                        <li key={index} className="commit-item">
                          <span className="commit-sha">{commit.sha}</span>
                          <span className="commit-message">{commit.message}</span>
                          <span className="commit-date">
                            {new Date(commit.date).toLocaleDateString('fr-FR')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;