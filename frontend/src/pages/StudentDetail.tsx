import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlertBadge from '../components/AlertBadge';
import './StudentDetail.css';

interface Repo {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  createdAt: string;
}

interface Student {
  username: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
  bio: string;
  location: string;
  company: string;
  totalRepos: number;
  totalCommits: number;
  commitsLastWeek: number;
  daysSinceLastCommit: number;
  activityRate: number;
  activityScore: number;
  isInactive: boolean;
  isRush: boolean;
  lastCommitDate: string;
  repos: Repo[];
}

function StudentDetail() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/students/${username}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/login';
            return;
          }
          throw new Error('Erreur lors de la récupération des détails');
        }
        
        const data = await response.json();
        setStudent(data.student);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentDetail();
  }, [username]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getAlertType = () => {
    if (!student) return 'active';
    if (student.isInactive) return 'inactive';
    if (student.isRush) return 'rush';
    return 'active';
  };

  if (loading) {
    return (
      <div className="student-detail-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="student-detail-error">
        <p>{error || 'Étudiant non trouvé'}</p>
        <button onClick={handleBack}>Retour</button>
      </div>
    );
  }

  return (
    <div className="student-detail">
      <header className="detail-header">
        <button onClick={handleBack} className="back-btn">
          ← Retour
        </button>
        <h1>Détail de l'étudiant</h1>
      </header>

      <div className="detail-content">
        <section className="profile-section">
          <div className="profile-header">
            <img 
              src={student.avatarUrl} 
              alt={student.displayName}
              className="profile-avatar"
            />
            <div className="profile-info">
              <h2>{student.displayName}</h2>
              <a 
                href={student.profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="profile-link"
              >
                @{student.username}
              </a>
              <div className="profile-meta">
                {student.company && <span>🏢 {student.company}</span>}
                {student.location && <span>📍 {student.location}</span>}
              </div>
              <AlertBadge 
                type={getAlertType()} 
                days={student.daysSinceLastCommit}
              />
            </div>
          </div>
          
          {student.bio && (
            <p className="profile-bio">{student.bio}</p>
          )}
        </section>

        <section className="metrics-section">
          <h3>Métriques</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-value">{student.totalRepos}</span>
              <span className="metric-label">Repositories</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{student.totalCommits}</span>
              <span className="metric-label">Commits total</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{student.commitsLastWeek}</span>
              <span className="metric-label">Cette semaine</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{student.activityScore}/100</span>
              <span className="metric-label">Score d'activité</span>
            </div>
          </div>
          
          <div className="activity-bar-container">
            <label>Activité (commits/semaine)</label>
            <div className="activity-bar">
              <div 
                className="activity-fill"
                style={{ width: `${Math.min(100, student.activityScore)}%` }}
              ></div>
            </div>
            <span>{student.activityRate.toFixed(1)} commits/semaine</span>
          </div>
          
          <div className="last-commit-info">
            <p>
              Dernier commit: {student.lastCommitDate 
                ? new Date(student.lastCommitDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Jamais'
              }
            </p>
            <p>
              {student.daysSinceLastCommit === 0 
                ? 'Aujourd\'hui'
                : `Il y a ${student.daysSinceLastCommit} jour${student.daysSinceLastCommit > 1 ? 's' : ''}`
              }
            </p>
          </div>
        </section>

        <section className="repos-section">
          <h3>Repositories ({student.repos.length})</h3>
          <div className="repos-list">
            {student.repos.map(repo => (
              <div key={repo.name} className="repo-card">
                <div className="repo-header">
                  <h4>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer">
                      {repo.name}
                    </a>
                  </h4>
                  {repo.language && (
                    <span className="repo-language">{repo.language}</span>
                  )}
                </div>
                <p className="repo-description">{repo.description || 'Pas de description'}</p>
                <div className="repo-stats">
                  <span>⭐ {repo.stars}</span>
                  <span>🍴 {repo.forks}</span>
                  <span>Mis à jour: {new Date(repo.updatedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default StudentDetail;