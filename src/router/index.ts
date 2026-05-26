import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../store/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/HomeView.vue'),
      },
      {
        path: 'posts/:slug',
        name: 'PostDetail',
        component: () => import('../views/PostDetailView.vue'),
      },
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('../views/ChangePasswordView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresStaff: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/DashboardView.vue'),
      },
      {
        path: 'posts',
        name: 'AdminPosts',
        component: () => import('../views/admin/PostListView.vue'),
      },
      {
        path: 'media',
        name: 'AdminMedia',
        component: () => import('../views/admin/MediaLibraryView.vue'),
      },
      {
        path: 'posts/new',
        name: 'AdminPostCreate',
        component: () => import('../views/admin/PostFormView.vue'),
      },
      {
        path: 'posts/:id/edit',
        name: 'AdminPostEdit',
        component: () => import('../views/admin/PostFormView.vue'),
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('../views/admin/CommentView.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/admin/CategoryView.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'tags',
        name: 'AdminTags',
        component: () => import('../views/admin/TagView.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('../views/admin/LogView.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard
router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  // If authenticated user tries to go to login or register
  if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    if (!authStore.user) {
      await authStore.fetchMe();
    }
    if (authStore.isEditor) {
      return next({ name: 'AdminDashboard' });
    } else {
      return next({ name: 'Home' });
    }
  }

  // If page requires login (e.g. admin paths)
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login' });
    }

    // Resolve user profile if not loaded
    if (!authStore.user) {
      await authStore.fetchMe();
    }

    // Validate staff eligibility (must be admin or editor to access staff pages)
    if (to.matched.some((record) => record.meta.requiresStaff)) {
      if (!authStore.isEditor) {
        return next({ name: 'Home' });
      }
    }

    // Validate admin restrictions
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (!authStore.isAdmin) {
        return next({ name: 'AdminDashboard' });
      }
    }
  }

  next();
});

export default router;
