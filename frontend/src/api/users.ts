import api from './axios';
import { User, CreateUserRequest } from '@/types';

export const usersApi = {
  listUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  }
};
