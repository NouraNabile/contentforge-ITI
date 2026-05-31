<template>
  <AppLayout>
    <div class="flex flex-col h-full">

      <!-- Page toolbar -->
      <div class="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 theme-glass" style="border-color:var(--border)">
        <div>
          <h1 class="font-display text-lg font-600 theme-text">Content Calendar</h1>
          <p class="text-xs theme-sub mt-0.5">
            <template v-if="currentCalendar">
              {{ calendarDateRange }} · {{ currentCalendar.posts?.length || 0 }} posts planned
            </template>
            <template v-else>No calendar yet — generate your first plan</template>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 p-1 rounded-xl theme-card theme-border">
            <button v-for="f in filters" :key="f" @click="activeFilter=f"
              class="px-3 py-1.5 rounded-lg text-xs transition-all"
              :class="activeFilter===f ? 'bg-blue-600 text-white' : 'theme-sub hover:theme-text'">
              {{ f }}
            </button>
          </div>
          <span class="text-[11px] px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">✦ Ramadan Active</span>
          <button @click="showModal=true" class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Generate Plan
          </button>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden">

        <!-- Calendar area -->
        <div class="flex-1 overflow-auto p-6">
          <!-- Week headers -->
          <div class="grid grid-cols-7 gap-2 mb-3">
            <div v-for="d in weekDays" :key="d" class="text-center text-[11px] theme-muted font-medium py-1">{{ d }}</div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredWeeks.length === 0 && !loadingCalendar"
            class="flex flex-col items-center justify-center py-24 theme-sub gap-3">
            <svg class="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-sm">No calendar yet — click <strong class="theme-text">✦ Generate Plan</strong> to start</p>
          </div>

          <!-- Loading state -->
          <div v-if="loadingCalendar" class="flex flex-col items-center justify-center py-24 gap-3 theme-sub">
            <svg class="w-8 h-8 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p class="text-sm">Generating your calendar with Gemini AI…</p>
            <p class="text-xs opacity-60">This may take 10–20 seconds</p>
          </div>

          <!-- Weeks -->
          <div class="space-y-2">
            <div v-for="week in filteredWeeks" :key="week.id" class="grid grid-cols-7 gap-2">
              <div v-for="cell in week.cells" :key="cell.id"
                @click="cell.copy && selectPost(cell)"
                class="rounded-xl border transition-all min-h-[100px] p-2.5 flex flex-col"
                :class="[cell.cellClass, cell.copy ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default',
                  selectedPost?.id === cell.id ? 'ring-2 ring-blue-500/50' : '']"
                :style="cell.copy ? '' : 'border-color:var(--border)'">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[11px] font-medium" :class="cell.copy ? 'theme-text' : 'theme-muted'">{{ cell.date }}</span>
                  <span v-if="cell.platform" class="text-[9px] px-1.5 py-0.5 rounded font-medium" :class="platformBadge(cell.platform)">{{ cell.platform }}</span>
                </div>
                <p v-if="cell.copy" class="text-[10px] leading-tight theme-sub flex-1">{{ cell.copy }}</p>
                <p v-else-if="cell.date" class="text-[10px] theme-muted flex-1 flex items-center justify-center">—</p>
                <span v-if="cell.status" class="text-[9px] font-medium mt-1.5" :class="statusColor(cell.status)">{{ cell.status }}</span>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div v-if="filteredWeeks.length > 0" class="flex items-center gap-5 flex-wrap mt-5 pt-4 border-t" style="border-color:var(--border)">
            <p class="text-[11px] theme-muted font-medium">Status:</p>
            <div v-for="s in legend" :key="s.label" class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full" :class="s.dot"></div>
              <span class="text-[10px] theme-sub">{{ s.label }}</span>
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div class="w-64 shrink-0 border-l overflow-y-auto p-4 space-y-4" style="border-color:var(--border)">

          <!-- Post editor -->
          <div v-if="selectedPost" class="rounded-xl theme-surface theme-border p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-medium theme-text">Edit Post</p>
              <button @click="selectedPost=null" class="theme-muted hover:theme-text">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="flex gap-1.5 mb-3 flex-wrap">
              <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="platformBadge(selectedPost.platform)">{{ selectedPost.platform }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full theme-card theme-border theme-muted">Arabic (EGY)</span>
            </div>
            <textarea v-model="editCopy" rows="5"
              class="w-full theme-input rounded-lg p-2.5 text-xs theme-text border focus:outline-none focus:border-blue-500/40 resize-none leading-relaxed"
              style="border-color:var(--border)"></textarea>
            <div class="mt-2 p-2 rounded-lg theme-card theme-border">
              <p class="text-[9px] theme-muted mb-1">Hashtags</p>
              <p class="text-[10px] text-blue-400">{{ selectedPost.hashtags?.join(' ') || '#القهوة #رمضان2026 #مصر' }}</p>
            </div>
            <!-- Status picker -->
            <div class="mt-3 space-y-1">
              <p class="text-[10px] theme-muted mb-2">Status</p>
              <button v-for="s in statuses" :key="s.label"
                @click="selectedPost.status = s.label"
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors text-left border"
                :class="selectedPost.status===s.label ? 'bg-blue-600/15 text-blue-400 border-blue-500/20' : 'theme-sub border-transparent hover:theme-text'">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="s.dot"></div>{{ s.label }}
              </button>
            </div>
            <!-- Save feedback -->
            <p v-if="saveMsg" class="text-[10px] text-green-400 mt-2 text-center">{{ saveMsg }}</p>
            <button @click="savePost" :disabled="saving"
              class="w-full mt-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors disabled:opacity-50">
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>

          <!-- Empty state -->
          <div v-else class="rounded-xl theme-card theme-border p-4 text-center">
            <p class="text-xs theme-muted">Click any post card to edit it here</p>
          </div>

          <!-- A/B Critic -->
          <div v-if="selectedPost" class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-amber-400">⚡</span>
              <p class="text-xs font-medium text-amber-300">A/B Critic Agent</p>
            </div>
            <p v-if="!variantB" class="text-[11px] theme-sub leading-relaxed mb-3">Generate a smarter version of this post using AI.</p>
            <div v-if="variantB" class="p-2.5 rounded-lg theme-card theme-border mb-3">
              <p class="text-[10px] theme-sub italic leading-relaxed">{{ variantB }}</p>
            </div>
            <div v-if="variantB" class="flex gap-2 mb-2">
              <button @click="applyVariantB" class="flex-1 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] hover:bg-amber-500/25 border border-amber-500/20 transition-colors">Use B</button>
              <button @click="variantB=null" class="flex-1 py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors">Keep A</button>
            </div>
            <button @click="generateVariantB" :disabled="loadingVariant"
              class="w-full py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors">
              {{ loadingVariant ? 'Generating…' : '✦ Generate Variant B' }}
            </button>
          </div>

          <!-- Trends -->
          <div class="rounded-xl theme-surface theme-border p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-medium theme-text">🔥 Trending Now</p>
              <span v-if="trendsLastUpdated" class="text-[9px] theme-muted">{{ trendsLastUpdated }}</span>
            </div>
            <div class="space-y-2">
              <div v-for="t in trends" :key="t.tag" class="flex items-center justify-between">
                <span class="text-[11px] theme-sub">{{ t.tag }}</span>
                <span class="text-[10px]" :class="t.color">{{ t.change }}</span>
              </div>
            </div>
            <button @click="injectTrend"
              class="w-full mt-3 py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors">
              Inject into next post →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="theme-surface rounded-2xl theme-border max-w-lg w-full p-7 theme-shadow">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-xl font-600 theme-text">Generate New Plan</h2>
          <button @click="showModal=false" class="theme-muted hover:theme-text"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>

        <!-- No brand warning -->
        <div v-if="!brandId" class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          ⚠️ No brand found. Please go to <strong>Brand Vault</strong> first and save your brand.
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs theme-sub mb-1.5 block">Campaign Brief</label>
            <textarea v-model="brief" rows="4" placeholder="e.g. Ramadan iftar campaign for our cold brew line…"
              class="w-full theme-input rounded-xl p-3.5 text-sm theme-text border resize-none focus:outline-none focus:border-blue-500/40"
              style="border-color:var(--border)"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs theme-sub mb-1.5 block">Dialect</label>
              <select v-model="selectedDialect" class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none" style="border-color:var(--border)">
                <option>Egyptian Arabic</option><option>Gulf Arabic</option><option>Levantine Arabic</option><option>Bilingual</option>
              </select>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">Duration</label>
              <select v-model="selectedDuration" class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none" style="border-color:var(--border)">
                <option>2 Weeks</option><option>1 Week</option><option>1 Month</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs theme-sub mb-1.5 block">Platforms</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="p in platforms" :key="p.name" @click="p.on=!p.on"
                class="px-3 py-1.5 rounded-lg text-xs border transition-all"
                :class="p.on ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'theme-border theme-muted hover:theme-text'">
                {{ p.name }}
              </button>
            </div>
          </div>
          <div class="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p class="text-[11px] text-amber-400 font-medium mb-1">✦ Trends being injected</p>
            <p class="text-[11px] theme-muted">#رمضان_كريم (+340%) · Cold brew Egypt (+210%)</p>
          </div>
          <p v-if="generateError" class="text-xs text-rose-400">{{ generateError }}</p>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showModal=false" class="flex-1 py-3 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">Cancel</button>
          <button @click="generateCalendar" :disabled="generating || !brief || !brandId"
            class="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50">
            {{ generating ? 'Generating…' : '✦ Generate Calendar' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import calendarApi from '../api/calendarApi'
import postsApi from '../api/postsApi'
import api from '../api/client'

// ── State ─────────────────────────────────────────────────────────────────────
const brandId        = ref(localStorage.getItem('cf_brandId') || '')
const activeFilter   = ref('All')
const filters        = ['All','Draft','Pending','Approved','Scheduled']
const selectedPost   = ref(null)
const editCopy       = ref('')
const showModal      = ref(false)
const brief          = ref('')
const selectedDialect  = ref('Egyptian Arabic')
const selectedDuration = ref('2 Weeks')
const generating     = ref(false)
const generateError  = ref('')
const loadingCalendar = ref(false)
const saving         = ref(false)
const saveMsg        = ref('')
const variantB       = ref(null)
const loadingVariant = ref(false)
const currentCalendar = ref(null)
const calendarWeeks  = ref([])

const weekDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const statuses = [
  { label:'Draft',     dot:'bg-slate-500' },
  { label:'Pending',   dot:'bg-amber-400' },
  { label:'Approved',  dot:'bg-green-400' },
  { label:'Scheduled', dot:'bg-blue-400' },
  { label:'Published', dot:'bg-teal-400' },
]
const legend = [
  { label:'Approved',  dot:'bg-green-400' },
  { label:'Scheduled', dot:'bg-blue-400' },
  { label:'Pending',   dot:'bg-amber-400' },
  { label:'Draft',     dot:'bg-slate-500' },
  { label:'Rest day',  dot:'bg-slate-700' },
]
const trends = ref([])
const trendsLastUpdated = ref('')
const platforms = ref([
  { name:'Instagram', on:true  },
  { name:'Facebook',  on:true  },
  { name:'LinkedIn',  on:false },
  { name:'Twitter/X', on:false },
  { name:'TikTok',    on:false },
])

// ── Computed ──────────────────────────────────────────────────────────────────

// Filter calendar cells by active status filter
const filteredWeeks = computed(() => {
  if (activeFilter.value === 'All') return calendarWeeks.value
  return calendarWeeks.value.map(week => ({
    ...week,
    cells: week.cells.map(cell =>
      (!cell.status || cell.status === activeFilter.value) ? cell : { ...cell, copy: null, status: null, platform: null, cellClass: 'bg-transparent' }
    )
  })).filter(week => week.cells.some(c => c.copy))
})

const calendarDateRange = computed(() => {
  if (!currentCalendar.value) return ''
  const start = new Date(currentCalendar.value.startDate)
  const end   = new Date(currentCalendar.value.endDate)
  return `${start.toLocaleDateString('en-GB', { day:'numeric', month:'short' })} – ${end.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}`
})

// ── Load on mount ─────────────────────────────────────────────────────────────
onMounted(async () => {
  // 1. جيب الـ trends من الـ API
  try {
    const data = await api.get('/trends')
    trends.value = data.trends.map(t => ({
      ...t,
      color: t.velocity > 200 ? 'text-green-400' : 'text-teal-400'
    }))
    trendsLastUpdated.value = new Date(data.lastUpdated).toLocaleTimeString('ar-EG')
  } catch {
    // fallback لو الـ backend مش شغال
    trends.value = [
      { tag:'#رمضان_كريم',     change:'+340%', color:'text-green-400' },
      { tag:'#قهوة_الصباح',    change:'+89%',  color:'text-teal-400' },
      { tag:'Cold brew Egypt', change:'+210%', color:'text-green-400' },
      { tag:'#سحور',           change:'+167%', color:'text-teal-400' },
    ]
  }

  // 2. جيب آخر calendar من الـ DB
  if (!brandId.value) return
  try {
    const calendars = await calendarApi.getBrandCalendars(brandId.value)
    if (calendars?.length) {
      const latest = await calendarApi.getCalendar(calendars[0]._id)
      currentCalendar.value = latest
      calendarWeeks.value = buildWeeks(latest.posts || [])
    }
  } catch {
    // No calendar yet — that's fine
  }
})

// ── Generate Calendar ─────────────────────────────────────────────────────────
async function generateCalendar() {
  if (!brief.value || !brandId.value) return
  generateError.value = ''
  generating.value = true
  loadingCalendar.value = true
  showModal.value = false
  try {
    const result = await calendarApi.generate({
      brandId: brandId.value,
      brief: brief.value,
      dialect: selectedDialect.value,
      platforms: platforms.value.filter(p => p.on).map(p => p.name),
    })
    currentCalendar.value = result.calendar
    calendarWeeks.value = buildWeeks(result.posts || [])
    brief.value = ''
  } catch (err) {
    generateError.value = err.message || 'Generation failed — is your backend running?'
    showModal.value = true
  } finally {
    generating.value = false
    loadingCalendar.value = false
  }
}

// ── Build weeks grid from flat posts array ────────────────────────────────────
function buildWeeks(posts) {
  if (!posts.length) return []
  // Sort by scheduledDate
  const sorted = [...posts].sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
  const weeks = []
  for (let i = 0; i < sorted.length; i += 7) {
    const chunk = sorted.slice(i, i + 7)
    // Pad to 7 cells if needed
    while (chunk.length < 7) chunk.push({ _id: `empty-${i}-${chunk.length}`, empty: true })
    weeks.push({
      id: i,
      cells: chunk.map(p => p.empty
        ? { id: p._id, date: '', platform: null, copy: null, status: null, hashtags: [], cellClass: 'bg-transparent' }
        : {
            id: p._id,
            date: new Date(p.scheduledDate).getDate().toString(),
            platform: (p.platform || '').slice(0, 2).toUpperCase(),
            copy: p.copyAR || p.copy || '',
            status: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1).replace('_', ' ') : 'Draft',
            hashtags: p.hashtags || [],
            cellClass: statusToClass(p.status),
          }
      )
    })
  }
  return weeks
}

function statusToClass(s) {
  return {
    approved:       'border-green-500/25 bg-green-500/5',
    scheduled:      'border-blue-500/25 bg-blue-500/5',
    pending_review: 'border-amber-500/20 bg-amber-500/5',
    draft:          'theme-card',
  }[s] || 'theme-card'
}

// ── Post editor ───────────────────────────────────────────────────────────────
function selectPost(cell) {
  selectedPost.value = cell
  editCopy.value = cell.copy
  variantB.value = null
  saveMsg.value = ''
}

async function savePost() {
  if (!selectedPost.value) return
  saving.value = true
  saveMsg.value = ''
  // Update local state immediately
  selectedPost.value.copy = editCopy.value
  selectedPost.value.cellClass = statusToClass(selectedPost.value.status.toLowerCase().replace(' ', '_'))
  try {
    await postsApi.updatePost(selectedPost.value.id, {
      copyAR: editCopy.value,
      status: selectedPost.value.status.toLowerCase().replace(' ', '_'),
    })
    saveMsg.value = '✓ Saved'
    setTimeout(() => saveMsg.value = '', 2000)
  } catch {
    saveMsg.value = '✓ Saved locally'
    setTimeout(() => saveMsg.value = '', 2000)
  } finally {
    saving.value = false
  }
}

// ── A/B Variant ───────────────────────────────────────────────────────────────
async function generateVariantB() {
  if (!selectedPost.value) return
  loadingVariant.value = true
  variantB.value = null
  try {
    const result = await postsApi.generateVariantB(selectedPost.value.id)
    variantB.value = result.copyAR || result.copyEN || 'No variant generated'
  } catch (err) {
    variantB.value = 'Could not generate variant — backend offline?'
  } finally {
    loadingVariant.value = false
  }
}

async function applyVariantB() {
  if (!selectedPost.value || !variantB.value) return
  editCopy.value = variantB.value
  selectedPost.value.copy = variantB.value
  variantB.value = null
  try {
    await postsApi.applyVariantB(selectedPost.value.id)
  } catch { /* local update still applied */ }
}

// ── Trend injection ───────────────────────────────────────────────────────────
function injectTrend() {
  if (!selectedPost.value) return
  const topTrend = trends.value[0]?.tag
  if (!editCopy.value.includes(topTrend)) {
    editCopy.value = editCopy.value + ' ' + topTrend
    selectedPost.value.copy = editCopy.value
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function platformBadge(p) {
  return { IG:'bg-pink-500/20 text-pink-400', FB:'bg-blue-500/20 text-blue-400', LI:'bg-blue-700/20 text-blue-300', TW:'bg-sky-500/20 text-sky-400', TI:'bg-rose-500/20 text-rose-400' }[p] || 'bg-slate-500/20 text-slate-400'
}
function statusColor(s) {
  return { Approved:'text-green-400', Scheduled:'text-blue-400', Pending:'text-amber-400', 'Pending Review':'text-amber-400', Draft:'text-slate-500', Published:'text-teal-400' }[s] || 'text-slate-500'
}
</script>