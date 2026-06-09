<template>
  <div class="min-h-screen theme-bg flex items-center justify-center p-6">
    <div class="max-w-md w-full text-center space-y-6">
      <!-- Icon -->
      <div class="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
        <svg class="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold theme-text">{{ t('payment.successTitle') }}</h1>
        <p class="text-sm theme-muted mt-2">{{ t('payment.successMsg') }}</p>
      </div>
      <button @click="router.push('/dashboard')"
        class="px-8 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
        {{ t('payment.goToDashboard') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n }   from 'vue-i18n'
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import paymentApi from '../api/paymentApi'

const { t }     = useI18n()
const router    = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // تحديث بيانات اليوزر بعد الدفع
  try {
    const data = await paymentApi.getStatus()
    if (authStore.user) {
      authStore.user = { ...authStore.user, plan: data.plan }
      localStorage.setItem('cf_user', JSON.stringify(authStore.user))
    }
  } catch { /* silent */ }
})
</script>
