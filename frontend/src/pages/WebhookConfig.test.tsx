import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WebhookConfig from './WebhookConfig';

declare const global: any;

const mockUser = {
  username: 'testuser',
  displayName: 'Test User'
};

describe('WebhookConfig Component', () => {
  it('renders webhook configuration page', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ orgs: [] })
    });

    render(
      <BrowserRouter>
        <WebhookConfig user={mockUser} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Configuration des Webhooks')).toBeInTheDocument();
  });

  it('displays webhook information', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ orgs: [] })
    });

    render(
      <BrowserRouter>
        <WebhookConfig user={mockUser} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Les webhooks permettent/)).toBeInTheDocument();
  });

  it('has configure button', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ orgs: [] })
    });

    render(
      <BrowserRouter>
        <WebhookConfig user={mockUser} />
      </BrowserRouter>
    );

    expect(screen.getByText('Configurer le webhook')).toBeInTheDocument();
  });
});