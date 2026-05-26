<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axiosClient from '../../api/axios';

interface Post {
  id: number;
  title: string;
  status: string;
  view_count: number;
}

interface Comment {
  id: number;
  status: string;
  author_name: string;
}

interface AuditLog {
  id: number;
  username: string;
  action: string;
  details: string;
  created_at: number;
}

const posts = ref<Post[]>([]);
const comments = ref<Comment[]>([]);
const logs = ref<AuditLog[]>([]);
const loading = ref(true);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    // 1. Fetch Posts
    const postResponse: any = await axiosClient.get('/admin/posts');
    if (postResponse.status === 'success') {
      posts.value = postResponse.data.posts;
    }
    
    // 2. Fetch Comments (only admin role has permission)
    try {
      const commentResponse: any = await axiosClient.get('/admin/comments');
      if (commentResponse.status === 'success') {
        comments.value = commentResponse.data;
      }
    } catch (e) {
      console.warn("User is likely an editor and cannot load comments.");
    }
    
    // 3. Fetch Logs (only admin role has permission)
    try {
      const logsResponse: any = await axiosClient.get('/admin/logs');
      if (logsResponse.status === 'success') {
        logs.value = logsResponse.data;
      }
    } catch (e) {
      console.warn("User is likely an editor and cannot load logs.");
    }
  } catch (error) {
    console.error('Không thể lấy dữ liệu Dashboard:', error);
  } finally {
    loading.value = false;
  }
};

const totalViews = computed(() => {
  return posts.value.reduce((sum, post) => sum + post.view_count, 0);
});

const activePostsCount = computed(() => {
  return posts.value.filter(p => p.status === 'published').length;
});

const pendingCommentsCount = computed(() => {
  return comments.value.filter(c => c.status === 'pending').length;
});

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="dashboard-view animate-fade-in">
    <div class="view-header">
      <h2 class="view-title">Bảng Điều Khiển</h2>
      <p class="view-subtitle">Tổng quan thông tin hoạt động hệ thống CMS</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu báo cáo...</p>
    </div>

    <template v-else>
      <!-- Stats Widget Widgets -->
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <div class="stat-icon views-icon">👁️</div>
          <div class="stat-info">
            <span class="stat-label">Tổng lượt xem</span>
            <span class="stat-number">{{ totalViews }}</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon posts-icon">📝</div>
          <div class="stat-info">
            <span class="stat-label">Bài viết đã xuất bản</span>
            <span class="stat-number">{{ activePostsCount }} <span class="sub-number">/ {{ posts.length }} bài</span></span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon comments-icon">💬</div>
          <div class="stat-info">
            <span class="stat-label">Bình luận chờ duyệt</span>
            <span class="stat-number">{{ pendingCommentsCount }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-details">
        <!-- Recent logs (Admin only) -->
        <div class="details-section glass-card" v-if="logs.length">
          <h3 class="section-title">Nhật ký hoạt động gần đây</h3>
          <div class="logs-list">
            <div v-for="log in logs.slice(0, 5)" :key="log.id" class="log-item">
              <div class="log-meta">
                <span class="log-user">👤 {{ log.username }}</span>
                <span class="log-time">{{ formatDate(log.created_at) }}</span>
              </div>
              <div class="log-action">
                <span class="action-tag">{{ log.action }}</span>
                <span class="action-details">{{ log.details }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System overview info -->
        <div class="details-section glass-card">
          <h3 class="section-title">Hướng dẫn quản trị</h3>
          <ul class="guide-list">
            <li><strong>Tạo bài viết:</strong> Điền đầy đủ thông tin bài viết, gắn tag, cập nhật SEO và tải ảnh đại diện lên để tối ưu hiển thị.</li>
            <li><strong>Phê duyệt bình luận:</strong> Admin sẽ duyệt các bình luận pending của người đọc trước khi xuất hiện chính thức tại bài viết.</li>
            <li><strong>Nhật ký bảo mật:</strong> Hệ thống lưu vết chi tiết từng thay đổi quan trọng để đảm bảo tính an toàn hệ thống.</li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.view-header {
  margin-bottom: 30px;
}

.view-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  margin-bottom: 6px;
}

.view-subtitle {
  color: hsl(var(--text-secondary));
  font-size: 0.95rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-color: var(--border-light);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: hsl(var(--bg-surface-elevated));
}

.views-icon {
  background-color: rgba(6, 182, 212, 0.1);
  color: hsl(var(--color-accent));
}

.posts-icon {
  background-color: rgba(139, 92, 246, 0.1);
  color: hsl(var(--color-primary-hover));
}

.comments-icon {
  background-color: rgba(245, 158, 11, 0.1);
  color: hsl(var(--color-warning));
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.85rem;
  color: hsl(var(--text-secondary));
  font-weight: 500;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
}

.sub-number {
  font-size: 0.9rem;
  color: hsl(var(--text-muted));
  font-weight: 500;
}

.dashboard-details {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 30px;
}

@media (max-width: 900px) {
  .dashboard-details {
    grid-template-columns: 1fr;
  }
}

.details-section {
  padding: 30px;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 20px;
  border-left: 3px solid hsl(var(--color-primary));
  padding-left: 12px;
  color: hsl(var(--text-primary));
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-item {
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 12px;
}

.log-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.log-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: hsl(var(--text-muted));
  margin-bottom: 6px;
}

.log-user {
  font-weight: 600;
}

.log-action {
  font-size: 0.9rem;
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-tag {
  background-color: hsl(var(--bg-surface-elevated));
  color: hsl(var(--color-primary-hover));
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.action-details {
  color: hsl(var(--text-secondary));
}

.guide-list {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: hsl(var(--text-secondary));
  font-size: 0.95rem;
}

.guide-list li {
  line-height: 1.6;
}

.loading-state {
  text-align: center;
  padding: 80px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid hsl(var(--bg-surface-elevated));
  border-top-color: hsl(var(--color-primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
