import { inject, injectable } from 'tsyringe';
import { IHttpClient } from '../infrastructure/httpClient';
import { GitHubProfile, GitHubRepository } from '../types';
import { AxiosError } from 'axios';

const GITHUB_API_URL = 'https://api.github.com';

export interface PaginationOptions {
  page?: string;
  per_page?: string;
}

export interface IGithubApplication {
  getProfile(username: string): Promise<GitHubProfile>;
  getRepositories(username: string, options?: PaginationOptions): Promise<GitHubRepository[]>;
}

@injectable()
export class GithubApplication implements IGithubApplication {
  private readonly githubToken: string | undefined;

  constructor(
    @inject("IHttpClient") private httpClient: IHttpClient
  ) {
    this.githubToken = process.env.GITHUB_TOKEN;
  }

  private getGitHubHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    };

    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }

    return headers;
  }

  async getProfile(username: string): Promise<GitHubProfile> {
    try {
      const profile = await this.httpClient.get<GitHubProfile>(
        `${GITHUB_API_URL}/users/${username}`,
        { headers: this.getGitHubHeaders() }
      );

      return profile;
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('GitHub user not found');
      }
      throw new Error('Failed to fetch GitHub profile');
    }
  }

  async getRepositories(username: string, options: PaginationOptions = {}): Promise<GitHubRepository[]> {
    try {
      const { page = '1', per_page = '30' } = options;

      const repositories = await this.httpClient.get<GitHubRepository[]>(
        `${GITHUB_API_URL}/users/${username}/repos`,
        {
          headers: this.getGitHubHeaders(),
          params: {
            page,
            per_page,
            sort: 'updated'
          }
        }
      );

      return repositories;
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('GitHub user not found');
      }
      throw new Error('Failed to fetch GitHub repositories');
    }
  }

  private isAxiosError(error: any): error is AxiosError {
    return error.isAxiosError === true;
  }
}
