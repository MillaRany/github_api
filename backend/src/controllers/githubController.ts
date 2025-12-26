import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { GitHubProfile, GitHubRepository } from '../types';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const getGitHubHeaders = () => {
  const headers: any = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  return headers;
};

export const getGitHubProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const response = await axios.get<GitHubProfile>(
      `${GITHUB_API_URL}/users/${username}`,
      { headers: getGitHubHeaders() }
    );

    res.json(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    console.error('Error fetching GitHub profile:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub profile' });
  }
};

export const getGitHubRepositories = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const { page = '1', per_page = '30' } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const response = await axios.get<GitHubRepository[]>(
      `${GITHUB_API_URL}/users/${username}/repos`,
      {
        headers: getGitHubHeaders(),
        params: {
          page,
          per_page,
          sort: 'updated'
        }
      }
    );

    res.json(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    console.error('Error fetching GitHub repositories:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub repositories' });
  }
};
