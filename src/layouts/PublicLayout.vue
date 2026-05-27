<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useConfigStore } from '../store/config';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const configStore = useConfigStore();

const isLoggedIn = computed(() => authStore.isAuthenticated);
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

watch(() => route.path, () => {
  isMenuOpen.value = false;
});

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchMe();
  }
});

const handleLogout = () => {
  authStore.logout();
  isMenuOpen.value = false;
  router.push('/');
};
</script>

<template>
  <div class="public-layout">
    <!-- Header Navigation -->
    <header class="header">
      <div class="container header-content">
        <router-link to="/" class="logo">
          <span class="logo-accent">Tech</span>Blog
        </router-link>

        <!-- Hamburger Toggle Button for Mobile -->
        <button @click="toggleMenu" class="menu-toggle" :class="{ 'is-open': isMenuOpen }" aria-label="Toggle Navigation">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <nav class="nav-links" :class="{ 'is-open': isMenuOpen }">
          <router-link to="/" class="nav-item">
            {{ configStore.lang === 'vi' ? 'Bài viết' : 'Articles' }}
          </router-link>
          
          <template v-if="isLoggedIn">
            <span class="welcome-text">
              {{ configStore.lang === 'vi' ? 'Xin chào,' : 'Hello,' }} {{ authStore.user?.username || (configStore.lang === 'vi' ? 'Thành viên' : 'Member') }}
            </span>
            <router-link to="/change-password" class="nav-item-btn btn btn-secondary btn-sm">
              {{ configStore.lang === 'vi' ? 'Đổi mật khẩu' : 'Password' }}
            </router-link>
            <router-link v-if="authStore.isEditor" to="/admin" class="nav-item-btn btn btn-secondary btn-sm">
              {{ configStore.lang === 'vi' ? 'Quản trị' : 'Admin' }}
            </router-link>
            <button @click="handleLogout" class="nav-item-btn btn btn-danger btn-sm">
              {{ configStore.lang === 'vi' ? 'Đăng xuất' : 'Logout' }}
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-item-btn btn btn-secondary btn-sm">
              {{ configStore.lang === 'vi' ? 'Đăng nhập' : 'Login' }}
            </router-link>
            <router-link to="/register" class="nav-item-btn btn btn-primary btn-sm">
              {{ configStore.lang === 'vi' ? 'Đăng ký' : 'Register' }}
            </router-link>
          </template>

          <span class="divider-v">|</span>

          <div class="nav-actions">
            <button @click="configStore.toggleTheme" class="icon-btn theme-btn" :title="configStore.theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'">
              {{ configStore.theme === 'dark' ? '🌙' : '☀️' }}
            </button>
            <button @click="configStore.toggleLang" class="icon-btn lang-btn" :title="configStore.lang === 'vi' ? 'English' : 'Tiếng Việt'">
              🌐 {{ configStore.lang === 'vi' ? 'VI' : 'EN' }}
            </button>
          </div>
        </nav>
      </div>
    </header>

    <!-- Page Body -->
    <main class="main-body container animate-fade-in">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-content text-muted">
        <p>&copy; 2026 TechBlog. Powered by VueJS & Yii2.</p>
        <p>{{ configStore.lang === 'vi' ? 'Liên hệ:' : 'Contact:' }} <a href="mailto:ngoquocvinh2003@gmail.com" class="footer-link">ngoquocvinh2003@gmail.com</a></p>
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
  width: 100%;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: hsl(var(--bg-surface) / 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
}

.header-content {
  height: 76px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.6rem;
  font-weight: 800;
  color: hsl(var(--text-primary));
  letter-spacing: -0.03em;
}

.logo-accent {
  background: linear-gradient(135deg, hsl(var(--color-primary-hover)), hsl(var(--color-accent)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 2px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-item {
  color: hsl(var(--text-secondary));
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
  padding: 6px 4px;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, hsl(var(--color-primary)), hsl(var(--color-accent)));
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.nav-item:hover::after, .router-link-active.nav-item::after {
  width: 100%;
}

.nav-item:hover, .router-link-active.nav-item {
  color: hsl(var(--text-primary));
}

.nav-item-btn {
  margin: 0 2px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.85rem;
  border-radius: 10px;
}

.welcome-text {
  color: hsl(var(--text-secondary));
  font-size: 0.9rem;
  font-weight: 600;
  background: hsl(var(--bg-surface-elevated) / 0.6);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.main-body {
  flex: 1;
  padding-top: 40px;
  padding-bottom: 60px;
}

.footer {
  padding: 36px 0;
  border-top: 1px solid var(--border-light);
  background-color: hsl(var(--bg-surface) / 0.4);
  backdrop-filter: blur(8px);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.footer-link {
  color: hsl(var(--text-secondary));
  font-weight: 600;
  border-bottom: 1px dashed hsl(var(--text-muted));
  padding-bottom: 1px;
}

.footer-link:hover {
  color: hsl(var(--color-primary-hover));
  border-bottom-color: hsl(var(--color-primary-hover));
}

.text-muted {
  color: hsl(var(--text-muted));
  font-size: 0.9rem;
}

.divider-v {
  color: hsl(var(--text-muted));
  opacity: 0.4;
  margin: 0 6px;
}

.icon-btn {
  background: hsl(var(--bg-surface-elevated) / 0.4);
  border: 1px solid var(--border-light);
  font-size: 1.1rem;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.25s ease;
}

.icon-btn:hover {
  background-color: hsl(var(--bg-surface-elevated));
  color: hsl(var(--text-primary));
  transform: scale(1.05);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Mobile Toggle Hamburger Button */
.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 110;
}

.menu-toggle .bar {
  width: 100%;
  height: 2px;
  background-color: hsl(var(--text-primary));
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-toggle.is-open .bar:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.menu-toggle.is-open .bar:nth-child(2) {
  opacity: 0;
}

.menu-toggle.is-open .bar:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

@media (max-width: 900px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 76px;
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(100vh - 76px);
    background: hsl(var(--bg-surface) / 0.98);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 40px 20px;
    gap: 20px;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 99;
    overflow-y: auto;
    border-bottom: 1px solid var(--border-light);
  }

  .nav-links.is-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .nav-item {
    font-size: 1.15rem;
    width: 100%;
    text-align: center;
    padding: 12px;
    border-radius: 10px;
    display: block;
  }

  .welcome-text {
    font-size: 1.1rem;
    margin-bottom: 5px;
    text-align: center;
    width: 100%;
  }

  .divider-v {
    display: none;
  }

  .nav-actions {
    margin-top: 15px;
    gap: 20px;
  }
}
</style>
