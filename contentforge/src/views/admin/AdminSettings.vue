<!-- AdminSettings.vue -->
<template>
  <div class="admin-settings">

    <div class="settings-grid">

      <!-- Trial Settings -->
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
            {{ t('admin.settings.trialTitle') }}
          </h2>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <p class="setting-name">{{ t('admin.settings.trialDuration') }}</p>
            <p class="setting-desc">{{ t('admin.settings.trialDurationDesc') }}</p>
          </div>
          <div class="setting-control">
            <input v-model.number="settings.trialDays" type="number" min="1" max="90" class="num-input"/>
            <span class="setting-unit">{{ t('admin.settings.unitDays') }}</span>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <p class="setting-name">{{ t('admin.settings.blockByPhone') }}</p>
            <p class="setting-desc">{{ t('admin.settings.blockByPhoneDesc') }}</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.blockByPhone"/>
            <span class="toggle-track"></span>
          </label>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <p class="setting-name">{{ t('admin.settings.demoEnabled') }}</p>
            <p class="setting-desc">{{ t('admin.settings.demoEnabledDesc') }}</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.demoEnabled"/>
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>

      <!-- Email Settings -->
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            {{ t('admin.settings.emailTitle') }}
          </h2>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <p class="setting-name">{{ t('admin.settings.otpExpiry') }}</p>
            <p class="setting-desc">{{ t('admin.settings.otpExpiryDesc') }}</p>
          </div>
          <div class="setting-control">
            <input v-model.number="settings.otpExpiryMinutes" type="number" min="1" max="60" class="num-input"/>
            <span class="setting-unit">{{ t('admin.settings.unitMinutes') }}</span>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <p class="setting-name">{{ t('admin.settings.sendWarning') }}</p>
            <p class="setting-desc">{{ t('admin.settings.sendWarningDesc') }}</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.sendExpiryWarning"/>
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>

      <!-- Platform Info -->
      <div class="panel info-panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ t('admin.settings.infoTitle') }}
          </h2>
        </div>
        <div class="info-rows">
          <div class="info-row">
            <span class="info-key">{{ t('admin.settings.version') }}</span>
            <span class="info-val">ContentForge v1.0.0</span>
          </div>
          <div class="info-row">
            <span class="info-key">{{ t('admin.settings.environment') }}</span>
            <span class="info-val env-badge">{{ isDev ? t('admin.settings.envDev') : t('admin.settings.envProd') }}</span>
          </div>
          <div class="info-row">
            <span class="info-key">{{ t('admin.settings.backend') }}</span>
            <span class="info-val">Express + MongoDB Atlas</span>
          </div>
          <div class="info-row">
            <span class="info-key">{{ t('admin.settings.jwtExpiry') }}</span>
            <span class="info-val">{{ t('admin.settings.jwtExpiryVal') }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Save -->
    <div class="save-row">
      <p class="save-note">{{ t('admin.settings.saveNote') }}</p>
      <button class="save-btn" @click="save" :disabled="saved">
        {{ saved ? t('admin.settings.saved') : t('admin.settings.saveBtn') }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isDev = import.meta.env.DEV
const saved = ref(false)

const settings = ref({
  trialDays:          14,
  blockByPhone:       true,
  demoEnabled:        true,
  otpExpiryMinutes:   10,
  sendExpiryWarning:  false,
})

function save() {
  localStorage.setItem('cf_admin_settings', JSON.stringify(settings.value))
  saved.value = true
  setTimeout(() => { saved.value = false }, 2500)
}
</script>

<style scoped>
.admin-settings { display: flex; flex-direction: column; gap: 1.5rem; }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }

.panel { background: var(--surface,#13151c); border: 1px solid var(--border,rgba(255,255,255,0.06)); border-radius: 14px; padding: 1.5rem; }
.info-panel { grid-column: span 2; }

.panel-header { margin-bottom: 1.25rem; }
.panel-title  { font-size: 15px; font-weight: 600; color: var(--text,#f0f2f5); margin: 0; display: flex; align-items: center; gap: 8px; }

.setting-row  { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border,rgba(255,255,255,0.04)); }
.setting-row:last-child { border-bottom: none; }
.setting-info { flex: 1; }
.setting-name { font-size: 13px; font-weight: 500; color: var(--text,#f0f2f5); margin: 0 0 2px; }
.setting-desc { font-size: 12px; color: var(--sub,#6b7280); margin: 0; }

.setting-control { display: flex; align-items: center; gap: 6px; }
.num-input {
  width: 64px; padding: 6px 10px; border-radius: 8px;
  background: rgba(255,255,255,0.05); border: 1px solid var(--border,rgba(255,255,255,0.08));
  color: var(--text,#f0f2f5); font-size: 14px; text-align: center; outline: none;
}
.setting-unit { font-size: 12px; color: var(--sub,#6b7280); }

/* Toggle */
.toggle-switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; cursor: pointer; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-track {
  position: absolute; inset: 0; border-radius: 999px;
  background: rgba(255,255,255,0.08); transition: background 0.2s;
}
.toggle-track::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #6b7280; transition: all 0.2s;
}
.toggle-switch input:checked + .toggle-track { background: rgba(59,130,246,0.3); }
.toggle-switch input:checked + .toggle-track::after { background: #60a5fa; transform: translateX(18px); }

/* Info */
.info-rows { display: grid; grid-template-columns: repeat(2,1fr); gap: 1rem; }
.info-row  { display: flex; flex-direction: column; gap: 4px; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border,rgba(255,255,255,0.04)); border-radius: 10px; }
.info-key  { font-size: 11px; color: var(--sub,#6b7280); text-transform: uppercase; letter-spacing: 0.05em; }
.info-val  { font-size: 13px; color: var(--text,#f0f2f5); font-weight: 500; }
.env-badge { color: #34d399; }

/* Save */
.save-row  { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.save-note { font-size: 12px; color: var(--sub,#6b7280); margin: 0; }
.save-btn  {
  padding: 10px 24px; border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #14b8a6);
  border: none; color: white; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: opacity 0.15s;
}
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.save-btn:not(:disabled):hover { opacity: 0.85; }

@media (max-width: 800px) { .settings-grid { grid-template-columns: 1fr; } .info-panel { grid-column: span 1; } }
</style>
