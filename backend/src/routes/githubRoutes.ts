import { Router } from 'express';
import { getGitHubProfile, getGitHubRepositories } from '../controllers/githubController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/profile/:username', getGitHubProfile);

router.get('/repos/:username', getGitHubRepositories);

export default router;
