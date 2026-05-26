import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Bearer Access Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle HTTP authorization errors globally
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized and avoid loops
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/auth/refresh-token' || originalRequest.url === 'auth/refresh-token') {
        // Refresh token itself failed/expired
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        try {
          const { useAuthStore } = await import('../store/auth');
          const authStore = useAuthStore();
          authStore.token = null;
          authStore.refreshToken = null;
          authStore.user = null;
        } catch (e) {}

        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Use raw axios to prevent recursion
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refresh_token: refreshToken
          });

          if (response.data && response.data.status === 'success') {
            const data = response.data.data;
            const newAccessToken = data.access_token;
            const newRefreshToken = data.refresh_token;

            localStorage.setItem('access_token', newAccessToken);
            localStorage.setItem('refresh_token', newRefreshToken);

            // Update Pinia store
            try {
              const { useAuthStore } = await import('../store/auth');
              const authStore = useAuthStore();
              authStore.token = newAccessToken;
              authStore.refreshToken = newRefreshToken;
            } catch (e) {
              console.error('Failed to update auth store:', e);
            }

            processQueue(null, newAccessToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          try {
            const { useAuthStore } = await import('../store/auth');
            const authStore = useAuthStore();
            authStore.token = null;
            authStore.refreshToken = null;
            authStore.user = null;
          } catch (e) {}

          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available
        localStorage.removeItem('access_token');
        try {
          const { useAuthStore } = await import('../store/auth');
          const authStore = useAuthStore();
          authStore.token = null;
          authStore.user = null;
        } catch (e) {}
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
