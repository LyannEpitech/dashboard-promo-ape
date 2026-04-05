import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'

describe('Login Component', () => {
  it('renders login page with title', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Dashboard Promo APE')).toBeInTheDocument()
    expect(screen.getByText('Suivi des étudiants Epitech via GitHub')).toBeInTheDocument()
  })
  
  it('renders GitHub login button', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    
    const button = screen.getByText('Se connecter avec GitHub')
    expect(button).toBeInTheDocument()
  })
  
  it('redirects to GitHub OAuth on button click', () => {
    // Mock window.location.href
    const originalHref = window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    })
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    
    const button = screen.getByText('Se connecter avec GitHub')
    fireEvent.click(button)
    
    expect(window.location.href).toBe('http://localhost:3001/auth/github')
    
    // Restore
    Object.defineProperty(window, 'location', {
      value: { href: originalHref },
      writable: true
    })
  })
  
  it('has correct styling classes', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    
    const container = screen.getByText('Dashboard Promo APE').closest('.login-card')
    expect(container).toBeInTheDocument()
  })
})