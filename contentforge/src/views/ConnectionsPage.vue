<template>
  <AppLayout>
    <div class="p-7 max-w-4xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">Connections</h1>
        <p class="text-sm theme-sub mt-1">Connect your social platforms, database, and API keys to enable publishing and data persistence.</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 p-1 rounded-xl theme-card theme-border w-fit mb-8">
        <button v-for="tab in tabs" :key="tab" @click="activeTab=tab"
          class="px-4 py-2 rounded-lg text-sm transition-all"
          :class="activeTab===tab ? 'bg-blue-600 text-white' : 'theme-sub hover:theme-text'">
          {{ tab }}
        </button>
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

      <!-- ───── MONGODB TAB ───── -->
      <div v-if="activeTab==='MongoDB'">
        <div class="grid md:grid-cols-2 gap-6">

          <!-- Connection config -->
          <div class="rounded-2xl theme-surface theme-border p-6 space-y-5">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-xl">🍃</div>
              <div>
                <p class="font-medium theme-text">MongoDB Atlas</p>
                <div class="flex items-center gap-1.5">
                  <div class="w-1.5 h-1.5 rounded-full" :class="mongo.connected ? 'bg-green-400 animate-pulse' : 'bg-slate-600'"></div>
                  <span class="text-[11px]" :class="mongo.connected ? 'text-green-400' : 'theme-muted'">
                    {{ mongo.connected ? 'Connected · ' + mongo.cluster : 'Not connected' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-xs theme-sub mb-1.5 block">Connection String (URI)</label>
                <div class="relative">
                  <input :type="showUri ? 'text' : 'password'" v-model="mongo.uri"
                    class="w-full theme-input rounded-xl px-3 py-2.5 text-xs theme-text border focus:outline-none focus:border-blue-500/40 pr-10 font-mono"
                    style="border-color:var(--border)"
                    placeholder="mongodb+srv://user:pass@cluster.mongodb.net/contentforge"/>
                  <button @click="showUri=!showUri" class="absolute right-3 top-1/2 -translate-y-1/2 theme-muted hover:theme-text">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path v-if="!showUri" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs theme-sub mb-1.5 block">Database Name</label>
                  <input v-model="mongo.dbName" type="text"
                    class="w-full theme-input rounded-xl px-3 py-2.5 text-xs theme-text border focus:outline-none focus:border-blue-500/40"
                    style="border-color:var(--border)" placeholder="contentforge"/>
                </div>
                <div>
                  <label class="text-xs theme-sub mb-1.5 block">Region</label>
                  <select v-model="mongo.region" class="w-full theme-input rounded-xl px-3 py-2.5 text-xs theme-text border focus:outline-none" style="border-color:var(--border)">
                    <option>AWS · me-south-1 (Bahrain)</option>
                    <option>AWS · eu-south-1 (Milan)</option>
                    <option>GCP · europe-west6</option>
                  </select>
                </div>
              </div>

              <div class="flex gap-2">
                <button @click="testMongo" class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Test Connection
                </button>
                <button @click="saveMongo" class="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm hover:bg-green-500 transition-colors">
                  Save & Connect
                </button>
              </div>

              <div v-if="mongoTestResult" class="p-3 rounded-xl text-xs"
                :class="mongoTestResult==='ok' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'">
                {{ mongoTestResult==='ok' ? '✓ Connection successful — latency 42ms' : '✗ Connection failed. Check your URI and network.' }}
              </div>
            </div>
          </div>

          <!-- Collections & stats -->
          <div class="space-y-4">
            <div class="rounded-2xl theme-surface theme-border p-5">
              <p class="text-sm font-medium theme-text mb-4">Collections</p>
              <div class="space-y-2.5">
                <div v-for="col in mongo.collections" :key="col.name"
                  class="flex items-center justify-between p-3 rounded-xl theme-card theme-border">
                  <div class="flex items-center gap-2.5">
                    <span class="text-sm">{{ col.icon }}</span>
                    <div>
                      <p class="text-xs font-medium theme-text">{{ col.name }}</p>
                      <p class="text-[10px] theme-muted">{{ col.desc }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xs font-medium text-blue-400">{{ col.docs }}</p>
                    <p class="text-[10px] theme-muted">docs</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl theme-surface theme-border p-5">
              <p class="text-sm font-medium theme-text mb-3">RAG Vector Store</p>
              <div class="space-y-2">
                <div class="flex justify-between text-xs"><span class="theme-sub">Embedding model</span><span class="theme-text">Google text-embedding-004</span></div>
                <div class="flex justify-between text-xs"><span class="theme-sub">Total chunks</span><span class="text-blue-400 font-medium">47</span></div>
                <div class="flex justify-between text-xs"><span class="theme-sub">Last embedded</span><span class="theme-text">2 hrs ago</span></div>
                <div class="flex justify-between text-xs"><span class="theme-sub">Index status</span><span class="text-green-400">✓ Active</span></div>
              </div>
              <button class="w-full mt-4 py-2 rounded-xl bg-blue-600/10 text-blue-400 text-xs border border-blue-500/20 hover:bg-blue-600/20 transition-colors">
                Re-embed Brand Vault →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ───── API KEYS TAB ───── -->
      <div v-if="activeTab==='API Keys'">
        <div class="space-y-4">
          <div v-for="api in apiKeys" :key="api.name" class="rounded-2xl theme-surface theme-border p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center text-lg" :class="api.iconBg">{{ api.icon }}</div>
                <div>
                  <p class="font-medium theme-text text-sm">{{ api.name }}</p>
                  <p class="text-[11px] theme-muted">{{ api.desc }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full" :class="api.key ? 'bg-green-400' : 'bg-slate-600'"></div>
                <span class="text-[11px]" :class="api.key ? 'text-green-400' : 'theme-muted'">{{ api.key ? 'Configured' : 'Not set' }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input :type="api.show ? 'text' : 'password'" v-model="api.key"
                  class="w-full theme-input rounded-xl px-3 py-2.5 text-xs theme-text border focus:outline-none focus:border-blue-500/40 pr-10 font-mono"
                  style="border-color:var(--border)"
                  :placeholder="api.placeholder"/>
                <button @click="api.show=!api.show" class="absolute right-3 top-1/2 -translate-y-1/2 theme-muted hover:theme-text">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              <button class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs hover:bg-blue-500 transition-colors">Save</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ───── BRAND FORM TAB ───── -->
      <div v-if="activeTab==='Brand Form'">
        <div class="rounded-2xl theme-surface theme-border p-7 space-y-7">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-lg font-600 theme-text">Brand Onboarding Form</h2>
            <div class="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
              <div class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              Auto-saved to MongoDB Atlas
            </div>
          </div>

          <!-- Section: Basic Info -->
          <div>
            <h3 class="text-sm font-medium theme-text mb-4 flex items-center gap-2">🏷️ Basic Info</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div v-for="field in basicFields" :key="field.key">
                <label class="text-xs theme-sub mb-1.5 block">{{ field.label }}</label>
                <input v-model="brandForm[field.key]" :type="field.type||'text'"
                  class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40 transition-colors"
                  style="border-color:var(--border)" :placeholder="field.placeholder"/>
              </div>
            </div>
          </div>

          <!-- Section: Dialect & Language -->
          <div>
            <h3 class="text-sm font-medium theme-text mb-4 flex items-center gap-2">🌍 Dialect & Language</h3>
            <div class="grid md:grid-cols-3 gap-3">
              <div v-for="d in dialects" :key="d"
                @click="toggleDialect(d)"
                class="p-3 rounded-xl border cursor-pointer transition-all text-center text-sm"
                :class="brandForm.dialects.includes(d)
                  ? 'bg-blue-600/15 border-blue-500/30 text-blue-400'
                  : 'theme-card theme-border theme-sub hover:theme-text'">
                {{ d }}
              </div>
            </div>
          </div>

          <!-- Section: Brand Voice -->
          <div>
            <h3 class="text-sm font-medium theme-text mb-4 flex items-center gap-2">🎙️ Brand Voice</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs theme-sub mb-1.5 block">Tone of Voice</label>
                <div class="flex flex-wrap gap-2">
                  <button v-for="tone in tones" :key="tone" @click="toggleTone(tone)"
                    class="px-3 py-1.5 rounded-lg text-xs border transition-all"
                    :class="brandForm.tones.includes(tone)
                      ? 'bg-teal-600/15 border-teal-500/30 text-teal-400'
                      : 'theme-card theme-border theme-sub hover:theme-text'">
                    {{ tone }}
                  </button>
                </div>
              </div>
              <div>
                <label class="text-xs theme-sub mb-1.5 block">Topics to Avoid</label>
                <textarea v-model="brandForm.avoidTopics" rows="3"
                  class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40 resize-none"
                  style="border-color:var(--border)" placeholder="e.g. Politics, competitors, sensitive religious topics..."></textarea>
              </div>
            </div>
          </div>

          <!-- Section: Platforms -->
          <div>
            <h3 class="text-sm font-medium theme-text mb-4 flex items-center gap-2">📱 Target Platforms</h3>
            <div class="flex flex-wrap gap-2">
              <button v-for="p in platformOptions" :key="p.name" @click="togglePlatformForm(p.name)"
                class="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all"
                :class="brandForm.platforms.includes(p.name)
                  ? 'bg-blue-600/15 border-blue-500/30 text-blue-400'
                  : 'theme-card theme-border theme-sub hover:theme-text'">
                <span>{{ p.icon }}</span>{{ p.name }}
              </button>
            </div>
          </div>

          <!-- Section: File Upload -->
          <div>
            <h3 class="text-sm font-medium theme-text mb-4 flex items-center gap-2">📎 Upload Brand Assets</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <label class="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-blue-500/40 text-center"
                style="border-color:var(--border)">
                <span class="text-2xl mb-2">📄</span>
                <p class="text-sm font-medium theme-text mb-1">Brand Guidelines PDF</p>
                <p class="text-xs theme-muted">Drop PDF here or click to upload</p>
                <input type="file" class="hidden" accept=".pdf"/>
              </label>
              <label class="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-blue-500/40 text-center"
                style="border-color:var(--border)">
                <span class="text-2xl mb-2">🖼️</span>
                <p class="text-sm font-medium theme-text mb-1">Top 10 Past Posts</p>
                <p class="text-xs theme-muted">Screenshots or images</p>
                <input type="file" class="hidden" accept=".png,.jpg,.jpeg" multiple/>
              </label>
            </div>
          </div>

          <!-- Save button -->
          <div class="flex gap-3 pt-2 border-t" style="border-color:var(--border)">
            <button class="px-6 py-3 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">Reset Form</button>
            <button @click="saveBrandForm" class="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              💾 Save & Embed to MongoDB Atlas
            </button>
          </div>

          <div v-if="savedBrand" class="p-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-sm flex items-center gap-2">
            ✓ Brand saved and embedded to MongoDB Atlas successfully!
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
const tabs = ['Social Platforms', 'MongoDB', 'API Keys', 'Brand Form']
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

const mongo = ref({
  connected: true,
  cluster: 'cluster0.contentforge.mongodb.net',
  uri: '',
  dbName: 'contentforge',
  region: 'AWS · me-south-1 (Bahrain)',
  collections: [
    { name:'brands',         icon:'🏷️', desc:'Brand profiles & RAG vault', docs:'3' },
    { name:'calendars',      icon:'📅', desc:'Campaign calendars',          docs:'12' },
    { name:'posts',          icon:'📝', desc:'All generated posts',         docs:'284' },
    { name:'embeddings',     icon:'🧠', desc:'Vector embeddings',           docs:'47' },
    { name:'trends_cache',   icon:'🔥', desc:'Hourly scraped trends',       docs:'1.2K' },
    { name:'users',          icon:'👤', desc:'User accounts & auth',        docs:'1' },
  ]
})

function testMongo() {
  setTimeout(() => { mongoTestResult.value = 'ok' }, 800)
}
function saveMongo() {
  mongo.value.connected = true
  mongoTestResult.value = 'ok'
}

const apiKeys = ref([
  { name:'Google Gemini API', icon:'✨', iconBg:'bg-blue-500/15', desc:'LLM for content generation (Gemini 2.5 Flash)', key:'', show:false, placeholder:'AIza...' },
  { name:'Google Embedding API', icon:'🔢', iconBg:'bg-purple-500/15', desc:'text-embedding-004 for RAG vectorization', key:'', show:false, placeholder:'AIza...' },
  { name:'DALL-E 3 / OpenAI',    icon:'🎨', iconBg:'bg-teal-500/15',   desc:'Image generation per post card', key:'', show:false, placeholder:'sk-...' },
  { name:'MongoDB Atlas API',    icon:'🍃', iconBg:'bg-green-500/15',  desc:'Data API for direct REST access', key:'', show:false, placeholder:'API key...' },
])

const brandForm = ref({
  name:'Araby Coffee', industry:'F&B · Specialty Coffee', website:'arabycoffee.com',
  targetAudience:'Egyptian millennials 22–35', marketSize:'Egypt · UAE · KSA',
  dialects:['Egyptian Arabic'], tones:['Warm','Bold','Community-first'],
  avoidTopics:'', platforms:['Instagram','Facebook'],
})

const basicFields = [
  { key:'name',           label:'Brand Name',       placeholder:'e.g. Araby Coffee' },
  { key:'industry',       label:'Industry / Niche',  placeholder:'e.g. F&B, SaaS, Fashion' },
  { key:'website',        label:'Website',           placeholder:'yoursite.com' },
  { key:'targetAudience', label:'Target Audience',   placeholder:'e.g. Egyptian millennials 22–35' },
]
const dialects = ['Egyptian Arabic','Gulf Arabic','Levantine Arabic','Modern Standard Arabic','English','Bilingual AR+EN']
const tones    = ['Warm','Bold','Humorous','Professional','Inspirational','Casual','Community-first','Urgent']
const platformOptions = [
  { name:'Instagram', icon:'📸' }, { name:'Facebook', icon:'📘' }, { name:'LinkedIn', icon:'💼' },
  { name:'Twitter/X', icon:'🐦' }, { name:'TikTok', icon:'🎵' }, { name:'YouTube', icon:'▶️' },
]

function toggleDialect(d)      { const i=brandForm.value.dialects.indexOf(d); i===-1 ? brandForm.value.dialects.push(d) : brandForm.value.dialects.splice(i,1) }
function toggleTone(t)         { const i=brandForm.value.tones.indexOf(t);    i===-1 ? brandForm.value.tones.push(t)    : brandForm.value.tones.splice(i,1) }
function togglePlatformForm(p) { const i=brandForm.value.platforms.indexOf(p);i===-1 ? brandForm.value.platforms.push(p): brandForm.value.platforms.splice(i,1) }

function saveBrandForm() {
  savedBrand.value = false
  setTimeout(() => { savedBrand.value = true }, 600)
}
</script>