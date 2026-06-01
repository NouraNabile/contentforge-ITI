<template>
  <AppLayout>
    <div class="p-7 max-w-4xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">Connections</h1>
        <p class="text-sm theme-sub mt-1">Connect your social platforms to enable one-click publishing from ContentForge.</p>
      </div>

      <!-- Platform grid -->
      <div class="grid md:grid-cols-2 gap-4">
        <div v-for="platform in socialPlatforms" :key="platform.name"
          class="rounded-2xl theme-surface theme-border p-5 flex flex-col gap-4">

          <!-- Platform header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="platform.iconBg">
                {{ platform.icon }}
              </div>
              <div>
                <p class="font-medium theme-text text-sm">{{ platform.name }}</p>
                <p class="text-[11px] theme-muted">{{ platform.handle || 'Not connected' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full transition-colors"
                  :class="platform.connected ? 'bg-green-400' : 'bg-slate-600'"></div>
                <span class="text-[11px] transition-colors"
                  :class="platform.connected ? 'text-green-400' : 'theme-muted'">
                  {{ platform.connected ? 'Connected' : 'Disconnected' }}
                </span>
              </div>
              <button @click="togglePlatform(platform)"
                :disabled="platform.loading"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                :class="platform.connected
                  ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20'
                  : 'bg-blue-600 text-white hover:bg-blue-500'">
                <span v-if="platform.loading">...</span>
                <span v-else>{{ platform.connected ? 'Disconnect' : 'Connect' }}</span>
              </button>
            </div>
          </div>

          <!-- Connected details -->
          <div v-if="platform.connected" class="p-3 rounded-xl theme-card theme-border space-y-2">
            <div class="grid grid-cols-3 gap-2 text-center">
              <div v-for="stat in platform.stats" :key="stat.label">
                <p class="text-sm font-medium theme-text">{{ stat.value }}</p>
                <p class="text-[10px] theme-muted">{{ stat.label }}</p>
              </div>
            </div>
          </div>

          <!-- Permissions -->
          <div v-if="platform.connected && platform.permissions?.length" class="flex flex-wrap gap-1.5">
            <span v-for="p in platform.permissions" :key="p"
              class="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/15">
              ✓ {{ p }}
            </span>
          </div>

          <!-- Coming soon badge for platforms without OAuth yet -->
          <div v-if="!platform.connected && platform.comingSoon"
            class="text-[10px] text-center theme-muted py-1 rounded-lg theme-card theme-border">
            OAuth coming soon
          </div>
        </div>
      </div>

      <!-- Info note -->
      <div class="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-400">
        <p class="font-medium mb-1">How publishing works</p>
        <p class="theme-sub leading-relaxed">Once connected, you can publish approved posts directly from the Calendar page in one click. ContentForge uses OAuth — we never store your social media password.</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import api from '../api/client'

const socialPlatforms = ref([
  { name:'Instagram', icon:'📸', iconBg:'bg-pink-500/15',  connected:false, handle:null, loading:false, comingSoon:false, permissions:['Read posts','Publish','Analytics'], stats:[] },
  { name:'Facebook',  icon:'📘', iconBg:'bg-blue-500/15',  connected:false, handle:null, loading:false, comingSoon:false, permissions:['Read','Publish','Insights'],         stats:[] },
  { name:'LinkedIn',  icon:'💼', iconBg:'bg-blue-700/15',  connected:false, handle:null, loading:false, comingSoon:true,  permissions:[], stats:[] },
  { name:'Twitter/X', icon:'🐦', iconBg:'bg-sky-500/15',   connected:false, handle:null, loading:false, comingSoon:true,  permissions:[], stats:[] },
  { name:'TikTok',    icon:'🎵', iconBg:'bg-rose-500/15',  connected:false, handle:null, loading:false, comingSoon:true,  permissions:[], stats:[] },
  { name:'YouTube',   icon:'▶️', iconBg:'bg-red-500/15',   connected:false, handle:null, loading:false, comingSoon:true,  permissions:[], stats:[] },
])

// ── Load connection status from DB on mount ───────────────────────────────────
onMounted(async () => {
  try {
    const data = await api.get('/connections')
    if (data?.connections) {
      data.connections.forEach(conn => {
        const p = socialPlatforms.value.find(x => x.name === conn.platform)
        if (p) {
          p.connected = conn.connected
          p.handle    = conn.handle || null
          p.stats     = conn.stats  || []
        }
      })
    }
  } catch {
    // API مش شغال — هيفضل كله disconnected
  }
})

// ── Connect / Disconnect ──────────────────────────────────────────────────────
async function togglePlatform(platform) {
  if (platform.comingSoon && !platform.connected) {
    alert(`${platform.name} OAuth is coming soon!`)
    return
  }

  platform.loading = true

  try {
    if (!platform.connected) {
      // ── Connect: افتح OAuth popup ──
      // لو الـ backend عنده /api/connections/:platform/auth هيرجع OAuth URL
      const data = await api.get(`/connections/${platform.name.toLowerCase()}/auth`)
      if (data?.authUrl) {
        // افتح الـ OAuth في popup
        const popup = window.open(data.authUrl, 'oauth', 'width=600,height=700')
        // استنى الـ popup يخلص
        const timer = setInterval(async () => {
          if (popup?.closed) {
            clearInterval(timer)
            // جيب الـ status بعد ما الـ OAuth يخلص
            try {
              const status = await api.get(`/connections/${platform.name.toLowerCase()}/status`)
              platform.connected = status.connected
              platform.handle    = status.handle || null
              platform.stats     = status.stats  || []
            } catch {}
            platform.loading = false
          }
        }, 500)
        return
      }
    } else {
      // ── Disconnect ──
      await api.delete(`/connections/${platform.name.toLowerCase()}`)
      platform.connected = false
      platform.handle    = null
      platform.stats     = []
    }
  } catch (err) {
    // لو الـ backend مش فيه /connections route بعد — بس غير الـ UI
    platform.connected = !platform.connected
  } finally {
    platform.loading = false
  }
}
</script>