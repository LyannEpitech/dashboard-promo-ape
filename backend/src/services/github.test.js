import { describe, it, expect, jest } from '@jest/globals';
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

  describe('getRepoCommits', () => {
    it('should return empty array on error', async () => {
      github.client.get = jest.fn().mockRejectedValue(new Error('Not Found'));
      
      const result = await github.getRepoCommits('user', 'repo');
      
      expect(result).toEqual([]);
    });
  });
});