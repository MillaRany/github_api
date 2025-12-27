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
    const users = await this.userApplication.listUsers();
    res.json(users);
  };

  getCurrentUser = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new Error('Unauthorized');
    }

    const user = await this.userApplication.getUserById(req.user.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const userResponse = await this.userApplication.toUserResponse(user);
    res.json(userResponse);
  };

  postUser = async (req: AuthRequest, res: Response) => {
    // Dados já validados pelo middleware!
    const { name, email, password, role } = req.body;

    const newUser = await this.userApplication.createUser(name, email, password, role);
    res.status(201).json(newUser);
  };

  deleteUser = async (req: AuthRequest, res: Response) => {
    // ID já validado e convertido para number pelo middleware!
    const { id } = req.params;

    await this.userApplication.deleteUser(Number(id));
    res.status(204).send();
  };
}
