<template>
  <footer class="transition-colors duration-300 py-12 md:py-16"
    :class="[
      isDark 
        ? 'bg-forge-950 border-t border-white/5' 
        : 'bg-slate-50 border-t border-slate-200'
    ]">

    <div class="max-w-6xl mx-auto px-6">

      <!-- Top row -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-10 md:mb-12">

        <!-- Brand column — full width on mobile -->
        <div class="col-span-2 md:col-span-2">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <span class="font-display font-700 text-lg"
              :class="isDark ? 'text-white' : 'text-slate-900'">
              ContentForge
            </span>
          </div>
          
          <p class="text-sm leading-relaxed mb-5 max-w-xs"
            :class="isDark ? 'text-slate-400' : 'text-slate-600'">
            {{ t('footer.tagline') }}
          </p>
          
          <p class="text-xs font-arabic leading-relaxed max-w-xs"
            :class="isDark ? 'text-slate-500' : 'text-slate-500'">
            {{ t('footer.taglineAr') }}
          </p>
        </div>

        <!-- Links columns -->
        <div v-for="col in footerLinks" :key="col.titleKey">
          <h5 class="font-display font-600 text-sm mb-4"
            :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ t(col.titleKey) }}
          </h5>
          <ul class="space-y-2.5">
            <li v-for="link in col.links" :key="link.key">
              <RouterLink v-if="link.to" :to="link.to"
                class="text-sm transition-colors flex items-center gap-1.5"
                :class="isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'">
                {{ t(link.key) }}
              </RouterLink>
            </li>
          </ul>
        </div>

      </div>

      <!-- Bottom row -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-center md:text-start"
        :class="isDark ? 'border-t border-white/5' : 'border-t border-slate-200'">
        
        <div class="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <p class="text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
            {{ t('footer.copyright') }}
          </p>
          <span class="hidden md:inline text-xs" :class="isDark ? 'text-slate-700' : 'text-slate-300'">|</span>
          <span class="text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
            {{ t('footer.builtWith') }}
          </span>
        </div>

        <!-- Back to Top Button -->
        <RouterLink to="/" 
          class="text-xs font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          :class="isDark 
            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          {{ t('footer.backToTop') }}
        </RouterLink>

      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'

const { t } = useI18n()
const { isDark } = useTheme()

const footerLinks = [
  {
    titleKey: 'footer.support.title',
    links: [
      { key: 'footer.support.contact', to: '/contact' }
    ],
  },
]
</script>