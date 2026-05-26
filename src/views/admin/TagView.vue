<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axiosClient from '../../api/axios';
import { useToastStore } from '../../store/toast';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

const toastStore = useToastStore();

const tags = ref<Tag[]>([]);
const loading = ref(false);
const saving = ref(false);

// Form Fields
const editId = ref<number | null>(null);
const name = ref('');
const formErrors = ref<Record<string, string[]>>({});

const fetchTags = async () => {
  loading.value = true;
  try {
    const response: any = await axiosClient.get('/admin/tags-full');
    if (response.status === 'success') {
      tags.value = response.data;
    }
  } catch (error) {
    console.error('Không thể tải danh sách thẻ tag:', error);
    toastStore.error('Không thể tải danh sách thẻ tag.');
  } finally {
    loading.value = false;
  }
};

const handleEdit = (tag: Tag) => {
  editId.value = tag.id;
  name.value = tag.name;
  formErrors.value = {};
};

const handleCancel = () => {
  editId.value = null;
  name.value = '';
  formErrors.value = {};
};

const handleSave = async () => {
  if (!name.value.trim()) {
    formErrors.value = { name: ['Tên thẻ tag không được để trống.'] };
    return;
  }

  saving.value = true;
  formErrors.value = {};
  const payload = {
    name: name.value,
  };

  try {
    let response: any;
    if (editId.value) {
      response = await axiosClient.put(`/admin/tags/${editId.value}`, payload);
    } else {
      response = await axiosClient.post('/admin/tags', payload);
    }

    if (response.status === 'success') {
      toastStore.success(editId.value ? 'Cập nhật thẻ tag thành công.' : 'Tạo thẻ tag mới thành công.');
      handleCancel();
      await fetchTags();
    }
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      formErrors.value = error.response.data.errors || {};
    } else {
      toastStore.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thẻ tag.');
    }
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Bạn có chắc chắn muốn xóa thẻ tag này? Hành động này sẽ xóa thẻ tag khỏi tất cả các bài viết liên quan.')) {
    return;
  }

  try {
    const response: any = await axiosClient.delete(`/admin/tags/${id}`);
    if (response.status === 'success') {
      toastStore.success('Xóa thẻ tag thành công.');
      if (editId.value === id) {
        handleCancel();
      }
      await fetchTags();
    }
  } catch (error: any) {
    toastStore.error(error.response?.data?.message || 'Không thể xóa thẻ tag.');
  }
};

onMounted(() => {
  fetchTags();
});
</script>

<template>
  <div class="tag-view animate-fade-in">
    <div class="view-header">
      <h2 class="view-title">Quản Lý Thẻ Tag</h2>
      <p class="view-subtitle">Quản lý và cập nhật các thẻ tag gán cho bài viết</p>
    </div>

    <div class="tag-grid">
      <!-- Left: Tags Table List -->
      <div class="table-container glass-card">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải danh sách thẻ tag...</p>
        </div>

        <template v-else>
          <div v-if="tags.length === 0" class="no-data">
            Chưa có thẻ tag nào được tạo.
          </div>

          <table v-else class="data-table">
            <thead>
              <tr>
                <th>Tên thẻ tag</th>
                <th>Đường dẫn (Slug)</th>
                <th class="actions-col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tag in tags" :key="tag.id">
                <td class="tag-name-cell">🏷️ {{ tag.name }}</td>
                <td>
                  <code class="slug-code">{{ tag.slug }}</code>
                </td>
                <td class="actions-cell">
                  <button @click="handleEdit(tag)" class="btn btn-secondary btn-xs">
                    ✏️ Sửa
                  </button>
                  <button @click="handleDelete(tag.id)" class="btn btn-danger btn-xs">
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>

      <!-- Right: Tag Editor Form -->
      <div class="form-container glass-card">
        <h3 class="form-title">
          {{ editId ? '✏️ Chỉnh Sửa Thẻ Tag' : '➕ Thêm Thẻ Tag Mới' }}
        </h3>
        
        <form @submit.prevent="handleSave" class="editor-form">
          <div class="form-group">
            <label class="form-label" for="tag-name">Tên thẻ tag *</label>
            <input
              type="text"
              id="tag-name"
              v-model="name"
              class="form-input"
              placeholder="Ví dụ: Laravel"
              required
            />
            <span v-if="formErrors.name" class="field-error">
              {{ formErrors.name[0] }}
            </span>
          </div>

          <div class="form-actions">
            <button
              v-if="editId"
              type="button"
              @click="handleCancel"
              class="btn btn-secondary btn-block"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-block"
              :disabled="saving"
            >
              {{ saving ? 'Đang lưu...' : 'Lưu thẻ tag' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-view {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.view-header {
  margin-bottom: 10px;
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

.tag-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

@media (max-width: 900px) {
  .tag-grid {
    grid-template-columns: 1fr;
  }
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

.tag-name-cell {
  font-weight: 600;
  color: hsl(var(--text-primary));
}

.slug-code {
  background-color: hsl(var(--bg-surface-elevated));
  color: hsl(var(--color-accent));
  padding: 3px 6px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.85rem;
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

.form-container {
  padding: 24px;
  border-color: var(--border-light);
}

.form-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 10px;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-error {
  color: hsl(var(--color-danger));
  font-size: 0.8rem;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-block {
  flex: 1;
  padding: 12px;
  font-weight: 600;
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

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
