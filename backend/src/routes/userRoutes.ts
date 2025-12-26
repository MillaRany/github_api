import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { container } from 'tsyringe';

const router = Router();
const userController = container.resolve(UserController);

router.use(authenticate);

router.get('/me', userController.getCurrentUser);

router.get('/', authorize(UserRole.ADMIN), userController.listUsers);

router.post('/', authorize(UserRole.ADMIN), userController.postUser);

router.delete('/:id', authorize(UserRole.ADMIN), userController.deleteUser);

export default router;
