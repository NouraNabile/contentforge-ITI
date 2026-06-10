<template>
  <div class="min-h-screen theme-bg flex flex-col justify-center items-center p-4 sm:p-6 bg-grid overflow-y-auto relative" :dir="locale === 'ar' ? 'rtl' : 'ltr'">

    <div class="absolute sm:fixed top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 z-50 flex items-center gap-2" 
         :class="locale === 'ar' ? 'sm:left-4 sm:right-auto' : 'sm:right-4 sm:left-auto'">
      
      <button @click="switchLang"
        class="flex items-center gap-1.5 text-xs theme-sub px-3 py-1.5 rounded-lg theme-card theme-border hover:theme-text transition-colors shadow-sm whitespace-nowrap">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
        </svg>
        {{ locale === 'en' ? 'عربي' : 'English' }}
      </button>

      <button @click="toggleTheme"
        class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors theme-card theme-border theme-sub hover:theme-text shadow-sm"
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
    </div>

    <div
      class="absolute top-1/4 left-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-red-600/5 blur-3xl pointer-events-none hidden sm:block"
      :class="locale === 'ar' ? 'translate-x-1/2' : '-translate-x-1/2'">
    </div>

    <div class="w-full max-w-2xl relative z-10 mt-16 sm:mt-8 mb-8">

      <div class="text-center mb-6 sm:mb-8">
        <RouterLink to="/" dir="ltr" class="inline-flex items-center gap-2.5 mb-4 sm:mb-6">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="font-display font-700 text-xl theme-text">ContentForge</span>
        </RouterLink>

        <div
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 sm:w-7 sm:h-7 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-3">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
          {{ t('trial.badge') }}
        </span>

        <h1 class="font-display text-xl sm:text-2xl font-700 theme-text mb-2 px-2">{{ t('trial.title') }}</h1>
        <p class="text-xs sm:text-sm theme-sub max-w-md mx-auto leading-relaxed px-4">{{ t('trial.subtitle') }}</p>
      </div>

      <div class="rounded-2xl theme-surface theme-border p-4 sm:p-6 md:p-8 theme-shadow mx-2 sm:mx-0">

        <p class="text-xs theme-sub font-medium mb-4 uppercase tracking-wider text-start">{{ t('trial.choosePlan') }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 mb-6">

          <div class="rounded-xl theme-card theme-border p-5 flex flex-col text-start justify-between min-h-[320px]">
            <div>
              <p class="text-sm font-600 theme-text mb-1">{{ t('trial.starter.name') }}</p>
              <div class="flex items-baseline gap-1 mb-1">
                <span class="text-2xl font-700 theme-text">$9</span>
                <span class="text-xs theme-sub">/ {{ t('trial.perMonth') }}</span>
              </div>
              <p class="text-xs theme-muted mb-4 min-h-[32px]">{{ t('trial.starter.desc') }}</p>
              
              <ul class="space-y-2 mb-5">
                <li v-for="feature in starterFeatures" :key="feature" class="flex items-start gap-2 text-xs theme-sub">
                  <svg class="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ t(feature) }}</span>
                </li>
              </ul>
            </div>
            
            <button @click="handleUpgrade"
              class="w-full py-2.5 rounded-xl theme-card theme-border text-xs theme-sub hover:theme-text transition-colors mt-auto">
              {{ t('trial.starter.cta') }}
            </button>
          </div>

          <div class="rounded-xl theme-card p-5 flex flex-col text-start justify-between min-h-[320px] relative border-2 border-blue-500/40 pt-8 md:pt-8">
            <span
              class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider whitespace-nowrap shadow-sm">
              {{ t('trial.pro.badge') }}
            </span>
            
            <div>
              <p class="text-sm font-600 theme-text mb-1">{{ t('trial.pro.name') }}</p>
              <div class="flex items-baseline gap-1 mb-1">
                <span class="text-2xl font-700 theme-text">$29</span>
                <span class="text-xs theme-sub">/ {{ t('trial.perMonth') }}</span>
              </div>
              <p class="text-xs theme-muted mb-4 min-h-[32px]">{{ t('trial.pro.desc') }}</p>
              
              <ul class="space-y-2 mb-5">
                <li v-for="feature in proFeatures" :key="feature" class="flex items-start gap-2 text-xs theme-sub">
                  <svg class="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ t(feature) }}</span>
                </li>
              </ul>
            </div>
            
            <button @click="handleUpgrade"
              class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors mt-auto shadow-md shadow-blue-600/10">
              {{ t('trial.pro.cta') }}
            </button>
          </div>

        </div>

        <Transition name="fade">
          <div v-if="showToast" class="mb-4 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ t('trial.comingSoon') }}
          </div>
        </Transition>
 
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px" style="background:var(--border)"></div>
          <span class="text-xs theme-muted">{{ t('common.or') }}</span>
          <div class="flex-1 h-px" style="background:var(--border)"></div>
        </div>
 
        <button @click="logout" class="w-full py-3 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors flex items-center justify-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          {{ t('trial.signOut') }}
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLang } from '../composables/useLang.js'
import { useTheme } from '../composables/useTheme.js'

const { t } = useI18n()
const { locale, switchLang } = useLang()
const { isDark, toggle: toggleTheme } = useTheme()

const router = useRouter()
const showToast = ref(false)

const starterFeatures = [
  'trial.starter.feature1',
  'trial.starter.feature2',
  'trial.starter.feature3',
  'trial.starter.feature4',
]
const proFeatures = [
  'trial.pro.feature1',
  'trial.pro.feature2',
  'trial.pro.feature3',
  'trial.pro.feature4',
]

function handleUpgrade() {
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 4000)
}

function logout() {
  localStorage.removeItem('cf_token')
  localStorage.removeItem('cf_user')
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>