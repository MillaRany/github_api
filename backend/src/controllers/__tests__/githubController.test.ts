import 'reflect-metadata';
import { GithubController } from '../githubController';
import { IGithubApplication } from '../../application/githubApplication';
import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { GitHubProfile, GitHubRepository, UserRole } from '../../types';

describe('GithubController', () => {
  let githubController: GithubController;
  let mockGithubApplication: jest.Mocked<IGithubApplication>;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;

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
    mockGithubApplication = {
      getProfile: jest.fn(),
      getRepositories: jest.fn()
    } as jest.Mocked<IGithubApplication>;

    githubController = new GithubController(mockGithubApplication);

    mockRequest = {
      user: {
        userId: 1,
        email: 'test@example.com',
        role: UserRole.USER
      },
      params: {},
      query: {}
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGitHubProfile', () => {
    it('should return GitHub profile successfully', async () => {
      mockRequest.params = { username: 'testuser' };
      mockGithubApplication.getProfile.mockResolvedValue(mockProfile);

      await githubController.getGitHubProfile(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockGithubApplication.getProfile).toHaveBeenCalledWith('testuser');
      expect(mockResponse.json).toHaveBeenCalledWith(mockProfile);
    });

    it('should throw error when user not found', async () => {
      mockRequest.params = { username: 'nonexistent' };
      mockGithubApplication.getProfile.mockRejectedValue(new Error('GitHub user not found'));

      await expect(
        githubController.getGitHubProfile(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow('GitHub user not found');
    });
  });

  describe('getGitHubRepositories', () => {
    it('should return repositories with default pagination', async () => {
      mockRequest.params = { username: 'testuser' };
      mockRequest.query = {};
      mockGithubApplication.getRepositories.mockResolvedValue(mockRepositories);

      await githubController.getGitHubRepositories(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockGithubApplication.getRepositories).toHaveBeenCalledWith('testuser', {
        page: '1',
        per_page: '30'
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockRepositories);
    });

    it('should return repositories with custom pagination', async () => {
      mockRequest.params = { username: 'testuser' };
      mockRequest.query = { page: '2', per_page: '10' };
      mockGithubApplication.getRepositories.mockResolvedValue(mockRepositories);

      await githubController.getGitHubRepositories(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockGithubApplication.getRepositories).toHaveBeenCalledWith('testuser', {
        page: '2',
        per_page: '10'
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockRepositories);
    });

    it('should return 400 when username is missing', async () => {
      mockRequest.params = {};
      mockRequest.query = {};

      await githubController.getGitHubRepositories(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username is required' });
      expect(mockGithubApplication.getRepositories).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      mockRequest.params = { username: 'nonexistent' };
      mockRequest.query = {};
      mockGithubApplication.getRepositories.mockRejectedValue(new Error('GitHub user not found'));

      await expect(
        githubController.getGitHubRepositories(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow('GitHub user not found');
    });
  });
});
