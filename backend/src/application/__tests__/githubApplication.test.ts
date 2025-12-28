import 'reflect-metadata';
import { GithubApplication } from '../githubApplication';
import { IHttpClient } from '../../infrastructure/httpClient';
import { GitHubProfile, GitHubRepository } from '../../types';

describe('GithubApplication', () => {
  let githubApp: GithubApplication;
  let mockHttpClient: jest.Mocked<IHttpClient>;

  const mockProfile: GitHubProfile = {
    login: 'testuser',
    id: 12345,
    avatar_url: 'https://avatar.url',
    name: 'Test User',
    company: 'Test Company',
    blog: 'https://blog.com',
    location: 'Test City',
    email: 'test@example.com',
    bio: 'Test bio',
    public_repos: 10,
    followers: 100,
    following: 50
  };

  const mockRepositories: GitHubRepository[] = [
    {
      id: 1,
      name: 'test-repo',
      full_name: 'testuser/test-repo',
      description: 'Test repository',
      html_url: 'https://github.com/testuser/test-repo',
      stargazers_count: 10,
      watchers_count: 10,
      forks_count: 5,
      language: 'TypeScript',
      updated_at: '2025-01-01'
    }
  ];

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<IHttpClient>;

    githubApp = new GithubApplication(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return GitHub profile successfully', async () => {
      mockHttpClient.get.mockResolvedValue(mockProfile);

      const result = await githubApp.getProfile('testuser');

      expect(result).toEqual(mockProfile);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github.v3+json'
          })
        })
      );
    });

    it('should throw error when user not found', async () => {
      const error = {
        isAxiosError: true,
        response: { status: 404 }
      };
      mockHttpClient.get.mockRejectedValue(error);

      await expect(githubApp.getProfile('nonexistent'))
        .rejects
        .toThrow('GitHub user not found');
    });

    it('should throw generic error for other failures', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      await expect(githubApp.getProfile('testuser'))
        .rejects
        .toThrow('Failed to fetch GitHub profile');
    });
  });

  describe('getRepositories', () => {
    it('should return repositories with default pagination', async () => {
      mockHttpClient.get.mockResolvedValue(mockRepositories);

      const result = await githubApp.getRepositories('testuser');

      expect(result).toEqual(mockRepositories);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser/repos',
        expect.objectContaining({
          params: {
            page: '1',
            per_page: '30',
            sort: 'updated'
          }
        })
      );
    });

    it('should return repositories with custom pagination', async () => {
      mockHttpClient.get.mockResolvedValue(mockRepositories);

      const result = await githubApp.getRepositories('testuser', {
        page: '2',
        per_page: '10'
      });

      expect(result).toEqual(mockRepositories);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser/repos',
        expect.objectContaining({
          params: {
            page: '2',
            per_page: '10',
            sort: 'updated'
          }
        })
      );
    });

    it('should throw error when user not found', async () => {
      const error = {
        isAxiosError: true,
        response: { status: 404 }
      };
      mockHttpClient.get.mockRejectedValue(error);

      await expect(githubApp.getRepositories('nonexistent'))
        .rejects
        .toThrow('GitHub user not found');
    });
  });
});