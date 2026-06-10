<template>
  <div class="min-h-screen theme-bg flex flex-col" :dir="locale === 'ar' ? 'rtl' : 'ltr'">

    <!-- TOP NAVBAR -->
    <header class="theme-glass border-b sticky top-0 z-50 px-3 sm:px-4 py-3 flex items-center justify-between"
      style="border-color: var(--border)">

      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <!-- Hamburger — mobile only -->
        <button @click="sidebarOpen = !sidebarOpen"
          class="md:hidden w-8 h-8 rounded-lg theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors shrink-0">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <RouterLink to="/" class="flex items-center gap-2 shrink-0">
          <div
            class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="font-display font-700 text-base theme-text">ContentForge</span>
        </RouterLink>
        <span style="color: var(--border)" class="hidden md:block shrink-0">|</span>
        <span class="hidden md:block text-sm theme-sub truncate">{{ pageTitle }}</span>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">

        <!-- Contact us — hidden on very small screens -->
        <RouterLink to="/contact"
          class="hidden sm:flex text-xs theme-sub px-2 sm:px-3 py-1.5 rounded-lg theme-card theme-border hover:theme-text transition-colors items-center gap-1.5">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span class="hidden md:inline">{{ t('layout.contactUs') }}</span>
        </RouterLink>

        <!-- Language switcher -->
        <button @click="switchLang"
          class="text-xs theme-sub px-2 sm:px-3 py-1.5 rounded-lg theme-card theme-border hover:theme-text transition-colors flex items-center gap-1 sm:gap-1.5">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
          </svg>
          <span class="hidden sm:inline">{{ locale === 'en' ? 'عربي' : 'English' }}</span>
          <span class="sm:hidden">{{ locale === 'en' ? 'ع' : 'EN' }}</span>
        </button>

        <!-- Light/Dark toggle -->
        <button @click="toggleTheme"
          class="w-8 h-8 rounded-xl theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors shrink-0"
          :title="isDark ? t('layout.switchLight') : t('layout.switchDark')">
          <svg v-if="isDark" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- Notifications bell -->
        <div class="relative">
          <button @click="showNotifs = !showNotifs"
            class="w-8 h-8 rounded-xl theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors relative shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="unreadCount > 0"
              class="absolute -top-1 -end-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {{ unreadCount }}
            </span>
          </button>
        </div>

        <!-- Avatar -->
        <div
          class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {{ authStore.userInitial }}
        </div>
      </div>
    </header>

    <!-- BODY -->
    <div class="flex flex-1" style="min-height:0">

      <!-- Mobile sidebar backdrop -->
      <Transition name="fade">
        <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-black/50 md:hidden" @click="sidebarOpen = false" />
      </Transition>

      <!-- SIDEBAR -->
      <aside
        class="fixed top-[57px] z-40 md:z-auto w-56 border-e flex flex-col py-5 px-3 shrink-0 theme-sidebar overflow-y-auto scrollbar-thin transition-transform duration-300"
        :class="sidebarOpen ? 'translate-x-0' : locale === 'ar' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'"
        style="height: calc(100vh - 57px); border-color: var(--border)" v-show="sidebarOpen || isDesktop">

        <!-- Brand chip -->
        <div class="mb-5 px-2">
          <p class="text-[10px] theme-muted uppercase tracking-wider mb-2 font-medium">
            {{ t('layout.activeBrand') }}
          </p>
          <div class="flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors"
            style="background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.25)">
            <div
              class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
              A
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium theme-text truncate">{{ authStore.userName }}</p>
              <p class="text-[10px] theme-muted">{{ authStore.userPlan }}</p>
            </div>
            <svg class="w-3 h-3 theme-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Nav items -->
        <nav class="space-y-0.5 flex-1">
          <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" @click="sidebarOpen = false"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all group" :class="[
              $route.path === item.path
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                : 'theme-sub hover:theme-text border border-transparent hover:bg-blue-500/5',
            ]">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
            </svg>
            {{ item.label }}
            <span v-if="item.badgeKey && sidebarStats[item.badgeKey]"
              class="ms-auto text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400">
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
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div v-for="s in stats" :key="s.labelKey" class="flex justify-between items-center">
            <span class="text-[11px] theme-sub">{{ t(s.labelKey) }}</span>
            <span class="text-[11px] font-medium" :class="s.color">{{ s.value }}</span>
          </div>
        </div>

        <!-- Bottom actions: Contact, Delete, Logout -->
        <div class="flex flex-col gap-1 px-1 pb-2 mt-3">

          <!-- Contact us — visible in sidebar on mobile where navbar link is hidden -->
          <RouterLink to="/contact" @click="sidebarOpen = false"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs theme-sub hover:theme-text transition-colors w-full sm:hidden">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ t('layout.contactUs') }}
          </RouterLink>

          <!-- Delete Account -->
          <button @click="showDeleteModal = true"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs theme-sub hover:text-rose-400 transition-colors w-full">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {{ t('layout.deleteAccount') }}
          </button>

          <!-- Logout -->
          <button @click="authStore.logout()"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs theme-sub hover:text-rose-400 transition-colors w-full">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ t('layout.logout') }}
          </button>
        </div>

      </aside>

      <!-- PAGE CONTENT -->
      <main class="flex-1 overflow-y-auto scrollbar-thin min-w-0 md:ms-56">
        <slot />
      </main>
    </div>

    <!-- Notification backdrop -->
    <div v-if="showNotifs" class="fixed inset-0 z-40" @click="showNotifs = false"></div>

    <!-- Delete Account Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          @click.self="showDeleteModal = false">

          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

          <div
            class="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl theme-surface p-6 sm:p-8 theme-shadow max-h-[95vh] overflow-y-auto"
            style="border: 1px solid var(--border)">

            <div class="flex items-start gap-4 mb-6">
              <div
                class="flex-shrink-0 w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <div class="space-y-1">
                <h3 class="font-display text-lg font-600 theme-text">
                  {{ t('layout.deleteModal.title') }}
                </h3>
                <p class="text-sm theme-sub leading-relaxed">
                  {{ t('layout.deleteModal.desc') }}
                </p>
              </div>
            </div>

            <div class="space-y-2 mb-6">
              <textarea v-model="deleteReason" rows="4" :placeholder="t('layout.deleteModal.reasonPlaceholder')"
                class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border resize-none focus:outline-none focus:border-blue-500/40 leading-relaxed"
                style="border-color: var(--border)" />
            </div>

            <p v-if="deleteError"
              class="text-sm text-rose-400 mb-6 bg-rose-500/10 py-2.5 px-4 rounded-xl border border-rose-500/15">
              {{ deleteError }}
            </p>

            <div v-if="deleteSuccess"
              class="text-sm text-emerald-400 mb-6 bg-emerald-500/10 py-2.5 px-4 rounded-xl border border-emerald-500/15">
              {{ t('layout.deleteModal.success') }}
            </div>

            <div class="flex gap-3 w-full items-center justify-center">
              <button @click="showDeleteModal = false; deleteReason = ''; deleteError = null; deleteSuccess = false"
                class="flex-1 w-full py-3 rounded-xl theme-card theme-border theme-sub text-sm font-semibold hover:theme-text transition-colors">
                {{ t('common.cancel') }}
              </button>
              <button @click="submitDeletion" :disabled="deleteLoading || deleteSuccess"
                class="flex-1 w-full py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <svg v-if="deleteLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ deleteLoading ? t('layout.deleteModal.sending') : t('layout.deleteModal.confirm') }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition :name="locale === 'ar' ? 'slide-notif-rtl' : 'slide-notif-ltr'">
        <!-- Changed variable from showNotifications to showNotifs -->
        <div v-if="showNotifs"
          class="fixed top-0 bottom-0 z-50 w-80 theme-surface border-s shadow-2xl flex flex-col"
          :class="locale === 'ar' ? 'left-0 border-r' : 'right-0 border-l'"
          style="border-color: var(--border)">
          
          <!-- Panel Header -->
          <div class="p-4 border-b flex items-center justify-between" style="border-color: var(--border)">
            <h2 class="font-display font-600 theme-text text-sm">
              {{ t('layout.notifications.title') }}
            </h2>
            <button @click="showNotifs = false"
              class="w-7 h-7 rounded-lg hover:theme-card flex items-center justify-center theme-sub hover:theme-text transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Panel Content List Wrapper -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <template v-if="notifications.length > 0">
              <!-- Replaced removeNotification with markRead to match your script setup -->
              <div v-for="n in notifications" :key="n.id" @click="markRead(n.id)"
                class="p-3 rounded-xl border theme-card transition-colors relative group cursor-pointer"
                :class="n.read ? 'opacity-50' : 'hover:bg-blue-500/5'"
                style="border-color: var(--border)">
                <p class="text-xs theme-text leading-relaxed pr-6">{{ n.message || n.text }}</p>
                <span class="text-[10px] theme-muted block mt-1.5">{{ n.time }}</span>
              </div>
            </template>
            <div v-else class="h-full flex flex-col items-center justify-center text-center pb-12">
              <span class="text-xs theme-muted">{{ t('layout.notifications.empty') }}</span>
            </div>
          </div>

        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'
import { useNotifications } from '../composables/useNotifications.js'
import { useLang } from '../composables/useLang.js'
import { useAuthStore } from '../stores/authStore'
import api from '../api/client'
import { useCalendarStore } from '../stores/calendarStore'

const route = useRoute()
const authStore = useAuthStore()
const calendarStore = useCalendarStore()
const { isDark, toggle: toggleTheme } = useTheme()
const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
const { locale, switchLang } = useLang()
const { t } = useI18n()

const showNotifs = ref(false)
const sidebarOpen = ref(false)
const statsLoading = ref(false)

watch(() => route.path, () => { sidebarOpen.value = false })

const isDesktop = ref(window.innerWidth >= 768)
function onResize() { isDesktop.value = window.innerWidth >= 768 }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const currentMonth = computed(() =>
  new Date().toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long', year: 'numeric',
  })
)

const pageTitle = computed(() => {
  const map = {
    '/dashboard': t('layout.nav.calendar'),
    '/drafts': t('layout.nav.drafts'),
    '/branding': t('layout.nav.branding'),
    '/chat': t('layout.nav.chat'),
    '/connections': t('layout.nav.connections'),
    '/payment': t('layout.nav.payment'),
  }
  return map[route.path] || t('layout.nav.calendar')
})

const sidebarStats = ref({ calendars: 0, drafts: 0 })
const stats = ref([
  { labelKey: 'layout.stats.generated', value: '…', color: 'text-blue-400' },
  { labelKey: 'layout.stats.approved', value: '…', color: 'text-green-400' },
  { labelKey: 'layout.stats.scheduled', value: '…', color: 'text-blue-400' },
  { labelKey: 'layout.stats.published', value: '…', color: 'text-teal-400' },
])

async function fetchStats() {
  if (!localStorage.getItem('cf_token')) return
  statsLoading.value = true
  try {
    const data = await api.get('/stats')
    stats.value = [
      { labelKey: 'layout.stats.generated', value: String(data.generated ?? 0), color: 'text-blue-400' },
      { labelKey: 'layout.stats.approved', value: String(data.approved ?? 0), color: 'text-green-400' },
      { labelKey: 'layout.stats.scheduled', value: String(data.scheduled ?? 0), color: 'text-blue-400' },
      { labelKey: 'layout.stats.published', value: String(data.published ?? 0), color: 'text-teal-400' },
    ]
    sidebarStats.value = { calendars: data.calendars ?? 0, drafts: data.generated ?? 0 }
  } catch { /* keep defaults */ }
  finally { statsLoading.value = false }
}

onMounted(() => {
  if (localStorage.getItem('cf_token')) fetchStats()
  else setTimeout(fetchStats, 300)
})
watch(() => calendarStore.posts, fetchStats, { deep: true })
watch(() => authStore.user?._id, fetchStats)

const navItems = computed(() => [
  { label: t('layout.nav.calendar'), path: '/dashboard', badgeKey: 'calendars', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: t('layout.nav.drafts'), path: '/drafts', badgeKey: 'drafts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: t('layout.nav.branding'), path: '/branding', badgeKey: null, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { label: t('layout.nav.chat'), path: '/chat', badgeKey: null, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { label: t('layout.nav.connections'), path: '/connections', badgeKey: null, icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { label: t('layout.nav.payment'), path: '/payment', badgeKey: null, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
])

// Delete Account
const showDeleteModal = ref(false)
const deleteReason = ref('')
const deleteLoading = ref(false)
const deleteError = ref(null)
const deleteSuccess = ref(false)

async function submitDeletion() {
  deleteLoading.value = true
  deleteError.value = null
  try {
    await api.post('/auth/deletion-request', { reason: deleteReason.value })
    deleteSuccess.value = true
    setTimeout(() => {
      showDeleteModal.value = false
      deleteReason.value = ''
      deleteSuccess.value = false
    }, 2000)
  } catch (err) {
    deleteError.value = err.message || t('layout.deleteModal.error')
  } finally {
    deleteLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform 0.25s ease;
}

.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(-100%);
}

/* English Layout: Panel slides from right edge toward the left */
.slide-notif-ltr-enter-active, 
.slide-notif-ltr-leave-active { 
  transition: transform 0.25s ease; 
}
.slide-notif-ltr-enter-from, 
.slide-notif-ltr-leave-to { 
  transform: translateX(100%); 
}

/* Arabic Layout: Panel slides from left edge toward the right */
.slide-notif-rtl-enter-active, 
.slide-notif-rtl-leave-active { 
  transition: transform 0.25s ease; 
}
.slide-notif-rtl-enter-from, 
.slide-notif-rtl-leave-to { 
  transform: translateX(-100%); 
}
</style>