<template>
  <AppLayout>
    <div class="p-7 max-w-4xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">Connected Accounts</h1>
        <p class="text-sm theme-sub mt-1">
          Connect your social media accounts so ContentForge can publish your approved posts directly — no copy-pasting needed.
        </p>
      </div>

      <!-- Info banner -->
      <div class="mb-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
        <span class="text-xl shrink-0">💡</span>
        <div>
          <p class="text-sm font-medium text-blue-300 mb-1">How publishing works</p>
          <p class="text-sm text-blue-200/70 leading-relaxed">
            Once you connect an account, you can approve a post in your calendar and hit
            <strong class="text-blue-300">Publish</strong> — ContentForge sends it directly to that platform.
            You stay in control: nothing gets posted without your approval first.
          </p>
        </div>
      </div>

      <!-- Platform cards -->
      <div class="grid md:grid-cols-2 gap-4">
        <div v-for="platform in socialPlatforms" :key="platform.name"
          class="rounded-2xl theme-surface theme-border p-5 flex flex-col gap-4 transition-all"
          :class="platform.connected ? 'border-green-500/20' : ''">

          <!-- Top row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                :class="platform.iconBg">
                {{ platform.icon }}
              </div>
              <div>
                <p class="font-medium theme-text text-sm">{{ platform.name }}</p>
                <p class="text-[11px]" :class="platform.connected ? 'text-green-400' : 'theme-muted'">
                  {{ platform.connected ? platform.handle : platform.description }}
                </p>
              </div>
            </div>

            <!-- Status + button -->
            <div class="flex flex-col items-end gap-2">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full"
                  :class="platform.connected ? 'bg-green-400 animate-pulse' : 'bg-slate-600'"></div>
                <span class="text-[11px]"
                  :class="platform.connected ? 'text-green-400' : 'theme-muted'">
                  {{ platform.connected ? 'Connected' : 'Not connected' }}
                </span>
              </div>
              <button @click="togglePlatform(platform)"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                :class="platform.connected
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                  : 'bg-blue-600 text-white hover:bg-blue-500'">
                {{ platform.connected ? 'Disconnect' : 'Connect Account' }}
              </button>
            </div>
          </div>

          <!-- Connected: show stats -->
          <div v-if="platform.connected"
            class="p-3 rounded-xl theme-card theme-border">
            <div class="grid grid-cols-3 gap-2 text-center mb-3">
              <div v-for="stat in platform.stats" :key="stat.label">
                <p class="text-sm font-bold theme-text">{{ stat.value }}</p>
                <p class="text-[10px] theme-muted">{{ stat.label }}</p>
              </div>
            </div>
            <!-- What ContentForge can do -->
            <div class="pt-2 border-t" style="border-color:var(--border)">
              <p class="text-[10px] theme-muted mb-1.5">ContentForge can:</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="action in platform.actions" :key="action"
                  class="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/15">
                  ✓ {{ action }}
                </span>
              </div>
            </div>
          </div>

          <!-- Not connected: show what they'll unlock -->
          <div v-else
            class="p-3 rounded-xl bg-slate-500/5 border border-dashed theme-border">
            <p class="text-[11px] theme-muted mb-2">Connect to unlock:</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="action in platform.actions" :key="action"
                class="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-700">
                {{ action }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom note -->
      <div class="mt-8 p-5 rounded-2xl theme-card theme-border flex gap-3">
        <span class="text-lg shrink-0">🔒</span>
        <div>
          <p class="text-sm font-medium theme-text mb-1">Your accounts are safe</p>
          <p class="text-xs theme-sub leading-relaxed">
            ContentForge only gets permission to <strong class="theme-text">read your profile</strong> and
            <strong class="theme-text">publish posts you explicitly approve</strong>.
            We never access your password, DMs, or personal data.
            You can disconnect any account here at any time.
          </p>
        </div>
      </div>

      <!-- Disconnect confirm modal -->
      <div v-if="confirmDisconnect"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div class="theme-surface rounded-2xl theme-border max-w-sm w-full p-6 theme-shadow">
          <p class="font-display text-lg font-600 theme-text mb-2">
            Disconnect {{ confirmDisconnect.name }}?
          </p>
          <p class="text-sm theme-sub mb-5 leading-relaxed">
            ContentForge will no longer be able to publish to {{ confirmDisconnect.name }}.
            Your existing posts and data stay untouched — you can reconnect anytime.
          </p>
          <div class="flex gap-3">
            <button @click="confirmDisconnect = null"
              class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">
              Keep connected
            </button>
            <button @click="doDisconnect"
              class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 transition-colors">
              Yes, disconnect
            </button>
          </div>
        </div>
      </div>

    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const confirmDisconnect = ref(null)

const socialPlatforms = ref([
  {
    name: 'Instagram',
    icon: '📸',
    iconBg: 'bg-gradient-to-br from-pink-500/20 to-purple-500/20',
    description: 'Post photos, reels & stories',
    connected: true,
    handle: '@araby.coffee · 12.4K followers',
    stats: [
      { label: 'Followers', value: '12.4K' },
      { label: 'Posts published', value: '23' },
      { label: 'Avg. engagement', value: '4.2%' },
    ],
    actions: ['Publish feed posts', 'Schedule stories', 'View reach & likes'],
  },
  {
    name: 'Facebook',
    icon: '📘',
    iconBg: 'bg-blue-500/15',
    description: 'Reach your Facebook page audience',
    connected: true,
    handle: 'Araby Coffee EG · 8.7K likes',
    stats: [
      { label: 'Page likes', value: '8.7K' },
      { label: 'Posts published', value: '18' },
      { label: 'Monthly reach', value: '45K' },
    ],
    actions: ['Publish to page', 'Schedule posts', 'View page insights'],
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    iconBg: 'bg-blue-700/15',
    description: 'Grow your professional brand',
    connected: false,
    handle: null,
    stats: [],
    actions: ['Publish articles & posts', 'Schedule content', 'Track impressions'],
  },
  {
    name: 'Twitter / X',
    icon: '🐦',
    iconBg: 'bg-sky-500/15',
    description: 'Join trending conversations',
    connected: false,
    handle: null,
    stats: [],
    actions: ['Post tweets & threads', 'Schedule posts', 'Monitor mentions'],
  },
  {
    name: 'TikTok',
    icon: '🎵',
    iconBg: 'bg-rose-500/15',
    description: 'Reach younger audiences with video',
    connected: false,
    handle: null,
    stats: [],
    actions: ['Publish video captions', 'Schedule posts', 'View video stats'],
  },
  {
    name: 'YouTube',
    icon: '▶️',
    iconBg: 'bg-red-500/15',
    description: 'Publish video descriptions & posts',
    connected: false,
    handle: null,
    stats: [],
    actions: ['Publish community posts', 'Schedule descriptions', 'Track views'],
  },
])

function togglePlatform(platform) {
  if (platform.connected) {
    // Ask for confirmation before disconnecting
    confirmDisconnect.value = platform
  } else {
    // In production: redirect to OAuth flow
    // window.location.href = `/api/auth/${platform.name.toLowerCase()}/connect`
    platform.connected = true
    platform.handle = `@your_account · just connected`
    platform.stats = [
      { label: 'Followers', value: '—' },
      { label: 'Posts published', value: '0' },
      { label: 'Avg. engagement', value: '—' },
    ]
  }
}

function doDisconnect() {
  if (!confirmDisconnect.value) return
  confirmDisconnect.value.connected = false
  confirmDisconnect.value.handle    = null
  confirmDisconnect.value.stats     = []
  confirmDisconnect.value = null
}
</script>
