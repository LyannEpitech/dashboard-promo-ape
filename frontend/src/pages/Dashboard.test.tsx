import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'

describe('Dashboard Component', () => {
  const mockUser = {
    username: 'testuser',
    displayName: 'Test User'
  }
  
  it('renders dashboard with user name', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Dashboard Promo APE')).toBeInTheDocument()
    expect(screen.getByText(/Test User/)).toBeInTheDocument()
  })
  
  it('renders dashboard with username when displayName is empty', () => {
    const userWithoutDisplayName = {
      username: 'johndoe',
      displayName: ''
    }
    
    render(
      <BrowserRouter>
        <Dashboard user={userWithoutDisplayName} />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/johndoe/)).toBeInTheDocument()
  })
  
  it('shows construction message', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/En construction/)).toBeInTheDocument()
    expect(screen.getByText(/liste des étudiants, métriques, alertes/)).toBeInTheDocument()
  })
  
  it('has logout link', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    )
    
    const logoutLink = screen.getByText('Déconnexion')
    expect(logoutLink).toBeInTheDocument()
    expect(logoutLink).toHaveAttribute('href', '/auth/logout')
  })
  
  it('renders dashboard header correctly', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    )
    
    const header = screen.getByText('Dashboard Promo APE').closest('.dashboard-header')
    expect(header).toBeInTheDocument()
  })
})