// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/teacher/dashboard',
    name: 'TeacherDashboard',
    component: () => import('@/views/TeacherDashboard.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Add global navigation guard
router.beforeEach((to, _, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.role;
  
  // Check if user is logged in and has permission to access
  if (requiresAuth) {
    if (!authStore.isLoggedIn) {
      // Not logged in, redirect to login page
      next({ name: 'Login' });
      return;
    }
    
    if (requiredRole && authStore.role !== requiredRole) {
      // No permission to access, redirect to corresponding role dashboard
      next({ 
        name: authStore.role === 'admin' ? 'AdminDashboard' : 'TeacherDashboard' 
      });
      return;
    }
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    // Logged in user trying to access login page, redirect to corresponding role dashboard
    next({ 
      name: authStore.role === 'admin' ? 'AdminDashboard' : 'TeacherDashboard' 
    });
    return;
  }
  
  // Default: allow navigation
  next();
});

export default router;