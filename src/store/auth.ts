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
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
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
          this.refreshToken = response.data.refresh_token;
          this.user = response.data.user;
          localStorage.setItem('access_token', this.token as string);
          localStorage.setItem('refresh_token', this.refreshToken as string);
          return true;
        }
        return false;
      } catch (error: any) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.token = null;
        this.refreshToken = null;
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
          this.refreshToken = response.data.refresh_token;
          this.user = response.data.user;
          localStorage.setItem('access_token', this.token as string);
          localStorage.setItem('refresh_token', this.refreshToken as string);
          return true;
        }
        return false;
      } catch (error: any) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.token = null;
        this.refreshToken = null;
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

    async changePassword(passwordData: any) {
      this.loading = true;
      try {
        const response: any = await axiosClient.post('/auth/change-password', passwordData);
        return response.status === 'success';
      } catch (error: any) {
        if (error.response?.data?.errors) {
          throw error.response.data.errors;
        }
        throw error.response?.data?.message || 'Đổi mật khẩu không thành công';
      } finally {
        this.loading = false;
      }
    },

    logout() {
      const rToken = localStorage.getItem('refresh_token');
      if (rToken) {
        axiosClient.post('/auth/logout', { refresh_token: rToken }).catch((e) => {
          console.error('Logout error on backend:', e);
        });
      }
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
});
