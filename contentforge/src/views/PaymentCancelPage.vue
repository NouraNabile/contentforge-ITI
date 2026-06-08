<template>
  <div class="min-h-screen theme-bg flex items-center justify-center p-6">
    <div class="max-w-md w-full text-center space-y-6">
      <div class="w-20 h-20 rounded-full bg-slate-500/15 border border-slate-500/30 flex items-center justify-center mx-auto">
        <svg class="w-10 h-10 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold theme-text">{{ t('payment.cancelTitle') }}</h1>
        <p class="text-sm theme-muted mt-2">{{ t('payment.cancelMsg') }}</p>
      </div>
      <div class="flex gap-3 justify-center">
        <button @click="router.push('/payment')"
          class="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
          {{ t('payment.tryAgain') }}
        </button>
        <button @click="router.push('/dashboard')"
          class="px-6 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">
          {{ t('payment.goToDashboard') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n }   from 'vue-i18n'
const { t }  = useI18n()
const router = useRouter()
</script>
