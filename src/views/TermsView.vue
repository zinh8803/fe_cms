<script setup lang="ts">
import { onMounted } from 'vue';
import { useConfigStore } from '../store/config';
import { applySeo } from '../utils/seo';

const configStore = useConfigStore();

onMounted(() => {
  applySeo({
    title: configStore.lang === 'vi' ? 'Điều khoản sử dụng - TechBlog' : 'Terms of Service - TechBlog',
    description: configStore.lang === 'vi'
      ? 'Quy định và điều khoản sử dụng khi truy cập và tương tác trên nền tảng TechBlog.'
      : 'Terms and conditions for accessing and using the TechBlog platform.',
    keywords: 'điều khoản, quy định, điều khoản sử dụng, terms of service, TechBlog terms',
  });
});
</script>

<template>
  <div class="legal-page">
    <div class="background-decorations">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="container legal-container animate-fade-in">
      <!-- Header -->
      <div class="legal-header text-center">
        <span class="badge badge-category">
          {{ configStore.lang === 'vi' ? 'Quy định & Pháp lý' : 'Legal & Compliance' }}
        </span>
        <h1 class="legal-title">
          {{ configStore.lang === 'vi' ? 'Điều Khoản Sử Dụng' : 'Terms of Service' }}
        </h1>
        <p class="legal-subtitle">
          {{ configStore.lang === 'vi' 
            ? 'Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ của TechBlog.' 
            : 'Please read these terms carefully before using TechBlog services.' 
          }}
        </p>
        <div class="legal-meta">
          <span class="meta-item">
            📅 {{ configStore.lang === 'vi' ? 'Cập nhật lần cuối: 15/09/2026' : 'Last updated: September 15, 2026' }}
          </span>
          <span class="meta-divider">•</span>
          <span class="meta-item">
            🏷️ {{ configStore.lang === 'vi' ? 'Phiên bản 2.1' : 'Version 2.1' }}
          </span>
        </div>
      </div>

      <!-- Main Content Body -->
      <main class="legal-content glass-card">
        <!-- Section 1 -->
        <section id="acceptance" class="legal-section">
          <h2 class="section-title">
            1. {{ configStore.lang === 'vi' ? 'Chấp nhận các điều khoản' : 'Acceptance of Terms' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Chào mừng bạn đến với <strong>TechBlog</strong>. Khi truy cập, duyệt web hoặc sử dụng bất kỳ dịch vụ, tài nguyên hay tính năng nào trên TechBlog, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý chịu ràng buộc bởi các Điều khoản sử dụng này.
              </p>
              <p>
                Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng trang web ngay lập tức.
              </p>
            </template>
            <template v-else>
              <p>
                Welcome to <strong>TechBlog</strong>. By accessing, browsing, or using any services, resources, or features provided on TechBlog, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
              </p>
              <p>
                If you do not agree with any part of these terms, please discontinue using the website immediately.
              </p>
            </template>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="intellectual-property" class="legal-section">
          <h2 class="section-title">
            2. {{ configStore.lang === 'vi' ? 'Quyền sở hữu trí tuệ & Bản quyền' : 'Intellectual Property Rights' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Toàn bộ nội dung đăng tải trên TechBlog—bao gồm bài viết kỹ thuật, mã nguồn mẫu, đồ họa, thiết kế giao diện, logo và tài liệu hướng dẫn—thuộc quyền sở hữu của ban quản trị TechBlog hoặc các tác giả được cấp phép, được bảo vệ theo pháp luật sở hữu trí tuệ Việt Nam và quốc tế.
              </p>
              <ul>
                <li><strong>Được phép:</strong> Chia sẻ liên kết bài viết, trích dẫn ngắn kèm ghi nhận nguồn rõ ràng trỏ về liên kết gốc trên TechBlog.</li>
                <li><strong>Nghiêm cấm:</strong> Tự ý sao chép toàn bộ bài viết, phân phối lại nhằm mục đích thương mại hoặc đảo ngược mã nguồn mà không có sự chấp thuận trước bằng văn bản.</li>
              </ul>
            </template>
            <template v-else>
              <p>
                All content published on TechBlog—including technical articles, code snippets, visual designs, logos, and instructional materials—is the property of TechBlog or its licensed authors and is protected by intellectual property laws.
              </p>
              <ul>
                <li><strong>Allowed:</strong> Sharing direct links to posts, citing brief snippets with clear attribution back to the original TechBlog URL.</li>
                <li><strong>Prohibited:</strong> Full duplication, commercial redistribution, or reverse engineering of source code without prior written consent.</li>
              </ul>
            </template>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="account" class="legal-section">
          <h2 class="section-title">
            3. {{ configStore.lang === 'vi' ? 'Tài khoản người dùng & Bảo mật' : 'User Account & Security' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Khi đăng ký tài khoản thành viên trên TechBlog, bạn có trách nhiệm cung cấp thông tin chính xác và cập nhật mật khẩu định kỳ.
              </p>
              <p>
                Bạn chịu hoàn toàn trách nhiệm đối với tất cả các hoạt động diễn ra dưới tài khoản của mình. Nếu phát hiện bất kỳ dấu hiệu truy cập trái phép nào, vui lòng thông báo ngay cho ban quản trị để được hỗ trợ kịp thời.
              </p>
            </template>
            <template v-else>
              <p>
                When registering an account on TechBlog, you are responsible for maintaining accurate registration details and keeping your password confidential.
              </p>
              <p>
                You are solely responsible for all activities conducted under your account. Should you detect any unauthorized access, please notify our administrators immediately.
              </p>
            </template>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="comments" class="legal-section">
          <h2 class="section-title">
            4. {{ configStore.lang === 'vi' ? 'Quy định về bình luận & Đóng góp nội dung' : 'Comments & Community Guidelines' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                TechBlog khuyến khích các cuộc thảo luận mang tính xây dựng, chia sẻ kinh nghiệm lập trình chuyên nghiệp. Để giữ cho cộng đồng văn minh, các hành vi sau bị nghiêm cấm:
              </p>
              <ul>
                <li>Đăng tải nội dung phỉ báng, thù địch, quấy rối, xúc phạm cá nhân hoặc tổ chức.</li>
                <li>Spam quảng cáo, chèn link độc hại, mã độc gây hại cho hệ thống hoặc người dùng khác.</li>
                <li>Tiết lộ thông tin bí mật cá nhân của bên thứ ba khi chưa được sự cho phép.</li>
              </ul>
              <p class="callout callout-warning">
                ⚠️ Ban quản trị có toàn quyền kiểm duyệt, chỉnh sửa hoặc xóa vĩnh viễn các bình luận vi phạm mà không cần thông báo trước.
              </p>
            </template>
            <template v-else>
              <p>
                TechBlog welcomes constructive discussions and knowledge exchange. To maintain a productive learning environment, the following behaviors are strictly prohibited:
              </p>
              <ul>
                <li>Posting defamatory, harassing, abusive, or discriminatory remarks.</li>
                <li>Spamming marketing links, phishing schemes, or malicious scripts.</li>
                <li>Disclosing confidential third-party personal details without consent.</li>
              </ul>
              <p class="callout callout-warning">
                ⚠️ Moderators reserve the right to review, edit, or remove non-compliant comments without prior warning.
              </p>
            </template>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="disclaimer" class="legal-section">
          <h2 class="section-title">
            5. {{ configStore.lang === 'vi' ? 'Giới hạn trách nhiệm pháp lý' : 'Limitation of Liability' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Các bài viết và đoạn mã mẫu trên TechBlog được cung cấp trên nguyên tắc <em>"như hiện có" (as-is)</em> nhằm phục vụ mục đích học hỏi và tham khảo. Mặc dù chúng tôi luôn cố gắng kiểm tra tính chính xác, chúng tôi không đảm bảo rằng mọi mã nguồn hoặc giải pháp đều phù hợp hoàn toàn cho môi trường sản xuất của bạn mà không phát sinh lỗi.
              </p>
              <p>
                TechBlog không chịu trách nhiệm đối với bất kỳ tổn thất trực tiếp hoặc gián tiếp nào (bao gồm mất dữ liệu, gián đoạn kinh doanh) phát sinh từ việc sử dụng thông tin từ trang web.
              </p>
            </template>
            <template v-else>
              <p>
                Articles and sample code snippets on TechBlog are provided on an <em>"as is"</em> basis for instructional and reference purposes. While we strive for accuracy, we do not guarantee that every solution will be error-free in your production environments.
              </p>
              <p>
                TechBlog shall not be held liable for any direct or indirect losses (including data loss or business interruption) arising from the application of knowledge shared on this website.
              </p>
            </template>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="modifications" class="legal-section">
          <h2 class="section-title">
            6. {{ configStore.lang === 'vi' ? 'Thay đổi điều khoản' : 'Modifications to Terms' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Chúng tôi có quyền điều chỉnh hoặc cập nhật Điều khoản sử dụng này vào bất kỳ lúc nào để phù hợp với sự phát triển của nền tảng và các quy định pháp luật hiện hành. Những thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang này kèm ngày sửa đổi tương ứng.
              </p>
            </template>
            <template v-else>
              <p>
                We reserve the right to revise or modify these Terms of Service at any time to reflect platform improvements or regulatory compliance. Revisions become effective immediately upon being published on this page with an updated timestamp.
              </p>
            </template>
          </div>
        </section>

        <!-- Section 7 -->
        <section id="contact" class="legal-section">
          <h2 class="section-title">
            7. {{ configStore.lang === 'vi' ? 'Thông tin liên hệ & Hỗ trợ' : 'Contact & Support' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Nếu bạn có bất kỳ thắc mắc, đề xuất hoặc khiếu nại nào liên quan đến các Điều khoản sử dụng của TechBlog, xin vui lòng liên hệ với chúng tôi qua:
              </p>
              <div class="contact-box">
                <p>📧 Email: <a href="mailto:ngoquocvinh2003@gmail.com" class="footer-link">ngoquocvinh2003@gmail.com</a></p>
                <p>🌐 Website: <a href="https://github.com/zinh8803/fe_cms" target="_blank" rel="noopener noreferrer" class="footer-link">TechBlog Community</a></p>
              </div>
            </template>
            <template v-else>
              <p>
                If you have any questions, feedback, or concerns regarding our Terms of Service, please reach out through:
              </p>
              <div class="contact-box">
                <p>📧 Email: <a href="mailto:ngoquocvinh2003@gmail.com" class="footer-link">ngoquocvinh2003@gmail.com</a></p>
                <p>🌐 Website: <a href="https://github.com/zinh8803/fe_cms" target="_blank" rel="noopener noreferrer" class="footer-link">TechBlog Community</a></p>
              </div>
            </template>
          </div>
        </section>

        <!-- Footer Action inside Card -->
        <div class="legal-footer-nav">
          <router-link to="/privacy" class="btn btn-secondary">
            🔒 {{ configStore.lang === 'vi' ? 'Xem Chính sách quyền riêng tư' : 'Read Privacy Policy' }}
          </router-link>
          <router-link to="/" class="btn btn-primary">
            🏠 {{ configStore.lang === 'vi' ? 'Về Trang chủ' : 'Back to Home' }}
          </router-link>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  position: relative;
  overflow: hidden;
  padding-bottom: 30px;
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
  filter: blur(110px);
  opacity: 0.12;
}

.circle-1 {
  width: 380px;
  height: 380px;
  background-color: hsl(var(--color-primary));
  top: 5%;
  right: 5%;
}

.circle-2 {
  width: 420px;
  height: 420px;
  background-color: hsl(var(--color-accent));
  bottom: 10%;
  left: 5%;
}

.legal-container {
  position: relative;
  z-index: 10;
}

.legal-header {
  margin-bottom: 36px;
}

.legal-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: hsl(var(--text-primary));
  margin: 14px 0 10px;
  letter-spacing: -0.03em;
}

.legal-subtitle {
  font-size: 1.1rem;
  color: hsl(var(--text-secondary));
  margin: 0 auto 18px;
}

.legal-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 0.88rem;
  color: hsl(var(--text-muted));
}

.meta-divider {
  opacity: 0.5;
}

/* Main Content */
.legal-content {
  width: 100%;
  padding: 44px 48px;
}

.legal-section {
  margin-bottom: 40px;
}

.legal-section:last-of-type {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
  letter-spacing: -0.01em;
}

.section-body {
  color: hsl(var(--text-secondary));
  font-size: 0.98rem;
  line-height: 1.75;
}

.section-body p {
  margin-bottom: 14px;
}

.section-body ul {
  padding-left: 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-body li strong {
  color: hsl(var(--text-primary));
}

.callout {
  padding: 16px 20px;
  border-radius: 12px;
  margin-top: 16px;
  font-size: 0.92rem;
}

.callout-warning {
  background: hsla(35, 90%, 50%, 0.12);
  border: 1px solid hsla(35, 90%, 50%, 0.3);
  color: hsl(var(--text-primary));
}

.contact-box {
  background: hsl(var(--bg-surface-elevated) / 0.5);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 18px 22px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-link {
  color: hsl(var(--color-primary));
  font-weight: 600;
}

.legal-footer-nav {
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

@media (max-width: 900px) {
  .legal-content {
    padding: 24px 20px;
  }

  .legal-title {
    font-size: 2rem;
  }
}
</style>
