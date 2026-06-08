import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import App from "./App.vue";
import i18n from './locales/i18n.js'
import "./style.css";

import LandingPage      from './views/LandingPage.vue'
import DashboardPreview from './views/DashboardPreview.vue'
import PostsManagerPage  from './views/PostsManagerPage.vue'
import BrandingPage     from './views/BrandingPage.vue'
import ChatPage         from './views/ChatPage.vue'
import ConnectionsPage  from './views/ConnectionsPage.vue'
import LoginPage        from './views/LoginPage.vue'
import TrialExpiredPage from './views/TrialExpiredPage.vue'

import AdminLayout    from './views/admin/AdminLayout.vue'
import AdminDashboard from './views/admin/AdminDashboard.vue'
import AdminUsers     from './views/admin/AdminUsers.vue'
import AdminTrends    from './views/admin/AdminTrends.vue'
import AdminPlans     from './views/admin/AdminPlans.vue'
import AdminSettings  from './views/admin/AdminSettings.vue'
import PosterGenerator from "./views/PosterGenerator.vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// ── Router ────────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',            component: LandingPage },
    { path: '/login',       component: LoginPage },
    { path: '/dashboard',   component: DashboardPreview, meta: { requiresAuth: true } },
    { path: '/drafts',      component: PostsManagerPage, meta: { requiresAuth: true } },
    { path: '/branding',    component: BrandingPage,     meta: { requiresAuth: true } },
    { path: '/chat',        component: ChatPage,         meta: { requiresAuth: true } },
    { path: '/connections', component: ConnectionsPage,  meta: { requiresAuth: true } },
        {
      path: "/poster",
      component: PosterGenerator,
      meta: { requiresAuth: true },
    },
    { path: '/trial-expired', component: TrialExpiredPage },
    {path: '/admin',component: AdminLayout,  meta: { requiresAuth: true, requiresAdmin: true },
    children: [
    { path: '',         component: AdminDashboard },
    { path: 'users',    component: AdminUsers     },
    { path: 'trends',   component: AdminTrends    },
    { path: 'plans',    component: AdminPlans     },
    { path: 'settings', component: AdminSettings  },
    
      ]
    }
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
});

// ── Route guard — redirect to login if not authenticated ──────────────────────
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem("cf_token");
  const user = JSON.parse(localStorage.getItem("cf_user"); || 'null')

  if (to.meta.requiresAuth && !isLoggedIn) {
    // Check if they were redirected due to trial expiry
    if (
      window.location.pathname === "/trial-expired" ||
      from.path === "/trial-expired"
    ) {
      next("/trial-expired");
    } else {
      next("/login");
    }
  } else {
    next();
  }
});

// ── Persist theme on startup ──────────────────────────────────────────────────
const saved = localStorage.getItem("cf-theme") || "dark";
document.documentElement.classList.add(saved);

// ── Mount app ─────────────────────────────────────────────────────────────────
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(Toast);
app.use(i18n)

// ── Persist locale on startup ─────────────────────────────────────────────────
const savedLocale = localStorage.getItem('cf-locale') || 'en'
i18n.global.locale.value = savedLocale
document.documentElement.setAttribute('dir', savedLocale === 'ar' ? 'rtl' : 'ltr')
document.documentElement.setAttribute('lang', savedLocale)


app.mount("#app");
