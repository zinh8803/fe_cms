<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axiosClient, { API_URL } from '../../api/axios';
import { useToastStore } from '../../store/toast';

const toastStore = useToastStore();

interface Post {
  id: number;
  title: string;
  slug: string;
  author: string;
  category: { id: number; name: string } | null;
  tags: string[];
  thumbnail_url: string | null;
  status: string;
  visibility: string;
  view_count: number;
  created_at: number;
}

interface Pagination {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  pageCount: number;
}

const posts = ref<Post[]>([]);
const pagination = ref<Pagination | null>(null);
const loading = ref(true);

const filterTitle = ref('');
const filterStatus = ref('');
const filterVisibility = ref('');
const currentPage = ref(1);

const fetchPosts = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
    };
    if (filterTitle.value) params.title = filterTitle.value;
    if (filterStatus.value) params.status = filterStatus.value;
    if (filterVisibility.value) params.visibility = filterVisibility.value;

    const response: any = await axiosClient.get('/admin/posts', { params });
    if (response.status === 'success') {
      posts.value = response.data.posts;
      pagination.value = response.data.pagination;
    }
  } catch (error) {
    console.error('Không thể tải bài viết:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  currentPage.value = 1;
  fetchPosts();
};

const handleReset = () => {
  filterTitle.value = '';
  filterStatus.value = '';
  filterVisibility.value = '';
  currentPage.value = 1;
  fetchPosts();
};

const deletePost = async (id: number) => {
  if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không? Bài viết sẽ được lưu trữ (soft delete) và có thể khôi phục lại từ database.')) {
    return;
  }

  try {
    const response: any = await axiosClient.delete(`/admin/posts/${id}`);
    if (response.status === 'success') {
      toastStore.success('Đã xóa tạm thời bài viết thành công.');
      fetchPosts();
    }
  } catch (error: any) {
    toastStore.error(error.response?.data?.message || 'Không thể xóa bài viết.');
  }
};

const changePage = (page: number) => {
  if (page < 1 || (pagination.value && page > pagination.value.pageCount)) return;
  currentPage.value = page;
  fetchPosts();
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric', day: 'numeric' });
};

onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <div class="post-list-view animate-fade-in">
    <div class="view-header-row">
      <div class="view-header">
        <h2 class="view-title">Quản Lý Bài Viết</h2>
        <p class="view-subtitle">Danh sách các bài viết trong hệ thống</p>
      </div>
      <router-link to="/admin/posts/new" class="btn btn-primary">
        ➕ Viết bài mới
      </router-link>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar glass-card">
      <input
        type="text"
        v-model="filterTitle"
        placeholder="Tìm theo tiêu đề..."
        class="form-input"
        @keyup.enter="handleFilter"
      />
      
      <select v-model="filterStatus" class="form-select" @change="handleFilter">
        <option value="">-- Trạng thái --</option>
        <option value="draft">Bản nháp</option>
        <option value="published">Đã xuất bản</option>
      </select>

      <select v-model="filterVisibility" class="form-select" @change="handleFilter">
        <option value="">-- Chế độ hiển thị --</option>
        <option value="public">Công khai</option>
        <option value="private">Riêng tư</option>
      </select>

      <div class="filter-actions">
        <button @click="handleFilter" class="btn btn-secondary">Lọc</button>
        <button @click="handleReset" class="btn btn-secondary text-muted">Đặt lại</button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container glass-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải bài viết...</p>
      </div>

      <template v-else>
        <div v-if="posts.length === 0" class="no-data">
          Không tìm thấy bài viết nào phù hợp.
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Người viết</th>
              <th>Lượt xem</th>
              <th>Trạng thái</th>
              <th>Hiển thị</th>
              <th>Ngày tạo</th>
              <th class="actions-col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <td class="post-title-cell">
                <div class="title-wrap">
                  <span class="thumbnail-preview" v-if="post.thumbnail_url">
                    <img :src="API_URL + post.thumbnail_url" alt="" />
                  </span>
                  <div class="title-details">
                    <a :href="'/posts/' + post.slug" target="_blank" class="post-link">
                      {{ post.title }}
                    </a>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge badge-category" v-if="post.category">
                  {{ post.category.name }}
                </span>
                <span v-else class="text-muted">Chưa phân loại</span>
              </td>
              <td>{{ post.author }}</td>
              <td>👁️ {{ post.view_count }}</td>
              <td>
                <span class="badge" :class="'badge-' + post.status">
                  {{ post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp' }}
                </span>
              </td>
              <td>
                <span class="badge badge-tag" :class="post.visibility">
                  {{ post.visibility === 'public' ? 'Công khai' : 'Riêng tư' }}
                </span>
              </td>
              <td>{{ formatDate(post.created_at) }}</td>
              <td class="actions-cell">
                <router-link :to="'/admin/posts/' + post.id + '/edit'" class="btn btn-secondary btn-xs">
                  ✏️ Sửa
                </router-link>
                <button @click="deletePost(post.id)" class="btn btn-danger btn-xs">
                  🗑️ Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination-row" v-if="pagination && pagination.pageCount > 1">
          <button
            @click="changePage(currentPage - 1)"
            class="btn btn-secondary btn-sm"
            :disabled="currentPage === 1"
          >
            Trước
          </button>
          <span class="page-info">Trang {{ currentPage }} / {{ pagination.pageCount }}</span>
          <button
            @click="changePage(currentPage + 1)"
            class="btn btn-secondary btn-sm"
            :disabled="currentPage === pagination.pageCount"
          >
            Sau
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.view-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.view-header {
  flex: 1;
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

.filter-bar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 20px;
  margin-bottom: 30px;
  border-color: var(--border-light);
}

@media (max-width: 768px) {
  .filter-bar {
    grid-template-columns: 1fr;
  }
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.table-container {
  overflow-x: auto;
  border-color: var(--border-light);
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
}

.data-table th {
  background-color: hsl(var(--bg-surface-elevated) / 0.5);
  font-weight: 600;
  color: hsl(var(--text-primary));
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.data-table tr:hover {
  background-color: hsl(var(--bg-surface) / 0.3);
}

.post-title-cell {
  max-width: 300px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thumbnail-preview {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  background-color: hsl(var(--bg-surface-elevated));
  flex-shrink: 0;
}

.thumbnail-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-details {
  overflow: hidden;
}

.post-link {
  color: hsl(var(--text-primary));
  font-weight: 600;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  display: block;
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
  border-bottom: none !important;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 0.8rem;
  border-radius: 6px;
}

.pagination-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid var(--border-light);
}

.page-info {
  font-size: 0.85rem;
  color: hsl(var(--text-secondary));
  font-weight: 500;
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
