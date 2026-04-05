import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

const mockUser = {
  username: 'testuser',
  displayName: 'Test User'
};

describe('Dashboard Component', () => {
  it('renders dashboard with user name', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Dashboard Promo APE')).toBeInTheDocument();
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
  });

  it('renders dashboard with username when displayName is empty', () => {
    const userWithoutDisplayName = {
      username: 'johndoe',
      displayName: ''
    };
    
    render(
      <BrowserRouter>
        <Dashboard user={userWithoutDisplayName} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/johndoe/)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Chargement des étudiants/)).toBeInTheDocument();
  });

  it('has logout button', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    );
    
    const logoutButton = screen.getByText('Déconnexion');
    expect(logoutButton).toBeInTheDocument();
  });

  it('renders dashboard header correctly', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    );
    
    const header = screen.getByText('Dashboard Promo APE');
    expect(header).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Étudiants')).toBeInTheDocument();
    expect(screen.getByText('Commits total')).toBeInTheDocument();
    expect(screen.getByText('Inactifs (3j+)')).toBeInTheDocument();
    expect(screen.getByText('En rush')).toBeInTheDocument();
  });

  it('renders students section', () => {
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Liste des étudiants')).toBeInTheDocument();
  });
});