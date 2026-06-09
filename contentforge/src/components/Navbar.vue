<template>
  <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'glass border-b border-white/5' : 'bg-transparent'">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 group">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <span class="font-display font-700 text-lg text-white tracking-tight">ContentForge</span>
      </RouterLink>

      <!-- Desktop nav -->
      <div class="hidden md:flex items-center gap-8">
        <a v-for="link in navLinks" :key="link.labelKey" :href="link.href"
          class="text-sm text-slate-400 hover:text-white transition-colors duration-200">
          {{ t(link.labelKey) }}
        </a>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-3">
        <!-- Lang toggle -->
        <button @click="switchLang"
          class="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"/>
          </svg>
          <span class="hidden sm:inline">{{ locale === 'en' ? 'عربي' : 'English' }}</span>
        </button>

        <!-- Desktop-only links -->
        <RouterLink to="/dashboard" class="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">
          {{ t('navbar.previewDashboard') }}
        </RouterLink>
        <a href="#get-started"
          class="hidden md:block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20">
          {{ t('navbar.getStarted') }}
        </a>

        <!-- Hamburger — mobile only -->
        <button @click="menuOpen = !menuOpen"
          class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 transition-colors"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'">
          <svg v-if="!menuOpen" class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="menu">
      <div v-if="menuOpen"
        class="md:hidden bg-forge-950 border-t border-white/10 px-6 py-5 flex flex-col gap-4 shadow-xl shadow-black/40">
        <a v-for="link in navLinks" :key="link.labelKey" :href="link.href"
          @click="menuOpen = false"
          class="text-sm text-slate-400 hover:text-white transition-colors py-1">
          {{ t(link.labelKey) }}
        </a>
        <div class="h-px bg-white/5"></div>
        <RouterLink to="/dashboard" @click="menuOpen = false"
          class="text-sm text-slate-400 hover:text-white transition-colors py-1">
          {{ t('navbar.previewDashboard') }}
        </RouterLink>
        <a href="#get-started" @click="menuOpen = false"
          class="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium text-center transition-all duration-200">
          {{ t('navbar.getStarted') }}
        </a>
      </div>
    </Transition>

  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLang } from '../composables/useLang.js'

const { t } = useI18n()
const { locale, switchLang } = useLang()
const route = useRoute()

const scrolled  = ref(false)
const menuOpen  = ref(false)

const navLinks = [
  { labelKey: 'navbar.links.features',    href: '#features' },
  { labelKey: 'navbar.links.howItWorks',  href: '#how-it-works' },
  { labelKey: 'navbar.links.competitors', href: '#competitors' },
  { labelKey: 'navbar.links.pricing',     href: '#pricing' },
]

function handleScroll() {
  scrolled.value = window.scrollY > 40
  if (menuOpen.value) menuOpen.value = false  // close on scroll
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.menu-enter-active, .menu-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.menu-enter-from, .menu-leave-to       { opacity: 0; transform: translateY(-6px); }
</style>

