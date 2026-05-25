<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axiosClient from '../../api/axios';
import { useToastStore } from '../../store/toast';

const toastStore = useToastStore();

interface Comment {
  id: number;
  post_title: string;
  post_id: number;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  created_at: number;
}

const comments = ref<Comment[]>([]);
const loading = ref(true);
const activeTab = ref<'pending' | 'approved' | 'hidden'>('pending');

const fetchComments = async () => {
  loading.value = true;
  try {
    const response: any = await axiosClient.get('/admin/comments');
    if (response.status === 'success') {
      comments.value = response.data;
    }
  } catch (error) {
    console.error('Không thể tải danh sách bình luận:', error);
  } finally {
    loading.value = false;
  }
};

const filteredComments = computed(() => {
  return comments.value.filter(comment => comment.status === activeTab.value);
});

const handleModerate = async (id: number, status: 'approved' | 'hidden' | 'delete') => {
  let confirmMsg = '';
  if (status === 'delete') {
    confirmMsg = 'Bạn có chắc chắn muốn xóa bình luận này vĩnh viễn không?';
  } else if (status === 'approved') {
    confirmMsg = 'Duyệt bình luận này hiển thị công khai?';
  } else {
    confirmMsg = 'Ẩn bình luận này đi?';
  }

  if (!confirm(confirmMsg)) return;

  try {
    const response: any = await axiosClient.put(`/admin/comments/${id}`, { status });
    if (response.status === 'success') {
      toastStore.success(response.message);
      fetchComments();
    }
  } catch (error: any) {
    toastStore.error(error.response?.data?.message || 'Lỗi khi kiểm duyệt bình luận.');
  }
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchComments();
});
</script>

<template>
  <div class="comment-view animate-fade-in">
    <div class="view-header">
      <h2 class="view-title">Kiểm Duyệt Bình Luận</h2>
      <p class="view-subtitle">Phê duyệt hoặc ẩn các bình luận của người đọc</p>
    </div>

    <!-- Moderation Tabs -->
    <div class="tabs-container">
      <button
        @click="activeTab = 'pending'"
        class="tab-btn"
        :class="{ active: activeTab === 'pending' }"
      >
        ⏳ Chờ duyệt ({{ comments.filter(c => c.status === 'pending').length }})
      </button>
      <button
        @click="activeTab = 'approved'"
        class="tab-btn"
        :class="{ active: activeTab === 'approved' }"
      >
        ✅ Đã duyệt ({{ comments.filter(c => c.status === 'approved').length }})
      </button>
      <button
        @click="activeTab = 'hidden'"
        class="tab-btn"
        :class="{ active: activeTab === 'hidden' }"
      >
        🚫 Bị ẩn ({{ comments.filter(c => c.status === 'hidden').length }})
      </button>
    </div>

    <!-- Comments List Table -->
    <div class="table-container glass-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải danh sách bình luận...</p>
      </div>

      <template v-else>
        <div v-if="filteredComments.length === 0" class="no-data">
          Không có bình luận nào trong danh mục này.
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Thông tin người gửi</th>
              <th>Nội dung bình luận</th>
              <th>Bài viết liên quan</th>
              <th>Thời gian</th>
              <th class="actions-col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comment in filteredComments" :key="comment.id">
              <td class="author-cell">
                <div class="author-details">
                  <span class="author-name">{{ comment.author_name }}</span>
                  <span class="author-email">{{ comment.author_email }}</span>
                </div>
              </td>
              <td class="content-cell">
                <p class="comment-text">{{ comment.content }}</p>
              </td>
              <td>
                <a :href="'/posts/' + comment.id" target="_blank" class="post-link">
                  {{ comment.post_title }}
                </a>
              </td>
              <td>{{ formatDate(comment.created_at) }}</td>
              <td class="actions-cell">
                <template v-if="comment.status === 'pending'">
                  <button @click="handleModerate(comment.id, 'approved')" class="btn btn-success btn-xs">
                    ✔️ Duyệt
                  </button>
                  <button @click="handleModerate(comment.id, 'hidden')" class="btn btn-secondary btn-xs">
                    ❌ Từ chối
                  </button>
                </template>
                <template v-if="comment.status === 'approved'">
                  <button @click="handleModerate(comment.id, 'hidden')" class="btn btn-secondary btn-xs">
                    🚫 Ẩn
                  </button>
                </template>
                <template v-if="comment.status === 'hidden'">
                  <button @click="handleModerate(comment.id, 'approved')" class="btn btn-success btn-xs">
                    🔓 Hiện
                  </button>
                </template>
                <button @click="handleModerate(comment.id, 'delete')" class="btn btn-danger btn-xs">
                  🗑️ Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </div>
</template>

<style scoped>
.view-header {
  margin-bottom: 30px;
}

.view-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
}

.view-subtitle {
  color: hsl(var(--text-secondary));
  font-size: 0.95rem;
}

.tabs-container {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.tab-btn {
  background-color: hsl(var(--bg-surface));
  color: hsl(var(--text-secondary));
  border: 1px solid var(--border-light);
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover, .tab-btn.active {
  background-color: hsl(var(--color-primary) / 0.15);
  color: hsl(var(--color-primary-hover));
  border-color: hsl(var(--color-primary) / 0.3);
}

.table-container {
  overflow-x: auto;
  border-color: rgba(255, 255, 255, 0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.data-table th, .data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  vertical-align: top;
}

.data-table th {
  background-color: hsl(var(--bg-surface-elevated) / 0.5);
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.data-table tr:hover {
  background-color: hsl(var(--bg-surface) / 0.3);
}

.author-cell {
  min-width: 160px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: white;
}

.author-email {
  font-size: 0.8rem;
  color: hsl(var(--text-muted));
}

.content-cell {
  max-width: 320px;
}

.comment-text {
  color: hsl(var(--text-secondary));
  line-height: 1.5;
  white-space: pre-wrap;
}

.post-link {
  color: white;
  font-weight: 500;
}

.post-link:hover {
  color: hsl(var(--color-primary-hover));
}

.actions-col {
  text-align: right;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-xs {
  padding: 6px 10px;
  font-size: 0.8rem;
  border-radius: 6px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: hsl(var(--text-muted));
}

.loading-state {
  text-align: center;
  padding: 60px 0;
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
