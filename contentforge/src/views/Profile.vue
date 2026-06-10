<template>
  <AppLayout>
    <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">{{ t('profile.title') }}</h1>
        <p class="text-sm theme-sub mt-1">{{ t('profile.subtitle') }}</p>
      </div>

      <!-- Profile Identity Card -->
      <div class="theme-surface theme-border rounded-2xl p-6 sm:p-8 mb-6">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-lg shadow-blue-500/20">
            {{ authStore.userInitial }}
          </div>
          <div class="flex-1 text-center sm:text-start">
            <h2 class="font-display text-xl font-600 theme-text">{{ authStore.user?.name || 'User' }}</h2>
            <p class="text-sm theme-sub mt-1">{{ authStore.user?.email }}</p>
            <div class="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/20 font-medium">
                {{ authStore.userPlan || 'Free Plan' }}
              </span>
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-green-600/15 text-green-400 border border-green-500/20 font-medium">
                ✓ {{ t('profile.activeAccount') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div class="theme-surface theme-border rounded-2xl p-6 sm:p-8 mb-6">
        <h3 class="font-display text-lg font-600 theme-text mb-1">{{ t('profile.accountInfo') }}</h3>
        <p class="text-xs theme-sub mb-6">{{ t('profile.accountInfoDesc') }}</p>
        
        <form @submit.prevent="updateProfile" class="space-y-5">
          <div>
            <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.fullName') }}</label>
            <input 
              type="text" 
              v-model="profileForm.name" 
              class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40"
              style="border-color: var(--border)"
            />
          </div>
          <div>
            <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.emailAddress') }}</label>
            <input 
              type="email" 
              :value="authStore.user?.email" 
              disabled
              class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border opacity-60 cursor-not-allowed"
              style="border-color: var(--border)"
            />
            <p class="text-[10px] theme-muted mt-1.5">{{ t('profile.emailReadonly') }}</p>
          </div>

          <div v-if="profileMsg" 
            class="text-xs py-2.5 px-4 rounded-xl border"
            :class="profileMsg.type === 'success' 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' 
              : 'text-rose-400 bg-rose-500/10 border-rose-500/15'">
            {{ profileMsg.text }}
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              :disabled="profileLoading"
              class="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="profileLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ profileLoading ? t('common.saving') : t('profile.saveChanges') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password Form -->
      <div class="theme-surface theme-border rounded-2xl p-6 sm:p-8 mb-6">
        <h3 class="font-display text-lg font-600 theme-text mb-1">{{ t('profile.changePassword') }}</h3>
        <p class="text-xs theme-sub mb-6">{{ t('profile.changePasswordDesc') }}</p>
        
        <form @submit.prevent="updatePassword" class="space-y-5">
          <!-- Current Password -->
          <div>
            <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.currentPassword') }}</label>
            <div class="relative">
              <input 
                :type="showCurrentPass ? 'text' : 'password'" 
                v-model="passwordForm.current" 
                class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40 pr-12"
                style="border-color: var(--border)"
              />
              <button 
                type="button" 
                @click="showCurrentPass = !showCurrentPass" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <svg v-if="showCurrentPass" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- New Password -->
            <div>
              <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.newPassword') }}</label>
              <div class="relative">
                <input 
                  :type="showNewPass ? 'text' : 'password'" 
                  v-model="passwordForm.new" 
                  class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40 pr-12"
                  style="border-color: var(--border)"
                />
                <button 
                  type="button" 
                  @click="showNewPass = !showNewPass" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg v-if="showNewPass" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.confirmPassword') }}</label>
              <div class="relative">
                <input 
                  :type="showConfirmPass ? 'text' : 'password'" 
                  v-model="passwordForm.confirm" 
                  class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40 pr-12"
                  style="border-color: var(--border)"
                />
                <button 
                  type="button" 
                  @click="showConfirmPass = !showConfirmPass" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg v-if="showConfirmPass" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="passwordMsg" 
            class="text-xs py-2.5 px-4 rounded-xl border"
            :class="passwordMsg.type === 'success' 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' 
              : 'text-rose-400 bg-rose-500/10 border-rose-500/15'">
            {{ passwordMsg.text }}
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              :disabled="passwordLoading"
              class="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="passwordLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ passwordLoading ? t('common.updating') : t('profile.updatePassword') }}
            </button>
          </div>
        </form>
      </div>

    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '../components/AppLayout.vue'
import { useAuthStore } from '../stores/authStore'
import api from '../api/client'

const { t } = useI18n()
const authStore = useAuthStore()

// Password visibility toggles
const showCurrentPass = ref(false)
const showNewPass = ref(false)
const showConfirmPass = ref(false)

// Profile Form State
const profileForm = ref({ name: '' })
const profileLoading = ref(false)
const profileMsg = ref(null)

// Password Form State
const passwordForm = ref({ current: '', new: '', confirm: '' })
const passwordLoading = ref(false)
const passwordMsg = ref(null)

onMounted(() => {
  if (authStore.user) {
    profileForm.value.name = authStore.user.name || ''
  }
})

// Update Profile Name
async function updateProfile() {
  profileLoading.value = true
  profileMsg.value = null
  try {
    await api.put('/auth/profile', { name: profileForm.value.name })
    
    if (authStore.user) authStore.user.name = profileForm.value.name
    
    profileMsg.value = { type: 'success', text: t('profile.updateSuccess') }
  } catch (err) {
    profileMsg.value = { type: 'error', text: err.response?.data?.message || err.message || t('profile.updateFailed') }
  } finally {
    profileLoading.value = false
    setTimeout(() => { profileMsg.value = null }, 4000)
  }
}

// Update Password
async function updatePassword() {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordMsg.value = { type: 'error', text: t('profile.passwordMismatch') }
    setTimeout(() => { passwordMsg.value = null }, 4000)
    return
  }
  if (passwordForm.value.new.length < 6) {
    passwordMsg.value = { type: 'error', text: t('profile.passwordTooShort') }
    setTimeout(() => { passwordMsg.value = null }, 4000)
    return
  }

  passwordLoading.value = true
  passwordMsg.value = null
  try {
    await api.put('/auth/change-password', {
      currentPassword: passwordForm.value.current,
      newPassword: passwordForm.value.new
    })
    passwordMsg.value = { type: 'success', text: t('profile.passwordSuccess') }
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (err) {
    passwordMsg.value = { type: 'error', text: err.response?.data?.message || err.message || t('profile.passwordFailed') }
  } finally {
    passwordLoading.value = false
    setTimeout(() => { passwordMsg.value = null }, 4000)
  }
}
</script>