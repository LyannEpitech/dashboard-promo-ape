import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentDetail from './StudentDetail';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

const mockStudent = {
  username: 'teststudent',
  displayName: 'Test Student',
  avatarUrl: 'https://example.com/avatar.png',
  profileUrl: 'https://github.com/teststudent',
  bio: 'A passionate developer',
  location: 'Paris',
  company: 'Epitech',
  totalRepos: 5,
  totalCommits: 150,
  commitsLastWeek: 20,
  daysSinceLastCommit: 1,
  activityRate: 8.5,
  activityScore: 85,
  isInactive: false,
  isRush: false,
  lastCommitDate: new Date().toISOString(),
  repos: [
    {
      name: 'project1',
      description: 'My first project',
      url: 'https://github.com/teststudent/project1',
      language: 'JavaScript',
      stars: 10,
      forks: 3,
      updatedAt: '2024-01-15T10:00:00Z',
      createdAt: '2024-01-01T10:00:00Z'
    }
  ]
};

describe('StudentDetail Component - US3', () => {
  it('renders loading state', () => {
    render(
      <BrowserRouter>
        <StudentDetail />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Chargement/)).toBeInTheDocument();
  });

  it('displays student information correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, student: mockStudent })
    });

    render(
      <BrowserRouter>
        <StudentDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });

    expect(screen.getByText('@teststudent')).toBeInTheDocument();
    expect(screen.getByText('A passionate developer')).toBeInTheDocument();
  });

  it('displays repos list', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, student: mockStudent })
    });

    render(
      <BrowserRouter>
        <StudentDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('project1')).toBeInTheDocument();
    });

    expect(screen.getByText('My first project')).toBeInTheDocument();
  });

  it('displays activity metrics', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, student: mockStudent })
    });

    render(
      <BrowserRouter>
        <StudentDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // total commits
    });
  });

  it('has back button', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, student: mockStudent })
    });

    render(
      <BrowserRouter>
        <StudentDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Retour/)).toBeInTheDocument();
    });
  });
});

describe('StudentDetail Alerts - US4', () => {
  it('displays inactive alert', async () => {
    const inactiveStudent = {
      ...mockStudent,
      isInactive: true,
      daysSinceLastCommit: 5
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, student: inactiveStudent })
    });

    render(
      <BrowserRouter>
        <StudentDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Inactif/)).toBeInTheDocument();
    });
  });

  it('displays rush alert', async () => {
    const rushStudent = {
      ...mockStudent,
      isRush: true
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, student: rushStudent })
    });

    render(
      <BrowserRouter>
        <StudentDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Rush/)).toBeInTheDocument();
    });
  });
});