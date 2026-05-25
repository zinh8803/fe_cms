<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

const handleRegister = async () => {
  if (!username.value || !email.value || !password.value) {
    errorMessage.value = 'Vui lòng điền đầy đủ tất cả các trường.';
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
      successMessage.value = 'Đăng ký tài khoản thành công! Đang chuyển hướng...';
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      errorMessage.value = 'Đăng ký tài khoản thất bại. Vui lòng thử lại.';
    }
  } catch (err: any) {
    errorMessage.value = err || 'Đăng ký không thành công.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-page">
    <div class="background-decorations">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="glass-card register-card animate-fade-in">
      <div class="card-header">
        <h2 class="title">Đăng Ký Tài Khoản</h2>
        <p class="subtitle">Tạo tài khoản để tham gia bình luận các bài viết</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <div class="form-group">
          <label class="form-label" for="username">Tên hiển thị (Tài khoản)</label>
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
          <label class="form-label" for="email">Địa chỉ Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-input"
            placeholder="username@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Mật khẩu</label>
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
          {{ loading ? 'Đang đăng ký...' : 'Đăng ký ngay' }}
        </button>

        <div class="auth-helper-links">
          <router-link to="/login">Đã có tài khoản? Đăng nhập</router-link>
          <span class="divider">|</span>
          <router-link to="/">Về trang chủ</router-link>
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
  border-color: rgba(255, 255, 255, 0.05);
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
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
</style>
