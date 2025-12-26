import { Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AuthRequest } from '../middleware/auth';
import { IGithubApplication } from '../application/githubApplication';

@injectable()
export class GithubController {
  constructor(
    @inject("IGithubApplication") private githubApplication: IGithubApplication
  ) {}

  getGitHubProfile = async (req: AuthRequest, res: Response) => {
    const { username } = req.params;

    const profile = await this.githubApplication.getProfile(username);
    res.json(profile);
  };

  getGitHubRepositories = async (req: AuthRequest, res: Response) => {
    const { username } = req.params;
    const { page = '1', per_page = '30' } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const repositories = await this.githubApplication.getRepositories(username, {
      page: page as string,
      per_page: per_page as string
    });

    res.json(repositories);
  };
}
