import { describe, it, expect, jest } from '@jest/globals';
import { 
  countCommitsInLastDays, 
  getLastCommitDate, 
  getDaysSinceLastCommit,
  detectRush,
  calculateActivityRate,
  calculateStudentMetrics
} from '../services/metrics.js';

describe('Metrics Service', () => {
  describe('countCommitsInLastDays', () => {
    it('should count commits in last 7 days', () => {
      const now = new Date();
      const commits = [
        { commit: { author: { date: now.toISOString() } } },
        { commit: { author: { date: new Date(now - 86400000 * 3).toISOString() } } },
        { commit: { author: { date: new Date(now - 86400000 * 10).toISOString() } } }
      ];
      
      expect(countCommitsInLastDays(commits, 7)).toBe(2);
    });

    it('should return 0 for empty commits', () => {
      expect(countCommitsInLastDays([], 7)).toBe(0);
    });
  });

  describe('getLastCommitDate', () => {
    it('should return the most recent commit date', () => {
      const now = new Date();
      const oldDate = new Date(now - 86400000 * 5);
      const commits = [
        { commit: { author: { date: oldDate.toISOString() } } },
        { commit: { author: { date: now.toISOString() } } }
      ];
      
      const result = getLastCommitDate(commits);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeCloseTo(now.getTime(), -3);
    });

    it('should return null for empty commits', () => {
      expect(getLastCommitDate([])).toBeNull();
    });
  });

  describe('getDaysSinceLastCommit', () => {
    it('should calculate days since last commit', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      expect(getDaysSinceLastCommit(twoDaysAgo)).toBe(2);
    });

    it('should return Infinity for null date', () => {
      expect(getDaysSinceLastCommit(null)).toBe(Infinity);
    });
  });

  describe('detectRush', () => {
    it('should detect rush when >50% commits in last 24h', () => {
      const now = new Date();
      const commits = [
        { commit: { author: { date: now.toISOString() } } },
        { commit: { author: { date: now.toISOString() } } },
        { commit: { author: { date: new Date(now - 86400000 * 2).toISOString() } } }
      ];
      
      expect(detectRush(commits)).toBe(true);
    });

    it('should not detect rush when <=50% commits in last 24h', () => {
      const now = new Date();
      const commits = [
        { commit: { author: { date: now.toISOString() } } },
        { commit: { author: { date: new Date(now - 86400000 * 2).toISOString() } } },
        { commit: { author: { date: new Date(now - 86400000 * 3).toISOString() } } }
      ];
      
      expect(detectRush(commits)).toBe(false);
    });

    it('should return false for empty commits', () => {
      expect(detectRush([])).toBe(false);
    });
  });

  describe('calculateActivityRate', () => {
    it('should calculate commits per week', () => {
      const now = new Date();
      const commits = [
        { commit: { author: { date: now.toISOString() } } },
        { commit: { author: { date: new Date(now - 86400000 * 3).toISOString() } } }
      ];
      
      // 2 commits in 4 weeks = 0.5 commits per week
      const rate = calculateActivityRate(commits, 4);
      expect(rate).toBeCloseTo(0.5, 1);
    });

    it('should return 0 for empty commits', () => {
      expect(calculateActivityRate([], 4)).toBe(0);
    });
  });

  describe('calculateStudentMetrics', () => {
    it('should calculate all metrics for a student', () => {
      const now = new Date();
      const user = {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.png',
        html_url: 'https://github.com/testuser'
      };
      const repos = [{ name: 'repo1' }, { name: 'repo2' }];
      const commits = [
        { commit: { author: { date: now.toISOString() } } },
        { commit: { author: { date: new Date(now - 86400000 * 2).toISOString() } } }
      ];
      
      const metrics = calculateStudentMetrics(user, repos, commits);
      
      expect(metrics.username).toBe('testuser');
      expect(metrics.displayName).toBe('Test User');
      expect(metrics.totalRepos).toBe(2);
      expect(metrics.totalCommits).toBe(2);
      expect(metrics.isInactive).toBe(false);
      expect(metrics.activityScore).toBeGreaterThan(0);
    });

    it('should detect inactive student', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 5);
      
      const user = { login: 'inactive', name: null, avatar_url: '', html_url: '' };
      const repos = [];
      const commits = [
        { commit: { author: { date: oldDate.toISOString() } } }
      ];
      
      const metrics = calculateStudentMetrics(user, repos, commits);
      
      expect(metrics.isInactive).toBe(true);
      expect(metrics.daysSinceLastCommit).toBeGreaterThanOrEqual(5);
    });

    it('should use username when displayName is null', () => {
      const user = {
        login: 'testuser',
        name: null,
        avatar_url: '',
        html_url: ''
      };
      
      const metrics = calculateStudentMetrics(user, [], []);
      
      expect(metrics.displayName).toBe('testuser');
    });
  });
});