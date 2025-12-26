import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { LoginRequest } from '../types';
import { inject, injectable } from 'tsyringe';
import { IUserApplication } from '../application/userApplication';

@injectable()
export class AuthController {
  constructor(
    @inject("IUserApplication") private userApplication: IUserApplication,
  ) { }

  login = async (req: Request, res: Response) => {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const user = await this.userApplication.getUserByEmail(email);

      await this.userApplication.verifyUserPassword(password, user.password);

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const userResponse = await this.userApplication.toUserResponse(user);

      res.json({
        token,
        user: userResponse
      });
  };
}