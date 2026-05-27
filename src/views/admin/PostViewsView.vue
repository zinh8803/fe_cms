<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axiosClient from '../../api/axios';
import { useConfigStore } from '../../store/config';

const configStore = useConfigStore();

interface PostViewRecord {
  id: number;
  post_title: string;
  ip_address: string;
  user_agent: string;
  referrer: string | null;
  is_spam: number;
  viewed_at: number;
}

const views = ref<PostViewRecord[]>([]);
const loading = ref(true);

// Filters state
const postTitleFilter = ref('');
const ipFilter = ref('');
const isSpamFilter = ref('');

// Pagination state
const currentPage = ref(1);
const pageSize = ref(15);
const totalCount = ref(0);
const pageCount = ref(0);

// Dynamic Metrics state
const totalHits = ref(0);
const spamHits = ref(0);
const validHits = ref(0);

const fetchViews = async (page = 1) => {
  loading.value = true;
  currentPage.value = page;
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    if (postTitleFilter.value.trim()) {
      params.post_title = postTitleFilter.value.trim();
    }
    if (ipFilter.value.trim()) {
      params.ip_address = ipFilter.value.trim();
    }
    if (isSpamFilter.value !== '') {
      params.is_spam = isSpamFilter.value;
    }

    const response: any = await axiosClient.get('/admin/post-views', { params });
    if (response.status === 'success') {
      views.value = response.data.views;
      totalHits.value = response.data.metrics.total;
      spamHits.value = response.data.metrics.spam;
      validHits.value = response.data.metrics.valid;
      
      totalCount.value = response.data.pagination.totalCount;
      pageCount.value = response.data.pagination.pageCount;
    }
  } catch (error) {
    console.error('Không thể tải nhật ký lượt xem:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  fetchViews(1);
};

const handleReset = () => {
  postTitleFilter.value = '';
  ipFilter.value = '';
  isSpamFilter.value = '';
  fetchViews(1);
};

const changePage = (page: number) => {
  if (page >= 1 && page <= pageCount.value) {
    fetchViews(page);
  }
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

onMounted(() => {
  fetchViews();
});
</script>

<template>
  <div class="views-log-page animate-fade-in">
    <div class="view-header">
      <h2 class="view-title">
        {{ configStore.lang === 'vi' ? 'Nhật Ký Lượt Xem' : 'Post View Logs' }}
      </h2>
      <p class="view-subtitle">
        {{ configStore.lang === 'vi' 
          ? 'Theo dõi nguồn truy cập, thiết bị độc giả và ngăn chặn spam F5 tăng lượt xem ảo' 
          : 'Track traffic sources, reader user agents and prevent F5 view count inflation' 
        }}
      </p>
    </div>

    <!-- Summary Widgets -->
    <div class="metrics-grid">
      <div class="metric-card glass-card">
        <div class="metric-icon total">📊</div>
        <div class="metric-details">
          <span class="metric-value">{{ totalHits }}</span>
          <span class="metric-label">{{ configStore.lang === 'vi' ? 'Tổng số lượt truy cập' : 'Total Hits' }}</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon valid">✅</div>
        <div class="metric-details">
          <span class="metric-value">{{ validHits }}</span>
          <span class="metric-label">{{ configStore.lang === 'vi' ? 'Lượt xem hợp lệ' : 'Valid Views' }}</span>
        </div>
      </div>
      <div class="metric-card glass-card">
        <div class="metric-icon spam">⚠️</div>
        <div class="metric-details">
          <span class="metric-value">{{ spamHits }}</span>
          <span class="metric-label">{{ configStore.lang === 'vi' ? 'Lượt xem F5 bị chặn' : 'F5 Spams Blocked' }}</span>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-container glass-card mb-4 animate-fade-in">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">
            {{ configStore.lang === 'vi' ? 'Tiêu đề bài viết' : 'Post Title' }}
          </label>
          <input 
            type="text" 
            v-model="postTitleFilter" 
            :placeholder="configStore.lang === 'vi' ? 'Tìm theo bài viết...' : 'Search by post...'" 
            class="filter-input"
            @keyup.enter="handleFilter"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            {{ configStore.lang === 'vi' ? 'Địa chỉ IP' : 'IP Address' }}
          </label>
          <input 
            type="text" 
            v-model="ipFilter" 
            :placeholder="configStore.lang === 'vi' ? 'Tìm theo IP...' : 'Search by IP...'" 
            class="filter-input"
            @keyup.enter="handleFilter"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            {{ configStore.lang === 'vi' ? 'Trạng thái' : 'Status' }}
          </label>
          <select v-model="isSpamFilter" class="filter-select" @change="handleFilter">
            <option value="">{{ configStore.lang === 'vi' ? 'Tất cả trạng thái' : 'All status' }}</option>
            <option value="0">{{ configStore.lang === 'vi' ? 'Hợp lệ' : 'Valid' }}</option>
            <option value="1">{{ configStore.lang === 'vi' ? 'Spam F5 bị chặn' : 'F5 Spam Blocked' }}</option>
          </select>
        </div>
        <div class="filter-actions">
          <button @click="handleFilter" class="btn btn-primary">
            {{ configStore.lang === 'vi' ? 'Tìm kiếm' : 'Search' }}
          </button>
          <button @click="handleReset" class="btn btn-secondary">
            {{ configStore.lang === 'vi' ? 'Đặt lại' : 'Reset' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Log Table -->
    <div class="table-container glass-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ configStore.lang === 'vi' ? 'Đang tải nhật ký lượt xem...' : 'Loading view logs...' }}</p>
      </div>

      <template v-else>
        <div v-if="views.length === 0" class="no-data">
          {{ configStore.lang === 'vi' ? 'Chưa ghi nhận lượt xem nào cho các bài viết.' : 'No post view log recorded.' }}
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>{{ configStore.lang === 'vi' ? 'Bài viết' : 'Post' }}</th>
              <th>{{ configStore.lang === 'vi' ? 'Địa chỉ IP' : 'IP Address' }}</th>
              <th>{{ configStore.lang === 'vi' ? 'Nguồn (Referrer)' : 'Referrer Source' }}</th>
              <th>{{ configStore.lang === 'vi' ? 'Trạng thái' : 'Status' }}</th>
              <th>{{ configStore.lang === 'vi' ? 'Thời gian' : 'Time' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="view in views" :key="view.id" :class="{ 'spam-row': view.is_spam === 1 }">
              <td class="post-cell">
                <strong>{{ view.post_title }}</strong>
              </td>
              <td>
                <span class="ip-badge">{{ view.ip_address || 'N/A' }}</span>
                <span class="user-agent" :title="view.user_agent">
                  🖥️ {{ view.user_agent ? (view.user_agent.length > 50 ? view.user_agent.slice(0, 50) + '...' : view.user_agent) : 'N/A' }}
                </span>
              </td>
              <td class="referrer-cell">
                <a v-if="view.referrer" :href="view.referrer" target="_blank" class="ref-link" :title="view.referrer">
                  🔗 {{ view.referrer }}
                </a>
                <span v-else class="text-muted">{{ configStore.lang === 'vi' ? 'Trực tiếp / Không rõ' : 'Direct / Unknown' }}</span>
              </td>
              <td>
                <span v-if="view.is_spam === 1" class="status-badge spam">
                  ⚠️ Spam F5
                </span>
                <span v-else class="status-badge valid">
                  ✅ Hợp lệ
                </span>
              </td>
              <td class="time-cell">{{ formatDate(view.viewed_at) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div v-if="pageCount > 1" class="pagination-container">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)"
          >
            ← {{ configStore.lang === 'vi' ? 'Trước' : 'Prev' }}
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in pageCount" 
              :key="page" 
              class="page-number-btn" 
              :class="{ active: page === currentPage }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button 
            class="page-btn" 
            :disabled="currentPage === pageCount" 
            @click="changePage(currentPage + 1)"
          >
            {{ configStore.lang === 'vi' ? 'Sau' : 'Next' }} →
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.views-log-page {
  max-width: 100%;
}

.view-header {
  margin-bottom: 24px;
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-color: var(--border-light);
}

.metric-icon {
  font-size: 2.2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon.total {
  background-color: hsl(var(--color-primary) / 0.15);
}

.metric-icon.valid {
  background-color: hsl(var(--color-success) / 0.15);
}

.metric-icon.spam {
  background-color: hsl(var(--color-danger) / 0.15);
}

.metric-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: hsl(var(--text-primary));
  line-height: 1.2;
}

.metric-label {
  font-size: 0.85rem;
  color: hsl(var(--text-muted));
  font-weight: 500;
}

/* Glassmorphic Filters Section */
.filters-container {
  padding: 20px;
  border: 1px solid var(--border-light);
  background: hsl(var(--bg-surface) / 0.4);
  backdrop-filter: blur(10px);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: hsl(var(--text-secondary));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-input, .filter-select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: hsl(var(--bg-surface-elevated) / 0.6);
  color: hsl(var(--text-primary));
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
}

.filter-input:focus, .filter-select:focus {
  border-color: hsl(var(--color-primary));
  box-shadow: 0 0 0 2px hsl(var(--color-primary) / 0.15);
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background: hsl(var(--color-primary));
  color: #fff;
}

.btn-primary:hover {
  background: hsl(var(--color-primary-hover));
  transform: translateY(-1px);
}

.btn-secondary {
  background: hsl(var(--bg-surface-elevated) / 0.8);
  color: hsl(var(--text-primary));
  border-color: var(--border-light);
}

.btn-secondary:hover {
  background: hsl(var(--bg-surface-elevated));
  border-color: hsl(var(--text-secondary));
}

/* Table Container */
.table-container {
  overflow-x: auto;
  border-color: var(--border-light);
  padding: 10px;
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
  vertical-align: middle;
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

.spam-row {
  background-color: hsl(var(--color-danger) / 0.02);
}

.post-cell {
  max-width: 250px;
  color: hsl(var(--text-primary));
}

.ip-badge {
  font-family: monospace;
  font-size: 0.85rem;
  background-color: hsl(var(--bg-surface-elevated));
  color: hsl(var(--text-primary));
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
  display: inline-block;
}

.user-agent {
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
  display: block;
  margin-top: 4px;
}

.referrer-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ref-link {
  color: hsl(var(--color-accent));
  font-size: 0.85rem;
}

.ref-link:hover {
  text-decoration: underline;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.status-badge.valid {
  background-color: rgba(16, 185, 129, 0.15);
  color: hsl(var(--color-success));
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.spam {
  background-color: rgba(239, 68, 68, 0.15);
  color: hsl(var(--color-danger));
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.time-cell {
  color: hsl(var(--text-secondary));
  min-width: 180px;
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

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 10px 20px;
  border-top: 1px solid var(--border-light);
}

.page-btn {
  background: hsl(var(--bg-surface-elevated) / 0.8);
  border: 1px solid var(--border-light);
  color: hsl(var(--text-primary));
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: hsl(var(--bg-surface-elevated));
  border-color: hsl(var(--text-secondary));
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-number-btn {
  background: transparent;
  border: 1px solid transparent;
  color: hsl(var(--text-secondary));
  width: 34px;
  height: 34px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number-btn:hover {
  background: hsl(var(--bg-surface-elevated) / 0.5);
  color: hsl(var(--text-primary));
}

.page-number-btn.active {
  background: hsl(var(--color-primary));
  color: #fff;
  border-color: hsl(var(--color-primary));
}
</style>
