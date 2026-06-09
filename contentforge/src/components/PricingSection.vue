<!-- PricingSection.vue -->
<template>
  <section id="pricing" class="py-24 bg-forge-900 relative overflow-hidden">
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent">
    </div>
    <div class="absolute inset-0 bg-grid opacity-30"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <div class="text-center mb-16">
        <span class="text-xs font-medium text-amber-400 uppercase tracking-widest mb-4 block">
          {{ t('pricing.eyebrow') }}
        </span>
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-4">
          {{ t('pricing.heading') }}<br />
          <span class="text-gradient-warm">{{ t('pricing.headingAccent') }}</span>
        </h2>
        <p class="text-slate-400 max-w-xl mx-auto">{{ t('pricing.subheading') }}</p>

        <!-- Toggle -->
        <div class="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <span class="text-sm" :class="!annual ? 'text-white' : 'text-slate-500'">{{ t('pricing.monthly') }}</span>
          <button @click="annual = !annual" dir="ltr"
            class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
            :class="annual ? 'bg-blue-600' : 'bg-forge-700'">
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
              :class="(annual && locale !== 'ar') || (!annual && locale === 'ar') ? 'translate-x-5' : 'translate-x-0'">
            </span>
          </button>
          <span class="text-sm" :class="annual ? 'text-white' : 'text-slate-500'">
            {{ t('pricing.annual') }}
            <span class="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400">
              {{ t('pricing.save20') }}
            </span>
          </span>

        </div>
      </div>

      <!-- Plans grid -->
      <div class="grid md:grid-cols-3 gap-5 md:gap-6">
        <div v-for="plan in plans" :key="plan.key"
          class="rounded-2xl p-5 md:p-7 border transition-all duration-300 flex flex-col" :class="plan.featured
            ? 'bg-blue-600/10 border-blue-500/40 shadow-xl shadow-blue-500/10'
            : 'bg-forge-950 border-white/8 hover:border-white/15'">

          <!-- Plan badge -->
          <div v-if="plan.featured" class="mb-4">
            <span
              class="text-[10px] px-2.5 py-1 rounded-full bg-blue-600/30 text-blue-300 font-medium border border-blue-500/30">
              {{ t('pricing.mostPopular') }}
            </span>

          </div>

          <h3 class="font-display text-xl font-600 text-white mb-1">{{ t(`pricing.plans.${plan.key}.name`) }}</h3>
          <p class="text-slate-500 text-sm mb-5 md:mb-6">{{ t(`pricing.plans.${plan.key}.tagline`) }}</p>

          <!-- Price -->
          <div class="flex items-baseline gap-1 mb-6 md:mb-7">
            <span class="text-slate-400 text-sm">$</span>
            <span class="font-display text-4xl font-700 text-white">
              {{ annual ? plan.annualPrice : plan.monthlyPrice }}
            </span>
            <span class="text-slate-500 text-sm">{{ t('pricing.perMonth') }}</span>
            <span v-if="annual" class="ml-2 text-[11px] text-green-400">
              {{ t('pricing.wasPrice', { price: plan.monthlyPrice }) }}
            </span>

          </div>

          <!-- CTA button -->
          <a href="#get-started"
            class="block text-center py-3 rounded-xl text-sm font-medium mb-6 md:mb-8 transition-all duration-200"
            :class="plan.featured
              ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25'
              : 'border border-white/15 text-slate-300 hover:border-white/30 hover:text-white'">
            {{ t(`pricing.plans.${plan.key}.cta`) }}
          </a>

          <!-- Features list -->
          <ul class="space-y-3 flex-1">
            <li v-for="feature in plan.features" :key="feature.textKey" class="flex items-start gap-2.5 text-sm"
              :class="feature.included ? 'text-slate-300' : 'text-slate-600'">
              <svg class="w-4 h-4 mt-0.5 shrink-0" :class="feature.included ? 'text-teal-400' : 'text-slate-700'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="feature.included" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 13l4 4L19 7" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ t(feature.textKey) }}
            </li>
          </ul>

        </div>
      </div>

      <!-- Bottom note -->
      <p class="text-center text-slate-600 text-sm mt-10">
        {{ t('pricing.bottomNote') }}
      </p>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t, locale } = useI18n()
const annual = ref(false)

const plans = [
  {
    key: 'starter',
    monthlyPrice: 29,
    annualPrice: 23,
    featured: false,
    features: [
      { textKey: 'pricing.plans.starter.f1', included: true },
      { textKey: 'pricing.plans.starter.f2', included: true },
      { textKey: 'pricing.plans.starter.f3', included: true },
      { textKey: 'pricing.plans.starter.f4', included: true },
      { textKey: 'pricing.plans.starter.f5', included: true },
      { textKey: 'pricing.plans.starter.f6', included: false },
      { textKey: 'pricing.plans.starter.f7', included: false },
      { textKey: 'pricing.plans.starter.f8', included: false },
    ],
  },
  {
    key: 'growth',
    monthlyPrice: 79,
    annualPrice: 63,
    featured: true,
    features: [
      { textKey: 'pricing.plans.growth.f1', included: true },
      { textKey: 'pricing.plans.growth.f2', included: true },
      { textKey: 'pricing.plans.growth.f3', included: true },
      { textKey: 'pricing.plans.growth.f4', included: true },
      { textKey: 'pricing.plans.growth.f5', included: true },
      { textKey: 'pricing.plans.growth.f6', included: true },
      { textKey: 'pricing.plans.growth.f7', included: true },
      { textKey: 'pricing.plans.growth.f8', included: true },
    ],
  },
  {
    key: 'agency',
    monthlyPrice: 199,
    annualPrice: 159,
    featured: false,
    features: [
      { textKey: 'pricing.plans.agency.f1', included: true },
      { textKey: 'pricing.plans.agency.f2', included: true },
      { textKey: 'pricing.plans.agency.f3', included: true },
      { textKey: 'pricing.plans.agency.f4', included: true },
      { textKey: 'pricing.plans.agency.f5', included: true },
      { textKey: 'pricing.plans.agency.f6', included: true },
      { textKey: 'pricing.plans.agency.f7', included: true },
      { textKey: 'pricing.plans.agency.f8', included: true },
    ],
  },
]

</script>
