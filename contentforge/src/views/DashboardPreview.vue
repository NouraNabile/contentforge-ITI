<template>
  <AppLayout>
    <div class="flex flex-col h-full">

      <!-- Page toolbar -->
      <div class="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 theme-glass" style="border-color:var(--border)">
        <div>
          <h1 class="font-display text-lg font-600 theme-text">Content Calendar</h1>
          <p class="text-xs theme-sub mt-0.5">May 26 – June 8, 2026 · 14 posts planned</p>
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
          <!-- Weeks -->
          <div class="space-y-2">
            <div v-for="week in calendarWeeks" :key="week.id" class="grid grid-cols-7 gap-2">
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
          <div class="flex items-center gap-5 flex-wrap mt-5 pt-4 border-t" style="border-color:var(--border)">
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
              <p class="text-[10px] text-blue-400">#القهوة #رمضان2026 #مصر</p>
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
            <button class="w-full mt-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors">Save Changes</button>
          </div>

          <!-- Empty state -->
          <div v-else class="rounded-xl theme-card theme-border p-4 text-center">
            <p class="text-xs theme-muted">Click any post card to edit it here</p>
          </div>

          <!-- A/B Critic -->
          <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-amber-400">⚡</span>
              <p class="text-xs font-medium text-amber-300">A/B Critic Agent</p>
            </div>
            <p class="text-[11px] theme-sub leading-relaxed mb-3">Version B leads with the offer — typically 23% higher engagement on Egyptian IG.</p>
            <div class="p-2.5 rounded-lg theme-card theme-border mb-3">
              <p class="text-[10px] theme-sub italic leading-relaxed">اشتري اتنين، جيب واحد مجاناً ☕</p>
            </div>
            <div class="flex gap-2">
              <button class="flex-1 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] hover:bg-amber-500/25 border border-amber-500/20 transition-colors">Use B</button>
              <button class="flex-1 py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors">Keep A</button>
            </div>
          </div>

          <!-- Trends -->
          <div class="rounded-xl theme-surface theme-border p-4">
            <p class="text-xs font-medium theme-text mb-3">🔥 Trending Now</p>
            <div class="space-y-2">
              <div v-for="t in trends" :key="t.tag" class="flex items-center justify-between">
                <span class="text-[11px] theme-sub">{{ t.tag }}</span>
                <span class="text-[10px]" :class="t.color">{{ t.change }}</span>
              </div>
            </div>
            <button class="w-full mt-3 py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors">Inject into next post →</button>
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
              <select class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none" style="border-color:var(--border)">
                <option>Egyptian Arabic</option><option>Gulf Arabic</option><option>Levantine Arabic</option><option>Bilingual</option>
              </select>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">Duration</label>
              <select class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none" style="border-color:var(--border)">
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
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showModal=false" class="flex-1 py-3 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">Cancel</button>
          <button @click="showModal=false" class="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">✦ Generate Calendar</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const activeFilter = ref('All')
const filters = ['All','Draft','Pending','Approved','Scheduled']
const selectedPost = ref(null)
const editCopy = ref('')
const showModal = ref(false)
const brief = ref('')

const weekDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const calendarWeeks = ref([
  { id:1, cells:[
    { id:1,  date:'26', platform:'IG', copy:'قهوتك المفضلة الآن بطعم رمضان ☕ اللي بيشتري اتنين يجيب واحد مجاناً', status:'Approved', cellClass:'border-green-500/25 bg-green-500/5' },
    { id:2,  date:'27', platform:'FB', copy:'Family iftar moments, powered by your morning brew 👨‍👩‍👧‍👦', status:'Scheduled', cellClass:'border-blue-500/25 bg-blue-500/5' },
    { id:3,  date:'28', platform:'IG', copy:'New cold brew flavors drop tomorrow — which one are you trying first?', status:'Pending', cellClass:'border-amber-500/20 bg-amber-500/5' },
    { id:4,  date:'29', platform:null, copy:null, status:null, cellClass:'bg-transparent' },
    { id:5,  date:'30', platform:'LI', copy:'How we built an Arabic-first coffee brand in 18 months.', status:'Draft', cellClass:'theme-card' },
    { id:6,  date:'31', platform:'IG', copy:'اختار طعمك المفضل 🎯 صوت في الكومنتس', status:'Draft', cellClass:'theme-card' },
    { id:7,  date:'1',  platform:null, copy:null, status:null, cellClass:'bg-transparent' },
  ]},
  { id:2, cells:[
    { id:8,  date:'2',  platform:'IG', copy:'Customer of the week: شاهد تجربته مع قهوة عربي ⭐', status:'Approved', cellClass:'border-green-500/25 bg-green-500/5' },
    { id:9,  date:'3',  platform:'IG', copy:'Tip: قهوتك بتبقى أحسن لما بتعملها بالماية البارده أول', status:'Scheduled', cellClass:'border-blue-500/25 bg-blue-500/5' },
    { id:10, date:'4',  platform:null, copy:null, status:null, cellClass:'bg-transparent' },
    { id:11, date:'5',  platform:'IG', copy:'2 for 1 weekend promo — Saturday and Sunday only 🎉', status:'Pending', cellClass:'border-amber-500/20 bg-amber-500/5' },
    { id:12, date:'6',  platform:'LI', copy:'Weekly roundup: what we learned from 10,000 Arabic posts this Ramadan.', status:'Draft', cellClass:'theme-card' },
    { id:13, date:'7',  platform:'IG', copy:'ترند الأسبوع 🔥 هل جربت قهوة الصباح معانا؟', status:'Draft', cellClass:'theme-card' },
    { id:14, date:'8',  platform:null, copy:null, status:null, cellClass:'bg-transparent' },
  ]},
])

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

const trends = [
  { tag:'#رمضان_كريم',  change:'+340%', color:'text-green-400' },
  { tag:'#قهوة_الصباح', change:'+89%',  color:'text-teal-400' },
  { tag:'Cold brew Egypt', change:'+210%', color:'text-green-400' },
  { tag:'#سحور',        change:'+167%', color:'text-teal-400' },
]

const platforms = ref([
  { name:'Instagram', on:true }, { name:'Facebook', on:true },
  { name:'LinkedIn',  on:false}, { name:'Twitter/X', on:false}, { name:'TikTok', on:false },
])

function selectPost(cell) { selectedPost.value = cell; editCopy.value = cell.copy }

function platformBadge(p) {
  return { IG:'bg-pink-500/20 text-pink-400', FB:'bg-blue-500/20 text-blue-400', LI:'bg-blue-700/20 text-blue-300', TW:'bg-sky-500/20 text-sky-400' }[p] || 'bg-slate-500/20 text-slate-400'
}
function statusColor(s) {
  return { Approved:'text-green-400', Scheduled:'text-blue-400', Pending:'text-amber-400', Draft:'text-slate-500', Published:'text-teal-400' }[s] || 'text-slate-500'
}
</script>
