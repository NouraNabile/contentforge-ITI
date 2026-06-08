<!-- AdminLayout.vue -->
<template>
  <div class="admin-shell">

    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon" v-show="!sidebarCollapsed">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="brand-name" v-show="!sidebarCollapsed">ContentForge</span>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6" />
            <path v-else d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div class="sidebar-badge" v-show="!sidebarCollapsed">
        <span>{{ t('admin.panel') }}</span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item" :title="item.label"
          active-class="router-link-active" exact-active-class="router-link-active">
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label" v-show="!sidebarCollapsed">{{ item.label }}</span>
          <span v-if="item.badge && !sidebarCollapsed" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer" v-show="!sidebarCollapsed">
        <div class="admin-user">
          <div class="admin-avatar">{{ userInitial }}</div>
          <div class="admin-info">
            <p class="admin-name">{{ userName }}</p>
            <p class="admin-role">{{ t('admin.role') }}</p>
          </div>
        </div>
        <RouterLink to="/dashboard" class="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {{ t('admin.userMode') }}
        </RouterLink>
        <button @click="authStore.logout()"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs theme-sub hover:text-rose-400 transition-colors w-full mt-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {{ t('admin.logout') }}
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <h1 class="page-title">{{ currentPageTitle }}</h1>
          <p class="page-sub">{{ currentPageSub }}</p>
        </div>
        <div class="topbar-right">
          <div class="topbar-time">{{ currentTime }}</div>
          <button class="notif-btn lang-btn" @click="switchLang" :title="locale === 'en' ? 'عربي' : 'English'">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"/>
  </svg>
  {{ locale === 'en' ? 'عربي' : 'English' }}
</button>
          <button class="notif-btn" @click="$router.push('/admin/users')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
        </div>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useI18n } from 'vue-i18n'
import { useLang } from '../../composables/useLang.js'

const { t } = useI18n()
const { locale, switchLang } = useLang()

const auth = useAuthStore()
const sidebarCollapsed = ref(false)
const currentTime = ref('')
const route = useRoute()

const userName = computed(() => auth.userName)
const userInitial = computed(() => auth.userInitial)
const authStore = useAuthStore()
const navItems = computed(() => [
  { path: '/admin', label: t('admin.nav.dashboard'), icon: `...` },
  { path: '/admin/users', label: t('admin.nav.users'), icon: `...` },
  { path: '/admin/trends', label: t('admin.nav.trends'), icon: `...` },
  { path: '/admin/plans', label: t('admin.nav.plans'), icon: `...` },
  { path: '/admin/settings', label: t('admin.nav.settings'), icon: `...` },
])

const pageMeta = computed(() => ({
  '/admin': { title: t('admin.nav.dashboard'), sub: t('admin.page.dashboardSub') },
  '/admin/users': { title: t('admin.nav.users'), sub: t('admin.page.usersSub') },
  '/admin/trends': { title: t('admin.nav.trends'), sub: t('admin.page.trendsSub') },
  '/admin/plans': { title: t('admin.nav.plans'), sub: t('admin.page.plansSub') },
  '/admin/settings': { title: t('admin.nav.settings'), sub: t('admin.page.settingsSub') },
}))

const currentPageTitle = computed(() => pageMeta.value[route.path]?.title || t('admin.panel'))
const currentPageSub = computed(() => pageMeta.value[route.path]?.sub || '')

let timer
onMounted(() => {
  const tick = () => {
    currentTime.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  tick()
  timer = setInterval(tick, 60000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg, #0d0f14);
  font-family: 'DM Sans', sans-serif;
}

/* ── Sidebar ── */
.admin-sidebar {
  width: 240px;
  min-height: 100vh;
  background: var(--surface, #13151c);
  border-right: 1px solid var(--border, rgba(255, 255, 255, 0.06));
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.06));
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #3b82f6, #14b8a6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text, #f0f2f5);
  white-space: nowrap;
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--sub, #6b7280);
  padding: 4px;
  border-radius: 6px;
  flex-shrink: 0;
}

.collapse-btn:hover {
  color: var(--text, #f0f2f5);
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-badge {
  margin: 0.75rem 1rem;
  padding: 3px 10px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  font-size: 11px;
  color: #60a5fa;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  margin-bottom: 2px;
  text-decoration: none;
  color: var(--sub, #6b7280);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover {
  color: var(--text, #f0f2f5);
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.router-link-active {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border, rgba(255, 255, 255, 0.06));
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.admin-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.admin-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text, #f0f2f5);
  margin: 0;
}

.admin-role {
  font-size: 11px;
  color: var(--sub, #6b7280);
  margin: 0;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sub, #6b7280);
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.15s;
}

.back-link:hover {
  color: var(--text, #f0f2f5);
  background: rgba(255, 255, 255, 0.05);
}

/* ── Main ── */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.06));
  background: var(--surface, #13151c);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text, #f0f2f5);
  margin: 0;
}

.page-sub {
  font-size: 12px;
  color: var(--sub, #6b7280);
  margin: 2px 0 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar-time {
  font-size: 13px;
  color: var(--sub, #6b7280);
  font-variant-numeric: tabular-nums;
}

.notif-btn {
  background: none;
  border: 1px solid var(--border, rgba(255, 255, 255, 0.06));
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  color: var(--sub, #6b7280);
  display: flex;
  align-items: center;
  transition: all 0.15s;
}

.notif-btn:hover {
  color: var(--text, #f0f2f5);
  border-color: rgba(255, 255, 255, 0.12);
}

.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--sub, #6b7280);
  padding: 6px 10px;
  white-space: nowrap;
}
</style>
