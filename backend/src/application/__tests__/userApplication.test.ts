import 'reflect-metadata';
import { userApplication } from '../userApplication';
import { IUserModel } from '../../models/User';
import { User, UserRole } from '../../types';

describe('UserApplication', () => {
  let userApp: userApplication;
  let mockUserModel: jest.Mocked<IUserModel>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    role: UserRole.USER,
    created_at: '2025-01-01 00:00:00'
  };

  beforeEach(() => {
    mockUserModel = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      verifyPassword: jest.fn(),
      toUserResponse: jest.fn()
    } as jest.Mocked<IUserModel>;

    userApp = new userApplication(mockUserModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      mockUserModel.findByEmail.mockResolvedValue(mockUser);

      const result = await userApp.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserModel.findByEmail).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      mockUserModel.findByEmail.mockResolvedValue(undefined);

      await expect(userApp.getUserByEmail('notfound@example.com'))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await userApp.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error when user not found', async () => {
      mockUserModel.findById.mockResolvedValue(undefined);

      await expect(userApp.getUserById(999))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('listUsers', () => {
    it('should return array of users', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com', role: UserRole.USER, created_at: '2025-01-01' },
        { id: 2, name: 'User 2', email: 'user2@example.com', role: UserRole.ADMIN, created_at: '2025-01-02' }
      ];

      mockUserModel.findAll.mockResolvedValue(mockUsers);

      const result = await userApp.listUsers();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users', async () => {
      mockUserModel.findAll.mockResolvedValue([]);

      const result = await userApp.listUsers();

      expect(result).toEqual([]);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const newUserResponse = {
        id: 2,
        name: 'New User',
        email: 'new@example.com',
        role: UserRole.USER,
        created_at: '2025-01-01'
      };

      mockUserModel.findByEmail.mockResolvedValue(undefined);
      mockUserModel.create.mockResolvedValue(newUserResponse);

      const result = await userApp.createUser('New User', 'new@example.com', 'password123', 'user');

      expect(result).toEqual(newUserResponse);
      expect(mockUserModel.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUserModel.create).toHaveBeenCalledWith('New User', 'new@example.com', 'password123', 'user');
    });

    it('should throw error when email already exists', async () => {
      mockUserModel.findByEmail.mockResolvedValue(mockUser);

      await expect(
        userApp.createUser('Duplicate', 'test@example.com', 'password123')
      ).rejects.toThrow('Email already in use');

      expect(mockUserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyUserPassword', () => {
    it('should return true for valid password', async () => {
      mockUserModel.verifyPassword.mockResolvedValue(true);

      const result = await userApp.verifyUserPassword('password123', '$2a$10$hashed');

      expect(result).toBe(true);
      expect(mockUserModel.verifyPassword).toHaveBeenCalledWith('password123', '$2a$10$hashed');
    });

    it('should throw error for invalid password', async () => {
      mockUserModel.verifyPassword.mockResolvedValue(false);

      await expect(
        userApp.verifyUserPassword('wrongpassword', '$2a$10$hashed')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockUserModel.delete.mockResolvedValue(undefined);

      await userApp.deleteUser(1);

      expect(mockUserModel.delete).toHaveBeenCalledWith(1);
      expect(mockUserModel.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('toUserResponse', () => {
    it('should convert user to user response', async () => {
      const userResponse = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
        created_at: '2025-01-01'
      };

      mockUserModel.toUserResponse.mockReturnValue(userResponse);

      const result = await userApp.toUserResponse(mockUser);

      expect(result).toEqual(userResponse);
      expect(mockUserModel.toUserResponse).toHaveBeenCalledWith(mockUser);
    });
  });
});