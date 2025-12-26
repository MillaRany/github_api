import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';
import { LoginRequest, User, UserRole } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN);

  const loadFromStorage = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  };

  const login = async (credentials: LoginRequest) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await authApi.login(credentials);
      
      token.value = response.token;
      user.value = response.user;

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      user.value = currentUser;
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (err) {
      logout();
    }
  };

  loadFromStorage();

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchCurrentUser
  };
});
