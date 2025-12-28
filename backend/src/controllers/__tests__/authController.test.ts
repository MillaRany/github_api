import 'reflect-metadata';
import { AuthController } from '../authController';
import { IUserApplication } from '../../application/userApplication';
import { Request, Response } from 'express';
import { User, UserRole, UserResponse } from '../../types';
import { generateToken } from '../../utils/jwt';

jest.mock('../../utils/jwt');

describe('AuthController', () => {
  let authController: AuthController;
  let mockUserApplication: jest.Mocked<IUserApplication>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    role: UserRole.USER,
    created_at: '2025-01-01'
  };

  const mockUserResponse: UserResponse = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
    created_at: '2025-01-01'
  };

  beforeEach(() => {
    mockUserApplication = {
      getUserByEmail: jest.fn(),
      getUserById: jest.fn(),
      listUsers: jest.fn(),
      verifyUserPassword: jest.fn(),
      toUserResponse: jest.fn(),
      createUser: jest.fn(),
      deleteUser: jest.fn()
    } as jest.Mocked<IUserApplication>;

    authController = new AuthController(mockUserApplication);

    mockRequest = {
      body: {}
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    (generateToken as jest.Mock).mockReturnValue('mock-jwt-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockUserApplication.getUserByEmail.mockResolvedValue(mockUser);
      mockUserApplication.verifyUserPassword.mockResolvedValue(true);
      mockUserApplication.toUserResponse.mockResolvedValue(mockUserResponse);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockUserApplication.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserApplication.verifyUserPassword).toHaveBeenCalledWith('password123', mockUser.password);
      expect(mockUserApplication.toUserResponse).toHaveBeenCalledWith(mockUser);
      expect(generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'mock-jwt-token',
        user: mockUserResponse
      });
    });

    it('should throw error when user not found', async () => {
      mockRequest.body = {
        email: 'notfound@example.com',
        password: 'password123'
      };

      mockUserApplication.getUserByEmail.mockRejectedValue(new Error('User not found'));

      await expect(
        authController.login(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('User not found');

      expect(mockUserApplication.verifyUserPassword).not.toHaveBeenCalled();
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should throw error when password is invalid', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockUserApplication.getUserByEmail.mockResolvedValue(mockUser);
      mockUserApplication.verifyUserPassword.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authController.login(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('Invalid credentials');

      expect(generateToken).not.toHaveBeenCalled();
    });
  });
});
