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
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState('Epitech');
  const [availableOrgs, setAvailableOrgs] = useState<Org[]>([]);
  const [patConfigured, setPatConfigured] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  // Recharger quand la recherche change (avec debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset à la page 1 quand on recherche
      if (selectedOrg) {
        fetchStudents();
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construire l'URL avec pagination et recherche
      let url = `/api/students?org=${selectedOrg}&page=${page}&limit=${limit}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url, {
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
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Ne pas charger automatiquement - attendre le clic sur le bouton
  // useEffect(() => {
  //   if (!selectedOrg) return;
  //   fetchStudents();
  // }, [selectedOrg, page]);

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
            <span className="stat-number">{total}</span>
            <span className="stat-label">Étudiants total</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{students.length}</span>
            <span className="stat-label">Affichés</span>
          </div>
          <div className="stat-card alert">
            <span className="stat-number">
              {Math.round(students.filter(s => s.isInactive).length / students.length * 100) || 0}%
            </span>
            <span className="stat-label">Inactifs</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-number">
              {Math.round(students.filter(s => s.isRush).length / students.length * 100) || 0}%
            </span>
            <span className="stat-label">En rush</span>
          </div>
        </div>

        <section className="students-section">
          <div className="students-section-header">
            <h2>Liste des étudiants</h2>
            <div className="header-actions">
              <button 
                onClick={fetchStudents}
                disabled={loading || !selectedOrg}
                className="btn-load"
              >
                {loading ? 'Chargement...' : '🔄 Charger les étudiants'}
              </button>
              <ExportButton />
            </div>
          </div>
          
          {students.length === 0 && !loading && (
            <div className="empty-state">
              <p>Cliquez sur "Charger les étudiants" pour voir la liste.</p>
              <p className="empty-hint">💡 Cette action utilise l'API GitHub (rate limit)</p>
            </div>
          )}
          
          <div className="pagination-info">
            {searchQuery ? (
              <span>{total} résultat{total !== 1 ? 's' : ''} pour "{searchQuery}"</span>
            ) : (
              <span>Page {page} sur {totalPages} ({total} étudiants)</span>
            )}
          </div>
          
          <StudentList 
            students={students}
            loading={loading}
            onSelectStudent={handleSelectStudent}
          />
          
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                ← Précédent
              </button>
              <span>Page {page} / {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Suivant →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;