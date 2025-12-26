import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { inject, injectable } from 'tsyringe';
import { IUserApplication } from '../application/userApplication';

@injectable()
export class UserController {
  constructor(
    @inject("IUserApplication") private userApplication: IUserApplication
  ) { }

  listUsers = async (req: AuthRequest, res: Response) => {
    try {
      const users = await this.userApplication.listUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  };

  getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        throw new Error('Unauthorized');
      }

      const user = await this.userApplication.getUserById(req.user.userId);

      if (user === undefined) {
        throw new Error('User not found');
      }

      const userResponse = await this.userApplication.toUserResponse(user);
      res.json(userResponse);
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error('Failed to fetch user');
    }
  };

  postUser = async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        throw new Error('Name, email, password, and role are required');
      }

      const newUser = await this.userApplication.createUser(name, email, password, role);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  deleteUser = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      await this.userApplication.deleteUser(Number(id));
      res.status(204).send();
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  }

}
