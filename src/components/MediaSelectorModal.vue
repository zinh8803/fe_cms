<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import axiosClient, { API_URL } from '../api/axios';
import { useToastStore } from '../store/toast';

const toastStore = useToastStore();

const props = defineProps<{
  isOpen: boolean;
  selectedId?: number | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', file: { id: number; url: string; filename: string }): void;
}>();

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
const localSelectedId = ref<number | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const fetchFiles = async () => {
  if (!props.isOpen) return;
  loading.value = true;
  try {
    const response: any = await axiosClient.get('/admin/files');
    if (response.status === 'success') {
      files.value = response.data;
    }
  } catch (error) {
    console.error('Không thể tải kho ảnh:', error);
  } finally {
    loading.value = false;
  }
};

// Fetch files and sync selected ID when modal opens
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      searchQuery.value = '';
      localSelectedId.value = props.selectedId || null;
      fetchFiles();
    }
  }
);

const filteredFiles = computed(() => {
  if (!searchQuery.value.trim()) return files.value;
  const q = searchQuery.value.toLowerCase();
  return files.value.filter((f) => f.filename.toLowerCase().includes(q));
});

const selectedFile = computed(() => {
  return files.value.find((f) => f.id === localSelectedId.value) || null;
});

const selectFile = (id: number) => {
  localSelectedId.value = id;
};

const handleConfirm = () => {
  if (selectedFile.value) {
    emit('select', {
      id: selectedFile.value.id,
      url: selectedFile.value.url,
      filename: selectedFile.value.filename,
    });
  }
  emit('close');
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
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
      // Prepend to files list
      files.value.unshift(newFile);
      // Auto-select newly uploaded file
      localSelectedId.value = newFile.id;
      
      // Clear file input
      if (fileInput.value) fileInput.value.value = '';
    }
  } catch (error: any) {
    toastStore.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh lên.');
  } finally {
    uploading.value = false;
  }
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop animate-fade-in" @click.self="emit('close')">
    <div class="modal-content glass-card animate-scale-in">
      <header class="modal-header">
        <h3 class="modal-title">🖼️ Thư viện ảnh</h3>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </header>

      <div class="modal-body-container">
        <!-- Controls row -->
        <div class="controls-row">
          <input
            type="text"
            v-model="searchQuery"
            class="search-input"
            placeholder="Tìm kiếm tên file ảnh..."
          />
          <button
            type="button"
            class="btn btn-secondary upload-btn"
            @click="triggerFileUpload"
            :disabled="uploading"
          >
            {{ uploading ? 'Đang tải...' : '📁 Tải ảnh mới' }}
          </button>
          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            accept="image/*"
            class="hidden-file-input"
          />
        </div>

        <!-- Main workspace layout -->
        <div class="modal-workspace">
          <!-- Left: Gallery Grid -->
          <div class="gallery-wrapper">
            <div v-if="loading" class="gallery-loading">
              <div class="spinner"></div>
              <p>Đang tải danh sách ảnh...</p>
            </div>
            <div v-else-if="filteredFiles.length === 0" class="gallery-empty">
              Không tìm thấy ảnh nào.
            </div>
            <div v-else class="gallery-grid">
              <div
                v-for="file in filteredFiles"
                :key="file.id"
                class="gallery-item"
                :class="{ 'is-selected': file.id === localSelectedId }"
                @click="selectFile(file.id)"
              >
                <img :src="API_URL + file.url" :alt="file.filename" class="gallery-img" />
                <div class="gallery-info-tooltip">{{ file.filename }}</div>
              </div>
            </div>
          </div>

          <!-- Right: Details Sidebar (only visible if something is selected) -->
          <div class="details-sidebar" :class="{ 'has-selection': selectedFile }">
            <div v-if="selectedFile" class="sidebar-details-content">
              <h4 class="details-heading">Chi tiết ảnh</h4>
              <div class="preview-box">
                <img :src="API_URL + selectedFile.url" :alt="selectedFile.filename" class="preview-img" />
              </div>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Tên:</span>
                  <span class="info-value truncate-text" :title="selectedFile.filename">{{ selectedFile.filename }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Kích thước:</span>
                  <span class="info-value">{{ formatSize(selectedFile.file_size) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Mime-type:</span>
                  <span class="info-value">{{ selectedFile.mime_type }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-selection-msg">
              Chọn một ảnh để xem thông tin chi tiết
            </div>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="emit('close')">Hủy bỏ</button>
        <button
          type="button"
          class="btn btn-primary"
          @click="handleConfirm"
          :disabled="!selectedFile"
        >
          Xác nhận chọn
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background-color: hsl(var(--bg-surface) / 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
}

.close-btn {
  background: transparent;
  border: none;
  color: hsl(var(--text-secondary));
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

.modal-body-container {
  flex: 1;
  padding: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.controls-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  flex: 1;
  background-color: hsl(var(--bg-surface-elevated) / 0.5);
  border: 1px solid var(--border-light);
  color: white;
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

.upload-btn {
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.hidden-file-input {
  display: none;
}

.modal-workspace {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  overflow: hidden;
  min-height: 350px;
}

.gallery-wrapper {
  background-color: hsl(var(--bg-surface-elevated) / 0.2);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  overflow-y: auto;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.gallery-loading,
.gallery-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: hsl(var(--text-secondary));
  font-size: 0.9rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid hsl(var(--bg-surface-elevated));
  border-top-color: hsl(var(--color-primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.gallery-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background-color: hsl(var(--bg-surface-elevated));
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.gallery-item:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.gallery-item.is-selected {
  border-color: hsl(var(--color-primary));
  box-shadow: 0 0 10px hsl(var(--color-primary) / 0.4);
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-info-tooltip {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.7rem;
  padding: 4px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-item:hover .gallery-info-tooltip {
  opacity: 1;
}

.details-sidebar {
  border: 1px solid var(--border-light);
  background-color: hsl(var(--bg-surface-elevated) / 0.15);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.no-selection-msg {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 0.85rem;
}

.sidebar-details-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.details-heading {
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 8px;
}

.preview-box {
  width: 100%;
  aspect-ratio: 16/10;
  border-radius: 8px;
  background-color: hsl(var(--bg-surface));
  border: 1px solid var(--border-light);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
}

.info-value {
  font-size: 0.85rem;
  color: hsl(var(--text-primary));
  font-weight: 500;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
