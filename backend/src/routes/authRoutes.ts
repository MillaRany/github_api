import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateBody } from '../middleware/validationMiddleware';
import { loginRequestSchema } from '../schemas/loginSchemas';
import { container } from 'tsyringe';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/login', validateBody(loginRequestSchema), authController.login);

export default router;
