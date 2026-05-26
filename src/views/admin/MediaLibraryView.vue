<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axiosClient, { API_URL } from '../../api/axios';
import { useToastStore } from '../../store/toast';

const toastStore = useToastStore();

interface MediaFile {
  id: number;
  filename: string;
  url: string;
  file_size: number;
  mime_type: string;
  created_at: number;
}

const files = ref<MediaFile[]>([]);
const loading = ref(false);
const uploading = ref(false);
const searchQuery = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const fetchFiles = async () => {
  loading.value = true;
  try {
    const response: any = await axiosClient.get('/admin/files');
    if (response.status === 'success') {
      files.value = response.data;
    }
  } catch (error) {
    console.error('Không thể tải danh sách tài nguyên:', error);
  } finally {
    loading.value = false;
  }
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const formData = new FormData();
  formData.append('file', file);

  uploading.value = true;
  try {
    const response: any = await axiosClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 'success') {
      const newFile: MediaFile = {
        id: response.data.id,
        filename: response.data.filename,
        url: response.data.url,
        file_size: file.size,
        mime_type: file.type,
        created_at: Math.floor(Date.now() / 1000),
      };
      files.value.unshift(newFile);
      toastStore.success('Tải ảnh mới lên kho ảnh thành công!');
      if (fileInput.value) fileInput.value.value = '';
    }
  } catch (error: any) {
    toastStore.error(error.response?.data?.message || 'Không thể tải ảnh lên.');
  } finally {
    uploading.value = false;
  }
};

const filteredFiles = computed(() => {
  if (!searchQuery.value.trim()) return files.value;
  const q = searchQuery.value.toLowerCase();
  return files.value.filter((f) => f.filename.toLowerCase().includes(q));
});

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const copyToClipboard = (path: string) => {
  const absoluteUrl = API_URL + path;
  navigator.clipboard.writeText(absoluteUrl).then(
    () => {
      toastStore.success('Đã sao chép đường dẫn ảnh vào bộ nhớ tạm!');
    },
    () => {
      toastStore.error('Không thể sao chép đường dẫn.');
    }
  );
};

onMounted(() => {
  fetchFiles();
});
</script>

<template>
  <div class="media-library-view animate-fade-in">
    <div class="view-header">
      <div class="header-main">
        <div>
          <h2 class="view-title">🖼️ Kho Ảnh & Tài Nguyên</h2>
          <p class="view-subtitle">Quản lý, duyệt và upload hình ảnh sử dụng cho các bài viết trên hệ thống</p>
        </div>
        <button
          type="button"
          class="btn btn-primary upload-trigger-btn"
          @click="triggerUpload"
          :disabled="uploading"
        >
          {{ uploading ? 'Đang tải...' : '📁 Tải ảnh mới' }}
        </button>
        <input
          type="file"
          ref="fileInput"
          @change="handleUpload"
          accept="image/*"
          class="hidden-file-input"
        />
      </div>
    </div>

    <!-- Filter toolbar -->
    <div class="filter-toolbar glass-card">
      <input
        type="text"
        v-model="searchQuery"
        class="search-input"
        placeholder="Tìm kiếm theo tên file ảnh..."
      />
      <div class="media-stats" v-if="files.length > 0">
        Tổng số lượng: <strong>{{ files.length }}</strong> ảnh
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải danh sách tài nguyên...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredFiles.length === 0" class="empty-state glass-card">
      <div class="empty-icon">📂</div>
      <h3>Không có ảnh nào trong kho</h3>
      <p>Bắt đầu bằng cách tải một bức ảnh lên từ máy tính của bạn.</p>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="gallery-grid">
      <div v-for="file in filteredFiles" :key="file.id" class="gallery-card glass-card">
        <div class="card-preview">
          <img :src="API_URL + file.url" :alt="file.filename" class="preview-img" />
          <div class="hover-overlay">
            <button class="overlay-action-btn" @click="copyToClipboard(file.url)">
              🔗 Copy URL
            </button>
          </div>
        </div>
        <div class="card-info">
          <h4 class="filename-text" :title="file.filename">{{ file.filename }}</h4>
          <div class="meta-row">
            <span class="meta-size">{{ formatSize(file.file_size) }}</span>
            <span class="meta-divider">•</span>
            <span class="meta-date">{{ formatDate(file.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.media-library-view {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.view-header {
  margin-bottom: 10px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

@media (max-width: 600px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
  }
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

.upload-trigger-btn {
  padding: 12px 24px;
  font-weight: 600;
}

.hidden-file-input {
  display: none;
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-color: var(--border-light);
  gap: 20px;
}

@media (max-width: 600px) {
  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

.search-input {
  max-width: 400px;
  flex: 1;
  background-color: hsl(var(--bg-surface) / 0.5);
  border: 1px solid var(--border-light);
  color: hsl(var(--text-primary));
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: hsl(var(--color-primary));
  box-shadow: 0 0 0 2px hsl(var(--color-primary) / 0.2);
}

.media-stats {
  font-size: 0.9rem;
  color: hsl(var(--text-secondary));
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

.empty-state {
  text-align: center;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border-color: var(--border-light);
}

.empty-icon {
  font-size: 3rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
}

.empty-state p {
  color: hsl(var(--text-secondary));
  max-width: 350px;
  line-height: 1.6;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.gallery-card {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-color: var(--border-light);
  transition: transform 0.2s, box-shadow 0.2s;
}

.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.card-preview {
  width: 100%;
  aspect-ratio: 16/10;
  background-color: hsl(var(--bg-surface-elevated));
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-card:hover .hover-overlay {
  opacity: 1;
}

.overlay-action-btn {
  background-color: hsl(var(--color-primary));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 4px 12px hsl(var(--color-primary) / 0.3);
  transition: all 0.2s;
}

.overlay-action-btn:hover {
  background-color: hsl(var(--color-primary-hover));
  transform: scale(1.05);
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: hsl(var(--bg-surface) / 0.3);
}

.filename-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: hsl(var(--text-primary));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
}

.meta-divider {
  opacity: 0.5;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
