<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useConfigStore } from '../store/config';
import { useToastStore } from '../store/toast';

const router = useRouter();
const authStore = useAuthStore();
const configStore = useConfigStore();
const toastStore = useToastStore();

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const fieldErrors = ref<any>({});
const globalError = ref('');
const loading = ref(false);

const handleUpdatePassword = async () => {
  fieldErrors.value = {};
  globalError.value = '';
  
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    globalError.value = configStore.lang === 'vi' 
      ? 'Vui lòng điền đầy đủ thông tin.' 
      : 'Please fill in all fields.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    fieldErrors.value.confirmPassword = [
      configStore.lang === 'vi' 
        ? 'Mật khẩu xác nhận không khớp.' 
        : 'Mismatched confirmation password.'
    ];
    return;
  }

  loading.value = true;
  try {
    const success = await authStore.changePassword({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    });
    
    if (success) {
      toastStore.success(
        configStore.lang === 'vi' 
          ? 'Đổi mật khẩu thành công!' 
          : 'Password updated successfully!'
      );
      oldPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      
      // Redirect back to home after 1.5s
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  } catch (err: any) {
    if (typeof err === 'object') {
      fieldErrors.value = err;
    } else {
      globalError.value = err;
      toastStore.error(err);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="profile-page">
    <div class="background-decorations">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="glass-card profile-card animate-fade-in">
      <div class="card-header">
        <h2 class="title">{{ configStore.lang === 'vi' ? 'Cập Nhật Mật Khẩu' : 'Update Password' }}</h2>
        <p class="subtitle">{{ configStore.lang === 'vi' ? 'Thay đổi mật khẩu tài khoản TechBlog của bạn' : 'Change your TechBlog account password' }}</p>
      </div>

      <form @submit.prevent="handleUpdatePassword" class="profile-form">
        <div v-if="globalError" class="alert alert-danger">
          {{ globalError }}
        </div>

        <div class="form-group">
          <label class="form-label" for="oldPassword">{{ configStore.lang === 'vi' ? 'Mật khẩu hiện tại' : 'Current Password' }} *</label>
          <input
            type="password"
            id="oldPassword"
            v-model="oldPassword"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
          <span v-if="fieldErrors.oldPassword" class="field-error">
            {{ fieldErrors.oldPassword[0] }}
          </span>
        </div>

        <div class="form-group">
          <label class="form-label" for="newPassword">{{ configStore.lang === 'vi' ? 'Mật khẩu mới' : 'New Password' }} *</label>
          <input
            type="password"
            id="newPassword"
            v-model="newPassword"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
          <span v-if="fieldErrors.newPassword" class="field-error">
            {{ fieldErrors.newPassword[0] }}
          </span>
        </div>

        <div class="form-group">
          <label class="form-label" for="confirmPassword">{{ configStore.lang === 'vi' ? 'Xác nhận mật khẩu mới' : 'Confirm New Password' }} *</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
          <span v-if="fieldErrors.confirmPassword" class="field-error">
            {{ fieldErrors.confirmPassword[0] }}
          </span>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? (configStore.lang === 'vi' ? 'Đang cập nhật...' : 'Updating...') : (configStore.lang === 'vi' ? 'Đổi mật khẩu' : 'Update Password') }}
        </button>

        <div class="auth-helper-links">
          <router-link to="/">{{ configStore.lang === 'vi' ? 'Về trang chủ' : 'Back to Home' }}</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 300px;
  height: 300px;
  background-color: hsl(var(--color-primary));
  top: 10%;
  right: 10%;
}

.circle-2 {
  width: 350px;
  height: 350px;
  background-color: hsl(var(--color-accent));
  bottom: 10%;
  left: 10%;
}

.profile-card {
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
  font-size: 1.6rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  margin-bottom: 8px;
}

.subtitle {
  color: hsl(var(--text-secondary));
  font-size: 0.9rem;
}

.profile-form {
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

.field-error {
  color: hsl(var(--color-danger));
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
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
}

.auth-helper-links a {
  color: hsl(var(--text-secondary));
  text-decoration: none;
}

.auth-helper-links a:hover {
  color: hsl(var(--color-primary));
}
</style>
