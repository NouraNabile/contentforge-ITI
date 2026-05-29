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
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
      <div class="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-5">
          Start creating Arabic content<br/>
          <span class="text-gradient-blue">that actually converts</span>
        </h2>
        <p class="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          Join Arab marketing teams saving 2 days per content cycle. Your first calendar is free — no credit card needed.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#"
            class="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-base transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5">
            Generate Your First Calendar Free
          </a>
          <RouterLink to="/dashboard"
            class="px-8 py-4 rounded-xl border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium text-base transition-all duration-200">
            Explore Dashboard
          </RouterLink>
        </div>
        <p class="text-slate-600 text-sm mt-6">14-day free trial · No credit card · Cancel anytime</p>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'
import HowItWorks from '../components/HowItWorks.vue'
import FeaturesSection from '../components/FeaturesSection.vue'
import CompetitorTable from '../components/CompetitorTable.vue'
import PricingSection from '../components/PricingSection.vue'
import Footer from '../components/Footer.vue'
</script>
