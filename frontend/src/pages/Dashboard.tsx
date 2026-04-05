import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentList, { Student } from '../components/StudentList';
import ExportButton from '../components/ExportButton';
import Navbar from '../components/Navbar';
import './Dashboard.css';

interface User {
  username: string;
  displayName: string;
}

interface Org {
  login: string;
  name: string;
}

interface DashboardProps {
  user: User;
}

function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [availableOrgs, setAvailableOrgs] = useState<Org[]>([]);
  const [patConfigured, setPatConfigured] = useState(false);

  // Récupérer les orgs disponibles via PAT
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await fetch('/api/pat/orgs', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailableOrgs(data.orgs || []);
          if (data.orgs && data.orgs.length > 0) {
            setSelectedOrg(data.orgs[0].login);
            setPatConfigured(true);
          }
        } else if (response.status === 400) {
          // PAT non configuré
          setPatConfigured(false);
          // Fallback sur Epitech
          setSelectedOrg('Epitech');
        }
      } catch (err) {
        console.error('Erreur récupération orgs:', err);
        setPatConfigured(false);
        setSelectedOrg('Epitech');
      }
    };
    
    fetchOrgs();
  }, []);

  // Filtrer les étudiants selon la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(student => 
        student.username.toLowerCase().includes(query) ||
        student.displayName.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  useEffect(() => {
    if (!selectedOrg) return;
    
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
        setFilteredStudents(data.students);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [selectedOrg]);

  const handleSelectStudent = (username: string) => {
    navigate(`/student/${username}`);
  };

  const handleOrgChange = async (orgLogin: string) => {
    setSelectedOrg(orgLogin);
    
    // Sauvegarder l'org sélectionnée dans la session
    if (patConfigured) {
      try {
        await fetch('/api/pat/select-org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ org: orgLogin })
        });
      } catch (err) {
        console.error('Erreur sauvegarde org:', err);
      }
    }
  };

  return (
    <div className="dashboard">
      <Navbar user={user} />
      
      <main className="dashboard-content">
        {!patConfigured && (
          <div className="pat-warning-banner">
            <span>⚠️ PAT non configuré. Certaines organisations peuvent ne pas être accessibles.</span>
            <button onClick={() => navigate('/config/pat')}>
              Configurer PAT
            </button>
          </div>
        )}
        
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        )}
        
        <div className="dashboard-header-row">
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="org-selector-container">
            <label>Organisation:</label>
            <select 
              value={selectedOrg} 
              onChange={(e) => handleOrgChange(e.target.value)}
              className="org-select"
            >
              {availableOrgs.length > 0 ? (
                availableOrgs.map(org => (
                  <option key={org.login} value={org.login}>
                    {org.name || org.login}
                  </option>
                ))
              ) : (
                <option value="Epitech">Epitech</option>
              )}
            </select>
          </div>
        </div>
        
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
          <div className="students-section-header">
            <h2>Liste des étudiants</h2>
            <ExportButton />
          </div>
          {searchQuery && (
            <div className="search-results">
              {filteredStudents.length} résultat{filteredStudents.length !== 1 ? 's' : ''} pour "{searchQuery}"
            </div>
          )}
          <StudentList 
            students={filteredStudents}
            loading={loading}
            onSelectStudent={handleSelectStudent}
          />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;