import { useState } from 'react';
import './StudentList.css';

interface Student {
  username: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
  totalRepos: number;
  totalCommits: number;
  commitsLastWeek: number;
  daysSinceLastCommit: number;
  activityRate: number;
  activityScore: number;
  isInactive: boolean;
  isRush: boolean;
  lastCommitDate: string | null;
  error?: boolean;
}

interface StudentListProps {
  students: Student[];
  loading: boolean;
  onSelectStudent: (username: string) => void;
}

function StudentList({ students, loading, onSelectStudent }: StudentListProps) {
  const [sortBy, setSortBy] = useState<'activity' | 'commits' | 'name'>('activity');
  const [filter, setFilter] = useState<'all' | 'inactive' | 'rush'>('all');

  const sortedStudents = [...students].sort((a, b) => {
    switch (sortBy) {
      case 'activity':
        return b.activityScore - a.activityScore;
      case 'commits':
        return b.totalCommits - a.totalCommits;
      case 'name':
        return a.displayName.localeCompare(b.displayName);
      default:
        return 0;
    }
  });

  const filteredStudents = sortedStudents.filter(student => {
    switch (filter) {
      case 'inactive':
        return student.isInactive;
      case 'rush':
        return student.isRush;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="student-list-loading">
        <div className="spinner"></div>
        <p>Chargement des étudiants...</p>
      </div>
    );
  }

  return (
    <div className="student-list">
      <div className="student-list-filters">
        <div className="filter-group">
          <label>Trier par:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'activity' | 'commits' | 'name')}>
            <option value="activity">Score d'activité</option>
            <option value="commits">Nombre de commits</option>
            <option value="name">Nom</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Filtrer:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'inactive' | 'rush')}>
            <option value="all">Tous</option>
            <option value="inactive">Inactifs (3j+)</option>
            <option value="rush">Rush (24h)</option>
          </select>
        </div>
      </div>

      <div className="student-list-stats">
        <span>Total: {students.length} étudiants</span>
        <span className="stat-inactive">{students.filter(s => s.isInactive).length} inactifs</span>
        <span className="stat-rush">{students.filter(s => s.isRush).length} en rush</span>
      </div>

      <div className="student-grid">
        {filteredStudents.map(student => (
          <div 
            key={student.username} 
            className={`student-card ${student.isInactive ? 'inactive' : ''} ${student.isRush ? 'rush' : ''}`}
            onClick={() => onSelectStudent(student.username)}
          >
            <div className="student-header">
              <img 
                src={student.avatarUrl} 
                alt={student.displayName}
                className="student-avatar"
              />
              <div className="student-info">
                <h3>{student.displayName}</h3>
                <a 
                  href={student.profileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{student.username}
                </a>
              </div>
            </div>

            <div className="student-metrics">
              <div className="metric">
                <span className="metric-value">{student.totalRepos}</span>
                <span className="metric-label">Repos</span>
              </div>
              <div className="metric">
                <span className="metric-value">{student.totalCommits}</span>
                <span className="metric-label">Commits</span>
              </div>
              <div className="metric">
                <span className="metric-value">{student.commitsLastWeek}</span>
                <span className="metric-label">Cette semaine</span>
              </div>
            </div>

            <div className="student-activity">
              <div className="activity-bar">
                <div 
                  className="activity-fill"
                  style={{ width: `${student.activityScore}%` }}
                ></div>
              </div>
              <span className="activity-score">{student.activityScore}/100</span>
            </div>

            <div className="student-alerts">
              {student.isInactive && (
                <span className="alert-badge alert-inactive">
                  Inactif ({student.daysSinceLastCommit}j)
                </span>
              )}
              {student.isRush && (
                <span className="alert-badge alert-rush">
                  Rush détecté!
                </span>
              )}
              {student.error && (
                <span className="alert-badge alert-error">
                  Erreur de chargement
                </span>
              )}
            </div>

            <div className="student-footer">
              <span className="last-commit">
                Dernier commit: {student.lastCommitDate 
                  ? new Date(student.lastCommitDate).toLocaleDateString('fr-FR')
                  : 'Jamais'
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentList;