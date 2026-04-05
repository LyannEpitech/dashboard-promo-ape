import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StudentDetail from './pages/StudentDetail'
import PatConfig from './pages/PatConfig'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div>Chargement...</div>

  return (
    <div className="app">
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/student/:username" 
          element={user ? <StudentDetail /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/config/pat" 
          element={user ? <PatConfig /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  )
}

export default App