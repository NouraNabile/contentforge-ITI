<template>
  <AppLayout>
    <div class="p-7 max-w-4xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">Connections</h1>
        <p class="text-sm theme-sub mt-1">Connect your social platforms, database, and API keys to enable publishing and data persistence.</p>
      </div>
      <!-- ───── SOCIAL PLATFORMS TAB ───── -->
      <div v-if="activeTab==='Social Platforms'">
        <div class="grid md:grid-cols-2 gap-4">
          <div v-for="platform in socialPlatforms" :key="platform.name"
            class="rounded-2xl theme-surface theme-border p-5 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="platform.iconBg">{{ platform.icon }}</div>
                <div>
                  <p class="font-medium theme-text text-sm">{{ platform.name }}</p>
                  <p class="text-[11px] theme-muted">{{ platform.handle || 'Not connected' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5">
                  <div class="w-1.5 h-1.5 rounded-full" :class="platform.connected ? 'bg-green-400' : 'bg-slate-600'"></div>
                  <span class="text-[11px]" :class="platform.connected ? 'text-green-400' : 'theme-muted'">
                    {{ platform.connected ? 'Connected' : 'Disconnected' }}
                  </span>
                </div>
                <!--<button @click="platform.connected ? togglePlatform(platform) : openConnectModal(platform)"
                :disabled="platform.loading"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                :class="platform.connected
                  ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20'
                  : 'bg-blue-600 text-white hover:bg-blue-500'">
                <span v-if="platform.loading">...</span>
                <span v-else>{{ platform.connected ? 'Disconnect' : 'Connect' }}</span>
              </button>-->
              <button @click="togglePlatform(platform)"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  :class="platform.connected
                    ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20'
                    : 'bg-blue-600 text-white hover:bg-blue-500'">
                  {{ platform.connected ? 'Disconnect' : 'Connect' }}
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
            <div v-if="platform.connected && platform.permissions" class="flex flex-wrap gap-1.5">
              <span v-for="p in platform.permissions" :key="p"
                class="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/15">
                ✓ {{ p }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ───── CONNECT MODAL ───── -->
      <div v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.6)"
        @click.self="closeModal">

        <div class="rounded-2xl theme-surface theme-border p-6 w-full max-w-md mx-4 flex flex-col gap-5" style="max-height: 90vh;">

          <!-- Modal Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                :class="activePlatform?.iconBg">
                {{ activePlatform?.icon }}
              </div>
              <div>
                <p class="font-medium theme-text text-sm">Connect {{ activePlatform?.name }}</p>
                <p class="text-[11px] theme-muted">Fill in your account details</p>
              </div>
            </div>
            <button @click="closeModal"
              class="text-xl theme-muted hover:theme-text transition-colors">✕</button>
          </div>

          <!-- Dynamic Form Fields -->
          <div class="flex flex-col gap-3 overflow-y-auto"  style="max-height: 55vh;">
            <div v-for="field in currentFields" :key="field.key">
              <label class="text-xs theme-sub mb-1.5 block">{{ field.label }}</label>
              <input
                v-model="formData[field.key]"
                :type="field.type || 'text'"
                :placeholder="field.placeholder"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40 transition-colors"
                style="border-color:var(--border)"/>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex gap-3 pt-2 border-t" style="border-color:var(--border)">
            <button @click="closeModal"
              :disabled="isSubmitting"
              class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button @click="submitForm"
              :disabled="isSubmitting"
              class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
              <span v-if="isSubmitting" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>{{ isSubmitting ? 'Connecting...' : 'Connect ✓' }}</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  </AppLayout>
</template>

<script setup>
// import { ref, onMounted, computed} from 'vue'
// import AppLayout from '../components/AppLayout.vue'
// import api from '../api/client'

// const showModal     = ref(false)
// const activePlatform = ref(null)
// const formData      = ref({})
// const isSubmitting = ref(false)

// const currentFields = computed(() =>
//   activePlatform.value ? platformFields[activePlatform.value.name] ?? [] : []
// )

// const socialPlatforms = ref([
//   { name:'Instagram', icon:'📸', iconBg:'bg-pink-500/15',  connected:false, handle:null, loading:false, comingSoon:false, permissions:['Read posts','Publish','Analytics'], stats:[] },
//   { name:'Facebook',  icon:'📘', iconBg:'bg-blue-500/15',  connected:false, handle:null, loading:false, comingSoon:false, permissions:['Read','Publish','Insights'],         stats:[] },
//   { name:'LinkedIn',  icon:'💼', iconBg:'bg-blue-700/15',  connected:false, handle:null, loading:false, comingSoon:true,  permissions:[], stats:[] },
//   { name:'Twitter/X', icon:'🐦', iconBg:'bg-sky-500/15',   connected:false, handle:null, loading:false, comingSoon:true,  permissions:[], stats:[] },
//   { name:'TikTok',    icon:'🎵', iconBg:'bg-rose-500/15',  connected:false, handle:null, loading:false, comingSoon:true,  permissions:[], stats:[] },
//   { name:'YouTube',   icon:'▶️', iconBg:'bg-red-500/15',   connected:false, handle:null, loading:false, comingSoon:true,  permissions:[], stats:[] },
// ])

// // The platformFields Data
// const platformFields = {
//   Instagram: [
//     { key: 'username', label: 'Username', placeholder: '@youraccount', type: 'text' },
//     { key: 'email',    label: 'Email',    placeholder: 'you@email.com', type: 'email' },
//   ],
//   Facebook: [
//     { key: 'pageName', label: 'Page Name', placeholder: 'Your Page Name', type: 'text' },
//     { key: 'email',    label: 'Email',     placeholder: 'you@email.com',  type: 'email' },
//   ],

// }

// // ── Load connection status from DB on mount ───────────────────────────────────
// onMounted(async () => {
//   try {
//     const data = await api.get('/connections')
//     if (data?.connections) {
//       data.connections.forEach(conn => {
//         const p = socialPlatforms.value.find(x => x.name === conn.platform)
//         if (p) {
//           p.connected = conn.connected
//           p.handle    = conn.handle || null
//           p.stats     = conn.stats  || []
//         }
//       })
//     }
//   } catch {
//     // API مش شغال — هيفضل كله disconnected
//   }
// })

// // ── Open modal and set active platform ─────────────────────────────────────────
// function openConnectModal(platform) {
//   activePlatform.value = platform
//   formData.value = {}
//   showModal.value = true
// }
// // Close modal and reset state
// function closeModal() {
//   showModal.value = false
//   activePlatform.value = null
//   formData.value = {}
// }

// // ── Submit form data ─────────────────────────────────────────────────────────
// async function submitForm() {
//   if (!activePlatform.value) return

//   // ── Basic validation ────────────────────────────────────────────────────────
//   const fields = currentFields.value
//   const requiredFields = fields.filter(f => !f.optional) // all fields are required by default

//   // Checks all fields have values (skips optional ones if you add optional: true to any field later)
//   for (const field of requiredFields) {
//     const value = formData.value[field.key]
//     if (value === undefined || value === null || String(value).trim() === '') {
//       alert(`Please fill in the ${field.label} field.`)
//       return
//     }
//   }

//   // ── Build stats array from numeric fields ───────────────────────────────────
//   const stats = []
//   // Auto-detects number type fields and builds the stats array for the UI card
//   for (const field of fields) {
//     if (field.type === 'number' && formData.value[field.key] !== undefined) {
//       stats.push({
//         label: field.label,
//         value: Number(formData.value[field.key]).toLocaleString()
//       })
//     }
//   }

//   // ── Prepare payload ─────────────────────────────────────────────────────────
//   const payload = {
//     platform: activePlatform.value.name,
//     handle: formData.value.username || formData.value.pageName || null,
//     email: formData.value.email || null,
//     connected: true,
//     stats: stats,
//     rawData: { ...formData.value } // send everything in case backend needs it
//   }

//   isSubmitting.value = true

//   try {
//     // ── Send to backend ───────────────────────────────────────────────────────
//     const res = await api.post('/connections', payload)

//     // ── Update local state ────────────────────────────────────────────────────
//     activePlatform.value.connected = true
//     activePlatform.value.handle = payload.handle
//     activePlatform.value.stats = stats

//     // ── Close modal & reset ───────────────────────────────────────────────────
//     closeModal()

//     // Optional: show success feedback
//     // You can replace this with a toast notification if you have one
//     console.log(`✓ ${activePlatform.value.name} connected successfully`)

//   } catch (err) {
//     console.error('Connection failed:', err)
//     alert(`Failed to connect ${activePlatform.value.name}. Please try again.`)
//   } finally {
//     isSubmitting.value = false
//   }
// }

// // async function submitForm() {
// //   if (!activePlatform.value) return

// //   const username = formData.value.username || formData.value.pageName || formData.value.profileName || formData.value.channelName

// //   if (!username || !formData.value.email) {
// //     alert('Please fill in all fields.')
// //     return
// //   }

// //   isSubmitting.value = true

// //   try {
// //     // ── Step 1: Send basic info to backend ───────────────────────────────────
// //     const connectRes = await api.post('/connections', {
// //       platform: activePlatform.value.name,
// //       handle: username,
// //       email: formData.value.email,
// //       connected: true,
// //     })

// //     // ── Step 2: Trigger backend to fetch real stats ──────────────────────────
// //     // Your backend will scrape or call the platform's API
// //     const statsRes = await api.get(`/connections/${activePlatform.value.name.toLowerCase()}/${username.replace('@', '')}/stats`)

// //     // ── Step 3: Update UI with fetched stats ─────────────────────────────────
// //     const stats = statsRes?.stats || []

// //     // Find and update the platform in the list
// //     const platform = socialPlatforms.value.find(p => p.name === activePlatform.value.name)
// //     if (platform) {
// //       platform.connected = true
// //       platform.handle = username
// //       platform.stats = stats
// //     }

// //     closeModal()

// //   } catch (err) {
// //     console.error('Connection failed:', err)
// //     alert(`Failed to connect ${activePlatform.value.name}. Please try again.`)
// //   } finally {
// //     isSubmitting.value = false
// //   }
// // }


// // ── Connect / Disconnect ──────────────────────────────────────────────────────
// async function togglePlatform(platform) {
//   if (platform.comingSoon && !platform.connected) {
//     alert(`${platform.name} OAuth is coming soon!`)
//     return
//   }

//   platform.loading = true

//   try {
//     if (!platform.connected) {
//       // ── Connect: افتح OAuth popup ──
//       // لو الـ backend عنده /api/connections/:platform/auth هيرجع OAuth URL
//       const data = await api.get(`/connections/${platform.name.toLowerCase()}/auth`)
//       if (data?.authUrl) {
//         // افتح الـ OAuth في popup
//         const popup = window.open(data.authUrl, 'oauth', 'width=600,height=700')
//         // استنى الـ popup يخلص
//         const timer = setInterval(async () => {
//           if (popup?.closed) {
//             clearInterval(timer)
//             // جيب الـ status بعد ما الـ OAuth يخلص
//             try {
//               const status = await api.get(`/connections/${platform.name.toLowerCase()}/status`)
//               platform.connected = status.connected
//               platform.handle    = status.handle || null
//               platform.stats     = status.stats  || []
//             } catch {}
//             platform.loading = false
//           }
//         }, 500)
//         return
//       }
//     } else {
//       // ── Disconnect ──
//       await api.delete(`/connections/${platform.name.toLowerCase()}`)
//       platform.connected = false
//       platform.handle    = null
//       platform.stats     = []
//     }
//   } catch (err) {
//     // لو الـ backend مش فيه /connections route بعد — بس غير الـ UI
//     platform.connected = !platform.connected
//   } finally {
//     platform.loading = false
//   }
// }

// async function connectMeta() {
//   // Get OAuth URL from backend
//   const { authUrl } = await api.get('/connections/meta/auth');
  
//   // Open popup
//   window.open(authUrl, 'meta-oauth', 'width=600,height=700');
// }
import { ref, onMounted, computed } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import api from '../api/client'

const socialPlatforms = ref([
  { name:'Instagram', icon:'📸', iconBg:'bg-pink-500/15', connected:true, handle:'@araby.coffee', permissions:['Read posts','Publish','Analytics'], stats:[{label:'Followers',value:'12.4K'},{label:'Posts',value:'234'},{label:'Eng. Rate',value:'4.2%'}] },
  { name:'Facebook',  icon:'📘', iconBg:'bg-blue-500/15', connected:true, handle:'Araby Coffee EG', permissions:['Read','Publish','Insights'], stats:[{label:'Likes',value:'8.7K'},{label:'Reach',value:'45K'},{label:'Posts',value:'189'}] },
  { name:'LinkedIn',  icon:'💼', iconBg:'bg-blue-700/15', connected:false, handle:null, permissions:[], stats:[] },
  { name:'Twitter/X', icon:'🐦', iconBg:'bg-sky-500/15',  connected:false, handle:null, permissions:[], stats:[] },
  { name:'TikTok',    icon:'🎵', iconBg:'bg-rose-500/15', connected:false, handle:null, permissions:[], stats:[] },
  { name:'YouTube',   icon:'▶️', iconBg:'bg-red-500/15',  connected:false, handle:null, permissions:[], stats:[] },
])

// The platformFields Data (for manual platforms like LinkedIn, etc.)
const platformFields = {
  LinkedIn: [
    { key: 'profileUrl', label: 'Profile URL', placeholder: 'https://linkedin.com/in/...', type: 'url' },
    { key: 'email', label: 'Email', placeholder: 'you@email.com', type: 'email' },
  ],
  'Twitter/X': [
    { key: 'username', label: 'Username', placeholder: '@yourhandle', type: 'text' },
    { key: 'email', label: 'Email', placeholder: 'you@email.com', type: 'email' },
  ],
  TikTok: [
    { key: 'username', label: 'Username', placeholder: '@youraccount', type: 'text' },
    { key: 'email', label: 'Email', placeholder: 'you@email.com', type: 'email' },
  ],
  YouTube: [
    { key: 'channelName', label: 'Channel Name', placeholder: 'Your Channel', type: 'text' },
    { key: 'email', label: 'Email', placeholder: 'you@email.com', type: 'email' },
  ],
}

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

<!-- the stepss to implement Meta OAuth connection:
1	Configure OAuth Redirect URI in Facebook Login for Business settings ✅
2	Copy App ID & Secret to your .env files ✅
3	Create a test user with Facebook Page + Instagram Business account
4	Implement backend OAuth routes
5	Update frontend to open OAuth popup
6	Test the connection
-->