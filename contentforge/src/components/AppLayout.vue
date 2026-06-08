<template>
  <div class="min-h-screen theme-bg flex flex-col">
    <!-- TOP NAVBAR -->
    <header class="theme-glass border-b sticky top-0 z-50 px-5 py-3 flex items-center justify-between"
      style="border-color: var(--border)">
      <div class="flex items-center gap-4">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="font-display font-700 text-base theme-text">ContentForge</span>
        </RouterLink>
        <span style="color: var(--border)" class="hidden md:block">|</span>
        <span class="hidden md:block text-sm theme-sub">{{ pageTitle }}</span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Language switcher -->
        <button @click="switchLang"
          class="text-xs theme-sub px-3 py-1.5 rounded-lg theme-card theme-border hover:theme-text transition-colors flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"/>
          </svg>
          {{ locale === 'en' ? 'عربي' : 'English' }}
        </button>

        <!-- Light/Dark toggle -->
        <button @click="toggleTheme"
          class="w-9 h-9 rounded-xl theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors"
          :title="isDark ? t('layout.switchLight') : t('layout.switchDark')">
          <svg v-if="isDark" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>

        <!-- Notifications bell -->
        <div class="relative">
          <button @click="showNotifs = !showNotifs"
            class="w-9 h-9 rounded-xl theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors relative">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {{ unreadCount }}
            </span>
          </button>

          <!-- Notifications panel -->
          <div v-if="showNotifs"
            class="absolute right-0 top-11 w-80 rounded-2xl theme-surface theme-shadow border overflow-hidden z-50 animate-slide-in"
            style="border-color: var(--border)">
            <div class="flex items-center justify-between px-4 py-3 border-b" style="border-color: var(--border)">
              <span class="font-display font-600 text-sm theme-text">{{ t('layout.notifications.title') }}</span>
              <button @click="markAllRead" class="text-[11px] text-blue-400 hover:text-blue-300">
                {{ t('layout.notifications.markAllRead') }}
              </button>
            </div>
            <div class="max-h-80 overflow-y-auto scrollbar-thin">
              <div v-for="n in notifications" :key="n.id" @click="markRead(n.id)"
                class="flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-0"
                :class="n.read ? 'opacity-50' : 'hover:bg-blue-500/5'" style="border-color: var(--border)">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm" :class="{
                  'bg-green-500/15': n.type === 'success',
                  'bg-amber-500/15': n.type === 'trend' || n.type === 'warning',
                  'bg-blue-500/15': n.type === 'info',
                }">
                  {{ n.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-xs font-medium theme-text truncate">{{ n.title }}</p>
                    <span v-if="!n.read" class="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                  </div>
                  <p class="text-[11px] theme-sub leading-relaxed mt-0.5">{{ n.message }}</p>
                  <p class="text-[10px] theme-muted mt-1">{{ n.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Avatar -->
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white">
          {{ authStore.userInitial }}
        </div>
      </div>
    </header>

    <!-- BODY -->
    <div class="flex flex-1" style="min-height:0">
      <!-- SIDEBAR -->
      <aside class="w-56 border-r flex flex-col py-5 px-3 shrink-0 theme-sidebar overflow-y-auto scrollbar-thin sticky top-0 self-start" style="height:calc(100vh - 57px); border-color: var(--border)">
        <!-- Brand chip -->
        <div class="mb-5 px-2">
          <p class="text-[10px] theme-muted uppercase tracking-wider mb-2 font-medium">
            {{ t('layout.activeBrand') }}
          </p>
          <div class="flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors"
            style="background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.25)">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
              A
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium theme-text truncate">{{ authStore.userName }}</p>
              <p class="text-[10px] theme-muted">{{ authStore.userPlan }}</p>
            </div>
            <svg class="w-3 h-3 theme-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Nav items -->
        <nav class="space-y-0.5 flex-1">
          <RouterLink v-for="item in navItems" :key="item.path" :to="item.path"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all group"
            :class="$route.path === item.path
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
              : 'theme-sub hover:theme-text border border-transparent hover:bg-blue-500/5'">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon"/>
            </svg>
            {{ item.label }}
            <span v-if="item.badgeKey && sidebarStats[item.badgeKey]"
              class="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400">
              {{ sidebarStats[item.badgeKey] }}
            </span>
          </RouterLink>
        </nav>

        <!-- Quick stats -->
        <div class="mt-4 p-3 rounded-xl theme-card theme-border space-y-2">
          <div class="flex items-center justify-between mb-1">
            <p class="text-[10px] theme-muted font-medium uppercase tracking-wider">
              {{ currentMonth }}
            </p>
            <svg v-if="statsLoading" class="w-3 h-3 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
          <div v-for="s in stats" :key="s.labelKey" class="flex justify-between items-center">
            <span class="text-[11px] theme-sub">{{ t(s.labelKey) }}</span>
            <span class="text-[11px] font-medium" :class="s.color">{{ s.value }}</span>
          </div>
        </div>
      </aside>

      <!-- PAGE CONTENT -->
      <main class="flex-1 overflow-y-auto scrollbar-thin">
        <slot/>
      </main>
    </div>

    <!-- Logout button -->
    <button @click="authStore.logout()"
      class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs theme-sub hover:text-rose-400 transition-colors w-full mt-2">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
      {{ t('layout.logout') }}
    </button>

    <div v-if="showNotifs" class="fixed inset-0 z-40" @click="showNotifs = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'
import { useNotifications } from '../composables/useNotifications.js'
import { useLang } from '../composables/useLang.js'
import { useAuthStore } from '../stores/authStore'
import api from '../api/client'
import { useCalendarStore } from "../stores/calendarStore";

const route = useRoute()
const authStore = useAuthStore()
const calendarStore = useCalendarStore();
const { isDark, toggle: toggleTheme } = useTheme()
const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
const { locale, switchLang } = useLang()
const { t } = useI18n()
const showNotifs = ref(false)
const statsLoading = ref(false)

// ── Current month — locale-aware ─────────────────────────────────────────────
const currentMonth = computed(() =>
  new Date().toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
)

// ── Page title — reactive to route AND locale ────────────────────────────────
const pageTitle = computed(() => {
  const map = {
    '/dashboard': t('layout.nav.calendar'),
    '/drafts':    t('layout.nav.drafts'),
    '/branding':  t('layout.nav.branding'),
    '/chat':      t('layout.nav.chat'),
    '/connections': t('layout.nav.connections'),
  }
  return map[route.path] || t('layout.nav.calendar')
})

// ── Stats — labelKey instead of hardcoded label ──────────────────────────────
const sidebarStats = ref({ calendars: 0, drafts: 0 })

const stats = ref([
  { labelKey: 'layout.stats.generated',  value: '…', color: 'text-blue-400' },
  { labelKey: 'layout.stats.approved',   value: '…', color: 'text-green-400' },
  { labelKey: 'layout.stats.scheduled',  value: '…', color: 'text-blue-400' },
  { labelKey: 'layout.stats.published',  value: '…', color: 'text-teal-400' },
])

async function fetchStats() {
  // لو التوكن مش موجود متبعتش الـ request
  if (!localStorage.getItem('cf_token')) return
  statsLoading.value = true
  try {
    const data = await api.get('/stats')
    stats.value = [
      { labelKey: 'layout.stats.generated',  value: String(data.generated ?? 0), color: 'text-blue-400' },
      { labelKey: 'layout.stats.approved',   value: String(data.approved  ?? 0), color: 'text-green-400' },
      { labelKey: 'layout.stats.scheduled',  value: String(data.scheduled ?? 0), color: 'text-blue-400' },
      { labelKey: 'layout.stats.published',  value: String(data.published ?? 0), color: 'text-teal-400' },
    ]
    sidebarStats.value = {
      calendars: data.calendars ?? 0,
      drafts:    data.generated ?? 0,
    }
  } catch {
    // keep defaults silently
  } finally {
    statsLoading.value = false
  }
}

onMounted(async () => {
  if (localStorage.getItem('cf_token')) {
    await fetchStats()
  } else {
    // استنى شوية — ممكن التوكن يكون لسه بيتحمل
    setTimeout(fetchStats, 300)
  }
})

// بيراقب أي تغيير في البوستات (approve, delete, generate جديد)
watch(() => calendarStore.posts, fetchStats, { deep: true })

// بيراقب لو اليوزر اتغيّر
watch(() => authStore.user?._id, fetchStats)

// ── Nav items — computed so labels re-render on language switch ───────────────
const navItems = computed(() => [
  {
    label: t('layout.nav.calendar'),
    path: '/dashboard',
    badgeKey: 'calendars',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    label: t('layout.nav.drafts'),
    path: '/drafts',
    badgeKey: 'drafts',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: t('layout.nav.branding'),
    path: '/branding',
    badgeKey: null,
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    label: t('layout.nav.chat'),
    path: '/chat',
    badgeKey: null,
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  {
    label: t('layout.nav.connections'),
    path: '/connections',
    badgeKey: null,
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
])
</script>