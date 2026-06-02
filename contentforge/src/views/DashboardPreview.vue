<template>
  <AppLayout>
    <div class="flex flex-col h-full">
      <!-- Page toolbar -->
      <div class="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 theme-glass"
        style="border-color: var(--border)">
        <div>
          <h1 class="font-display text-lg font-600 theme-text">
            Content Calendar
          </h1>
          <p class="text-xs theme-sub mt-0.5">
            <template v-if="currentCalendar">
              {{ calendarDateRange }} ·
              {{ currentCalendar.posts?.length || 0 }} posts planned
            </template>
            <template v-else>No calendar yet — generate your first plan</template>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Top trend badge — من DB مش هاردكود -->
          <span v-if="topTrend"
            class="text-[11px] px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-default"
            :title="`Trending ${topTrend.change}`">
            ✦ {{ topTrend.tag }}
          </span>

          <!-- Calendar actions — بتظهر بس لو في calendar -->
          <template v-if="currentCalendar">
            <!-- Approve Plan -->
            <button @click="approvePlan" :disabled="approving"
              class="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ approving ? "Approving…" : "Approve Plan" }}
            </button>
            <!-- Regenerate -->
            <button @click="openRegenerate"
              class="px-3 py-2 rounded-xl theme-card theme-border theme-sub text-xs hover:theme-text transition-colors flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
            <!-- Delete -->
            <button @click="confirmDelete"
              class="px-3 py-2 rounded-xl bg-rose-600/10 text-rose-400 border border-rose-500/20 text-xs hover:bg-rose-600/20 transition-colors flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </template>

          <!-- Generate -->
          <button @click="showModal = true"
            class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Generate Plan
          </button>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Calendar area -->
        <div class="flex-1 overflow-auto p-6">
          <div class="grid grid-cols-7 gap-2 mb-3">
            <div v-for="d in weekDays" :key="d" class="text-center text-[11px] theme-muted font-medium py-1">
              {{ d }}
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredWeeks.length === 0 && !loadingCalendar"
            class="flex flex-col items-center justify-center py-24 theme-sub gap-3">
            <svg class="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm">
              No calendar yet — click
              <strong class="theme-text">✦ Generate Plan</strong> to start
            </p>
          </div>

          <!-- Loading state -->
          <div v-if="loadingCalendar" class="flex flex-col items-center justify-center py-24 gap-3 theme-sub">
            <svg class="w-8 h-8 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p class="text-sm">Generating your calendar with Gemini AI…</p>
            <p class="text-xs opacity-60">This usually takes 20–40 seconds</p>
          </div>

          <!-- Weeks -->
          <div class="space-y-2">
            <div v-for="week in filteredWeeks" :key="week.id" class="grid grid-cols-7 gap-2">
              <div v-for="cell in week.cells" :key="cell.id" :draggable="!!cell.copy"
                @dragstart="cell.copy && onDragStart(cell)" @dragover.prevent
                @dragenter="cell.copy && (dragOverId = cell.id)" @dragleave="dragOverId = null"
                @drop="cell.copy && onDrop(cell)" @click="cell.copy && selectPost(cell)"
                class="rounded-xl border transition-all min-h-[100px] p-2.5 flex flex-col" :class="[
                  cell.cellClass,
                  cell.copy ? 'cursor-grab hover:scale-[1.02]' : 'cursor-default',
                  selectedPost?.id === cell.id ? 'ring-2 ring-blue-500/50' : '',
                  dragOverId === cell.id ? 'ring-2 ring-amber-400/50 scale-[1.02]' : ''
                ]" :style="cell.copy ? '' : 'border-color:var(--border)'">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[11px] font-medium" :class="cell.copy ? 'theme-text' : 'theme-muted'">{{ cell.date
                  }}</span>
                  <span v-if="cell.platform" class="text-[9px] px-1.5 py-0.5 rounded font-medium"
                    :class="platformBadge(cell.platform)">{{ cell.platform }}</span>
                </div>
                <p v-if="cell.copy" class="text-[10px] leading-tight theme-sub flex-1">
                  {{ cell.copy }}
                </p>
                <p v-else-if="cell.date" class="text-[10px] theme-muted flex-1 flex items-center justify-center">
                  —
                </p>
                <span v-if="cell.status" class="text-[9px] font-medium mt-1.5" :class="statusColor(cell.status)">{{
                  cell.status }}</span>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div v-if="filteredWeeks.length > 0" class="flex items-center gap-5 flex-wrap mt-5 pt-4 border-t"
            style="border-color: var(--border)">
            <p class="text-[11px] theme-muted font-medium">Status:</p>
            <div v-for="s in legend" :key="s.label" class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full" :class="s.dot"></div>
              <span class="text-[10px] theme-sub">{{ s.label }}</span>
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div class="w-64 shrink-0 border-l overflow-y-auto p-4 space-y-4" style="border-color: var(--border)">
          <!-- Post editor -->
          <div v-if="selectedPost" class="rounded-xl theme-surface theme-border p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-medium theme-text">Edit Post</p>
              <button @click="selectedPost = null" class="theme-muted hover:theme-text">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex gap-1.5 mb-3 flex-wrap">
              <span class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                :class="platformBadge(selectedPost.platform)">{{
                  selectedPost.platform }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full theme-card theme-border theme-muted">{{
                selectedPost.dialect
                || "Arabic" }}</span>
            </div>
            <textarea v-model="editCopy" rows="5"
              class="w-full theme-input rounded-lg p-2.5 text-xs theme-text border focus:outline-none focus:border-blue-500/40 resize-none leading-relaxed"
              style="border-color: var(--border)"></textarea>
            <div class="mt-2 p-2 rounded-lg theme-card theme-border">
              <p class="text-[9px] theme-muted mb-1">Hashtags</p>
              <p class="text-[10px] text-blue-400">
                {{ selectedPost.hashtags?.join(" ") || "—" }}
              </p>
            </div>
            <div class="mt-3 space-y-1">
              <p class="text-[10px] theme-muted mb-2">Status</p>
              <button v-for="s in statuses" :key="s.label" @click="selectedPost.status = s.label"
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors text-left border"
                :class="selectedPost.status === s.label
                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/20'
                  : 'theme-sub border-transparent hover:theme-text'
                  ">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="s.dot"></div>
                {{ s.label }}
              </button>
            </div>
            <p v-if="saveMsg" class="text-[10px] text-green-400 mt-2 text-center">
              {{ saveMsg }}
            </p>
            <button @click="savePost" :disabled="saving"
              class="w-full mt-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors disabled:opacity-50">
              {{ saving ? "Saving…" : "Save Changes" }}
            </button>
          </div>
          <div v-else class="rounded-xl theme-card theme-border p-4 text-center">
            <p class="text-xs theme-muted">
              Click any post card to edit it here
            </p>
          </div>

          <!-- A/B Critic -->
          <div v-if="selectedPost" class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-amber-400">⚡</span>
              <p class="text-xs font-medium text-amber-300">A/B Critic Agent</p>
            </div>
            <p v-if="!variantB" class="text-[11px] theme-sub leading-relaxed mb-3">
              Generate a smarter version of this post using AI.
            </p>
            <div v-if="variantB" class="p-2.5 rounded-lg theme-card theme-border mb-3">
              <p class="text-[10px] theme-sub italic leading-relaxed">
                {{ variantB }}
              </p>
            </div>
            <div v-if="variantB" class="flex gap-2 mb-2">
              <button @click="applyVariantB"
                class="flex-1 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] hover:bg-amber-500/25 border border-amber-500/20 transition-colors">
                Use B
              </button>
              <button @click="variantB = null"
                class="flex-1 py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors">
                Keep A
              </button>
            </div>
            <button @click="generateVariantB" :disabled="loadingVariant"
              class="w-full py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors">
              {{ loadingVariant ? "Generating…" : "✦ Generate Variant B" }}
            </button>
          </div>

          <!-- Trends -->
          <div class="rounded-xl theme-surface theme-border p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-medium theme-text">🔥 Trending Now</p>
              <span v-if="trendsLastUpdated" class="text-[9px] theme-muted">{{
                trendsLastUpdated
              }}</span>
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

    <!-- ── Generate / Regenerate Modal ── -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="theme-surface rounded-2xl theme-border max-w-lg w-full p-7 theme-shadow">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-xl font-600 theme-text">
            {{ isRegenerate ? "Regenerate Calendar" : "Generate New Plan" }}
          </h2>
          <button @click="showModal = false" class="theme-muted hover:theme-text">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="isRegenerate"
          class="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
          ⚠️ This will delete the current calendar and generate a new one.
        </div>

        <div v-if="!brandId" class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          ⚠️ No brand found. Please go to <strong>Brand Vault</strong> first.
        </div>

        <div class="space-y-4">
          <!-- Brief -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">Campaign Brief</label>
            <textarea v-model="brief" rows="3" placeholder="e.g. Ramadan iftar campaign for our cold brew line…"
              class="w-full theme-input rounded-xl p-3.5 text-sm theme-text border resize-none focus:outline-none focus:border-blue-500/40"
              style="border-color: var(--border)"></textarea>
          </div>

          <!-- Dialect + Start Date -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs theme-sub mb-1.5 block">Dialect</label>
              <select v-model="selectedDialect"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none"
                style="border-color: var(--border)">
                <option>Egyptian Arabic</option>
                <option>Gulf Arabic</option>
                <option>Levantine Arabic</option>
                <option>Modern Standard Arabic</option>
                <option>Bilingual AR+EN</option>
              </select>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">Start Date</label>
              <input type="date" v-model="startDate"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none"
                style="border-color: var(--border)" :min="todayStr()" />
            </div>
          </div>

          <!-- End Date -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">End Date</label>
            <input type="date" v-model="endDate"
              class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none"
                style="border-color: var(--border)" :min="startDate || todayStr()" />
            <p class="text-[10px] theme-muted mt-1">
              {{ durationLabel }}
            </p>
          </div>

          <!-- Platforms -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">Platforms</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="p in platforms" :key="p.name" @click="p.on = !p.on"
                class="px-3 py-1.5 rounded-lg text-xs border transition-all" :class="p.on
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                  : 'theme-border theme-muted hover:theme-text'
                  ">
                {{ p.name }}
              </button>
            </div>
          </div>

          <!-- Trends preview -->
          <div v-if="trends.length" class="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p class="text-[11px] text-amber-400 font-medium mb-1">
              ✦ Trends being injected
            </p>
            <p class="text-[11px] theme-muted">
              {{
                trends
                  .slice(0, 3)
                  .map((t) => `${t.tag} (${t.change})`)
                  .join(" · ")
              }}
            </p>
          </div>

          <p v-if="generateError" class="text-xs text-rose-400">
            {{ generateError }}
          </p>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="showModal = false"
            class="flex-1 py-3 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">
            Cancel
          </button>
          <button @click="doGenerate" :disabled="generating || !brief || !brandId || !startDate || !endDate
            "
            class="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50">
            {{
              generating
                ? "Generating… (may take ~40s)"
                : isRegenerate
                  ? "↺ Regenerate"
                  : "✦ Generate Calendar"
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirm Dialog ── -->
    <div v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="theme-surface rounded-2xl theme-border max-w-sm w-full p-6 theme-shadow">
        <h2 class="font-display text-lg font-600 theme-text mb-2">
          Delete Calendar?
        </h2>
        <p class="text-sm theme-sub mb-6">
          This will permanently delete the calendar and all its posts. This
          cannot be undone.
        </p>
        <div class="flex gap-3">
          <button @click="showDeleteConfirm = false"
            class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">
            Cancel
          </button>
          <button @click="deleteCalendar" :disabled="deleting"
            class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 transition-colors disabled:opacity-50">
            {{ deleting ? "Deleting…" : "Delete" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Approve success toast ── -->
    <div v-if="approveMsg"
      class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-medium shadow-lg">
      ✓ {{ approveMsg }}
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AppLayout from "../components/AppLayout.vue";
import calendarApi from "../api/calendarApi";
import postsApi from "../api/postsApi";
import api from "../api/client";
import { useCalendarStore } from '../stores/calendarStore'

// ── State ─────────────────────────────────────────────────────────────────────
const brandId = ref(localStorage.getItem("cf_brandId") || "");
const activeFilter = ref("All");
const selectedPost = ref(null);
const editCopy = ref("");
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const isRegenerate = ref(false);
const brief = ref("");
const selectedDialect = ref("Egyptian Arabic");
const startDate = ref(todayStr());
const endDate = ref(twoWeeksStr());
const generating = ref(false);
const generateError = ref("");
const loadingCalendar = ref(false);
const saving = ref(false);
const saveMsg = ref("");
const approving = ref(false);
const approveMsg = ref("");
const deleting = ref(false);
const variantB = ref(null);
const loadingVariant = ref(false);
const currentCalendar = ref(null);
const calendarWeeks = ref([]);
const trends = ref([]);
const trendsLastUpdated = ref("");
const store = useCalendarStore()

// ── Drag & Drop state ─────────────────────────────────────────────────────
const draggedCell = ref(null)
const dragOverId = ref(null)

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const statuses = [
  { label: "Draft", dot: "bg-slate-500" },
  { label: "Pending", dot: "bg-amber-400" },
  { label: "Approved", dot: "bg-green-400" },
  { label: "Scheduled", dot: "bg-blue-400" },
  { label: "Published", dot: "bg-teal-400" },
];
const legend = [
  { label: "Approved", dot: "bg-green-400" },
  { label: "Scheduled", dot: "bg-blue-400" },
  { label: "Pending", dot: "bg-amber-400" },
  { label: "Draft", dot: "bg-slate-500" },
];
const platforms = ref([
  { name: "Instagram", on: true },
  { name: "Facebook", on: true },
  { name: "LinkedIn", on: false },
  { name: "Twitter/X", on: false },
  { name: "TikTok", on: false },
]);

// ── Computed ──────────────────────────────────────────────────────────────────
const topTrend = computed(() => trends.value[0] || null);

const durationLabel = computed(() => {
  if (!startDate.value || !endDate.value) return "";
  const days = Math.round(
    (new Date(endDate.value) - new Date(startDate.value)) /
    (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return "⚠️ End date must be after start date";
  return `${days} days · ~${Math.round(days * 0.65)} posts expected`;
});

const filteredWeeks = computed(() => {
  if (activeFilter.value === "All") return calendarWeeks.value;
  return calendarWeeks.value
    .map((week) => ({
      ...week,
      cells: week.cells.map((cell) =>
        !cell.status || cell.status === activeFilter.value
          ? cell
          : {
            ...cell,
            copy: null,
            status: null,
            platform: null,
            cellClass: "bg-transparent",
          }
      ),
    }))
    .filter((week) => week.cells.some((c) => c.copy));
});

const calendarDateRange = computed(() => {
  if (!currentCalendar.value) return "";
  const s = new Date(currentCalendar.value.startDate);
  const e = new Date(currentCalendar.value.endDate);
  return `${s.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })} – ${e.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
});

// ── Helpers for dates ─────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function twoWeeksStr() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ── Load on mount ─────────────────────────────────────────────────────────────
onMounted(async () => {
  // 1. Trends
  try {
    const data = await api.get("/trends");
    trends.value = data.trends.map((t) => ({
      ...t,
      color: t.velocity > 200 ? "text-green-400" : "text-teal-400",
    }));
    trendsLastUpdated.value = new Date(data.lastUpdated).toLocaleTimeString(
      "ar-EG"
    );
  } catch (err) {
    console.error(err);
    trends.value = [];
  }

  // 2. Latest calendar
  if (!brandId.value) return;
  try {
    const calendars = await calendarApi.getBrandCalendars(brandId.value);
    if (calendars?.length) {
      const latest = await calendarApi.getCalendar(calendars[0]._id);
      currentCalendar.value = latest;
      calendarWeeks.value = buildWeeks(latest.posts || []);
    }
  } catch { }
});

// ── Generate / Regenerate ─────────────────────────────────────────────────────
function openRegenerate() {
  isRegenerate.value = true;
  showModal.value = true;
}

async function doGenerate() {
  if (!brief.value || !brandId.value || !startDate.value || !endDate.value)
    return;
  generateError.value = "";
  generating.value = true;
  loadingCalendar.value = true;
  showModal.value = false;

  const today = parseLocalDate(todayStr())
  const start = parseLocalDate(startDate.value)
  const end = parseLocalDate(endDate.value)

  if (start < today) {
    generateError.value = "Start date cannot be before today.";
    showModal.value = true;
    generating.value = false;
    loadingCalendar.value = false;
    return;
  }

  if (end < today) {
    generateError.value = "End date cannot be before today.";
    showModal.value = true;
    generating.value = false;
    loadingCalendar.value = false;
    return;
  }

  if (end <= start) {
    generateError.value = "End date must be after start date.";
    showModal.value = true;
    generating.value = false;
    loadingCalendar.value = false;
    return;
  }

  try {
    // لو regenerate، امسح القديم الأول
    if (isRegenerate.value && currentCalendar.value) {
      await calendarApi
        .deleteCalendar(currentCalendar.value._id)
        .catch(() => { });
      currentCalendar.value = null;
      calendarWeeks.value = [];
    }

    const durationDays = Math.round(
      (end - start) /
      (1000 * 60 * 60 * 24)
    );

    const result = await calendarApi.generate({
      brandId: brandId.value,
      brief: brief.value,
      dialect: selectedDialect.value,
      platforms: platforms.value.filter((p) => p.on).map((p) => p.name),
      startDate: startDate.value,
      endDate: endDate.value,
      duration: Math.round((new Date(endDate.value) - new Date(startDate.value)) / (1000 * 60 * 60 * 24)),
    });

    currentCalendar.value = result.calendar;
    calendarWeeks.value = buildWeeks(result.posts || []);
    brief.value = "";
    isRegenerate.value = false;
  } catch (err) {
    generateError.value = err.message?.includes("timeout")
      ? "Request timed out — Gemini is busy. Please try again."
      : err.message || "Generation failed — is your backend running?";
    showModal.value = true;
  } finally {
    generating.value = false;
    loadingCalendar.value = false;
  }
}

// ── Approve Plan ──────────────────────────────────────────────────────────────
async function approvePlan() {
  if (!currentCalendar.value) return;
  approving.value = true;
  try {
    await calendarApi.approveCalendar(currentCalendar.value._id);
    // حدث الـ local state
    calendarWeeks.value = calendarWeeks.value.map((week) => ({
      ...week,
      cells: week.cells.map((cell) =>
        cell.copy
          ? {
            ...cell,
            status: "Approved",
            cellClass: "border-green-500/25 bg-green-500/5",
          }
          : cell
      ),
    }));
    approveMsg.value = "All posts approved!";
    setTimeout(() => (approveMsg.value = ""), 3000);
  } catch (err) {
    alert("Approve failed: " + err.message);
  } finally {
    approving.value = false;
  }
}

// ── Delete Calendar ───────────────────────────────────────────────────────────
function confirmDelete() {
  showDeleteConfirm.value = true;
}

async function deleteCalendar() {
  if (!currentCalendar.value) return;
  deleting.value = true;
  try {
    await calendarApi.deleteCalendar(currentCalendar.value._id);
    currentCalendar.value = null;
    calendarWeeks.value = [];
    selectedPost.value = null;
    showDeleteConfirm.value = false;
  } catch (err) {
    alert("Delete failed: " + err.message);
  } finally {
    deleting.value = false;
  }
}

// ── Build weeks grid ──────────────────────────────────────────────────────────
function buildWeeks(posts) {
  if (!posts.length) return [];
  const sorted = [...posts].sort(
    (a, b) =>
      new Date(a.date || a.scheduledDate) - new Date(b.date || b.scheduledDate)
  );
  const weeks = [];
  for (let i = 0; i < sorted.length; i += 7) {
    const chunk = sorted.slice(i, i + 7);
    while (chunk.length < 7)
      chunk.push({ _id: `empty-${i}-${chunk.length}`, empty: true });
    weeks.push({
      id: i,
      cells: chunk.map((p) =>
        p.empty
          ? {
            id: p._id,
            date: "",
            platform: null,
            copy: null,
            status: null,
            hashtags: [],
            cellClass: "bg-transparent",
          }
          : {
            id: p._id,
            date: new Date(p.date || p.scheduledDate).getDate().toString(),
            platform: (p.platform || "").slice(0, 2).toUpperCase(),
            copy: p.copyAR || p.copy || "",
            dialect: p.dialect || "",
            status: p.status
              ? p.status.charAt(0).toUpperCase() +
              p.status.slice(1).replace("_", " ")
              : "Draft",
            hashtags: p.hashtags || [],
            cellClass: statusToClass(p.status),
          }
      ),
    });
  }
  return weeks;
}

function statusToClass(s) {
  return (
    {
      approved: "border-green-500/25 bg-green-500/5",
      scheduled: "border-blue-500/25 bg-blue-500/5",
      pending_review: "border-amber-500/20 bg-amber-500/5",
      draft: "theme-card",
    }[s] || "theme-card"
  );
}

// ── Post editor ───────────────────────────────────────────────────────────────
function selectPost(cell) {
  selectedPost.value = cell;
  editCopy.value = cell.copy;
  variantB.value = null;
  saveMsg.value = "";
}

async function savePost() {
  if (!selectedPost.value) return;
  saving.value = true;
  saveMsg.value = "";
  selectedPost.value.copy = editCopy.value;
  selectedPost.value.cellClass = statusToClass(
    selectedPost.value.status.toLowerCase().replace(" ", "_")
  );
  try {
    await postsApi.updatePost(selectedPost.value.id, {
      copyAR: editCopy.value,
      status: selectedPost.value.status.toLowerCase().replace(" ", "_"),
    });
    saveMsg.value = "✓ Saved";
  } catch {
    saveMsg.value = "✓ Saved locally";
  } finally {
    saving.value = false;
    setTimeout(() => (saveMsg.value = ""), 2000);
  }
}

// ── A/B Variant ───────────────────────────────────────────────────────────────
async function generateVariantB() {
  if (!selectedPost.value) return;
  loadingVariant.value = true;
  variantB.value = null;
  try {
    const r = await postsApi.generateVariantB(selectedPost.value.id);
    variantB.value = r.copyAR || r.copyEN || "No variant generated";
  } catch {
    variantB.value = "Could not generate variant";
  } finally {
    loadingVariant.value = false;
  }
}
async function applyVariantB() {
  if (!selectedPost.value || !variantB.value) return;
  editCopy.value = variantB.value;
  selectedPost.value.copy = variantB.value;
  variantB.value = null;
  try {
    await postsApi.applyVariantB(selectedPost.value.id);
  } catch { }
}

// ── Inject trend ──────────────────────────────────────────────────────────────
function injectTrend() {
  if (!selectedPost.value || !trends.value[0]) return;
  const tag = trends.value[0].tag;
  if (!editCopy.value.includes(tag)) {
    editCopy.value += " " + tag;
    selectedPost.value.copy = editCopy.value;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function platformBadge(p) {
  return (
    {
      IG: "bg-pink-500/20 text-pink-400",
      FB: "bg-blue-500/20 text-blue-400",
      LI: "bg-blue-700/20 text-blue-300",
      TW: "bg-sky-500/20 text-sky-400",
      TI: "bg-rose-500/20 text-rose-400",
    }[p] || "bg-slate-500/20 text-slate-400"
  );
}
function statusColor(s) {
  return (
    {
      Approved: "text-green-400",
      Scheduled: "text-blue-400",
      Pending: "text-amber-400",
      "Pending Review": "text-amber-400",
      Draft: "text-slate-500",
      Published: "text-teal-400",
    }[s] || "text-slate-500"
  );
}

function onDragStart(cell) {
  draggedCell.value = cell
}

async function onDrop(targetCell) {
  dragOverId.value = null
  if (!draggedCell.value) return
  if (draggedCell.value.id === targetCell.id) return

  try {
    await store.swapPostDates(draggedCell.value.id, targetCell.id)

    // Swap the display dates in calendarWeeks so UI reflects the change
    const temp = draggedCell.value.date
    draggedCell.value.date = targetCell.date
    targetCell.date = temp
  } catch {
    alert("Failed to swap posts. Please try again.")
  } finally {
    draggedCell.value = null
  }
}
</script>