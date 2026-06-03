// src/api/authApi.js
// All authentication calls: register, login, logout, get current user
import api from './client'
 
const authApi = {
 
  // ── Register a new user ─────────────────────────────────────────────────────
  // POST /api/auth/register
  // Body: { name, email, password, phone }
  // Returns: { message } — user must verify email before token is issued
  async register({ name, email, password, phone }) {
    const data = await api.post('/auth/register', { name, email, password, phone })
    // No token yet — backend returns just a message until email is verified
    return data
  },
 
  // ── Login ───────────────────────────────────────────────────────────────────
  // POST /api/auth/login
  // Body: { email, password }
  // Returns: { token, user }
  async login({ email, password }) {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('cf_token', data.token)
    localStorage.setItem('cf_user',  JSON.stringify(data.user))
    return data
  },
 
  // ── Logout ──────────────────────────────────────────────────────────────────
  logout() {
    localStorage.removeItem('cf_token')
    localStorage.removeItem('cf_user')
    window.location.href = '/login'
  },
 
  // ── Get current logged-in user from localStorage ────────────────────────────
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('cf_user')) || null
    } catch {
      return null
    }
  },
 
  // ── Check if user is logged in ──────────────────────────────────────────────
  isLoggedIn() {
    return !!localStorage.getItem('cf_token')
  },
 
  // ── Get fresh user profile from server ─────────────────────────────────────
  // GET /api/auth/me
  async getProfile() {
    return await api.get('/auth/me')
  },
}
 
export default authApi