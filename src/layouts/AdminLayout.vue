<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useConfigStore } from '../store/config';

const router = useRouter();
const authStore = useAuthStore();
const configStore = useConfigStore();

const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="admin-layout-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <router-link to="/admin">
          <span class="logo-accent">Tech</span>Blog <span class="admin-badge">Admin</span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-link-item" exact-active-class="active">
          <span class="icon">📊</span> Bảng điều khiển
        </router-link>
        
        <router-link to="/admin/posts" class="nav-link-item" active-class="active">
          <span class="icon">📝</span> Quản lý bài viết
        </router-link>

        <router-link to="/admin/media" class="nav-link-item" active-class="active">
          <span class="icon">🖼️</span> Kho ảnh
        </router-link>

        <template v-if="isAdmin">
          <router-link to="/admin/categories" class="nav-link-item" active-class="active">
            <span class="icon">📁</span> Danh mục
          </router-link>

          <router-link to="/admin/tags" class="nav-link-item" active-class="active">
            <span class="icon">🏷️</span> Thẻ tag
          </router-link>

          <router-link to="/admin/comments" class="nav-link-item" active-class="active">
            <span class="icon">💬</span> Duyệt bình luận
          </router-link>

          <router-link to="/admin/logs" class="nav-link-item" active-class="active">
            <span class="icon">🛡️</span> Nhật ký hệ thống
          </router-link>
        </template>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/" class="nav-link-item back-home">
          <span class="icon">🏠</span> Xem Trang chủ
        </router-link>
      </div>
    </aside>

    <!-- Main Content Panel -->
    <div class="main-panel">
      <header class="topbar">
        <div class="topbar-title">
          CMS Administration
        </div>

        <div class="topbar-user" v-if="user">
          <button @click="configStore.toggleTheme" class="icon-btn theme-btn" :title="configStore.theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'">
            {{ configStore.theme === 'dark' ? '🌙' : '☀️' }}
          </button>
          <div class="user-info">
            <span class="username">{{ user.username }}</span>
            <span class="role-badge" :class="user.role">{{ user.role }}</span>
          </div>
          <button @click="handleLogout" class="btn btn-secondary btn-sm logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout-container {
  display: flex;
  min-height: 100vh;
  background-color: hsl(var(--bg-base));
}

.sidebar {
  width: 260px;
  background-color: hsl(var(--bg-surface));
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-light);
}

.sidebar-logo a {
  font-size: 1.3rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  letter-spacing: -0.01em;
}

.logo-accent {
  color: hsl(var(--color-primary));
}

.admin-badge {
  font-size: 0.7rem;
  background-color: hsl(var(--color-accent) / 0.15);
  color: hsl(var(--color-accent));
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
  border: 1px solid hsl(var(--color-accent) / 0.3);
}

.sidebar-nav {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: hsl(var(--text-secondary));
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link-item:hover {
  background-color: hsl(var(--bg-surface-elevated));
  color: hsl(var(--text-primary));
}

.nav-link-item.active {
  background-color: hsl(var(--color-primary) / 0.15);
  color: hsl(var(--color-primary-hover));
  border: 1px solid hsl(var(--color-primary) / 0.2);
}

.icon {
  font-size: 1.1rem;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-light);
}

.back-home {
  background-color: hsl(var(--bg-surface-elevated) / 0.5);
  color: hsl(var(--text-primary));
}

.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.topbar {
  height: 70px;
  background-color: hsl(var(--bg-surface));
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.topbar-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.username {
  font-weight: 500;
  font-size: 0.95rem;
}

.role-badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  padding: 0px 6px;
  margin-top: 2px;
}

.role-badge.admin {
  background-color: rgba(239, 68, 68, 0.15);
  color: hsl(var(--color-danger));
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.role-badge.editor {
  background-color: rgba(139, 92, 246, 0.15);
  color: hsl(var(--color-primary));
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.logout-btn {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
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
