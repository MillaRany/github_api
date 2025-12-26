import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateData } from '../middleware/validationMiddleware';
import { loginRequestSchema } from '../schemas/loginSchemas';
import { container } from 'tsyringe';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/login', validateData(loginRequestSchema), authController.login);

export default router;
