// src/api/client.js
// ─────────────────────────────────────────────────────────────────────────────
// Core axios instance — every API call in the app goes through this file.
// It automatically:
//   • Attaches the JWT token to every request header
//   • Refreshes UI on 401 (logged out)
//   • Shows consistent error messages
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios'

// ── Base URL ──────────────────────────────────────────────────────────────────
// During development  → http://localhost:3000/api
// In production       → https://your-render-app.onrender.com/api
// Change VITE_API_URL in your .env file to switch
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// ── Create the axios instance ─────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,          // 60 seconds — AI generation can be slow
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── REQUEST interceptor — attach JWT token automatically ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cf_token') || localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── RESPONSE interceptor — handle errors globally ────────────────────────────
api.interceptors.response.use(
  // Success: just return the data directly (no need to write .data everywhere)
  (response) => response.data,

  // Error: parse and re-throw with a clean message
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || error.message || 'Something went wrong'

    // 401 → token expired or invalid → force logout
    if (status === 401) {
      localStorage.removeItem('cf_token')
      localStorage.removeItem('cf_user')
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // 403 → trial expired → clear session and redirect to upgrade page
   if (status === 403) {
  if (window.location.pathname !== '/trial-expired') {
    window.location.href = '/trial-expired'
  }
}

    // 429 → rate limited (too many AI requests)
    if (status === 429) {
      console.warn('Rate limited — slow down requests')
    }

    return Promise.reject({ status, message })
  }
)

export default api
