import { Router } from 'express';
import { GithubController } from '../controllers/githubController';
import { authenticate } from '../middleware/auth';
import { container } from 'tsyringe';
import { validateParams } from '../middleware/validationMiddleware';
import { githubUsernameSchema } from '../schemas/githubUsernameSchema';

const router = Router();
const githubController = container.resolve(GithubController);

router.use(authenticate);

router.get('/users/:username', validateParams(githubUsernameSchema), githubController.getGitHubProfile);
router.get('/users/:username/repos', validateParams(githubUsernameSchema), githubController.getGitHubRepositories);

export default router;
