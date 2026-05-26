<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useConfigStore } from '../store/config';

const router = useRouter();
const authStore = useAuthStore();
const configStore = useConfigStore();

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

const handleRegister = async () => {
  if (!username.value || !email.value || !password.value) {
    errorMessage.value = configStore.lang === 'vi' ? 'Vui lòng điền đầy đủ tất cả các trường.' : 'Please fill in all fields.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const success = await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });

    if (success) {
      successMessage.value = configStore.lang === 'vi' ? 'Đăng ký tài khoản thành công! Đang chuyển hướng...' : 'Registration successful! Redirecting...';
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      errorMessage.value = configStore.lang === 'vi' ? 'Đăng ký tài khoản thất bại. Vui lòng thử lại.' : 'Registration failed. Please try again.';
    }
  } catch (err: any) {
    errorMessage.value = err || (configStore.lang === 'vi' ? 'Đăng ký không thành công.' : 'Registration unsuccessful.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-page">
    <!-- Top actions (Theme / Lang) -->
    <div class="top-actions animate-fade-in">
      <button @click="configStore.toggleTheme" class="icon-btn theme-btn" :title="configStore.theme === 'dark' ? (configStore.lang === 'vi' ? 'Chế độ sáng' : 'Light Mode') : (configStore.lang === 'vi' ? 'Chế độ tối' : 'Dark Mode')">
        {{ configStore.theme === 'dark' ? '🌙' : '☀️' }}
      </button>
      <button @click="configStore.toggleLang" class="icon-btn lang-btn" :title="configStore.lang === 'vi' ? 'English' : 'Tiếng Việt'">
        🌐 {{ configStore.lang === 'vi' ? 'VI' : 'EN' }}
      </button>
    </div>

    <div class="background-decorations">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="glass-card register-card animate-fade-in">
      <div class="card-header">
        <h2 class="title">{{ configStore.lang === 'vi' ? 'Đăng Ký Tài Khoản' : 'Create Account' }}</h2>
        <p class="subtitle">{{ configStore.lang === 'vi' ? 'Tạo tài khoản để tham gia bình luận các bài viết' : 'Create an account to join comments on articles' }}</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <div class="form-group">
          <label class="form-label" for="username">{{ configStore.lang === 'vi' ? 'Tên hiển thị (Tài khoản)' : 'Display Name (Username)' }}</label>
          <input
            type="text"
            id="username"
            v-model="username"
            class="form-input"
            placeholder="NguyenVanA"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="email">{{ configStore.lang === 'vi' ? 'Địa chỉ Email' : 'Email Address' }}</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-input"
            placeholder="example@gmail.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">{{ configStore.lang === 'vi' ? 'Mật khẩu' : 'Password' }}</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? (configStore.lang === 'vi' ? 'Đang đăng ký...' : 'Registering...') : (configStore.lang === 'vi' ? 'Đăng ký ngay' : 'Register Now') }}
        </button>

        <div class="auth-helper-links">
          <router-link to="/login">{{ configStore.lang === 'vi' ? 'Đã có tài khoản? Đăng nhập' : 'Already have an account? Sign In' }}</router-link>
          <span class="divider">|</span>
          <router-link to="/">{{ configStore.lang === 'vi' ? 'Về trang chủ' : 'Back to Home' }}</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: hsl(var(--bg-base));
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Top Actions bar styling */
.top-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background-color: hsl(var(--bg-surface-elevated));
  color: hsl(var(--text-primary));
}

/* Background Glowing Circles */
.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background-color: hsl(var(--color-primary));
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 450px;
  height: 450px;
  background-color: hsl(var(--color-accent));
  bottom: -150px;
  left: -150px;
}

.register-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;
  z-index: 10;
  border-color: var(--border-light);
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  margin-bottom: 8px;
}

.subtitle {
  color: hsl(var(--text-secondary));
  font-size: 0.9rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alert {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
}

.alert-danger {
  background-color: rgba(239, 68, 68, 0.15);
  color: hsl(var(--color-danger));
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.alert-success {
  background-color: rgba(16, 185, 129, 0.15);
  color: hsl(var(--color-success));
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-weight: 600;
}

.auth-helper-links {
  text-align: center;
  margin-top: 10px;
  font-size: 0.9rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.auth-helper-links a {
  color: hsl(var(--text-secondary));
}

.auth-helper-links a:hover {
  color: hsl(var(--color-primary));
}

.divider {
  color: hsl(var(--text-muted));
  font-size: 0.8rem;
}

@media (max-width: 480px) {
  .register-card {
    padding: 24px 20px;
  }
  .title {
    font-size: 1.5rem;
  }
}
</style>
