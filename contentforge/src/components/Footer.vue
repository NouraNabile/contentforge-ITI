<!-- Footer.vue -->
<template>
  <footer class="bg-forge-950 border-t border-white/5 py-16">
    <div class="max-w-6xl mx-auto px-6">

      <!-- Top row -->
      <div class="grid md:grid-cols-5 gap-10 mb-12">

        <!-- Brand column -->
        <div class="md:col-span-2">
          <div class="flex items-center gap-2.5 mb-4">
            <div
              class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <span class="font-display font-700 text-lg text-white">ContentForge</span>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs">
            {{ t('footer.tagline') }}
          </p>
          <p class="text-slate-600 text-xs font-arabic">{{ t('footer.taglineAr') }}</p>

        </div>

        <!-- Links columns -->
        <div v-for="col in footerLinks" :key="col.title">
          <h5 class="font-display font-600 text-white text-sm mb-4">{{ t(col.titleKey) }}</h5>
          <ul class="space-y-2.5">
            <li v-for="link in col.links" :key="link">
              <a href="#" class="text-slate-500 hover:text-slate-300 text-sm transition-colors">{{ t(link.key) }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
        <p class="text-slate-600 text-xs">
          {{ t('footer.copyright') }}
        </p>
        <div class="flex items-center gap-6">
          <span class="text-xs text-slate-600">{{ t('footer.builtWith') }}</span>
        </div>

      </div>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
 
const { t } = useI18n()
 
const footerLinks = [
  {
    titleKey: 'footer.product.title',
    links: [
      { key: 'footer.product.features' },
      { key: 'footer.product.howItWorks' },
      { key: 'footer.product.pricing' },
      { key: 'footer.product.dashboardPreview' },
      { key: 'footer.product.brandVault' },
    ],
  },
  {
    titleKey: 'footer.platforms.title',
    links: [
      { key: 'footer.platforms.instagram' },
      { key: 'footer.platforms.facebook' },
      { key: 'footer.platforms.linkedin' },
      { key: 'footer.platforms.twitterX' },
      { key: 'footer.platforms.tiktok' },
    ],
  },
  {
    titleKey: 'footer.company.title',
    links: [
      { key: 'footer.company.about' },
      { key: 'footer.company.blog' },
      { key: 'footer.company.careers' },
      { key: 'footer.company.contact' },
      { key: 'footer.company.privacyPolicy' },
    ],
  },
]

</script>
