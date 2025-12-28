import 'reflect-metadata';
import { UserController } from '../userController';
import { IUserApplication } from '../../application/userApplication';
import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { User, UserRole, UserResponse } from '../../types';

describe('UserController', () => {
  let userController: UserController;
  let mockUserApplication: jest.Mocked<IUserApplication>;
  let mockRequest: Partial<AuthRequest>;
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

    userController = new UserController(mockUserApplication);

    mockRequest = {
      user: {
        userId: 1,
        email: 'test@example.com',
        role: UserRole.USER
      },
      body: {},
      params: {}
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should return list of users', async () => {
      const mockUsers = [mockUserResponse];
      mockUserApplication.listUsers.mockResolvedValue(mockUsers);

      await userController.listUsers(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockUserApplication.listUsers).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return empty array when no users', async () => {
      mockUserApplication.listUsers.mockResolvedValue([]);

      await userController.listUsers(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      mockUserApplication.getUserById.mockResolvedValue(mockUser);
      mockUserApplication.toUserResponse.mockResolvedValue(mockUserResponse);

      await userController.getCurrentUser(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockUserApplication.getUserById).toHaveBeenCalledWith(1);
      expect(mockUserApplication.toUserResponse).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUserResponse);
    });

    it('should throw error when user not authenticated', async () => {
      mockRequest.user = undefined;

      await expect(
        userController.getCurrentUser(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow('Unauthorized');

      expect(mockUserApplication.getUserById).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      mockUserApplication.getUserById.mockRejectedValue(new Error('User not found'));

      await expect(
        userController.getCurrentUser(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow('User not found');
    });
  });

  describe('postUser', () => {
    it('should create user successfully', async () => {
      mockRequest.body = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'user'
      };

      const newUserResponse = {
        id: 2,
        name: 'New User',
        email: 'new@example.com',
        role: UserRole.USER,
        created_at: '2025-01-01'
      };

      mockUserApplication.createUser.mockResolvedValue(newUserResponse);

      await userController.postUser(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockUserApplication.createUser).toHaveBeenCalledWith(
        'New User',
        'new@example.com',
        'password123',
        'user'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newUserResponse);
    });

    it('should throw error when email already exists', async () => {
      mockRequest.body = {
        name: 'Duplicate',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      mockUserApplication.createUser.mockRejectedValue(new Error('Email already in use'));

      await expect(
        userController.postUser(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow('Email already in use');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: '1' };
      mockUserApplication.deleteUser.mockResolvedValue(undefined);

      await userController.deleteUser(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockUserApplication.deleteUser).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle deletion of non-existent user', async () => {
      mockRequest.params = { id: '999' };
      mockUserApplication.deleteUser.mockRejectedValue(new Error('User not found'));

      await expect(
        userController.deleteUser(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow('User not found');
    });
  });
});
