import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlertBadge from './AlertBadge';

describe('AlertBadge Component - US4', () => {
  it('renders inactive alert', () => {
    render(<AlertBadge type="inactive" days={5} />);
    
    expect(screen.getByText('Inactif (5j)')).toBeInTheDocument();
    expect(screen.getByText('Inactif (5j)')).toHaveClass('alert-inactive');
  });

  it('renders rush alert', () => {
    render(<AlertBadge type="rush" />);
    
    expect(screen.getByText('Rush détecté!')).toBeInTheDocument();
    expect(screen.getByText('Rush détecté!')).toHaveClass('alert-rush');
  });

  it('renders active status', () => {
    render(<AlertBadge type="active" />);
    
    expect(screen.getByText('Actif')).toBeInTheDocument();
    expect(screen.getByText('Actif')).toHaveClass('alert-active');
  });

  it('renders error alert', () => {
    render(<AlertBadge type="error" />);
    
    expect(screen.getByText('Erreur')).toBeInTheDocument();
    expect(screen.getByText('Erreur')).toHaveClass('alert-error');
  });

  it('handles custom message', () => {
    render(<AlertBadge type="inactive" days={10} message="10 jours sans commit" />);
    
    expect(screen.getByText('10 jours sans commit')).toBeInTheDocument();
  });
});