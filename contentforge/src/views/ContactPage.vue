<!-- src/views/ContactPage.vue -->
<template>
  <div class="min-h-screen theme-surface transition-colors duration-200" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <Navbar />

    <section class="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
      <!-- Background glow -->
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>

      <div class="max-w-lg mx-auto">

        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="font-display text-3xl sm:text-4xl font-700 theme-text mb-3">
            {{ t('contact.title') }}
            <span class="text-gradient-blue">{{ t('contact.titleAccent') }}</span>
          </h1>
          <p class="theme-sub text-base">{{ t('contact.subtitle') }}</p>
        </div>

        <!-- Success state -->
        <div v-if="submitted" class="text-center py-16">
          <div class="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5 text-xl text-green-400">
            ✓
          </div>
          <h3 class="text-lg font-600 theme-text mb-2">{{ t('contact.successTitle') }}</h3>
          <p class="text-sm theme-sub mb-6">{{ t('contact.successDesc') }}</p>
          <button @click="submitted = false; resetForm()"
            class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            {{ t('contact.sendAnother') }}
          </button>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs theme-sub font-medium mb-1.5">
                {{ t('contact.form.name') }} <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                :placeholder="t('contact.form.namePlaceholder')"
                class="w-full px-4 py-3 rounded-xl theme-input border text-sm theme-text placeholder-slate-400/50 focus:outline-none focus:border-blue-500/50 transition-colors"
                :class="errors.name ? 'border-rose-500/50' : 'theme-border'"
              />
              <p v-if="errors.name" class="text-[11px] text-rose-400 mt-1">{{ t('contact.form.nameError') }}</p>
            </div>

            <div>
              <label class="block text-xs theme-sub font-medium mb-1.5">
                {{ t('contact.form.email') }} <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                :placeholder="t('contact.form.emailPlaceholder')"
                class="w-full px-4 py-3 rounded-xl theme-input border text-sm theme-text placeholder-slate-400/50 focus:outline-none focus:border-blue-500/50 transition-colors"
                :class="errors.email ? 'border-rose-500/50' : 'theme-border'"
              />
              <p v-if="errors.email" class="text-[11px] text-rose-400 mt-1">{{ t('contact.form.emailError') }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs theme-sub font-medium mb-1.5">
              {{ t('contact.form.company') }}
            </label>
            <input
              v-model="form.company"
              type="text"
              :placeholder="t('contact.form.companyPlaceholder')"
              class="w-full px-4 py-3 rounded-xl theme-input border text-sm theme-text placeholder-slate-400/50 focus:outline-none focus:border-blue-500/50 transition-colors"
              :class="'theme-border'"
            />
          </div>

          <div>
            <label class="block text-xs theme-sub font-medium mb-1.5">
              {{ t('contact.form.subject') }} <span class="text-rose-400">*</span>
            </label>
            <select
              v-model="form.subject"
              class="w-full px-4 py-3 rounded-xl theme-input border text-sm theme-text focus:outline-none focus:border-blue-500/50 transition-colors"
              :class="errors.subject ? 'border-rose-500/50' : 'theme-border'"
            >
              <option value="" disabled class="theme-surface">{{ t('contact.form.subjectPlaceholder') }}</option>
              <option v-for="opt in subjectOptions" :key="opt.value" :value="opt.value" class="theme-surface">
                {{ t(opt.labelKey) }}
              </option>
            </select>
            <p v-if="errors.subject" class="text-[11px] text-rose-400 mt-1">{{ t('contact.form.subjectError') }}</p>
          </div>

          <div>
            <label class="block text-xs theme-sub font-medium mb-1.5">
              {{ t('contact.form.message') }} <span class="text-rose-400">*</span>
            </label>
            <textarea
              v-model="form.message"
              rows="5"
              :placeholder="t('contact.form.messagePlaceholder')"
              class="w-full px-4 py-3 rounded-xl theme-input border text-sm theme-text placeholder-slate-400/50 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              :class="errors.message ? 'border-rose-500/50' : 'theme-border'"
            ></textarea>
            <div class="flex items-center justify-between mt-1">
              <p v-if="errors.message" class="text-[11px] text-rose-400">{{ t('contact.form.messageError') }}</p>
              <p class="text-[11px] theme-muted ms-auto">{{ form.message.length }}/1000</p>
            </div>
          </div>

          <div v-if="submitError" class="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {{ t('contact.form.submitError') }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loading ? t('contact.form.sending') : t('contact.form.submit') }}
          </button>

          <p class="text-[11px] theme-muted text-center">{{ t('contact.form.privacy') }}</p>

        </form>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLang } from '../composables/useLang.js'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const { t } = useI18n()
const { locale } = useLang()

const submitted   = ref(false)
const loading     = ref(false)
const submitError = ref(false)

const form = ref({ name: '', email: '', company: '', subject: '', message: '' })
const errors = ref({ name: false, email: false, subject: false, message: false })

const subjectOptions = [
  { value: 'demo',        labelKey: 'contact.subject.demo' },
  { value: 'pricing',     labelKey: 'contact.subject.pricing' },
  { value: 'technical',   labelKey: 'contact.subject.technical' },
  { value: 'partnership', labelKey: 'contact.subject.partnership' },
  { value: 'other',       labelKey: 'contact.subject.other' },
]

function validate() {
  errors.value = {
    name:    !form.value.name.trim(),
    email:   !form.value.email.includes('@'),
    subject: !form.value.subject,
    message: form.value.message.trim().length < 10,
  }
  return !Object.values(errors.value).some(Boolean)
}

async function handleSubmit() {
  submitError.value = false
  if (!validate()) return
  loading.value = true
  try {
    // TODO: replace with real API call
    await new Promise(r => setTimeout(r, 1200))
    submitted.value = true
  } catch {
    submitError.value = true
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value  = { name: '', email: '', company: '', subject: '', message: '' }
  errors.value = { name: false, email: false, subject: false, message: false }
}
</script>