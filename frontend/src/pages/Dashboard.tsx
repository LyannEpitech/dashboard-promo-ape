import { useState, useEffect } from 'react';
import StudentList, { Student } from '../components/StudentList';
import './Dashboard.css';

interface User {
  username: string;
  displayName: string;
}

interface DashboardProps {
  user: User;
}

function Dashboard({ user }: DashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState('Epitech');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/students?org=${selectedOrg}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/login';
            return;
          }
          throw new Error('Erreur lors de la récupération des étudiants');
        }
        
        const data = await response.json();
        setStudents(data.students);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [selectedOrg]);

  const handleSelectStudent = (username: string) => {
    // Navigation vers la page détail (à implémenter dans US3)
    console.log('Sélection de l\'étudiant:', username);
    alert(`Détail de l'étudiant ${username} - À implémenter dans US3`);
  };

  const handleLogout = async () => {
    await fetch('/auth/logout', { credentials: 'include' });
    window.location.href = '/login';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-brand">
          <h1>Dashboard Promo APE</h1>
          <span className="header-subtitle">Vue d'ensemble de la promo</span>
        </div>
        
        <div className="header-actions">
          <div className="org-selector">
            <label>Organisation:</label>
            <select 
              value={selectedOrg} 
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <option value="Epitech">Epitech</option>
              <option value="EpitechPromo2026">Promo 2026</option>
            </select>
          </div>
          
          <div className="user-menu">
            <span className="user-name">
              {user.displayName || user.username}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        )}
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-number">{students.length}</span>
            <span className="stat-label">Étudiants</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {students.reduce((acc, s) => acc + s.totalCommits, 0)}
            </span>
            <span className="stat-label">Commits total</span>
          </div>
          <div className="stat-card alert">
            <span className="stat-number">
              {students.filter(s => s.isInactive).length}
            </span>
            <span className="stat-label">Inactifs (3j+)</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-number">
              {students.filter(s => s.isRush).length}
            </span>
            <span className="stat-label">En rush</span>
          </div>
        </div>

        <section className="students-section">
          <h2>Liste des étudiants</h2>
          <StudentList 
            students={students}
            loading={loading}
            onSelectStudent={handleSelectStudent}
          />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;