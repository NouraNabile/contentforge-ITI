<template>
  <footer class="bg-forge-950 border-t border-white/5 py-16">
    <div class="max-w-6xl mx-auto px-6">

      <!-- Top row -->
      <div class="grid md:grid-cols-5 gap-10 mb-12">

        <!-- Brand column -->
        <div class="md:col-span-2">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="font-display font-700 text-lg text-white">ContentForge</span>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs">
            AI content strategy platform built specifically for Arabic and bilingual brands across Egypt, the Gulf, and the Levant.
          </p>
          <p class="text-slate-600 text-xs font-arabic">منصة الذكاء الاصطناعي للعلامات التجارية العربية</p>
        </div>

        <!-- Links columns -->
        <div v-for="col in footerLinks" :key="col.title">
          <h5 class="font-display font-600 text-white text-sm mb-4">{{ col.title }}</h5>
          <ul class="space-y-2.5">
            <li v-for="link in col.links" :key="link">
              <a href="#" class="text-slate-500 hover:text-slate-300 text-sm transition-colors">{{ link }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
        <p class="text-slate-600 text-xs">
          © 2026 ContentForge · UI&UX Development Team 3 · Graduate Project
        </p>
        <div class="flex items-center gap-6">
          <span class="text-xs text-slate-600">Built with Vue 3 · Node.js · MongoDB Atlas · Gemini 2.5</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'How it Works', 'Pricing', 'Dashboard Preview', 'Brand Vault'],
  },
  {
    title: 'Platforms',
    links: ['Instagram', 'Facebook', 'LinkedIn', 'Twitter/X', 'TikTok'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact', 'Privacy Policy'],
  },
]
</script>
