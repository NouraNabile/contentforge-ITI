<template>
  <section id="pricing" class="py-24 bg-forge-900 relative overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
    <div class="absolute inset-0 bg-grid opacity-30"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-6">
      <div class="text-center mb-16">
        <span class="text-xs font-medium text-amber-400 uppercase tracking-widest mb-4 block">Pricing</span>
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-4">
          Simple pricing for<br/>
          <span class="text-gradient-warm">Arab marketing teams</span>
        </h2>
        <p class="text-slate-400 max-w-xl mx-auto">No agency retainer. No complex setup. Cancel anytime.</p>

        <!-- Toggle -->
        <div class="flex items-center justify-center gap-3 mt-8">
          <span class="text-sm" :class="!annual ? 'text-white' : 'text-slate-500'">Monthly</span>
          <button @click="annual = !annual"
            class="relative w-12 h-6 rounded-full transition-colors duration-200"
            :class="annual ? 'bg-blue-600' : 'bg-forge-700'">
            <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
              :class="annual ? 'translate-x-6' : 'translate-x-0.5'"></span>
          </button>
          <span class="text-sm" :class="annual ? 'text-white' : 'text-slate-500'">
            Annual
            <span class="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400">Save 20%</span>
          </span>
        </div>
      </div>

      <!-- Plans grid -->
      <div class="grid md:grid-cols-3 gap-6">
        <div v-for="plan in plans" :key="plan.name"
          class="rounded-2xl p-7 border transition-all duration-300 flex flex-col"
          :class="plan.featured
            ? 'bg-blue-600/10 border-blue-500/40 shadow-xl shadow-blue-500/10'
            : 'bg-forge-950 border-white/8 hover:border-white/15'">

          <!-- Plan badge -->
          <div v-if="plan.featured" class="mb-4">
            <span class="text-[10px] px-2.5 py-1 rounded-full bg-blue-600/30 text-blue-300 font-medium border border-blue-500/30">
              ✦ Most Popular
            </span>
          </div>

          <h3 class="font-display text-xl font-600 text-white mb-1">{{ plan.name }}</h3>
          <p class="text-slate-500 text-sm mb-6">{{ plan.tagline }}</p>

          <!-- Price -->
          <div class="flex items-baseline gap-1 mb-7">
            <span class="text-slate-400 text-sm">$</span>
            <span class="font-display text-4xl font-700 text-white">
              {{ annual ? plan.annualPrice : plan.monthlyPrice }}
            </span>
            <span class="text-slate-500 text-sm">/mo</span>
            <span v-if="annual" class="ml-2 text-[11px] text-green-400 line-through-none">
              was ${{ plan.monthlyPrice }}
            </span>
          </div>

          <!-- CTA button -->
          <a href="#get-started"
            class="block text-center py-3 rounded-xl text-sm font-medium mb-8 transition-all duration-200"
            :class="plan.featured
              ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25'
              : 'border border-white/15 text-slate-300 hover:border-white/30 hover:text-white'">
            {{ plan.cta }}
          </a>

          <!-- Features list -->
          <ul class="space-y-3 flex-1">
            <li v-for="feature in plan.features" :key="feature.text"
              class="flex items-start gap-2.5 text-sm"
              :class="feature.included ? 'text-slate-300' : 'text-slate-600'">
              <svg class="w-4 h-4 mt-0.5 shrink-0"
                :class="feature.included ? 'text-teal-400' : 'text-slate-700'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="feature.included" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              {{ feature.text }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom note -->
      <p class="text-center text-slate-600 text-sm mt-10">
        All plans include Arabic dialect support, cultural trend injection, and 14-day free trial.
        No credit card required to start.
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const annual = ref(false)

const plans = [
  {
    name: 'Starter',
    tagline: 'For freelancers & solo creators',
    monthlyPrice: 29,
    annualPrice: 23,
    cta: 'Start Free Trial',
    featured: false,
    features: [
      { text: '1 Brand Profile', included: true },
      { text: '2 calendars/month', included: true },
      { text: 'Egyptian Arabic dialect', included: true },
      { text: 'Basic brand voice upload', included: true },
      { text: 'Instagram & Facebook publish', included: true },
      { text: 'A/B Critic Agent', included: false },
      { text: 'AI Image Generation', included: false },
      { text: 'Multi-dialect support', included: false },
    ],
  },
  {
    name: 'Growth',
    tagline: 'For SME marketing teams',
    monthlyPrice: 79,
    annualPrice: 63,
    cta: 'Start Free Trial',
    featured: true,
    features: [
      { text: '3 Brand Profiles', included: true },
      { text: 'Unlimited calendars', included: true },
      { text: 'All 3 Arabic dialects', included: true },
      { text: 'Full RAG brand voice memory', included: true },
      { text: 'All platforms + LinkedIn', included: true },
      { text: 'A/B Critic Agent', included: true },
      { text: 'AI Image Generation (50/mo)', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    name: 'Agency',
    tagline: 'For regional marketing agencies',
    monthlyPrice: 199,
    annualPrice: 159,
    cta: 'Contact Sales',
    featured: false,
    features: [
      { text: 'Unlimited Brand Profiles', included: true },
      { text: 'Unlimited calendars', included: true },
      { text: 'All dialects + custom voices', included: true },
      { text: 'White-label dashboard', included: true },
      { text: '12-platform publishing', included: true },
      { text: 'A/B Critic Agent', included: true },
      { text: 'Unlimited AI Image Generation', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
  },
]
</script>
