import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import LandingPage      from './views/LandingPage.vue'
import DashboardPreview from './views/DashboardPreview.vue'
import DraftsPage       from './views/DraftsPage.vue'
import BrandingPage     from './views/BrandingPage.vue'
import ChatPage         from './views/ChatPage.vue'
import ConnectionsPage  from './views/ConnectionsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',            component: LandingPage },
    { path: '/dashboard',   component: DashboardPreview },
    { path: '/drafts',      component: DraftsPage },
    { path: '/branding',    component: BrandingPage },
    { path: '/chat',        component: ChatPage },
    { path: '/connections', component: ConnectionsPage },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

// Persist theme
const saved = localStorage.getItem('cf-theme') || 'dark'
document.documentElement.classList.add(saved)

createApp(App).use(router).mount('#app')
