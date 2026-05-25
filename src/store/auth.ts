import { defineStore } from 'pinia';
import axiosClient from '../api/axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('access_token'),
    user: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    isAdmin: (state): boolean => state.user?.role === 'admin',
    isEditor: (state): boolean => state.user?.role === 'editor' || state.user?.role === 'admin',
  },

  actions: {
    async login(loginData: any) {
      this.loading = true;
      try {
        const response: any = await axiosClient.post('/auth/login', loginData);
        if (response.status === 'success') {
          this.token = response.data.access_token;
          this.user = response.data.user;
          localStorage.setItem('access_token', this.token as string);
          return true;
        }
        return false;
      } catch (error: any) {
        localStorage.removeItem('access_token');
        this.token = null;
        this.user = null;
        throw error.response?.data?.message || 'Đăng nhập không thành công';
      } finally {
        this.loading = false;
      }
    },

    async register(registerData: any) {
      this.loading = true;
      try {
        const response: any = await axiosClient.post('/auth/register', registerData);
        if (response.status === 'success') {
          this.token = response.data.access_token;
          this.user = response.data.user;
          localStorage.setItem('access_token', this.token as string);
          return true;
        }
        return false;
      } catch (error: any) {
        localStorage.removeItem('access_token');
        this.token = null;
        this.user = null;
        if (error.response?.data?.errors) {
          const errorsMap = error.response.data.errors;
          const firstErrKey = Object.keys(errorsMap)[0];
          throw errorsMap[firstErrKey][0];
        }
        throw error.response?.data?.message || 'Đăng ký không thành công';
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      if (!this.token) return;
      this.loading = true;
      try {
        const response: any = await axiosClient.get('/auth/me');
        if (response.status === 'success') {
          this.user = response.data;
        }
      } catch (error) {
        this.logout();
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('access_token');
    }
  }
});
