import { database } from '../database/db';
import bcrypt from 'bcryptjs';
import { User, UserRole, UserResponse } from '../types';
import { injectable } from 'tsyringe';


export interface IUserModel{
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: number): Promise<User | undefined>;
  findAll(): Promise<UserResponse[]>;
  create(name: string, email: string, password: string, role?: UserRole): Promise<UserResponse>;
  delete(id: number): Promise<void>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  toUserResponse(user: User): UserResponse;
}

@injectable()
export class UserModel implements IUserModel {
  async findByEmail(email: string): Promise<User | undefined> {
    return database.get<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  async findById(id: number): Promise<User | undefined> {
    return database.get<User>(
      'SELECT id, email, password FROM users WHERE id = ?',
      [id]
    );
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await database.all<User>(
      'SELECT id, name, email, role, created_at FROM users'
    );
    return users;
  }

  async create(name: string, email: string, password: string, role: UserRole = UserRole.USER): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await database.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const user = await this.findByEmail(email);
    return this.toUserResponse(user!);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async delete(id: number): Promise<void> {
    await database.run(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
  }

  toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };
  }
}
