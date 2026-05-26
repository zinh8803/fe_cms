<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axiosClient, { API_URL } from '../api/axios';
import { useConfigStore } from '../store/config';

const configStore = useConfigStore();

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: number;
  title: string;
  title_en: string | null;
  slug: string;
  summary: string;
  summary_en: string | null;
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  thumbnail_url: string | null;
  view_count: number;
  published_at: number;
}

interface Pagination {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  pageCount: number;
}

const posts = ref<Post[]>([]);
const pagination = ref<Pagination | null>(null);
const categories = ref<Category[]>([]);
const tags = ref<string[]>([]);

const searchQuery = ref('');
const selectedCategory = ref('');
const selectedTag = ref('');
const currentPage = ref(1);
const loading = ref(false);

const fetchPosts = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
    };
    if (searchQuery.value) params.title = searchQuery.value;
    if (selectedCategory.value) params.category_slug = selectedCategory.value;
    if (selectedTag.value) params.tag_slug = selectedTag.value;

    const response: any = await axiosClient.get('/posts', { params });
    if (response.status === 'success') {
      posts.value = response.data.posts;
      pagination.value = response.data.pagination;
    }
  } catch (error) {
    console.error('Không thể lấy danh sách bài viết:', error);
  } finally {
    loading.value = false;
  }
};

const fetchFilterOptions = async () => {
  try {
    const [catRes, tagRes]: any = await Promise.all([
      axiosClient.get('/categories'),
      axiosClient.get('/tags')
    ]);
    if (catRes.status === 'success') {
      categories.value = catRes.data;
    }
    if (tagRes.status === 'success') {
      tags.value = tagRes.data;
    }
  } catch (error) {
    console.error('Không thể tải danh mục và tag:', error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchPosts();
};

const filterByCategory = (slug: string) => {
  selectedCategory.value = selectedCategory.value === slug ? '' : slug;
  selectedTag.value = '';
  currentPage.value = 1;
  fetchPosts();
};

const filterByTag = (tag: string) => {
  const slug = tag.toLowerCase();
  selectedTag.value = selectedTag.value === slug ? '' : slug;
  selectedCategory.value = '';
  currentPage.value = 1;
  fetchPosts();
};

const changePage = (page: number) => {
  if (page < 1 || (pagination.value && page > pagination.value.pageCount)) return;
  currentPage.value = page;
  fetchPosts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const formatDate = (timestamp: number) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(() => {
  fetchPosts();
  fetchFilterOptions();
});
</script>

<template>
  <div class="home-view">
    <!-- Hero Banner -->
    <div class="hero-section glass-card">
      <h1 class="hero-title">
        {{ configStore.lang === 'vi' ? 'Chào mừng đến với' : 'Welcome to' }} <span class="accent">TechBlog</span>
      </h1>
      <p class="hero-subtitle">
        {{ configStore.lang === 'vi' 
            ? 'Góc chia sẻ kiến thức lập trình VueJS, Yii2 và phát triển web hiện đại' 
            : 'Sharing knowledge on VueJS, Yii2, and modern web development' 
        }}
      </p>
    </div>

    <!-- Search & Filters -->
    <div class="filters-container glass-card">
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          placeholder="Tìm kiếm bài viết..."
          class="form-input search-input"
        />
        <button @click="handleSearch" class="btn btn-primary search-btn">
          🔍 Tìm kiếm
        </button>
      </div>

      <!-- Categories Selector -->
      <div class="category-tabs">
        <span class="filter-label">Chuyên mục:</span>
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="filterByCategory(cat.slug)"
          class="category-tab"
          :class="{ active: selectedCategory === cat.slug }"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="content-layout">
      <!-- Posts Grid -->
      <div class="posts-section">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải danh sách bài viết...</p>
        </div>

        <template v-else>
          <div v-if="posts.length === 0" class="empty-state glass-card">
            <span class="empty-icon">📭</span>
            <h3>{{ configStore.lang === 'vi' ? 'Không tìm thấy bài viết nào' : 'No posts found' }}</h3>
            <p>
              {{ configStore.lang === 'vi' 
                  ? 'Hãy thử tìm kiếm từ khoá khác hoặc chuyên mục khác nhé.' 
                  : 'Try searching for other keywords or categories.' 
              }}
            </p>
          </div>

          <div v-else class="posts-grid">
            <article v-for="post in posts" :key="post.id" class="post-card glass-card">
              <div class="post-thumb">
                <img
                  v-if="post.thumbnail_url"
                  :src="API_URL + post.thumbnail_url"
                  :alt="(configStore.lang === 'en' && post.title_en) ? post.title_en : post.title"
                  class="thumb-img"
                />
                <div v-else class="thumb-placeholder">
                  <span>TechBlog</span>
                </div>
                <span class="post-cat-badge" v-if="post.category">
                  {{ post.category.name }}
                </span>
              </div>

              <div class="post-info">
                <div class="post-meta">
                  <span class="meta-item">
                    👁️ {{ post.view_count }} {{ configStore.lang === 'vi' ? 'lượt xem' : 'views' }}
                  </span>
                  <span class="meta-item">{{ formatDate(post.published_at) }}</span>
                </div>

                <h3 class="post-title">
                  <router-link :to="'/posts/' + post.slug">
                    {{ (configStore.lang === 'en' && post.title_en) ? post.title_en : post.title }}
                  </router-link>
                </h3>

                <p class="post-summary">
                  {{ (configStore.lang === 'en' && post.summary_en) ? post.summary_en : post.summary }}
                </p>

                <div class="post-tags" v-if="post.tags && post.tags.length">
                  <span
                    v-for="tag in post.tags"
                    :key="tag.slug"
                    @click="filterByTag(tag.slug)"
                    class="badge badge-tag"
                  >
                    #{{ tag.name }}
                  </span>
                </div>
              </div>
            </article>
          </div>

          <!-- Pagination -->
          <div class="pagination-container" v-if="pagination && pagination.pageCount > 1">
            <button
              @click="changePage(currentPage - 1)"
              class="btn btn-secondary page-btn"
              :disabled="currentPage === 1"
            >
              ← Trước
            </button>
            <span class="page-info">Trang {{ currentPage }} / {{ pagination.pageCount }}</span>
            <button
              @click="changePage(currentPage + 1)"
              class="btn btn-secondary page-btn"
              :disabled="currentPage === pagination.pageCount"
            >
              Sau →
            </button>
          </div>
        </template>
      </div>

      <!-- Sidebar -->
      <aside class="sidebar-section">
        <div class="sidebar-widget glass-card">
          <h4 class="widget-title">Thẻ Từ Khóa</h4>
          <div class="tag-cloud">
            <span
              v-for="tag in tags"
              :key="tag"
              @click="filterByTag(tag)"
              class="cloud-tag"
              :class="{ active: selectedTag === tag.toLowerCase() }"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <div class="sidebar-widget glass-card">
          <h4 class="widget-title">
            {{ configStore.lang === 'vi' ? 'Giới thiệu' : 'About' }}
          </h4>
          <p class="widget-text">
            {{ configStore.lang === 'vi'
                ? 'TechBlog là blog chia sẻ kiến thức công nghệ hiện đại được xây dựng nhằm trình diễn kỹ năng phối hợp hiệu quả giữa VueJS (Frontend) và Yii2 (Backend).'
                : 'TechBlog is a modern tech sharing blog built to demonstrate clean development integration between VueJS (Frontend) and Yii2 (Backend).'
            }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  padding: 60px 40px;
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, hsl(var(--bg-surface)) 0%, hsl(var(--bg-base)) 100%);
  border-color: rgba(139, 92, 246, 0.1);
}

.home-view {
  overflow: hidden;
  max-width: 100%;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.hero-title .accent {
  background: linear-gradient(135deg, hsl(var(--color-primary-hover)), hsl(var(--color-accent)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  color: hsl(var(--text-secondary));
  font-size: 1.1rem;
}

.filters-container {
  padding: 24px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-box {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
}

.search-btn {
  white-space: nowrap;
}

.category-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: hsl(var(--text-secondary));
  text-transform: uppercase;
}

.category-tab {
  background: hsl(var(--bg-surface-elevated));
  color: hsl(var(--text-secondary));
  border: 1px solid var(--border-light);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab:hover, .category-tab.active {
  background-color: hsl(var(--color-primary) / 0.15);
  color: hsl(var(--color-primary-hover));
  border-color: hsl(var(--color-primary) / 0.3);
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
}

@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.post-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.post-thumb {
  position: relative;
  height: 180px;
  background-color: hsl(var(--bg-surface-elevated));
  overflow: hidden;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card:hover .thumb-img {
  transform: scale(1.05);
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  color: hsl(var(--text-muted));
  background: linear-gradient(135deg, hsl(var(--bg-surface)) 0%, hsl(var(--bg-surface-elevated)) 100%);
}

.post-cat-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(11, 15, 23, 0.85);
  backdrop-filter: blur(4px);
  color: hsl(var(--color-primary-hover));
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.post-info {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: hsl(var(--text-muted));
  margin-bottom: 12px;
  font-weight: 500;
  flex-wrap: wrap;
  gap: 4px;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.4;
  display: block;
  width: 100%;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.post-title a {
  color: hsl(var(--text-primary));
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  display: inline-block;
  max-width: 100%;
}

.post-title a:hover {
  color: hsl(var(--color-primary-hover));
}

.post-summary {
  color: hsl(var(--text-secondary));
  font-size: 0.9rem;
  margin-bottom: 20px;
  line-height: 1.5;
  flex: 1;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-tag {
  cursor: pointer;
  background-color: hsl(var(--bg-surface-elevated));
}

.badge-tag:hover {
  background-color: hsl(var(--color-accent) / 0.15);
  color: hsl(var(--color-accent));
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.page-info {
  font-size: 0.95rem;
  font-weight: 500;
  color: hsl(var(--text-secondary));
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.sidebar-widget {
  padding: 24px;
}

.widget-title {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: hsl(var(--text-primary));
  margin-bottom: 16px;
  border-left: 3px solid hsl(var(--color-primary));
  padding-left: 10px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cloud-tag {
  background-color: hsl(var(--bg-surface-elevated));
  color: hsl(var(--text-secondary));
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-light);
}

.cloud-tag:hover, .cloud-tag.active {
  background-color: hsl(var(--color-accent) / 0.15);
  color: hsl(var(--color-accent));
  border-color: hsl(var(--color-accent) / 0.3);
}

.widget-text {
  color: hsl(var(--text-secondary));
  font-size: 0.9rem;
  line-height: 1.6;
}

.loading-state {
  text-align: center;
  padding: 80px 0;
  color: hsl(var(--text-secondary));
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
  padding: 60px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  display: block;
}

@media (max-width: 600px) {
  .hero-section {
    padding: 24px 16px;
    margin-bottom: 20px;
  }
  .hero-title {
    font-size: 1.6rem;
  }
  .hero-subtitle {
    font-size: 0.9rem;
  }
  .filters-container {
    padding: 14px;
    margin-bottom: 20px;
    gap: 10px;
  }
  .search-box {
    flex-direction: column;
    gap: 10px;
  }
  .search-btn {
    width: 100%;
  }
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .post-info {
    padding: 16px;
  }
  .post-title {
    font-size: 1.1rem;
  }
  .post-summary {
    font-size: 0.85rem;
    margin-bottom: 14px;
  }
  .sidebar-widget {
    padding: 16px;
  }
  .pagination-container {
    gap: 12px;
  }
}
</style>
