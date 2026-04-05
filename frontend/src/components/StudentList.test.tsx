import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentList from './StudentList';

const mockStudents = [
  {
    username: 'student1',
    displayName: 'Student One',
    avatarUrl: 'https://example.com/avatar1.png',
    profileUrl: 'https://github.com/student1',
    totalRepos: 5,
    totalCommits: 100,
    commitsLastWeek: 10,
    daysSinceLastCommit: 1,
    activityRate: 5.5,
    activityScore: 55,
    isInactive: false,
    isRush: false,
    lastCommitDate: new Date().toISOString()
  },
  {
    username: 'student2',
    displayName: 'Student Two',
    avatarUrl: 'https://example.com/avatar2.png',
    profileUrl: 'https://github.com/student2',
    totalRepos: 3,
    totalCommits: 50,
    commitsLastWeek: 0,
    daysSinceLastCommit: 5,
    activityRate: 2.0,
    activityScore: 20,
    isInactive: true,
    isRush: false,
    lastCommitDate: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    username: 'student3',
    displayName: 'Student Three',
    avatarUrl: 'https://example.com/avatar3.png',
    profileUrl: 'https://github.com/student3',
    totalRepos: 8,
    totalCommits: 200,
    commitsLastWeek: 50,
    daysSinceLastCommit: 0,
    activityRate: 15.0,
    activityScore: 100,
    isInactive: false,
    isRush: true,
    lastCommitDate: new Date().toISOString()
  }
];

describe('StudentList Component', () => {
  it('renders loading state', () => {
    render(
      <StudentList 
        students={[]} 
        loading={true} 
        onSelectStudent={() => {}} 
      />
    );
    
    expect(screen.getByText('Chargement des étudiants...')).toBeInTheDocument();
  });

  it('renders student list correctly', () => {
    render(
      <StudentList 
        students={mockStudents} 
        loading={false} 
        onSelectStudent={() => {}} 
      />
    );
    
    expect(screen.getByText('Student One')).toBeInTheDocument();
    expect(screen.getByText('Student Two')).toBeInTheDocument();
    expect(screen.getByText('Student Three')).toBeInTheDocument();
  });

  it('displays correct stats', () => {
    render(
      <StudentList 
        students={mockStudents} 
        loading={false} 
        onSelectStudent={() => {}} 
      />
    );
    
    expect(screen.getByText('Total: 3 étudiants')).toBeInTheDocument();
  });

  it('calls onSelectStudent when card is clicked', () => {
    const mockSelect = vi.fn();
    
    render(
      <StudentList 
        students={mockStudents} 
        loading={false} 
        onSelectStudent={mockSelect} 
      />
    );
    
    const studentCard = screen.getByText('Student One').closest('.student-card');
    fireEvent.click(studentCard!);
    
    expect(mockSelect).toHaveBeenCalledWith('student1');
  });

  it('displays activity scores', () => {
    render(
      <StudentList 
        students={mockStudents} 
        loading={false} 
        onSelectStudent={() => {}} 
      />
    );
    
    expect(screen.getByText('55/100')).toBeInTheDocument();
    expect(screen.getByText('100/100')).toBeInTheDocument();
  });

  it('displays rush alert badge', () => {
    render(
      <StudentList 
        students={mockStudents} 
        loading={false} 
        onSelectStudent={() => {}} 
      />
    );
    
    expect(screen.getByText('Rush détecté!')).toBeInTheDocument();
  });
});