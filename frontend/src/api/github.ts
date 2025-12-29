import api from './axios';
import { GitHubProfile, GitHubRepository } from '@/types';

export const githubApi = {
  getProfile: async (username: string): Promise<GitHubProfile> => {
    const response = await api.get<GitHubProfile>(`/github/users/${username}`);
    return response.data;
  },

  getRepositories: async (username: string, page = 1, perPage = 30): Promise<GitHubRepository[]> => {
    const response = await api.get<GitHubRepository[]>(`/github/users/${username}/repos`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  }
};
