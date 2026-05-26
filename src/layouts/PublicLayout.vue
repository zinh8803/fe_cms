<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useConfigStore } from '../store/config';

const router = useRouter();
const authStore = useAuthStore();
const configStore = useConfigStore();

const isLoggedIn = computed(() => authStore.isAuthenticated);

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchMe();
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<template>
  <div class="public-layout">
    <!-- Header Navigation -->
    <header class="header">
      <div class="container header-content">
        <router-link to="/" class="logo">
          <!-- <img style="width: 50px; height: 20px;" src="../../public/favicon.png" alt="TechBlog Logo" class="logo-icon" /> -->
          <span class="logo-accent">Tech</span>Blog
        </router-link>

        <nav class="nav-links">
          <router-link to="/" class="nav-item">Bài viết</router-link>
          
          <template v-if="isLoggedIn">
            <span class="welcome-text">Xin chào, {{ authStore.user?.username || 'Thành viên' }}</span>
            <router-link v-if="authStore.isEditor" to="/admin" class="nav-item btn btn-secondary btn-sm">
              Quản trị
            </router-link>
            <button @click="handleLogout" class="nav-item btn btn-danger btn-sm">
              Đăng xuất
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-item btn btn-secondary btn-sm">
              Đăng nhập
            </router-link>
            <router-link to="/register" class="nav-item btn btn-primary btn-sm">
              Đăng ký
            </router-link>
          </template>

          <span class="divider-v">|</span>

          <button @click="configStore.toggleTheme" class="icon-btn theme-btn" :title="configStore.theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'">
            {{ configStore.theme === 'dark' ? '🌙' : '☀️' }}
          </button>
          <button @click="configStore.toggleLang" class="icon-btn lang-btn" :title="configStore.lang === 'vi' ? 'English' : 'Tiếng Việt'">
            🌐 {{ configStore.lang === 'vi' ? 'VI' : 'EN' }}
          </button>
        </nav>
      </div>
    </header>

    <!-- Page Body -->
    <main class="main-body container animate-fade-in">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container text-muted text-center">
        <p>&copy; 2026 TechBlog. Powered by VueJS & Yii2.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: hsl(var(--bg-surface) / 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
}

.header-content {
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  letter-spacing: -0.02em;
}

.logo-accent {
  color: hsl(var(--color-primary));
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-item {
  color: hsl(var(--text-secondary));
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-item:hover, .router-link-active {
  color: hsl(var(--text-primary));
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.welcome-text {
  color: hsl(var(--text-secondary));
  font-size: 0.9rem;
  font-weight: 500;
}

.main-body {
  flex: 1;
  padding-top: 40px;
  padding-bottom: 60px;
}

.footer {
  padding: 30px 0;
  border-top: 1px solid var(--border-light);
  background-color: hsl(var(--bg-surface));
}

.text-center {
  text-align: center;
}

.text-muted {
  color: hsl(var(--text-muted));
  font-size: 0.9rem;
}

.divider-v {
  color: hsl(var(--text-muted));
  opacity: 0.5;
  margin: 0 4px;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  padding: 6px;
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
</style>
