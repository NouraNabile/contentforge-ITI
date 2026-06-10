<template>
  <div class="flex flex-col gap-6">

    <!-- Settings Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <!-- Trial Settings -->
      <div 
        class="rounded-2xl border p-6"
        :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'"
      >
        <div class="flex items-center gap-2 mb-5">
          <svg class="w-4 h-4" :class="isDark ? 'text-slate-400' : 'text-slate-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <h2 class="text-[15px] font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ t('admin.settingsPage.trialSettings') }}
          </h2>
        </div>

        <!-- Trial Duration -->
        <div 
          class="flex items-center justify-between gap-4 py-4 border-b"
          :class="isDark ? 'border-white/5' : 'border-slate-100'"
        >
          <div class="flex-1">
            <p class="text-[13px] font-medium mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.settingsPage.trialDuration') }}
            </p>
            <p class="text-[12px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.trialDurationDesc') }}
            </p>
          </div>
          <div class="flex items-center gap-1.5">
            <input 
              v-model.number="settings.trialDays" 
              type="number" 
              min="1" 
              max="90" 
              class="w-16 px-2.5 py-1.5 rounded-lg text-center text-sm border focus:outline-none focus:border-blue-500/40"
              :class="isDark 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'bg-slate-50 border-slate-200 text-slate-900'"
            />
            <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.days') }}
            </span>
          </div>
        </div>

        <!-- Block by Phone -->
        <div 
          class="flex items-center justify-between gap-4 py-4 border-b"
          :class="isDark ? 'border-white/5' : 'border-slate-100'"
        >
          <div class="flex-1">
            <p class="text-[13px] font-medium mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.settingsPage.blockByPhone') }}
            </p>
            <p class="text-[12px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.blockByPhoneDesc') }}
            </p>
          </div>
          <label class="relative inline-block w-10 h-[22px] shrink-0 cursor-pointer">
            <input type="checkbox" v-model="settings.blockByPhone" class="opacity-0 w-0 h-0"/>
            <span 
              class="absolute inset-0 rounded-full transition-colors"
              :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
              style="transition: background 0.2s;"
            ></span>
            <span 
              class="absolute top-[3px] left-[3px] w-4 h-4 rounded-full transition-all"
              :class="[
                settings.blockByPhone 
                  ? 'bg-blue-500 translate-x-[18px]' 
                  : (isDark ? 'bg-slate-500' : 'bg-slate-400')
              ]"
              style="transition: all 0.2s;"
            ></span>
          </label>
        </div>

        <!-- Demo Enabled -->
        <div class="flex items-center justify-between gap-4 py-4">
          <div class="flex-1">
            <p class="text-[13px] font-medium mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.settingsPage.demoEnabled') }}
            </p>
            <p class="text-[12px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.demoEnabledDesc') }}
            </p>
          </div>
          <label class="relative inline-block w-10 h-[22px] shrink-0 cursor-pointer">
            <input type="checkbox" v-model="settings.demoEnabled" class="opacity-0 w-0 h-0"/>
            <span 
              class="absolute inset-0 rounded-full transition-colors"
              :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
              style="transition: background 0.2s;"
            ></span>
            <span 
              class="absolute top-[3px] left-[3px] w-4 h-4 rounded-full transition-all"
              :class="[
                settings.demoEnabled 
                  ? 'bg-blue-500 translate-x-[18px]' 
                  : (isDark ? 'bg-slate-500' : 'bg-slate-400')
              ]"
              style="transition: all 0.2s;"
            ></span>
          </label>
        </div>
      </div>

      <!-- Email Settings -->
      <div 
        class="rounded-2xl border p-6"
        :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'"
      >
        <div class="flex items-center gap-2 mb-5">
          <svg class="w-4 h-4" :class="isDark ? 'text-slate-400' : 'text-slate-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <h2 class="text-[15px] font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ t('admin.settingsPage.emailOtp') }}
          </h2>
        </div>

        <!-- OTP Expiry -->
        <div 
          class="flex items-center justify-between gap-4 py-4 border-b"
          :class="isDark ? 'border-white/5' : 'border-slate-100'"
        >
          <div class="flex-1">
            <p class="text-[13px] font-medium mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.settingsPage.otpExpiry') }}
            </p>
            <p class="text-[12px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.otpExpiryDesc') }}
            </p>
          </div>
          <div class="flex items-center gap-1.5">
            <input 
              v-model.number="settings.otpExpiryMinutes" 
              type="number" 
              min="1" 
              max="60" 
              class="w-16 px-2.5 py-1.5 rounded-lg text-center text-sm border focus:outline-none focus:border-blue-500/40"
              :class="isDark 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'bg-slate-50 border-slate-200 text-slate-900'"
            />
            <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.minutes') }}
            </span>
          </div>
        </div>

        <!-- Send Expiry Warning -->
        <div class="flex items-center justify-between gap-4 py-4">
          <div class="flex-1">
            <p class="text-[13px] font-medium mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.settingsPage.sendExpiryWarning') }}
            </p>
            <p class="text-[12px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.sendExpiryWarningDesc') }}
            </p>
          </div>
          <label class="relative inline-block w-10 h-[22px] shrink-0 cursor-pointer">
            <input type="checkbox" v-model="settings.sendExpiryWarning" class="opacity-0 w-0 h-0"/>
            <span 
              class="absolute inset-0 rounded-full transition-colors"
              :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
              style="transition: background 0.2s;"
            ></span>
            <span 
              class="absolute top-[3px] left-[3px] w-4 h-4 rounded-full transition-all"
              :class="[
                settings.sendExpiryWarning 
                  ? 'bg-blue-500 translate-x-[18px]' 
                  : (isDark ? 'bg-slate-500' : 'bg-slate-400')
              ]"
              style="transition: all 0.2s;"
            ></span>
          </label>
        </div>
      </div>

    </div>

    <!-- Save Row -->
    <div class="flex items-center justify-between gap-4">
      <p class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
        {{ saveMsg }}
      </p>
      <button 
        @click="save" 
        :disabled="saving || saved"
        class="px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-teal-400 text-white hover:opacity-85"
      >
        {{ saving ? t('admin.settingsPage.saving') : saved ? t('admin.settingsPage.saved') : t('admin.settingsPage.saveSettings') }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../../composables/useTheme.js'
import adminApi from '../../api/adminApi'

const { t } = useI18n()
const { isDark } = useTheme()

const isDev = import.meta.env.DEV
const saved = ref(false)
const saving = ref(false)
const saveMsg = ref('')

const settings = ref({
  trialDays: 14,
  blockByPhone: true,
  demoEnabled: true,
  otpExpiryMinutes: 10,
  sendExpiryWarning: false,
})

onMounted(async () => {
  try {
    const data = await adminApi.getSettings()
    settings.value = data.settings
  } catch (err) {
    console.error('Failed to load settings:', err)
  }
})

async function save() {
  saving.value = true
  saveMsg.value = ''
  try {
    const res = await adminApi.saveSettings(settings.value)
    saveMsg.value = `✓ ${t('admin.settingsPage.saved')} — ${res.updatedUsers} ${t('admin.settingsPage.trialUsersUpdated')}`
    saved.value = true
    setTimeout(() => { saved.value = false; saveMsg.value = '' }, 3000)
  } catch (err) {
    saveMsg.value = err.message || t('admin.settingsPage.saveFailed')
  } finally {
    saving.value = false
  }
}
</script>