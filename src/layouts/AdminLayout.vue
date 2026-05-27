<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useConfigStore } from '../store/config';
import axiosClient from '../api/axios';

const router = useRouter();
const authStore = useAuthStore();
const configStore = useConfigStore();

const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const notifications = ref<{ id: number; type: string; content: string; is_read: number; created_at: number }[]>([]);
const unreadCount = ref(0);
const showNotificationsDropdown = ref(false);
let pollingInterval: any = null;

const fetchNotifications = async () => {
  try {
    const response: any = await axiosClient.get('/admin/notifications');
    if (response.status === 'success') {
      notifications.value = response.data.notifications;
      unreadCount.value = response.data.unreadCount;
    }
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
  }
};

const markAsRead = async (id: number) => {
  try {
    await axiosClient.put(`/admin/notifications/${id}/read`);
    fetchNotifications();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const markAllAsRead = async () => {
  try {
    await axiosClient.put('/admin/notifications/read-all');
    fetchNotifications();
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const clickNotification = (item: { id: number; type: string }) => {
  markAsRead(item.id);
  showNotificationsDropdown.value = false;
  if (item.type === 'comment') {
    router.push('/admin/comments');
  }
};

onMounted(() => {
  fetchNotifications();
  pollingInterval = setInterval(fetchNotifications, 30000);
});

onBeforeUnmount(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});
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
          <span class="icon">📊</span> {{ configStore.lang === 'vi' ? 'Bảng điều khiển' : 'Dashboard' }}
        </router-link>
        
        <router-link to="/admin/posts" class="nav-link-item" active-class="active">
          <span class="icon">📝</span> {{ configStore.lang === 'vi' ? 'Quản lý bài viết' : 'Manage Articles' }}
        </router-link>

        <router-link to="/admin/media" class="nav-link-item" active-class="active">
          <span class="icon">🖼️</span> {{ configStore.lang === 'vi' ? 'Kho ảnh' : 'Media Library' }}
        </router-link>

        <template v-if="isAdmin">
          <router-link to="/admin/categories" class="nav-link-item" active-class="active">
            <span class="icon">📁</span> {{ configStore.lang === 'vi' ? 'Danh mục' : 'Categories' }}
          </router-link>

          <router-link to="/admin/tags" class="nav-link-item" active-class="active">
            <span class="icon">🏷️</span> {{ configStore.lang === 'vi' ? 'Thẻ tag' : 'Tags' }}
          </router-link>

          <router-link to="/admin/comments" class="nav-link-item" active-class="active">
            <span class="icon">💬</span> {{ configStore.lang === 'vi' ? 'Duyệt bình luận' : 'Moderate Comments' }}
          </router-link>

          <router-link to="/admin/logs" class="nav-link-item" active-class="active">
            <span class="icon">🛡️</span> {{ configStore.lang === 'vi' ? 'Nhật ký hệ thống' : 'System Logs' }}
          </router-link>

          <router-link to="/admin/post-views" class="nav-link-item" active-class="active">
            <span class="icon">👁️</span> {{ configStore.lang === 'vi' ? 'Thống kê lượt xem' : 'View Logs' }}
          </router-link>
        </template>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/" class="nav-link-item back-home">
          <span class="icon">🏠</span> {{ configStore.lang === 'vi' ? 'Xem Trang chủ' : 'View Site' }}
        </router-link>
      </div>
    </aside>

    <!-- Main Content Panel -->
    <div class="main-panel">
      <header class="topbar">
        <div class="topbar-title">
          {{ configStore.lang === 'vi' ? 'Quản trị hệ thống' : 'CMS Administration' }}
        </div>

        <div class="topbar-user" v-if="user">
          <!-- Notification Bell -->
          <div class="notification-wrapper">
            <button @click="showNotificationsDropdown = !showNotificationsDropdown" class="icon-btn notification-btn" :title="configStore.lang === 'vi' ? 'Thông báo' : 'Notifications'">
              🔔
              <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
            </button>
            
            <div v-if="showNotificationsDropdown" class="notification-dropdown glass-card">
              <div class="dropdown-header">
                <span class="dropdown-title">
                  {{ configStore.lang === 'vi' ? 'Thông báo mới' : 'New Notifications' }}
                </span>
                <button v-if="unreadCount > 0" @click="markAllAsRead" class="read-all-btn">
                  {{ configStore.lang === 'vi' ? 'Đọc tất cả' : 'Read all' }}
                </button>
              </div>

              <div class="dropdown-body">
                <div v-if="notifications.length === 0" class="empty-notifications">
                  {{ configStore.lang === 'vi' ? 'Không có thông báo nào' : 'No notifications' }}
                </div>
                <div
                  v-else
                  v-for="item in notifications"
                  :key="item.id"
                  @click="clickNotification(item)"
                  class="notification-item"
                  :class="{ unread: !item.is_read }"
                >
                  <div class="notification-icon">💬</div>
                  <div class="notification-content">
                    <p class="notification-text">{{ item.content }}</p>
                    <span class="notification-time">⏳ {{ new Date(item.created_at * 1000).toLocaleTimeString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button @click="configStore.toggleTheme" class="icon-btn theme-btn" :title="configStore.lang === 'vi' ? (configStore.theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối') : (configStore.theme === 'dark' ? 'Light Mode' : 'Dark Mode')">
            {{ configStore.theme === 'dark' ? '🌙' : '☀️' }}
          </button>
          <button @click="configStore.toggleLang" class="icon-btn lang-btn" :title="configStore.lang === 'vi' ? 'English' : 'Tiếng Việt'">
            🌐 {{ configStore.lang === 'vi' ? 'VI' : 'EN' }}
          </button>
          <div class="user-info">
            <span class="username">{{ user.username }}</span>
            <span class="role-badge" :class="user.role">{{ user.role }}</span>
          </div>
          <button @click="handleLogout" class="btn btn-secondary btn-sm logout-btn">
            {{ configStore.lang === 'vi' ? 'Đăng xuất' : 'Logout' }}
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

.notification-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: hsl(var(--color-danger));
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid hsl(var(--bg-surface));
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  display: flex;
  flex-direction: column;
  border-color: var(--border-glow);
  background: var(--glass-bg);
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: hsl(var(--text-primary));
}

.read-all-btn {
  background: transparent;
  border: none;
  color: hsl(var(--color-primary-hover));
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.read-all-btn:hover {
  text-decoration: underline;
}

.dropdown-body {
  overflow-y: auto;
}

.empty-notifications {
  padding: 30px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 0.9rem;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
}

.notification-item:hover {
  background-color: hsl(var(--bg-surface-elevated));
}

.notification-item.unread {
  background-color: hsl(var(--color-primary) / 0.05);
}

.notification-icon {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.notification-text {
  font-size: 0.85rem;
  color: hsl(var(--text-primary));
  line-height: 1.4;
  margin: 0;
}

.notification-time {
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
}
</style>
