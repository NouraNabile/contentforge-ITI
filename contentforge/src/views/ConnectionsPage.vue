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

    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const activeTab = ref('Social Platforms')
// const tabs = ['Social Platforms', 'MongoDB', 'API Keys', 'Brand Form']
const showUri = ref(false)
const mongoTestResult = ref(null)
const savedBrand = ref(false)

const socialPlatforms = ref([
  { name:'Instagram', icon:'📸', iconBg:'bg-pink-500/15', connected:true, handle:'@araby.coffee', permissions:['Read posts','Publish','Analytics'], stats:[{label:'Followers',value:'12.4K'},{label:'Posts',value:'234'},{label:'Eng. Rate',value:'4.2%'}] },
  { name:'Facebook',  icon:'📘', iconBg:'bg-blue-500/15', connected:true, handle:'Araby Coffee EG', permissions:['Read','Publish','Insights'], stats:[{label:'Likes',value:'8.7K'},{label:'Reach',value:'45K'},{label:'Posts',value:'189'}] },
  { name:'LinkedIn',  icon:'💼', iconBg:'bg-blue-700/15', connected:false, handle:null, permissions:[], stats:[] },
  { name:'Twitter/X', icon:'🐦', iconBg:'bg-sky-500/15',  connected:false, handle:null, permissions:[], stats:[] },
  { name:'TikTok',    icon:'🎵', iconBg:'bg-rose-500/15', connected:false, handle:null, permissions:[], stats:[] },
  { name:'YouTube',   icon:'▶️', iconBg:'bg-red-500/15',  connected:false, handle:null, permissions:[], stats:[] },
])

function togglePlatform(p) { p.connected = !p.connected }

function testMongo() {
  setTimeout(() => { mongoTestResult.value = 'ok' }, 800)
}
function saveMongo() {
  mongo.value.connected = true
  mongoTestResult.value = 'ok'
}

</script>