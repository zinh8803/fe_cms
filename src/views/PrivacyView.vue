<script setup lang="ts">
import { onMounted } from 'vue';
import { useConfigStore } from '../store/config';
import { applySeo } from '../utils/seo';

const configStore = useConfigStore();

onMounted(() => {
  applySeo({
    title: configStore.lang === 'vi' ? 'Chính sách quyền riêng tư - TechBlog' : 'Privacy Policy - TechBlog',
    description: configStore.lang === 'vi'
      ? 'Chính sách bảo mật thông tin và quyền riêng tư của người dùng tại nền tảng TechBlog.'
      : 'Privacy policy and personal data protection principles at TechBlog.',
    keywords: 'quyền riêng tư, bảo mật, chính sách bảo mật, privacy policy, TechBlog privacy',
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
        <span class="badge badge-tag">
          {{ configStore.lang === 'vi' ? 'Bảo Mật Dữ Liệu' : 'Data Privacy' }}
        </span>
        <h1 class="legal-title">
          {{ configStore.lang === 'vi' ? 'Chính Sách Quyền Riêng Tư' : 'Privacy Policy' }}
        </h1>
        <p class="legal-subtitle">
          {{ configStore.lang === 'vi' 
            ? 'TechBlog cam kết tôn trọng và bảo vệ tuyệt đối dữ liệu riêng tư của mọi độc giả và thành viên.' 
            : 'TechBlog is committed to respecting and safeguarding the personal privacy of all readers and members.' 
          }}
        </p>
        <div class="legal-meta">
          <span class="meta-item">
            📅 {{ configStore.lang === 'vi' ? 'Cập nhật lần cuối: 15/09/2026' : 'Last updated: September 15, 2026' }}
          </span>
          <span class="meta-divider">•</span>
          <span class="meta-item">
            🛡️ {{ configStore.lang === 'vi' ? 'Tuân thủ GDPR & Pháp luật Việt Nam' : 'GDPR & Privacy Compliant' }}
          </span>
        </div>
      </div>

      <!-- Main Content Body -->
      <main class="legal-content glass-card">
        <!-- Section 1 -->
        <section id="overview" class="legal-section">
          <h2 class="section-title">
            1. {{ configStore.lang === 'vi' ? 'Cam kết bảo mật chung' : 'Our Privacy Commitment' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Tại <strong>TechBlog</strong>, chúng tôi hiểu rằng quyền riêng tư của bạn là vô cùng quan trọng. Chính sách này mô tả cách chúng tôi thu thập, lưu trữ, sử dụng và bảo vệ thông tin khi bạn truy cập website hoặc sử dụng các tính năng thảo luận của cộng đồng chúng tôi.
              </p>
              <div class="highlight-card">
                🔒 <strong>Nguyên tắc cốt lõi:</strong> Chúng tôi không bao giờ bán, cho thuê hay thương mại hoá thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc tiếp thị phiền hà.
              </div>
            </template>
            <template v-else>
              <p>
                At <strong>TechBlog</strong>, we recognize the vital importance of your personal privacy. This Privacy Policy details how we handle, store, use, and safeguard your data whenever you browse our site or interact with our developer community.
              </p>
              <div class="highlight-card">
                🔒 <strong>Core Principle:</strong> We strictly never sell, lease, or monetize your personal data to any external parties for marketing or advertising purposes.
              </div>
            </template>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="collection" class="legal-section">
          <h2 class="section-title">
            2. {{ configStore.lang === 'vi' ? 'Thông tin chúng tôi thu thập' : 'Information We Collect' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Chúng tôi chỉ thu thập những thông tin cần thiết tối thiểu nhằm mang lại trải nghiệm duyệt blog mượt mà và an toàn:
              </p>
              <ul>
                <li><strong>Thông tin tài khoản:</strong> Tên người dùng (username), địa chỉ email và mật khẩu (được mã hóa mật mã an toàn bằng thuật toán bcrypt/Argon2) khi bạn đăng ký tài khoản.</li>
                <li><strong>Nội dung đóng góp:</strong> Bình luận, phản hồi và thời gian đăng bài mà bạn chủ động gửi lên hệ thống.</li>
                <li><strong>Nhật ký kỹ thuật (Log data):</strong> Địa chỉ IP truy cập, loại trình duyệt, phiên bản hệ điều hành và số lượt xem bài viết để phát hiện tấn công DDoS và tối ưu hóa hiệu năng máy chủ.</li>
              </ul>
            </template>
            <template v-else>
              <p>
                We collect only the minimal necessary data to deliver a secure and smooth developer reading experience:
              </p>
              <ul>
                <li><strong>Account Information:</strong> Username, email address, and encrypted credentials (hashed using industry standard bcrypt/Argon2 algorithms) when you register.</li>
                <li><strong>User Contributions:</strong> Comments, discussion replies, and timestamps submitted directly by you.</li>
                <li><strong>Technical Logs:</strong> IP address, user agent, browser type, and page access timestamps used solely to prevent DDoS attacks and improve server response times.</li>
              </ul>
            </template>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="usage" class="legal-section">
          <h2 class="section-title">
            3. {{ configStore.lang === 'vi' ? 'Mục đích sử dụng dữ liệu' : 'How We Use Your Data' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>Dữ liệu thu thập được sử dụng cho các mục đích cụ thể sau:</p>
              <ul>
                <li>Xác thực phiên đăng nhập và định danh tác giả các bình luận.</li>
                <li>Cho phép bạn thay đổi mật khẩu và quản lý hồ sơ cá nhân an toàn.</li>
                <li>Phân tích số liệu thống kê lượt đọc bài viết (Page views) nhằm gợi ý những chủ đề công nghệ được quan tâm nhất.</li>
                <li>Ngăn chặn các hành vi gian lận, spam bình luận và các lỗ hổng bảo mật.</li>
              </ul>
            </template>
            <template v-else>
              <p>We use collected data solely for specific and legitimate operations:</p>
              <ul>
                <li>Authenticating your user session and attributing comment authorship.</li>
                <li>Enabling password resets and secure profile management.</li>
                <li>Aggregating anonymized article viewership metrics to surface trending tech topics.</li>
                <li>Guarding the platform against malicious scripts, bot spam, and security intrusions.</li>
              </ul>
            </template>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="security" class="legal-section">
          <h2 class="section-title">
            4. {{ configStore.lang === 'vi' ? 'Bảo mật & Thời gian lưu trữ' : 'Data Security & Retention' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Chúng tôi triển khai các tiêu chuẩn bảo mật hiện đại bao gồm giao thức truyền tải mã hóa <strong>HTTPS/TLS</strong>, mã hóa mật khẩu một chiều và cơ chế phân quyền RBAC nghiêm ngặt giữa người dùng thông thường, biên tập viên và quản trị viên.
              </p>
              <p>
                Thông tin tài khoản của bạn được lưu trữ an toàn trong suốt thời gian tài khoản hoạt động. Nếu bạn yêu cầu xóa tài khoản, toàn bộ dữ liệu cá nhân định danh sẽ được xóa vĩnh viễn khỏi cơ sở dữ liệu sau khi xác thực.
              </p>
            </template>
            <template v-else>
              <p>
                We implement industry-grade security measures including encrypted <strong>HTTPS/TLS</strong> transport layers, one-way cryptographic password hashing, and strict Role-Based Access Control (RBAC) separating members, editors, and administrators.
              </p>
              <p>
                Your account data is safely retained as long as your account remains active. Upon an account deletion request, all identifiable personal data is permanently purged from our database.
              </p>
            </template>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="cookies" class="legal-section">
          <h2 class="section-title">
            5. {{ configStore.lang === 'vi' ? 'Cookie & Quản lý phiên truy cập' : 'Cookies & Session Storage' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>TechBlog sử dụng LocalStorage và Cookie trình duyệt cho các mục đích thiết yếu:</p>
              <ul>
                <li><strong>Giao diện (Theme):</strong> Lưu tùy chọn chế độ Sáng / Tối (Dark / Light mode).</li>
                <li><strong>Ngôn ngữ (Language):</strong> Lưu tùy chọn ngôn ngữ hiển thị (Tiếng Việt / English).</li>
                <li><strong>Phiên xác thực (JWT Token):</strong> Lưu token xác thực để bạn không cần đăng nhập lại mỗi khi làm mới trang.</li>
              </ul>
              <p>Bạn có thể xóa hoặc chặn cookie trong phần cài đặt của trình duyệt bất cứ lúc nào, tuy nhiên một số tính năng như đăng nhập có thể bị gián đoạn.</p>
            </template>
            <template v-else>
              <p>TechBlog utilizes browser LocalStorage and essential cookies strictly for operational needs:</p>
              <ul>
                <li><strong>Theme Preferences:</strong> Preserving your Dark / Light mode visual preference.</li>
                <li><strong>Locale Setting:</strong> Remembering your chosen language (Vietnamese / English).</li>
                <li><strong>Authentication Session (JWT):</strong> Maintaining your signed-in state without requiring re-login on refresh.</li>
              </ul>
              <p>You may clear or disable cookies via your browser settings at any time, though authentication-dependent features may require signing back in.</p>
            </template>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="rights" class="legal-section">
          <h2 class="section-title">
            6. {{ configStore.lang === 'vi' ? 'Quyền lợi của bạn đối với dữ liệu' : 'Your Data Protection Rights' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>Với tư cách là người dùng, bạn luôn nắm giữ toàn quyền kiểm soát dữ liệu cá nhân của mình:</p>
              <div class="rights-grid">
                <div class="right-box">
                  <span class="right-icon">👁️</span>
                  <h4>Quyền truy cập</h4>
                  <p>Xem thông tin tài khoản và lịch sử bình luận của bạn bất kỳ lúc nào.</p>
                </div>
                <div class="right-box">
                  <span class="right-icon">✏️</span>
                  <h4>Quyền chỉnh sửa</h4>
                  <p>Cập nhật mật khẩu hoặc thông tin cá nhân trong trang cài đặt tài khoản.</p>
                </div>
                <div class="right-box">
                  <span class="right-icon">🗑️</span>
                  <h4>Quyền yêu cầu xóa</h4>
                  <p>Yêu cầu ban quản trị gỡ bỏ tài khoản và ẩn danh các nội dung đã bình luận.</p>
                </div>
              </div>
            </template>
            <template v-else>
              <p>As a valued community member, you retain full rights over your personal data:</p>
              <div class="rights-grid">
                <div class="right-box">
                  <span class="right-icon">👁️</span>
                  <h4>Right of Access</h4>
                  <p>Review your personal profile data and comments history at any time.</p>
                </div>
                <div class="right-box">
                  <span class="right-icon">✏️</span>
                  <h4>Right to Rectify</h4>
                  <p>Update your password and credentials seamlessly in account settings.</p>
                </div>
                <div class="right-box">
                  <span class="right-icon">🗑️</span>
                  <h4>Right to Erasure</h4>
                  <p>Request account closure and permanent anonymization of your submissions.</p>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- Section 7 -->
        <section id="third-party" class="legal-section">
          <h2 class="section-title">
            7. {{ configStore.lang === 'vi' ? 'Dịch vụ của bên thứ ba' : 'Third-Party Services' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Trang web có thể tích hợp hoặc liên kết tới các tài nguyên bên ngoài (như GitHub repository, Google Fonts, thư viện CDN). Các trang này có chính sách quyền riêng tư riêng biệt và TechBlog không chịu trách nhiệm về nội dung hay thực tiễn xử lý dữ liệu của các bên độc lập này.
              </p>
            </template>
            <template v-else>
              <p>
                Our site may occasionally embed or link to third-party services (such as GitHub, Google Fonts, or CDN mirrors). These external sites maintain distinct privacy policies, and TechBlog is not responsible for their independent data handling practices.
              </p>
            </template>
          </div>
        </section>

        <!-- Section 8 -->
        <section id="contact" class="legal-section">
          <h2 class="section-title">
            8. {{ configStore.lang === 'vi' ? 'Thông tin liên hệ khiếu nại & Thắc mắc' : 'Contact & Inquiries' }}
          </h2>
          <div class="section-body">
            <template v-if="configStore.lang === 'vi'">
              <p>
                Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào về việc thực thi quyền riêng tư cá nhân, xin vui lòng gửi email tới bộ phận phụ trách:
              </p>
              <div class="contact-box">
                <p>📧 Email hỗ trợ bảo mật: <a href="mailto:ngoquocvinh2003@gmail.com" class="footer-link">ngoquocvinh2003@gmail.com</a></p>
                <p>⚡ Phản hồi: Chúng tôi thường giải quyết mọi yêu cầu dữ liệu cá nhân trong vòng 24 - 48 giờ làm việc.</p>
              </div>
            </template>
            <template v-else>
              <p>
                If you have inquiries or wish to exercise any of your privacy rights, please reach out to our team:
              </p>
              <div class="contact-box">
                <p>📧 Privacy Inquiries: <a href="mailto:ngoquocvinh2003@gmail.com" class="footer-link">ngoquocvinh2003@gmail.com</a></p>
                <p>⚡ Response Time: We respond to personal data inquiries within 24 to 48 business hours.</p>
              </div>
            </template>
          </div>
        </section>

        <!-- Footer Action inside Card -->
        <div class="legal-footer-nav">
          <router-link to="/terms" class="btn btn-secondary">
            📜 {{ configStore.lang === 'vi' ? 'Xem Điều khoản sử dụng' : 'Read Terms of Service' }}
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

.highlight-card {
  background: hsla(174, 90%, 41%, 0.1);
  border: 1px solid hsla(174, 90%, 41%, 0.25);
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 0;
  font-size: 0.95rem;
  color: hsl(var(--text-primary));
}

.rights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.right-box {
  background: hsl(var(--bg-surface-elevated) / 0.5);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.25s ease;
}

.right-box:hover {
  border-color: var(--border-glow);
  transform: translateY(-2px);
}

.right-icon {
  font-size: 1.6rem;
  margin-bottom: 8px;
  display: inline-block;
}

.right-box h4 {
  font-size: 1rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  margin-bottom: 6px;
}

.right-box p {
  font-size: 0.88rem;
  color: hsl(var(--text-secondary));
  margin: 0;
  line-height: 1.5;
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
