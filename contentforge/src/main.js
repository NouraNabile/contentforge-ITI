import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

import LandingPage      from './views/LandingPage.vue'
import DashboardPreview from './views/DashboardPreview.vue'
import DraftsPage       from './views/DraftsPage.vue'
import BrandingPage     from './views/BrandingPage.vue'
import ChatPage         from './views/ChatPage.vue'
import ConnectionsPage  from './views/ConnectionsPage.vue'
import LoginPage        from './views/LoginPage.vue'

// ── Router ────────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',            component: LandingPage ,alias: "/home"},
    { path: '/login',       component: LoginPage },
    { path: '/dashboard',   component: DashboardPreview, meta: { requiresAuth: true } },
    { path: '/drafts',      component: DraftsPage,       meta: { requiresAuth: true } },
    { path: '/branding',    component: BrandingPage,     meta: { requiresAuth: true } },
    { path: '/chat',        component: ChatPage,         meta: { requiresAuth: true } },
    { path: '/connections', component: ConnectionsPage,  meta: { requiresAuth: true } },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

// ── Route guard — redirect to login if not authenticated ──────────────────────
// localStorage.removeItem('cf_token')
router.beforeEach((to, from, next) => {
  // console.log(localStorage.getItem('cf_token'))
  const isLoggedIn = !!localStorage.getItem('cf_token')
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

// ── Persist theme on startup ──────────────────────────────────────────────────
const saved = localStorage.getItem('cf-theme') || 'dark'
document.documentElement.classList.add(saved)

// ── Mount app ─────────────────────────────────────────────────────────────────
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
