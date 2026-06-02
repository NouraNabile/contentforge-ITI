// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '../api/authApi'

export const useAuthStore = defineStore('auth', () => {

  // ── State ─────────────────────────────────────────────────────────────────
  const user    = ref(authApi.getUser())   // Load from localStorage on start
  const loading = ref(false)
  const error   = ref(null)

  // ── Getters ───────────────────────────────────────────────────────────────
  const isLoggedIn  = computed(() => !!user.value)
  const userName    = computed(() => user.value?.name || 'Guest')
  const userPlan    = computed(() => user.value?.plan || 'free')
  const userInitial = computed(() => user.value?.name?.[0]?.toUpperCase() || '?')

  // ── Actions ───────────────────────────────────────────────────────────────
  async function login(credentials) {z
    loading.value = true
    error.value   = null
    try {
      const data = await authApi.login(credentials)
      user.value  = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(credentials) {
    loading.value = true
    error.value   = null
    try {
      const data = await authApi.register(credentials)
      user.value  = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    authApi.logout()
  }

  return { user, loading, error, isLoggedIn, userName, userPlan, userInitial, login, register, logout }
})
