import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Projects from './Projects';

declare const global: any;

const mockUser = {
  username: 'testuser',
  displayName: 'Test User'
};

describe('Projects Component', () => {
  it('renders projects page', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ orgs: [] })
    });

    render(
      <BrowserRouter>
        <Projects user={mockUser} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Vue transversale par projet')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ orgs: [] })
    });

    render(
      <BrowserRouter>
        <Projects user={mockUser} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Chargement/)).toBeInTheDocument();
  });

  it('displays org selector', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ orgs: [{ login: 'Epitech', name: 'Epitech' }] })
    });

    render(
      <BrowserRouter>
        <Projects user={mockUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Organisation:/)).toBeInTheDocument();
    });
  });
});