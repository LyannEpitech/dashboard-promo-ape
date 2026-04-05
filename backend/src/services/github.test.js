import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import GitHubService from './github.js';

describe('GitHubService', () => {
  let github;
  
  beforeEach(() => {
    github = new GitHubService('fake-token');
    // Mock console.error to avoid polluting test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with access token', () => {
      expect(github.accessToken).toBe('fake-token');
      expect(github.client).toBeDefined();
    });
  });

  describe('getOrgMembers', () => {
    it('should handle API errors gracefully', async () => {
      github.client.get = jest.fn().mockRejectedValue(new Error('API Error'));
      
      await expect(github.getOrgMembers('test-org')).rejects.toThrow('API Error');
    });
  });

  describe('getUser', () => {
    it('should return user data', async () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
        bio: 'A bio',
        location: 'Paris',
        company: 'Epitech'
      };
      github.client.get = jest.fn().mockResolvedValue({ data: mockUser });
      
      const result = await github.getUser('testuser');
      
      expect(result.login).toBe('testuser');
      expect(result.name).toBe('Test User');
    });

    it('should handle user not found', async () => {
      github.client.get = jest.fn().mockRejectedValue(new Error('Not Found'));
      
      await expect(github.getUser('nonexistent')).rejects.toThrow('Not Found');
    });
  });

  describe('getUserRepos', () => {
    it('should return repos list', async () => {
      const mockRepos = [
        { name: 'repo1', stargazers_count: 5 },
        { name: 'repo2', stargazers_count: 10 }
      ];
      github.client.get = jest.fn().mockResolvedValue({ data: mockRepos });
      
      const result = await github.getUserRepos('testuser');
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('repo1');
    });

    it('should handle API errors', async () => {
      github.client.get = jest.fn().mockRejectedValue(new Error('API Error'));
      
      await expect(github.getUserRepos('testuser')).rejects.toThrow('API Error');
    });
  });

  describe('getRepoCommits', () => {
    it('should return commits list', async () => {
      const mockCommits = [
        { sha: 'abc123', commit: { message: 'First commit' } },
        { sha: 'def456', commit: { message: 'Second commit' } }
      ];
      github.client.get = jest.fn().mockResolvedValue({ data: mockCommits });
      
      const result = await github.getRepoCommits('user', 'repo');
      
      expect(result).toHaveLength(2);
    });

    it('should return empty array on error', async () => {
      github.client.get = jest.fn().mockRejectedValue(new Error('Not Found'));
      
      const result = await github.getRepoCommits('user', 'repo');
      
      expect(result).toEqual([]);
    });
  });
});