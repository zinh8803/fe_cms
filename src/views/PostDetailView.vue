<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useToastStore } from '../store/toast';
import { useConfigStore } from '../store/config';
import axiosClient, { API_URL } from '../api/axios';
import { applySeo, absoluteUrl, injectArticleJsonLd } from '../utils/seo';

const toastStore = useToastStore();
const configStore = useConfigStore();

interface PostSeo {
  title?: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  keywords?: string;
  keywords_en?: string;
}

interface PostDetail {
  id: number;
  title: string;
  title_en: string | null;
  slug: string;
  content: string;
  content_en: string | null;
  category: { id: number; name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  thumbnail_url: string | null;
  view_count: number;
  published_at: number;
  updated_at?: number;
  related?: {
    title: string;
    title_en: string | null;
    slug: string;
    thumbnail_url: string | null;
    published_at: number;
  }[];
  seo: PostSeo | null;
}

interface CommentNode {
  id: number;
  parent_id: number | null;
  author_name: string;
  content: string;
  created_at: number;
  replies: CommentNode[];
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const post = ref<PostDetail | null>(null);
const comments = ref<CommentNode[]>([]);
const loading = ref(true);
const commentLoading = ref(false);

// Post Comment Form Fields
const commentContent = ref('');
const formMessage = ref({ type: '', text: '' });

// Reply Form Control
const replyToId = ref<number | null>(null);
const replyContent = ref('');

const fetchPostDetail = async () => {
  loading.value = true;
  try {
    const slug = route.params.slug as string;
    const response: any = await axiosClient.get(`/posts/${slug}`);
    if (response.status === 'success') {
      if (response.data.redirect) {
        // Redirection for old slugs
        router.replace({ name: 'PostDetail', params: { slug: response.data.new_slug } });
        return;
      }
      post.value = response.data;

      // Fetch Comments in parallel — don't block post render
      fetchComments();
    }
  } catch (error) {
    console.error(configStore.lang === 'vi' ? 'Không tìm thấy bài viết:' : 'Article not found:', error);
  } finally {
    loading.value = false;
  }
};

const fetchComments = async () => {
  if (!post.value) return;
  try {
    const response: any = await axiosClient.get(`/posts/${post.value.id}/comments`);
    if (response.status === 'success') {
      comments.value = response.data;
    }
  } catch (error) {
    console.error(configStore.lang === 'vi' ? 'Không thể tải bình luận:' : 'Could not load comments:', error);
  }
};

const handleCommentSubmit = async (parentId: number | null = null) => {
  if (!post.value) return;
  
  const isReply = parentId !== null;
  const content = isReply ? replyContent.value : commentContent.value;
  
  if (!content) {
    const msg = configStore.lang === 'vi' 
      ? 'Nội dung bình luận không được bỏ trống.' 
      : 'Comment content cannot be empty.';
    if (isReply) toastStore.warning(msg);
    else formMessage.value = { type: 'error', text: msg };
    return;
  }

  commentLoading.value = true;
  if (!isReply) formMessage.value = { type: '', text: '' };

  try {
    const payload = {
      content: content,
      parent_id: parentId
    };

    const response: any = await axiosClient.post(`/posts/${post.value.id}/comments`, payload);
    if (response.status === 'success') {
      const msg = configStore.lang === 'vi' 
        ? 'Đã đăng bình luận thành công.' 
        : 'Comment posted successfully.';
      if (isReply) {
        toastStore.success(msg);
        replyContent.value = '';
        replyToId.value = null;
      } else {
        formMessage.value = { type: 'success', text: msg };
        commentContent.value = '';
      }
      await fetchComments();
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || (configStore.lang === 'vi' ? 'Không thể gửi bình luận.' : 'Failed to submit comment.');
    if (isReply) toastStore.error(errMsg);
    else formMessage.value = { type: 'error', text: errMsg };
  } finally {
    commentLoading.value = false;
  }
};

const toggleReplyForm = (id: number) => {
  replyToId.value = replyToId.value === id ? null : id;
  replyContent.value = '';
};

const formatDate = (timestamp: number) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  const locale = configStore.lang === 'vi' ? 'vi-VN' : 'en-US';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Bilingual Title and Content Computeds
const displayTitle = computed(() => {
  if (configStore.lang === 'en' && post.value?.title_en) {
    return post.value.title_en;
  }
  return post.value?.title || '';
});

const displayContent = computed(() => {
  if (configStore.lang === 'en' && post.value?.content_en) {
    return post.value.content_en;
  }
  return post.value?.content || '';
});
 
const displayContentParsed = computed(() => {
  let content = displayContent.value;
  if (!content) return '';
  // Add loading="lazy" to all img tags if not already present
  return content.replace(/<img\s(?![^>]*loading=)/gi, '<img loading="lazy" ');
});

const plainText = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent?.replace(/\s+/g, ' ').trim() || '';
};

const excerpt = (text: string, length = 155) => {
  if (text.length <= length) return text;
  return `${text.slice(0, length - 1).trim()}...`;
};

const getPostImage = () => {
  if (!post.value?.thumbnail_url) return undefined;
  return new URL(post.value.thumbnail_url, `${API_URL}/`).toString();
};

const isFallbackActive = computed(() => {
  return configStore.lang === 'en' && post.value && !post.value.content_en;
});

// Recursive comment counting including replies
const countComments = (nodes: CommentNode[]): number => {
  let count = 0;
  for (const node of nodes) {
    count++;
    if (node.replies && node.replies.length) {
      count += countComments(node.replies);
    }
  }
  return count;
};

const totalCommentsCount = computed(() => {
  return countComments(comments.value);
});

// Watch lang & post to update document metadata
watch(
  () => [configStore.lang, post.value],
  () => {
    if (post.value) {
      const isEn = configStore.lang === 'en';
      const title = (isEn ? post.value.seo?.title_en : post.value.seo?.title) || displayTitle.value;
      const contentExcerpt = excerpt(plainText(displayContent.value));
      const description = (isEn ? post.value.seo?.description_en : post.value.seo?.description) || contentExcerpt || displayTitle.value;
      const keywords = (isEn ? post.value.seo?.keywords_en : post.value.seo?.keywords) || post.value.tags.map((tag) => tag.name).join(', ');
      const postUrl = new URL('/posts/' + post.value.slug, window.location.origin).toString();
      const imageUrl = getPostImage() || absoluteUrl('/og-image.png');
      const publishedIso = post.value.published_at
        ? new Date(post.value.published_at * 1000).toISOString()
        : undefined;
      const modifiedIso = post.value.updated_at
        ? new Date(post.value.updated_at * 1000).toISOString()
        : publishedIso;

      applySeo({
        title,
        description,
        keywords,
        image: getPostImage(),
        url: postUrl,
        type: 'article',
        publishedTime: publishedIso,
        modifiedTime: modifiedIso,
      });

      // Inject BlogPosting JSON-LD structured data
      injectArticleJsonLd({
        title,
        description,
        image: imageUrl,
        url: postUrl,
        publishedTime: publishedIso || '',
        modifiedTime: modifiedIso || '',
        author: 'TechBlog',
      });
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug) {
      fetchPostDetail();
    }
  }
);

onMounted(() => {
  fetchPostDetail();
});
</script>

<template>
  <div class="post-detail-view">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ configStore.lang === 'vi' ? 'Đang tải nội dung bài viết...' : 'Loading article content...' }}</p>
    </div>

    <template v-else-if="post">
      <!-- Article Header -->
      <article class="post-container">
        <header class="post-header glass-card">
          <div class="post-meta-top">
            <span class="badge badge-category" v-if="post.category">
              {{ post.category.name }}
            </span>
            <span class="meta-date">📅 {{ configStore.lang === 'vi' ? 'Đăng ngày:' : 'Published:' }} {{ formatDate(post.published_at) }}</span>
            <span class="meta-date" v-if="post.updated_at && post.updated_at > post.published_at + 3600">
              🔄 {{ configStore.lang === 'vi' ? 'Cập nhật:' : 'Updated:' }} {{ formatDate(post.updated_at) }}
            </span>
            <span class="meta-views">👁️ {{ post.view_count }} {{ configStore.lang === 'vi' ? 'lượt xem' : 'views' }}</span>
          </div>

          <h1 class="post-title">{{ displayTitle }}</h1>
          
          <div class="post-tags" v-if="post.tags && post.tags.length">
            <span v-for="tag in post.tags" :key="tag.slug" class="badge badge-tag">
              #{{ tag.name }}
            </span>
          </div>
        </header>

        <!-- Fallback Translation Notice -->
        <div v-if="isFallbackActive" class="fallback-warning-banner glass-card">
          <span class="warning-icon">⚠️</span>
          <div class="warning-text">
            <strong>Notice:</strong> This article is not yet translated to English. Showing the Vietnamese version.
          </div>
        </div>

        <!-- Thumbnail Image: loading="eager" because it's the LCP (hero) element -->
        <div class="post-thumbnail-wrap glass-card" v-if="post.thumbnail_url">
          <img :src="API_URL + post.thumbnail_url" :alt="displayTitle" class="detail-thumb" loading="eager" fetchpriority="high" />
        </div>

        <!-- Post Content HTML body -->
        <div class="post-body glass-card" v-html="displayContentParsed"></div>
      </article>

      <!-- Related Posts Section -->
      <section class="related-posts glass-card animate-fade-in" v-if="post.related && post.related.length > 0">
        <h3 class="related-title">
          {{ configStore.lang === 'vi' ? 'Bài viết liên quan' : 'Related Articles' }}
        </h3>
        <div class="related-grid">
          <router-link
            v-for="rel in post.related"
            :key="rel.slug"
            :to="'/posts/' + rel.slug"
            class="related-card glass-card"
          >
            <div class="related-thumb-wrap">
              <img
                v-if="rel.thumbnail_url"
                :src="API_URL + rel.thumbnail_url"
                :alt="rel.title"
                class="related-thumb-img"
                loading="lazy"
              />
              <div v-else class="related-placeholder">TechBlog</div>
            </div>
            <div class="related-info">
              <h4 class="related-card-title">
                {{ (configStore.lang === 'en' && rel.title_en) ? rel.title_en : rel.title }}
              </h4>
              <span class="related-date">📅 {{ formatDate(rel.published_at) }}</span>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Comments Thread section -->
      <section class="comments-section glass-card">
        <h3 class="section-title">
          {{ configStore.lang === 'vi' ? 'Bình luận' : 'Comments' }} ({{ totalCommentsCount }})
        </h3>

        <!-- Comment form -->
        <form v-if="isAuthenticated" @submit.prevent="handleCommentSubmit(null)" class="comment-form">
          <h4 class="form-title">
            {{ configStore.lang === 'vi' ? 'Gửi bình luận của bạn' : 'Submit your comment' }}
          </h4>
          
          <div v-if="formMessage.text" class="alert" :class="'alert-' + formMessage.type">
            {{ formMessage.text }}
          </div>

          <div class="form-group">
            <label class="form-label" for="comment-content">
              {{ configStore.lang === 'vi' ? 'Nội dung bình luận' : 'Comment content' }}
            </label>
            <textarea
              id="comment-content"
              v-model="commentContent"
              class="form-textarea"
              :placeholder="configStore.lang === 'vi' ? 'Chia sẻ ý kiến của bạn về bài viết này...' : 'Share your thoughts on this article...'"
              required
            ></textarea>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="commentLoading">
            {{ commentLoading ? (configStore.lang === 'vi' ? 'Đang gửi...' : 'Sending...') : (configStore.lang === 'vi' ? 'Gửi bình luận' : 'Submit comment') }}
          </button>
        </form>
        <div v-else class="comment-login-alert glass-card">
          <p v-if="configStore.lang === 'vi'">
            🔑 Vui lòng <router-link to="/login" class="login-link">đăng nhập</router-link> hoặc <router-link to="/register" class="login-link">đăng ký</router-link> tài khoản để gửi bình luận.
          </p>
          <p v-else>
            🔑 Please <router-link to="/login" class="login-link">login</router-link> or <router-link to="/register" class="login-link">register</router-link> an account to submit comments.
          </p>
        </div>

        <hr class="divider" />

        <!-- Nested Comments List -->
        <div class="comments-list">
          <div v-if="comments.length === 0" class="no-comments">
            {{ configStore.lang === 'vi' ? 'Chưa có bình luận nào được phê duyệt. Hãy là người đầu tiên bình luận!' : 'No approved comments yet. Be the first to comment!' }}
          </div>

          <div v-else class="comment-tree">
            <!-- Recursive comment component layout inside templates -->
            <div v-for="comment in comments" :key="comment.id" class="comment-node-wrapper">
              <div class="comment-node">
                <div class="comment-node-header">
                  <span class="author-avatar">👤</span>
                  <div class="author-details">
                    <span class="author-name">{{ comment.author_name }}</span>
                    <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                  </div>
                  <button v-if="isAuthenticated" @click="toggleReplyForm(comment.id)" class="reply-trigger">
                    {{ configStore.lang === 'vi' ? 'Phản hồi' : 'Reply' }}
                  </button>
                </div>
                <div class="comment-node-body">
                  {{ comment.content }}
                </div>

                <!-- Slide-in Reply Box -->
                <div v-if="replyToId === comment.id" class="reply-form-box">
                  <form @submit.prevent="handleCommentSubmit(comment.id)" class="reply-form">
                    <h5 class="reply-form-title">
                      {{ configStore.lang === 'vi' ? 'Trả lời' : 'Reply to' }} {{ comment.author_name }}
                    </h5>
                    <textarea
                      v-model="replyContent"
                      :placeholder="configStore.lang === 'vi' ? 'Viết phản hồi...' : 'Write a reply...'"
                      class="form-textarea textarea-sm"
                      required
                    ></textarea>
                    <div class="reply-actions">
                      <button type="submit" class="btn btn-primary btn-sm">
                        {{ configStore.lang === 'vi' ? 'Gửi phản hồi' : 'Send reply' }}
                      </button>
                      <button type="button" @click="replyToId = null" class="btn btn-secondary btn-sm">
                        {{ configStore.lang === 'vi' ? 'Hủy' : 'Cancel' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- Nested replies rendering (Level 2 recursion) -->
              <div v-if="comment.replies && comment.replies.length" class="comment-replies">
                <div v-for="reply in comment.replies" :key="reply.id" class="comment-node reply-node">
                  <div class="comment-node-header">
                    <span class="author-avatar">💬</span>
                    <div class="author-details">
                      <span class="author-name">{{ reply.author_name }}</span>
                      <span class="comment-date">{{ formatDate(reply.created_at) }}</span>
                    </div>
                  </div>
                  <div class="comment-node-body">
                    {{ reply.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="empty-state glass-card">
      <h3>{{ configStore.lang === 'vi' ? 'Không tìm thấy bài viết' : 'Post not found' }}</h3>
      <router-link to="/">{{ configStore.lang === 'vi' ? 'Quay về trang chủ' : 'Back to homepage' }}</router-link>
    </div>
  </div>
</template>

<style scoped>
.post-detail-view {
  overflow: hidden;
  max-width: 100%;
}

.post-container {
  margin-bottom: 40px;
  max-width: 100%;
  overflow: hidden;
}

.post-header {
  padding: 30px;
  margin-bottom: 24px;
  border-color: rgba(255, 255, 255, 0.05);
}

.post-meta-top {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: hsl(var(--text-muted));
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.post-title {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 20px;
  color: hsl(var(--text-primary));
  display: block;
  width: 100%;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.post-thumbnail-wrap {
  overflow: hidden;
  height: 400px;
  margin-bottom: 24px;
  border-color: rgba(255, 255, 255, 0.05);
}

.detail-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-body {
  padding: 40px;
  font-size: 1.1rem;
  line-height: 1.8;
  color: hsl(var(--text-primary));
  overflow-wrap: anywhere;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  overflow: hidden;
}

.post-body :deep(p) {
  margin-bottom: 20px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.post-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px auto;
  display: block;
}

.post-body :deep(h2), .post-body :deep(h3) {
  color: hsl(var(--text-primary));
  margin: 30px 0 15px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.post-body :deep(pre) {
  overflow-x: auto;
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.post-body :deep(code) {
  word-break: break-all;
  overflow-wrap: anywhere;
}

.post-body :deep(table) {
  max-width: 100%;
  overflow-x: auto;
  display: block;
}

.post-body :deep(a) {
  word-break: break-all;
  overflow-wrap: anywhere;
}

.post-body :deep(iframe) {
  max-width: 100%;
}

.fallback-warning-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  background-color: hsl(var(--color-warning) / 0.1) !important;
  border: 1px solid hsl(var(--color-warning) / 0.25) !important;
  color: hsl(var(--color-warning));
  border-radius: 12px;
}

.warning-icon {
  font-size: 1.25rem;
}

.warning-text {
  font-size: 0.95rem;
  font-weight: 500;
}

.comments-section {
  padding: 40px;
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: hsl(var(--text-primary));
}

.comment-form {
  background-color: hsl(var(--bg-surface-elevated) / 0.3);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  margin-bottom: 40px;
}

.form-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.divider {
  border: 0;
  height: 1px;
  background-color: var(--border-light);
  margin: 40px 0;
}

.no-comments {
  text-align: center;
  color: hsl(var(--text-muted));
  padding: 40px 0;
}

.comment-tree {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.comment-node-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-node {
  background-color: hsl(var(--bg-surface) / 0.5);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 20px;
}

.comment-node-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
}

.author-avatar {
  font-size: 1.25rem;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: hsl(var(--text-primary));
}

.comment-date {
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
}

.reply-trigger {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: hsl(var(--color-primary-hover));
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.reply-trigger:hover {
  text-decoration: underline;
}

.comment-node-body {
  color: hsl(var(--text-secondary));
  font-size: 0.95rem;
  white-space: pre-wrap;
}

.comment-replies {
  margin-left: 40px;
  padding-left: 16px;
  border-left: 2px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-node {
  background-color: hsl(var(--bg-surface-elevated) / 0.2);
}

.reply-form-box {
  margin-top: 16px;
  background-color: hsl(var(--bg-surface-elevated) / 0.5);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 16px;
}

.reply-form-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.input-sm {
  padding: 8px 12px;
  font-size: 0.85rem;
}

.textarea-sm {
  min-height: 80px;
  padding: 10px;
  font-size: 0.85rem;
  margin-top: 10px;
}

.reply-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
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

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 20px;
}
.alert-error {
  background-color: rgba(239, 68, 68, 0.15);
  color: hsl(var(--color-danger));
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.alert-success {
  background-color: rgba(16, 185, 129, 0.15);
  color: hsl(var(--color-success));
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.comment-login-alert {
  padding: 24px;
  text-align: center;
  border-color: rgba(255, 255, 255, 0.05);
  margin-bottom: 40px;
}

.comment-login-alert p {
  margin: 0;
  color: hsl(var(--text-secondary));
  font-size: 0.95rem;
}

.login-link {
  color: hsl(var(--color-primary-hover));
  font-weight: 600;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .post-header {
    padding: 20px 16px;
  }
  .post-thumbnail-wrap {
    height: auto;
    max-height: 300px;
  }
  .post-title {
    font-size: 1.5rem;
  }
  .post-body {
    padding: 20px 16px;
    font-size: 1rem;
  }
  .comments-section {
    padding: 20px 16px;
  }
  .comment-form {
    padding: 16px;
  }
  .comment-node {
    padding: 16px;
  }
  .divider {
    margin: 24px 0;
  }
  .section-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .post-header {
    padding: 16px 12px;
  }
  .post-title {
    font-size: 1.25rem;
    line-height: 1.4;
  }
  .post-meta-top {
    gap: 8px;
    font-size: 0.78rem;
  }
  .post-thumbnail-wrap {
    height: auto;
    max-height: 220px;
    border-radius: 12px;
  }
  .post-body {
    padding: 16px 12px;
    font-size: 0.95rem;
    line-height: 1.7;
  }
  .comments-section {
    padding: 16px 12px;
  }
  .comment-replies {
    margin-left: 12px;
    padding-left: 8px;
  }
  .comment-node {
    padding: 12px;
  }
  .reply-form-box {
    padding: 12px;
  }
  .section-title {
    font-size: 1.1rem;
  }
}

.related-posts {
  padding: 40px;
  margin-bottom: 40px;
  border-color: rgba(255, 255, 255, 0.05);
}

.related-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: hsl(var(--text-primary));
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.related-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.related-card:hover {
  border-color: var(--border-glow);
  transform: translateY(-2px);
}

.related-thumb-wrap {
  height: 120px;
  background-color: hsl(var(--bg-surface-elevated));
  position: relative;
  overflow: hidden;
}

.related-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: hsl(var(--text-muted));
  background: linear-gradient(135deg, hsl(var(--bg-surface)) 0%, hsl(var(--bg-surface-elevated)) 100%);
}

.related-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.related-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: hsl(var(--text-primary));
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-date {
  font-size: 0.8rem;
  color: hsl(var(--text-muted));
}

@media (max-width: 768px) {
  .related-posts {
    padding: 20px 16px;
  }
  .related-title {
    font-size: 1.2rem;
  }
  .related-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  .related-thumb-wrap {
    height: 150px;
  }
}
</style>
