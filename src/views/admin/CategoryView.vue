<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axiosClient from '../../api/axios';
import { useToastStore } from '../../store/toast';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

const toastStore = useToastStore();

const categories = ref<Category[]>([]);
const loading = ref(false);
const saving = ref(false);

// Form Fields
const editId = ref<number | null>(null);
const name = ref('');
const description = ref('');
const formErrors = ref<Record<string, string[]>>({});

const fetchCategories = async () => {
  loading.value = true;
  try {
    const response: any = await axiosClient.get('/admin/categories');
    if (response.status === 'success') {
      categories.value = response.data;
    }
  } catch (error) {
    console.error('Không thể tải danh sách danh mục:', error);
    toastStore.error('Không thể tải danh sách danh mục.');
  } finally {
    loading.value = false;
  }
};

const handleEdit = (category: Category) => {
  editId.value = category.id;
  name.value = category.name;
  description.value = category.description || '';
  formErrors.value = {};
};

const handleCancel = () => {
  editId.value = null;
  name.value = '';
  description.value = '';
  formErrors.value = {};
};

const handleSave = async () => {
  if (!name.value.trim()) {
    formErrors.value = { name: ['Tên danh mục không được để trống.'] };
    return;
  }

  saving.value = true;
  formErrors.value = {};
  const payload = {
    name: name.value,
    description: description.value,
  };

  try {
    let response: any;
    if (editId.value) {
      response = await axiosClient.put(`/admin/categories/${editId.value}`, payload);
    } else {
      response = await axiosClient.post('/admin/categories', payload);
    }

    if (response.status === 'success') {
      toastStore.success(editId.value ? 'Cập nhật danh mục thành công.' : 'Tạo danh mục mới thành công.');
      handleCancel();
      await fetchCategories();
    }
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      formErrors.value = error.response.data.errors || {};
    } else {
      toastStore.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.');
    }
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.')) {
    return;
  }

  try {
    const response: any = await axiosClient.delete(`/admin/categories/${id}`);
    if (response.status === 'success') {
      toastStore.success('Xóa danh mục thành công.');
      if (editId.value === id) {
        handleCancel();
      }
      await fetchCategories();
    }
  } catch (error: any) {
    toastStore.error(error.response?.data?.message || 'Không thể xóa danh mục.');
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="category-view animate-fade-in">
    <div class="view-header">
      <h2 class="view-title">Quản Lý Danh Mục</h2>
      <p class="view-subtitle">Tạo, sửa và xóa các danh mục phân loại bài viết</p>
    </div>

    <div class="category-grid">
      <!-- Left: Categories Table List -->
      <div class="table-container glass-card">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải danh sách danh mục...</p>
        </div>

        <template v-else>
          <div v-if="categories.length === 0" class="no-data">
            Chưa có danh mục nào được tạo.
          </div>

          <table v-else class="data-table">
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Đường dẫn (Slug)</th>
                <th>Mô tả</th>
                <th class="actions-col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in categories" :key="category.id">
                <td class="category-name-cell">{{ category.name }}</td>
                <td>
                  <code class="slug-code">{{ category.slug }}</code>
                </td>
                <td class="description-cell">
                  {{ category.description || '-' }}
                </td>
                <td class="actions-cell">
                  <button @click="handleEdit(category)" class="btn btn-secondary btn-xs">
                    ✏️ Sửa
                  </button>
                  <button @click="handleDelete(category.id)" class="btn btn-danger btn-xs">
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>

      <!-- Right: Category Editor Form -->
      <div class="form-container glass-card">
        <h3 class="form-title">
          {{ editId ? '✏️ Chỉnh Sửa Danh Mục' : '➕ Thêm Danh Mục Mới' }}
        </h3>
        
        <form @submit.prevent="handleSave" class="editor-form">
          <div class="form-group">
            <label class="form-label" for="category-name">Tên danh mục *</label>
            <input
              type="text"
              id="category-name"
              v-model="name"
              class="form-input"
              placeholder="Ví dụ: Công nghệ"
              required
            />
            <span v-if="formErrors.name" class="field-error">
              {{ formErrors.name[0] }}
            </span>
          </div>

          <div class="form-group">
            <label class="form-label" for="category-desc">Mô tả chi tiết</label>
            <textarea
              id="category-desc"
              v-model="description"
              class="form-textarea"
              placeholder="Nhập mô tả ngắn cho danh mục này..."
            ></textarea>
            <span v-if="formErrors.description" class="field-error">
              {{ formErrors.description[0] }}
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
              {{ saving ? 'Đang lưu...' : 'Lưu danh mục' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-view {
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

.category-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

@media (max-width: 900px) {
  .category-grid {
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

.category-name-cell {
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

.description-cell {
  color: hsl(var(--text-secondary));
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
