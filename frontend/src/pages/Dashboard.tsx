import './Dashboard.css'

interface DashboardProps {
  user: {
    username: string
    displayName: string
  }
}

function Dashboard({ user }: DashboardProps) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard Promo APE</h1>
        <div className="user-info">
          <span>Bienvenue, {user.displayName || user.username}</span>
          <a href="/auth/logout">Déconnexion</a>
        </div>
      </header>
      
      <main className="dashboard-content">
        <h2>Vue d'ensemble de la promo</h2>
        <p>En construction... 🚧</p>
        <p>Prochainement: liste des étudiants, métriques, alertes</p>
      </main>
    </div>
  )
}

export default Dashboard