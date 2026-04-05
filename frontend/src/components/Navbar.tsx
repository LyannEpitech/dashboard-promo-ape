import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  user?: {
    username: string;
    displayName: string;
  };
}

function Navbar({ user }: NavbarProps) {
  const location = useLocation();

  const handleLogout = async () => {
    await fetch('/auth/logout', { credentials: 'include' });
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">Dashboard Promo APE</Link>
      </div>
      
      <div className="navbar-links">
        <Link 
          to="/dashboard" 
          className={location.pathname === '/dashboard' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link 
          to="/projects"
          className={location.pathname === '/projects' ? 'active' : ''}
        >
          Projets
        </Link>
        <Link 
          to="/config/pat"
          className={location.pathname === '/config/pat' ? 'active' : ''}
        >
          Config PAT
        </Link>
        <Link 
          to="/config/webhook"
          className={location.pathname === '/config/webhook' ? 'active' : ''}
        >
          Webhooks
        </Link>
      </div>

      <div className="navbar-user">
        {user && (
          <>
            <span className="user-name">{user.displayName || user.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
