<!-- FeaturesSection.vue -->
<template>
  <section id="features" class="py-24 bg-forge-900 relative overflow-hidden">
    <div class="absolute inset-0 bg-grid opacity-30"></div>
    <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <div class="text-center mb-16">
        <span class="text-xs font-medium text-teal-400 uppercase tracking-widest mb-4 block">
          {{ t('features.eyebrow') }}
        </span>
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-4">
          {{ t('features.heading') }}<br />
          <span class="text-gradient-arabic">{{ t('features.headingAccent') }}</span>
        </h2>
        <p class="text-slate-400 max-w-xl mx-auto">{{ t('features.subheading') }}</p>
      </div>

      <!-- Big feature cards -->
      <div class="grid md:grid-cols-2 gap-5 mb-5">
        <div v-for="feat in bigFeatures" :key="feat.key"
          class="rounded-2xl border-subtle bg-forge-950 p-5 md:p-7 hover:border-white/15 transition-all duration-300 group"
          :class="feat.glow">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4 md:mb-5 text-xl" :class="feat.iconBg">
            {{ feat.emoji }}
          </div>
          <h3 class="font-display text-lg md:text-xl font-600 text-white mb-2 md:mb-3">
            {{ t(`features.big.${feat.key}.title`) }}
          </h3>
          <p class="text-slate-400 text-sm leading-relaxed mb-4 md:mb-5">
            {{ t(`features.big.${feat.key}.description`) }}
          </p>
          <div class="space-y-2">
            <div v-for="(_, i) in Array.from({ length: feat.pointCount })" :key="i"
              class="flex items-center gap-2 text-sm text-slate-400">
              <div class="w-1 h-1 rounded-full shrink-0" :class="feat.dotColor"></div>
              {{ t(`features.big.${feat.key}.points.p${i + 1}`) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Small feature cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        <div v-for="feat in smallFeatures" :key="feat.key"
          class="rounded-2xl border-subtle bg-forge-950 p-4 md:p-6 hover:border-white/15 transition-all duration-300">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3 md:mb-4 text-lg" :class="feat.iconBg">
            {{ feat.emoji }}
          </div>
          <h3 class="font-display text-sm md:text-base font-600 text-white mb-2">
            {{ t(`features.small.${feat.key}.title`) }}
          </h3>
          <p class="text-slate-500 text-xs md:text-sm leading-relaxed">
            {{ t(`features.small.${feat.key}.description`) }}
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
 
const { t } = useI18n()

const bigFeatures = [
  {
    key: 'arabicIntelligence',
    emoji: '🌍',
    pointCount: 4,
    iconBg: 'bg-blue-500/15 text-blue-300',
    dotColor: 'bg-blue-400',
    glow: 'card-glow',
  },
  {
    key: 'ragBrandVoice',
    emoji: '🧠',
    pointCount: 4,
    iconBg: 'bg-purple-500/15 text-purple-300',
    dotColor: 'bg-purple-400',
    glow: '',
  },
]
 
const smallFeatures = [
  { key: 'calendar',    emoji: '🗓️', iconBg: 'bg-teal-500/15 text-teal-300' },
  { key: 'imageGen',    emoji: '🎨', iconBg: 'bg-rose-500/15 text-rose-300' },
  { key: 'abCritic',   emoji: '⚡', iconBg: 'bg-amber-500/15 text-amber-300' },
  { key: 'publishing', emoji: '📤', iconBg: 'bg-green-500/15 text-green-300' },
  { key: 'dashboard',  emoji: '💾', iconBg: 'bg-blue-500/15 text-blue-300' },
  { key: 'workflow',   emoji: '🚀', iconBg: 'bg-indigo-500/15 text-indigo-300' },
]

</script>
