<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axiosClient, { API_URL } from '../api/axios';
import { useConfigStore } from '../store/config';

const configStore = useConfigStore();
const router = useRouter();

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

const suggestions = ref<{ id: number; title: string; title_en: string | null; slug: string }[]>([]);
const showSuggestions = ref(false);
let debounceTimeout: any = null;

const onSearchInput = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  
  if (!searchQuery.value || searchQuery.value.trim().length < 2) {
    suggestions.value = [];
    return;
  }
  
  debounceTimeout = setTimeout(async () => {
    try {
      const response: any = await axiosClient.get('/posts/suggestions', {
        params: { q: searchQuery.value }
      });
      if (response.status === 'success') {
        suggestions.value = response.data;
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, 300);
};

const selectSuggestion = (item: { slug: string }) => {
  showSuggestions.value = false;
  router.push('/posts/' + item.slug);
};

const hideSuggestionsWithDelay = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

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
        <div class="search-input-wrapper">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            @input="onSearchInput"
            @focus="showSuggestions = true"
            @blur="hideSuggestionsWithDelay"
            :placeholder="configStore.lang === 'vi' ? 'Tìm kiếm bài viết...' : 'Search articles...'"
            class="form-input search-input"
            autocomplete="off"
          />
          <!-- Suggestions Dropdown -->
          <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown glass-card">
            <div
              v-for="item in suggestions"
              :key="item.id"
              @mousedown="selectSuggestion(item)"
              class="suggestion-item"
            >
              <span class="suggestion-title">
                {{ (configStore.lang === 'en' && item.title_en) ? item.title_en : item.title }}
              </span>
            </div>
          </div>
        </div>
        <button @click="handleSearch" class="btn btn-primary search-btn">
          🔍 {{ configStore.lang === 'vi' ? 'Tìm kiếm' : 'Search' }}
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
                  loading="lazy"
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
.home-view {
  overflow: hidden;
  max-width: 100%;
}

.hero-section {
  padding: 70px 40px;
  text-align: center;
  margin-bottom: 30px;
  background: linear-gradient(135deg, hsl(var(--color-primary) / 0.1) 0%, hsl(var(--color-accent) / 0.05) 50%, hsl(var(--bg-surface)) 100%);
  border: 1px solid var(--border-light);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 60px rgba(139, 92, 246, 0.03);
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -20%;
  width: 140%;
  height: 200%;
  background: radial-gradient(circle, hsl(var(--color-primary) / 0.04) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.hero-title {
  font-size: 2.6rem;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: -0.03em;
  position: relative;
  z-index: 1;
}

.hero-title .accent {
  background: linear-gradient(135deg, hsl(var(--color-primary-hover)), hsl(var(--color-accent)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  color: hsl(var(--text-secondary));
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
}

.filters-container {
  padding: 24px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: 20px;
}

.search-box {
  display: flex;
  gap: 12px;
}
 
.search-input-wrapper {
  position: relative;
  flex: 1;
}
 
.search-input {
  width: 100%;
  padding: 14px 20px;
  border-radius: 14px;
}
 
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 6px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 50;
  padding: 8px 0;
  border-color: var(--border-glow);
  background: var(--glass-bg);
  border-radius: 14px;
}
 
.suggestion-item {
  padding: 12px 18px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
}
 
.suggestion-item:hover {
  background-color: hsl(var(--bg-surface-elevated));
}
 
.suggestion-title {
  font-size: 0.95rem;
  color: hsl(var(--text-primary));
  font-weight: 600;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-btn {
  white-space: nowrap;
  border-radius: 14px;
  padding: 0 24px;
}

.category-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: hsl(var(--text-secondary));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-tab {
  background: hsl(var(--bg-surface-elevated) / 0.6);
  color: hsl(var(--text-secondary));
  border: 1px solid var(--border-light);
  padding: 8px 18px;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-tab:hover, .category-tab.active {
  background: linear-gradient(135deg, hsl(var(--color-primary) / 0.15), hsl(var(--color-accent) / 0.1));
  color: hsl(var(--color-primary-hover));
  border-color: hsl(var(--color-primary) / 0.4);
  transform: translateY(-1px);
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
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
  height: 200px;
  background-color: hsl(var(--bg-surface-elevated));
  overflow: hidden;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.post-card:hover .thumb-img {
  transform: scale(1.06);
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.6rem;
  color: hsl(var(--text-muted));
  background: linear-gradient(135deg, hsl(var(--bg-surface)) 0%, hsl(var(--bg-surface-elevated)) 100%);
}

.post-cat-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  font-size: 0.75rem;
  font-weight: 700;
  background: hsl(var(--bg-surface) / 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: hsl(var(--color-primary-hover));
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid var(--border-light);
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
  font-weight: 600;
  flex-wrap: wrap;
  gap: 4px;
}

.post-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.45;
  display: block;
  width: 100%;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: anywhere;
  letter-spacing: -0.02em;
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
  line-height: 1.6;
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
  background-color: hsl(var(--bg-surface-elevated) / 0.5);
  font-size: 0.75rem;
  font-weight: 700;
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
  margin-top: 10px;
}

.page-info {
  font-size: 0.95rem;
  font-weight: 600;
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
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: hsl(var(--text-primary));
  margin-bottom: 18px;
  border-left: 4px solid hsl(var(--color-primary));
  padding-left: 10px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cloud-tag {
  background-color: hsl(var(--bg-surface-elevated) / 0.5);
  color: hsl(var(--text-secondary));
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-light);
}

.cloud-tag:hover, .cloud-tag.active {
  background: linear-gradient(135deg, hsl(var(--color-accent) / 0.2), hsl(var(--color-primary) / 0.1));
  color: hsl(var(--color-accent));
  border-color: hsl(var(--color-accent) / 0.4);
  transform: scale(1.03);
}

.widget-text {
  color: hsl(var(--text-secondary));
  font-size: 0.9rem;
  line-height: 1.65;
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
    padding: 36px 20px;
    margin-bottom: 20px;
  }
  .hero-title {
    font-size: 1.8rem;
  }
  .hero-subtitle {
    font-size: 0.95rem;
  }
  .filters-container {
    padding: 16px;
    margin-bottom: 20px;
    gap: 12px;
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
    font-size: 1.15rem;
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
