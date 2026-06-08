<!-- HeroSection.vue -->
<template>
  <section
    class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-forge-950 bg-grid pt-24 pb-16">

    <!-- Ambient orbs -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/8 blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-500/6 blur-3xl pointer-events-none"></div>
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-3xl pointer-events-none">
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 text-center">

      <!-- Badge -->
      <div
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-subtle bg-white/3 text-xs text-slate-400 mb-8 animate-fade-up">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-slow"></span>
        {{ t('hero.badge') }}

      </div>

      <!-- Headline -->
      <h1
        class="font-display text-5xl md:text-7xl font-800 text-white leading-[1.05] tracking-tight mb-6 animate-fade-up animate-delay-100">
        {{ t('hero.heading') }}<br />
        <span class="text-gradient-blue">{{ t('hero.headingAccent') }}</span><br />
        {{ t('hero.headingSuffix') }}
      </h1>


      <!-- Subheadline -->
      <p
        class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-delay-200">
        {{ t('hero.subheading') }}
      </p>


      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-up animate-delay-300">
        <a href="#get-started"
          class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-base transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5">
          {{ t('hero.ctaPrimary') }}
        </a>
        <RouterLink to="/dashboard"
          class="w-full sm:w-auto px-8 py-3.5 rounded-xl border-subtle hover:border-white/15 text-slate-300 hover:text-white font-medium text-base transition-all duration-200 flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="shrink-0">
            <polygon points="5,3 13,8 5,13" fill="currentColor" />
          </svg>
          {{ t('hero.ctaSecondary') }}
        </RouterLink>
      </div>

      <!-- Trust bar -->
      <div class="flex items-center justify-center gap-8 flex-wrap animate-fade-up animate-delay-400">
        <span v-for="trust in trustItems" :key="trust.key" class="flex items-center gap-2 text-sm text-slate-500">
          <span class="text-teal-400">✦</span>
          {{ t(trust.key) }}
        </span>

      </div>

      <!-- Dashboard preview card -->
      <div class="mt-16 animate-fade-up animate-delay-500">
        <DashboardMockup />
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import DashboardMockup from './DashboardMockup.vue'

const { t } = useI18n()

const trustItems = [
  { key: 'hero.trust.dialectAI' },
  { key: 'hero.trust.ragMemory' },
  { key: 'hero.trust.calendar' },
  { key: 'hero.trust.dragDrop' },
]

</script>
