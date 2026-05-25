<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import axiosClient from '../../api/axios';
import MediaSelectorModal from '../../components/MediaSelectorModal.vue';
import { useToastStore } from '../../store/toast';

const toastStore = useToastStore();

interface Category {
  id: number;
  name: string;
}

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);
const postId = computed(() => route.params.id ? parseInt(route.params.id as string) : null);

const categories = ref<Category[]>([]);
const loading = ref(false);
const saving = ref(false);

// Form Fields
const title = ref('');
const titleEn = ref('');
const content = ref('');
const contentEn = ref('');
const categoryId = ref('');
const status = ref('draft');
const visibility = ref('public');
const tagsInput = ref(''); // comma-separated strings
const thumbnailId = ref<number | null>(null);
const thumbnailUrl = ref<string | null>(null);

// active language tab for editor
const activeTab = ref<'vi' | 'en'>('vi');

// SEO Fields
const seoTitle = ref('');
const seoDescription = ref('');
const seoKeywords = ref('');

// Validation Errors
const errors = ref<Record<string, string[]>>({});
const generalError = ref('');

// Tiptap Editor Config for Vietnamese
const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    TiptapImage,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ],
  onUpdate: ({ editor }) => {
    content.value = editor.getHTML();
  },
});

// Tiptap Editor Config for English
const editorEn = useEditor({
  content: '',
  extensions: [
    StarterKit,
    TiptapImage,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ],
  onUpdate: ({ editor }) => {
    contentEn.value = editor.getHTML();
  },
});

onBeforeUnmount(() => {
  editor.value?.destroy();
  editorEn.value?.destroy();
});

// Inline Image Upload Config
const inlineImageInput = ref<HTMLInputElement | null>(null);

const triggerInlineImageUpload = () => {
  inlineImageInput.value?.click();
};

const handleInlineImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response: any = await axiosClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 'success') {
      const imageUrl = 'http://localhost:8080' + response.data.url;
      const activeEditor = activeTab.value === 'vi' ? editor.value : editorEn.value;
      activeEditor?.chain().focus().setImage({ src: imageUrl }).run();
      if (inlineImageInput.value) {
        inlineImageInput.value.value = '';
      }
    }
  } catch (error: any) {
    toastStore.error(error.response?.data?.message || 'Lỗi khi tải ảnh chèn vào bài viết.');
  }
};

// Media Library Modal Controls
const isMediaModalOpen = ref(false);
const mediaModalPurpose = ref<'thumbnail' | 'editor' | null>(null);

const openMediaModalForThumbnail = () => {
  mediaModalPurpose.value = 'thumbnail';
  isMediaModalOpen.value = true;
};

const openMediaModalForEditor = () => {
  mediaModalPurpose.value = 'editor';
  isMediaModalOpen.value = true;
};

const handleMediaSelect = (file: { id: number; url: string; filename: string }) => {
  if (mediaModalPurpose.value === 'thumbnail') {
    thumbnailId.value = file.id;
    thumbnailUrl.value = file.url;
  } else if (mediaModalPurpose.value === 'editor') {
    const imageUrl = 'http://localhost:8080' + file.url;
    const activeEditor = activeTab.value === 'vi' ? editor.value : editorEn.value;
    activeEditor?.chain().focus().setImage({ src: imageUrl }).run();
  }
};

const fetchCategories = async () => {
  try {
    const response: any = await axiosClient.get('/admin/categories');
    if (response.status === 'success') {
      categories.value = response.data;
    }
  } catch (error) {
    console.error('Không thể lấy danh mục:', error);
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response: any = await axiosClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 'success') {
      thumbnailId.value = response.data.id;
      thumbnailUrl.value = response.data.url;
      toastStore.success('Tải ảnh đại diện lên thành công!');
    }
  } catch (error: any) {
    toastStore.error(error.response?.data?.message || 'Lỗi khi tải ảnh lên. File không hợp lệ.');
  }
};

const handleSave = async () => {
  if (!title.value || !content.value || !categoryId.value) {
    generalError.value = 'Vui lòng nhập các thông tin bắt buộc (Tiêu đề, nội dung và danh mục Tiếng Việt).';
    return;
  }

  saving.value = true;
  errors.value = {};
  generalError.value = '';

  // Parse tags
  const tags = tagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const payload = {
    title: title.value,
    title_en: titleEn.value || null,
    content: content.value,
    content_en: contentEn.value || null,
    category_id: parseInt(categoryId.value),
    status: status.value,
    visibility: visibility.value,
    tags: tags,
    thumbnail_id: thumbnailId.value,
    seo_title: seoTitle.value,
    seo_description: seoDescription.value,
    seo_keywords: seoKeywords.value,
  };

  try {
    let response: any;
    if (isEditMode.value) {
      response = await axiosClient.put(`/admin/posts/${postId.value}`, payload);
    } else {
      response = await axiosClient.post('/admin/posts', payload);
    }

    if (response.status === 'success') {
      toastStore.success(isEditMode.value ? 'Cập nhật bài viết thành công.' : 'Tạo bài viết mới thành công.');
      router.push('/admin/posts');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors || {};
    } else {
      generalError.value = error.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết.';
    }
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await fetchCategories();
  if (isEditMode.value) {
    loading.value = true;
    try {
      const response: any = await axiosClient.get(`/admin/posts/${postId.value}`);
      if (response.status === 'success') {
        const postData = response.data;
        title.value = postData.title;
        titleEn.value = postData.title_en || '';
        content.value = postData.content;
        contentEn.value = postData.content_en || '';
        categoryId.value = postData.category_id.toString();
        status.value = postData.status;
        visibility.value = postData.visibility;
        tagsInput.value = postData.tags.join(', ');
        thumbnailId.value = postData.thumbnail_id;
        thumbnailUrl.value = postData.thumbnail_url;
        
        // Sync content to Tiptap editors
        editor.value?.commands.setContent(postData.content);
        editorEn.value?.commands.setContent(postData.content_en || '');
        
        if (postData.seo) {
          seoTitle.value = postData.seo.title || '';
          seoDescription.value = postData.seo.description || '';
          seoKeywords.value = postData.seo.keywords || '';
        }
      }
    } catch (e) {
      console.error(e);
      generalError.value = 'Không thể lấy thông tin bài viết để biên tập.';
    } finally {
      loading.value = false;
    }
  }
});
</script>

<template>
  <div class="post-form-view animate-fade-in">
    <div class="view-header">
      <h2 class="view-title">{{ isEditMode ? 'Biên Tập Bài Viết' : 'Tạo Bài Viết Mới' }}</h2>
      <p class="view-subtitle">{{ isEditMode ? 'Chỉnh sửa thông tin bài viết hiện tại' : 'Soạn thảo nội dung bài viết mới lên hệ thống' }}</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải thông tin bài viết...</p>
    </div>

    <template v-else>
      <div v-if="generalError" class="alert alert-danger">
        {{ generalError }}
      </div>

      <div class="form-container">
        <!-- Left: main content parameters -->
        <div class="main-form glass-card">
          <!-- Tab selector -->
          <div class="editor-tabs">
            <button
              type="button"
              class="editor-tab-btn"
              :class="{ active: activeTab === 'vi' }"
              @click="activeTab = 'vi'"
            >
              🇻🇳 Tiếng Việt <span class="required">*</span>
            </button>
            <button
              type="button"
              class="editor-tab-btn"
              :class="{ active: activeTab === 'en' }"
              @click="activeTab = 'en'"
            >
              🇬🇧 English (Optional)
            </button>
          </div>

          <!-- Vietnamese Tab Content -->
          <div v-show="activeTab === 'vi'">
            <div class="form-group">
              <label class="form-label" for="title">Tiêu đề bài viết <span class="required">*</span></label>
              <input
                type="text"
                id="title"
                v-model="title"
                class="form-input"
                placeholder="Nhập tiêu đề..."
                required
              />
              <span class="error-msg" v-if="errors.title">{{ errors.title[0] }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Nội dung bài viết <span class="required">*</span></label>
              <div class="tiptap-editor-container">
                <!-- Toolbar -->
                <div class="editor-toolbar" v-if="editor">
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleBold().run()"
                    :class="{ 'is-active': editor.isActive('bold') }"
                    class="toolbar-btn"
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleItalic().run()"
                    :class="{ 'is-active': editor.isActive('italic') }"
                    class="toolbar-btn"
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleStrike().run()"
                    :class="{ 'is-active': editor.isActive('strike') }"
                    class="toolbar-btn"
                    title="Strike"
                  >
                    <s>S</s>
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
                    class="toolbar-btn"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
                    class="toolbar-btn"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleBulletList().run()"
                    :class="{ 'is-active': editor.isActive('bulletList') }"
                    class="toolbar-btn"
                    title="Bullet List"
                  >
                    • Danh sách
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleOrderedList().run()"
                    :class="{ 'is-active': editor.isActive('orderedList') }"
                    class="toolbar-btn"
                    title="Ordered List"
                  >
                    1. Danh sách
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleBlockquote().run()"
                    :class="{ 'is-active': editor.isActive('blockquote') }"
                    class="toolbar-btn"
                    title="Blockquote"
                  >
                    ” Trích dẫn
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="editor.chain().focus().setTextAlign('left').run()"
                    :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
                    class="toolbar-btn"
                    title="Align Left"
                  >
                    ⬅️ Trái
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().setTextAlign('center').run()"
                    :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
                    class="toolbar-btn"
                    title="Align Center"
                  >
                    ↔️ Giữa
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().setTextAlign('right').run()"
                    :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
                    class="toolbar-btn"
                    title="Align Right"
                  >
                    ➡️ Phải
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().setTextAlign('justify').run()"
                    :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
                    class="toolbar-btn"
                    title="Align Justify"
                  >
                    🟰 Đều
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="triggerInlineImageUpload"
                    class="toolbar-btn"
                    title="Upload Image from Computer"
                  >
                    🖼️ Tải ảnh
                  </button>
                  <button
                    type="button"
                    @click="openMediaModalForEditor"
                    class="toolbar-btn"
                    title="Select Image from Gallery"
                  >
                    📚 Kho ảnh
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="editor.chain().focus().undo().run()"
                    :disabled="!editor.can().chain().focus().undo().run()"
                    class="toolbar-btn"
                    title="Undo"
                  >
                    ↩️
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().redo().run()"
                    :disabled="!editor.can().chain().focus().redo().run()"
                    class="toolbar-btn"
                    title="Redo"
                  >
                    ↪️
                  </button>
                </div>
                
                <!-- Editor Content Area -->
                <editor-content :editor="editor" class="editor-content-area" />
              </div>
              <span class="error-msg" v-if="errors.content">{{ errors.content[0] }}</span>
            </div>
          </div>

          <!-- English Tab Content -->
          <div v-show="activeTab === 'en'">
            <div class="form-group">
              <label class="form-label" for="titleEn">English Title</label>
              <input
                type="text"
                id="titleEn"
                v-model="titleEn"
                class="form-input"
                placeholder="Enter English title..."
              />
              <span class="error-msg" v-if="errors.title_en">{{ errors.title_en[0] }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">English Content</label>
              <div class="tiptap-editor-container">
                <!-- Toolbar -->
                <div class="editor-toolbar" v-if="editorEn">
                  <button
                    type="button"
                    @click="editorEn.chain().focus().toggleBold().run()"
                    :class="{ 'is-active': editorEn.isActive('bold') }"
                    class="toolbar-btn"
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().toggleItalic().run()"
                    :class="{ 'is-active': editorEn.isActive('italic') }"
                    class="toolbar-btn"
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().toggleStrike().run()"
                    :class="{ 'is-active': editorEn.isActive('strike') }"
                    class="toolbar-btn"
                    title="Strike"
                  >
                    <s>S</s>
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().toggleHeading({ level: 2 }).run()"
                    :class="{ 'is-active': editorEn.isActive('heading', { level: 2 }) }"
                    class="toolbar-btn"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().toggleHeading({ level: 3 }).run()"
                    :class="{ 'is-active': editorEn.isActive('heading', { level: 3 }) }"
                    class="toolbar-btn"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().toggleBulletList().run()"
                    :class="{ 'is-active': editorEn.isActive('bulletList') }"
                    class="toolbar-btn"
                    title="Bullet List"
                  >
                    • Bullet List
                  </button>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().toggleOrderedList().run()"
                    :class="{ 'is-active': editorEn.isActive('orderedList') }"
                    class="toolbar-btn"
                    title="Ordered List"
                  >
                    1. Ordered List
                  </button>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().toggleBlockquote().run()"
                    :class="{ 'is-active': editorEn.isActive('blockquote') }"
                    class="toolbar-btn"
                    title="Blockquote"
                  >
                    ” Blockquote
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().setTextAlign('left').run()"
                    :class="{ 'is-active': editorEn.isActive({ textAlign: 'left' }) }"
                    class="toolbar-btn"
                    title="Align Left"
                  >
                    ⬅️ Left
                  </button>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().setTextAlign('center').run()"
                    :class="{ 'is-active': editorEn.isActive({ textAlign: 'center' }) }"
                    class="toolbar-btn"
                    title="Align Center"
                  >
                    ↔️ Center
                  </button>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().setTextAlign('right').run()"
                    :class="{ 'is-active': editorEn.isActive({ textAlign: 'right' }) }"
                    class="toolbar-btn"
                    title="Align Right"
                  >
                    ➡️ Right
                  </button>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().setTextAlign('justify').run()"
                    :class="{ 'is-active': editorEn.isActive({ textAlign: 'justify' }) }"
                    class="toolbar-btn"
                    title="Align Justify"
                  >
                    🟰 Justified
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="triggerInlineImageUpload"
                    class="toolbar-btn"
                    title="Upload Image from Computer"
                  >
                    🖼️ Upload Image
                  </button>
                  <button
                    type="button"
                    @click="openMediaModalForEditor"
                    class="toolbar-btn"
                    title="Select Image from Gallery"
                  >
                    📚 Gallery
                  </button>
                  <span class="toolbar-divider"></span>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().undo().run()"
                    :disabled="!editorEn.can().chain().focus().undo().run()"
                    class="toolbar-btn"
                    title="Undo"
                  >
                    ↩️
                  </button>
                  <button
                    type="button"
                    @click="editorEn.chain().focus().redo().run()"
                    :disabled="!editorEn.can().chain().focus().redo().run()"
                    class="toolbar-btn"
                    title="Redo"
                  >
                    ↪️
                  </button>
                </div>
                
                <!-- Editor Content Area -->
                <editor-content :editor="editorEn" class="editor-content-area" />
              </div>
              <span class="error-msg" v-if="errors.content_en">{{ errors.content_en[0] }}</span>
            </div>
          </div>

          <!-- Hidden file input for inline image upload (shared) -->
          <input
            type="file"
            ref="inlineImageInput"
            @change="handleInlineImageUpload"
            accept="image/*"
            class="file-input-hidden"
          />

          <!-- SEO section card -->
          <div class="seo-card">
            <h4 class="seo-title-section">🔧 Cấu hình SEO (Tìm kiếm)</h4>
            
            <div class="form-group">
              <label class="form-label" for="seo-title">SEO Title (Tiêu đề tìm kiếm)</label>
              <input
                type="text"
                id="seo-title"
                v-model="seoTitle"
                class="form-input"
                placeholder="Để trống sẽ tự động lấy tiêu đề bài viết..."
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="seo-description">SEO Description (Mô tả tìm kiếm)</label>
              <textarea
                id="seo-description"
                v-model="seoDescription"
                class="form-textarea seo-desc-input"
                placeholder="Viết tóm tắt ngắn khoảng 150-160 ký tự cho Google hiển thị..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="seo-keywords">SEO Keywords (Từ khóa cách nhau bởi dấu phẩy)</label>
              <input
                type="text"
                id="seo-keywords"
                v-model="seoKeywords"
                class="form-input"
                placeholder="cms, vuejs, yii2, coding"
              />
            </div>
          </div>
        </div>

        <!-- Right: settings panel -->
        <div class="settings-panel">
          <div class="panel-section glass-card">
            <h4 class="panel-title">Phân loại & Trạng thái</h4>

            <div class="form-group">
              <label class="form-label" for="category">Danh mục <span class="required">*</span></label>
              <select id="category" v-model="categoryId" class="form-select" required>
                <option value="">-- Chọn danh mục --</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id.toString()">
                  {{ cat.name }}
                </option>
              </select>
              <span class="error-msg" v-if="errors.category_id">{{ errors.category_id[0] }}</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="tags">Thẻ tags (phân cách bằng dấu phẩy)</label>
              <input
                type="text"
                id="tags"
                v-model="tagsInput"
                class="form-input"
                placeholder="VueJS, Yii2, JavaScript"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="status">Trạng thái phát hành</label>
              <select id="status" v-model="status" class="form-select">
                <option value="draft">Bản nháp (Draft)</option>
                <option value="published">Xuất bản (Publish)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="visibility">Chế độ hiển thị</label>
              <select id="visibility" v-model="visibility" class="form-select">
                <option value="public">Công khai (Public)</option>
                <option value="private">Riêng tư (Private)</option>
              </select>
            </div>
          </div>

          <!-- Thumbnail card -->
          <div class="panel-section glass-card">
            <h4 class="panel-title">Ảnh đại diện (Thumbnail)</h4>
            
            <div class="thumbnail-preview-box">
              <img
                v-if="thumbnailUrl"
                :src="'http://localhost:8080' + thumbnailUrl"
                alt="Thumbnail Preview"
                class="preview-img"
              />
              <div v-else class="preview-empty">
                Chưa có ảnh đại diện
              </div>
            </div>

            <div class="form-group thumbnail-actions">
              <label class="form-label btn btn-secondary upload-trigger" for="thumbnail-upload">
                📁 Tải ảnh lên
              </label>
              <input
                type="file"
                id="thumbnail-upload"
                @change="handleFileUpload"
                accept="image/*"
                class="file-input-hidden"
              />
              <button
                type="button"
                class="btn btn-secondary select-library-btn"
                @click="openMediaModalForThumbnail"
              >
                📚 Chọn từ kho ảnh
              </button>
            </div>
          </div>

          <!-- Save buttons -->
          <div class="form-actions">
            <button @click="handleSave" class="btn btn-primary btn-block" :disabled="saving">
              {{ saving ? 'Đang lưu...' : 'Lưu bài viết' }}
            </button>
            <router-link to="/admin/posts" class="btn btn-secondary btn-block">
              Hủy bỏ
            </router-link>
          </div>
        </div>
      </div>
    </template>

    <!-- Media selector modal -->
    <MediaSelectorModal
      :isOpen="isMediaModalOpen"
      :selectedId="mediaModalPurpose === 'thumbnail' ? thumbnailId : null"
      @close="isMediaModalOpen = false"
      @select="handleMediaSelect"
    />
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

.form-container {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 30px;
  align-items: start;
}

@media (max-width: 900px) {
  .form-container {
    grid-template-columns: 1fr;
  }
}

.main-form {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-color: rgba(255, 255, 255, 0.05);
}

.required {
  color: hsl(var(--color-danger));
}

.main-editor {
  min-height: 350px;
}

.seo-card {
  margin-top: 20px;
  background-color: hsl(var(--bg-surface-elevated) / 0.2);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 24px;
}

.seo-title-section {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
}

.seo-desc-input {
  min-height: 80px;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.panel-section {
  padding: 24px;
  border-color: rgba(255, 255, 255, 0.05);
}

.panel-title {
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: white;
  margin-bottom: 20px;
  border-left: 3px solid hsl(var(--color-primary));
  padding-left: 10px;
}

.thumbnail-preview-box {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  background-color: hsl(var(--bg-surface));
  border: 1px dashed var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 16px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-empty {
  font-size: 0.85rem;
  color: hsl(var(--text-muted));
}

.upload-trigger {
  width: 100%;
}

.file-input-hidden {
  display: none;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-weight: 600;
}

.error-msg {
  color: hsl(var(--color-danger));
  font-size: 0.8rem;
  margin-top: 4px;
}

.alert {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.alert-danger {
  background-color: rgba(239, 68, 68, 0.15);
  color: hsl(var(--color-danger));
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.loading-state {
  text-align: center;
  padding: 100px 0;
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

/* Tiptap Editor Styles */
.tiptap-editor-container {
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background-color: hsl(var(--bg-surface));
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.tiptap-editor-container:focus-within {
  border-color: hsl(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25);
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background-color: hsl(var(--bg-surface-elevated) / 0.5);
  border-bottom: 1px solid var(--border-light);
  align-items: center;
}

.toolbar-btn {
  background: transparent;
  border: none;
  color: hsl(var(--text-secondary));
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background-color: hsl(var(--bg-surface-elevated));
  color: white;
}

.toolbar-btn.is-active {
  background-color: hsl(var(--color-primary) / 0.15);
  color: hsl(var(--color-primary-hover));
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-divider {
  width: 1px;
  height: 18px;
  background-color: var(--border-light);
  margin: 0 4px;
}

/* ProseMirror content styling */
:deep(.ProseMirror) {
  padding: 16px 20px;
  min-height: 300px;
  outline: none;
  color: hsl(var(--text-primary));
  font-size: 0.95rem;
}

:deep(.ProseMirror p) {
  margin-bottom: 12px;
}

:deep(.ProseMirror ul), :deep(.ProseMirror ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}

:deep(.ProseMirror blockquote) {
  border-left: 3px solid hsl(var(--color-primary));
  padding-left: 12px;
  color: hsl(var(--text-secondary));
  font-style: italic;
  margin: 12px 0;
}

:deep(.ProseMirror h2), :deep(.ProseMirror h3) {
  color: white;
  margin: 20px 0 10px;
}

:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 12px 0;
  display: block;
}

.thumbnail-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.select-library-btn {
  width: 100%;
  padding: 10px;
  font-weight: 600;
}

/* Editor Tab Bar Styles */
.editor-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-light);
}

.editor-tab-btn {
  background: transparent;
  border: none;
  color: hsl(var(--text-secondary));
  font-size: 0.95rem;
  font-weight: 600;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
  position: relative;
  outline: none;
}

.editor-tab-btn:hover {
  color: white;
}

.editor-tab-btn.active {
  color: hsl(var(--color-primary-hover));
}

.editor-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: hsl(var(--color-primary));
}
</style>
