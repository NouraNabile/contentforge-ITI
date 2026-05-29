<template>
  <div class="min-h-screen theme-bg flex items-center justify-center p-6 bg-grid">

    <!-- Ambient glow -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-600/8 blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">

      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-flex items-center gap-2.5 mb-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span class="font-display font-700 text-xl theme-text">ContentForge</span>
        </RouterLink>
        <h1 class="font-display text-2xl font-700 theme-text mb-1">
          {{ isRegister ? 'Create your account' : 'Welcome back' }}
        </h1>
        <p class="text-sm theme-sub">
          {{ isRegister ? 'Start generating Arabic content in minutes' : 'Sign in to your brand dashboard' }}
        </p>
      </div>

      <!-- Card -->
      <div class="rounded-2xl theme-surface theme-border p-8 theme-shadow">

        <!-- Error banner -->
        <div v-if="error" class="mb-5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ error }}
        </div>

        <!-- Success banner -->
        <div v-if="success" class="mb-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          {{ success }}
        </div>

        <div class="space-y-4">

          <!-- Name field (register only) -->
          <div v-if="isRegister">
            <label class="text-xs theme-sub mb-1.5 block font-medium">Full Name</label>
            <input v-model="form.name" type="text" placeholder="Noura Nabil"
              class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors"
              style="border-color:var(--border)" @keyup.enter="submit"/>
          </div>

          <!-- Email -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block font-medium">Email Address</label>
            <input v-model="form.email" type="email" placeholder="noura@arabycoffee.com"
              class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors"
              style="border-color:var(--border)" @keyup.enter="submit"/>
          </div>

          <!-- Password -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block font-medium">Password</label>
            <div class="relative">
              <input v-model="form.password" :type="showPass ? 'text' : 'password'"
                placeholder="At least 6 characters"
                class="w-full theme-input rounded-xl px-4 py-3 pr-11 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors"
                style="border-color:var(--border)" @keyup.enter="submit"/>
              <button @click="showPass=!showPass" type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 theme-muted hover:theme-text transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="!showPass" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit button -->
          <button @click="submit" :disabled="loading"
            class="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loading ? (isRegister ? 'Creating account…' : 'Signing in…') : (isRegister ? 'Create Account' : 'Sign In') }}
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px" style="background:var(--border)"></div>
          <span class="text-xs theme-muted">or</span>
          <div class="flex-1 h-px" style="background:var(--border)"></div>
        </div>

        <!-- Demo login button -->
        <button @click="demoLogin"
          class="w-full py-3 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">
          🎭 Try with Demo Account
        </button>

        <!-- Toggle register/login -->
        <p class="text-center text-sm theme-sub mt-6">
          {{ isRegister ? 'Already have an account?' : "Don't have an account?" }}
          <button @click="isRegister=!isRegister; error=null"
            class="text-blue-400 hover:text-blue-300 ml-1 font-medium transition-colors">
            {{ isRegister ? 'Sign in' : 'Create one free' }}
          </button>
        </p>
      </div>

      <!-- Connection status indicator -->
      <div class="flex items-center justify-center gap-2 mt-5">
        <div class="w-1.5 h-1.5 rounded-full" :class="serverOnline ? 'bg-green-400' : 'bg-rose-400'"></div>
        <span class="text-[11px] theme-muted">
          {{ serverOnline ? 'Server connected · ' + apiUrl : 'Backend offline — start your server first' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import api from '../api/client'

const router   = useRouter()
const authStore= useAuthStore()

const isRegister  = ref(false)
const showPass    = ref(false)
const loading     = ref(false)
const error       = ref(null)
const success     = ref(null)
const serverOnline= ref(false)
const apiUrl      = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const form = ref({ name: '', email: '', password: '' })

// Check server health on mount
onMounted(async () => {
  try {
    await api.get('/health')
    serverOnline.value = true
  } catch {
    serverOnline.value = false
  }
})

async function submit() {
  error.value = null
  if (!form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }
  loading.value = true
  try {
    if (isRegister.value) {
      await authStore.register(form.value)
      success.value = 'Account created! Redirecting…'
    } else {
      await authStore.login(form.value)
    }
    setTimeout(() => router.push('/dashboard'), 600)
  } catch (err) {
    error.value = err.message || 'Something went wrong. Is your backend running?'
  } finally {
    loading.value = false
  }
}

// Fill demo credentials and log in
async function demoLogin() {
  form.value = { email: 'demo@arabycoffee.com', password: 'demo123' }
  // If backend is offline, just go to dashboard directly (demo mode)
  if (!serverOnline.value) {
    localStorage.setItem('cf_token', 'demo_token')
    localStorage.setItem('cf_user', JSON.stringify({ name: 'Noura', email: 'demo@arabycoffee.com', plan: 'growth' }))
    router.push('/dashboard')
    return
  }
  await submit()
}
</script>
