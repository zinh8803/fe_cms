<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '../store/config';
import { applySeo } from '../utils/seo';

const router = useRouter();
const configStore = useConfigStore();

onMounted(() => {
  applySeo({
    title: configStore.lang === 'vi' ? 'Không tìm thấy trang - 404 Not Found' : 'Page Not Found - 404 Error',
    description: configStore.lang === 'vi' ? 'Rất tiếc, trang bạn yêu cầu không tồn tại hoặc đã được chuyển dời.' : 'Sorry, the page you requested does not exist or has been moved.',
    robots: 'noindex, follow', // Do not index this 404 page but follow links
  });
});

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <div class="not-found-page">
    <div class="background-decorations">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="glass-card error-card animate-fade-in">
      <div class="error-code">404</div>
      
      <h1 class="error-title">
        {{ configStore.lang === 'vi' ? 'Không tìm thấy trang' : 'Page Not Found' }}
      </h1>
      
      <p class="error-desc">
        {{ configStore.lang === 'vi' 
          ? 'Đường dẫn này không tồn tại, hoặc đã được chuyển sang bài viết/chuyên mục khác. Vui lòng kiểm tra lại URL.' 
          : 'The link you followed may be broken, or the page may have been removed. Please check the URL again.'
        }}
      </p>

      <div class="suggested-paths">
        <h3 class="suggested-title">
          {{ configStore.lang === 'vi' ? 'Gợi ý hữu ích dành cho bạn:' : 'Helpful suggestions:' }}
        </h3>
        <ul class="suggestions-list">
          <li>
            <router-link to="/">🏠 {{ configStore.lang === 'vi' ? 'Về Trang chủ TechBlog' : 'Back to Home' }}</router-link>
          </li>
          <li>
            <a href="#" @click.prevent="goBack">↩️ {{ configStore.lang === 'vi' ? 'Quay lại trang trước' : 'Go back to previous page' }}</a>
          </li>
        </ul>
      </div>

      <div class="actions">
        <router-link to="/" class="btn btn-primary">
          {{ configStore.lang === 'vi' ? 'Đi tới Trang chủ' : 'Go to Homepage' }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 40px 20px;
}

.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
}

.circle-1 {
  width: 350px;
  height: 350px;
  background-color: hsl(var(--color-primary));
  top: 10%;
  right: 15%;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background-color: hsl(var(--color-accent));
  bottom: 10%;
  left: 15%;
}

.error-card {
  width: 100%;
  max-width: 550px;
  padding: 50px 40px;
  z-index: 10;
  text-align: center;
  border-color: var(--border-light);
}

.error-code {
  font-size: 7rem;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-accent)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
  letter-spacing: -0.05em;
  animation: float 3s ease-in-out infinite;
}

.error-title {
  font-size: 2rem;
  font-weight: 800;
  color: hsl(var(--text-primary));
  margin-bottom: 16px;
}

.error-desc {
  color: hsl(var(--text-secondary));
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.suggested-paths {
  background-color: hsl(var(--bg-surface-elevated) / 0.4);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  margin-bottom: 30px;
}

.suggested-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestions-list li a {
  color: hsl(var(--text-secondary));
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-block;
}

.suggestions-list li a:hover {
  color: hsl(var(--color-primary-hover));
  transform: translateX(4px);
}

.actions {
  display: flex;
  justify-content: center;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@media (max-width: 600px) {
  .error-card {
    padding: 30px 20px;
  }
  .error-code {
    font-size: 5rem;
  }
  .error-title {
    font-size: 1.5rem;
  }
  .error-desc {
    font-size: 0.9rem;
  }
}
</style>
