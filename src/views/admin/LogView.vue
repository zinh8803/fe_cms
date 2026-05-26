<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axiosClient from '../../api/axios';

interface AuditLog {
  id: number;
  username: string;
  action: string;
  details: string;
  created_at: number;
}

const logs = ref<AuditLog[]>([]);
const loading = ref(true);

const fetchLogs = async () => {
  loading.value = true;
  try {
    const response: any = await axiosClient.get('/admin/logs');
    if (response.status === 'success') {
      logs.value = response.data;
    }
  } catch (error) {
    console.error('Không thể tải nhật ký hoạt động:', error);
  } finally {
    loading.value = false;
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
  fetchLogs();
});
</script>

<template>
  <div class="log-view animate-fade-in">
    <div class="view-header">
      <h2 class="view-title">Nhật Ký Hoạt Động</h2>
      <p class="view-subtitle">Nhật ký lịch sử thao tác của các quản trị viên trên hệ thống</p>
    </div>

    <!-- Logs Table -->
    <div class="table-container glass-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải nhật ký...</p>
      </div>

      <template v-else>
        <div v-if="logs.length === 0" class="no-data">
          Chưa ghi nhận hoạt động nào trong hệ thống.
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th class="id-col">ID</th>
              <th>Người thực hiện</th>
              <th>Hành động</th>
              <th>Chi tiết thao tác</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="id-cell text-muted">#{{ log.id }}</td>
              <td class="user-cell">
                <span class="user-avatar">👤</span>
                <strong>{{ log.username }}</strong>
              </td>
              <td>
                <span class="action-badge">{{ log.action }}</span>
              </td>
              <td class="details-cell">
                <code class="details-code">{{ log.details }}</code>
              </td>
              <td class="time-cell">{{ formatDate(log.created_at) }}</td>
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
  color: hsl(var(--text-primary));
  margin-bottom: 6px;
}

.view-subtitle {
  color: hsl(var(--text-secondary));
  font-size: 0.95rem;
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

.id-col {
  width: 80px;
}

.id-cell {
  font-family: monospace;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.user-avatar {
  font-size: 1.1rem;
}

.action-badge {
  background-color: hsl(var(--color-primary) / 0.15);
  color: hsl(var(--color-primary-hover));
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid hsl(var(--color-primary) / 0.3);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.details-cell {
  max-width: 380px;
}

.details-code {
  font-family: Consolas, Monaco, monospace;
  font-size: 0.85rem;
  background-color: hsl(var(--bg-surface-elevated));
  color: hsl(var(--text-secondary));
  padding: 4px 8px;
  border-radius: 6px;
  word-break: break-all;
  display: block;
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
</style>
