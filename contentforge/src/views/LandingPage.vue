<!-- Landing Page -->
<template>
  <div class="min-h-screen bg-forge-950">
    <Navbar />
    <HeroSection />
    <HowItWorks />
    <FeaturesSection />
    <CompetitorTable />
    <PricingSection />

    <!-- CTA Banner -->
    <section id="get-started" class="py-24 bg-forge-950 relative overflow-hidden">
      <div class="absolute inset-0 bg-grid opacity-40"></div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none">
      </div>
      <div class="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-5">
          {{ t('landing.cta.title') }}<br />
          <span class="text-gradient-blue">{{ t('landing.cta.titleAccent') }}</span>
        </h2>
        <p class="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          {{ t('landing.cta.subtitle') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#"
            class="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-base transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5">
            {{ t('landing.cta.primaryBtn') }}
          </a>
          <RouterLink to="/dashboard"
            class="px-8 py-4 rounded-xl border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium text-base transition-all duration-200">
            {{ t('landing.cta.secondaryBtn') }}
          </RouterLink>

        </div>
        <p class="text-slate-600 text-sm mt-6">{{ t('landing.cta.fine') }}</p>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'
import HowItWorks from '../components/HowItWorks.vue'
import FeaturesSection from '../components/FeaturesSection.vue'
import CompetitorTable from '../components/CompetitorTable.vue'
import PricingSection from '../components/PricingSection.vue'
import Footer from '../components/Footer.vue'

const { t } = useI18n()
</script>
