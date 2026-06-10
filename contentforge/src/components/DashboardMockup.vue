<!-- DashboardMockup.vue -->
<template>
  <div class="relative max-w-5xl mx-auto">
    <!-- Glow behind card -->
    <div class="absolute inset-0 bg-blue-600/10 blur-2xl rounded-3xl"></div>

    <!-- Main window frame -->
    <div class="relative rounded-2xl overflow-hidden transition-all duration-300"
      :class="isDark 
        ? 'border border-white/8 bg-forge-900 card-glow' 
        : 'border border-slate-200 bg-white shadow-xl'">

      <!-- Window chrome -->
      <div class="flex items-center gap-3 px-5 py-3.5 border-b transition-colors"
        :class="isDark ? 'border-white/5 bg-forge-800/50' : 'border-slate-200 bg-slate-50'">
        <div class="flex gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
        </div>
        <div class="flex-1 flex justify-center">
          <div class="px-4 py-1 rounded-md text-xs font-mono transition-colors"
            :class="isDark ? 'bg-forge-950/60 text-slate-500' : 'bg-slate-200/60 text-slate-500'">
            contentforge.app/dashboard
          </div>
        </div>
      </div>

      <!-- App layout -->
      <div class="flex h-[440px]">

        <!-- Sidebar -->
        <div class="w-52 border-r flex flex-col py-4 px-3 shrink-0 transition-colors"
          :class="isDark ? 'border-white/5 bg-forge-900' : 'border-slate-200 bg-slate-50/70'">
          <!-- Brand selector -->
          <div class="flex items-center gap-2 px-2 py-2 rounded-lg border mb-6 transition-colors"
            :class="isDark ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'">
            <div
              class="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white">
              A</div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium truncate transition-colors" :class="isDark ? 'text-white' : 'text-slate-900'">{{ t('mockup.brandName') }}</p>
              <p class="text-[10px] text-slate-500">{{ t('mockup.brandMarket') }}</p>
            </div>
            <svg class="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Nav items -->
          <nav class="space-y-0.5 flex-1">
            <div v-for="(item, i) in sidebarItems" :key="item.label"
              class="flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs transition-colors cursor-pointer"
              :class="i === 0 
                ? (isDark ? 'bg-blue-600/15 text-blue-400' : 'bg-blue-100/70 text-blue-700 font-semibold') 
                : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')">
              <component :is="'svg'" class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
              </component>
              {{ item.label ? t(item.label) : '' }}
              <span v-if="item.badge"
                class="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
                :class="isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'">
                {{ item.badge }}
              </span>
            </div>
          </nav>

          <!-- Stats summary -->
          <div class="mt-4 p-2.5 rounded-lg border transition-colors"
            :class="isDark ? 'bg-forge-950/60 border-white/5' : 'bg-white border-slate-200 shadow-sm'">
            <p class="text-[10px] text-slate-500 mb-2">{{ t('mockup.thisMonth') }}</p>
            <div class="space-y-1.5">
              <div class="flex justify-between text-[11px]">
                <span :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ t('mockup.postsGenerated') }}</span>
                <span class="text-teal-600 dark:text-teal-400 font-medium">84</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ t('mockup.approved') }}</span>
                <span class="text-green-600 dark:text-green-400 font-medium">61</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main content -->
        <div class="flex-1 overflow-hidden flex flex-col transition-colors"
          :class="isDark ? 'bg-forge-900' : 'bg-white'">

          <!-- Top bar -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b transition-colors"
            :class="isDark ? 'border-white/5' : 'border-slate-200'">
            <div>
              <h2 class="text-sm font-display font-600 transition-colors" :class="isDark ? 'text-white' : 'text-slate-900'">{{ t('mockup.calendarTitle') }}</h2>
              <p class="text-[11px] text-slate-500">{{ t('mockup.calendarRange') }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] px-2 py-1 rounded-md border transition-all"
                :class="isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 font-medium'">
                ✦ {{ t('mockup.campaignActive') }}
              </span>
              <button
                class="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-500 transition-colors">
                + {{ t('mockup.generatePlan') }}
              </button>
            </div>
          </div>

          <!-- Calendar grid -->
          <div class="flex-1 overflow-hidden p-4">
            <!-- Day labels -->
            <div class="grid grid-cols-7 gap-1.5 mb-2">
              <div v-for="day in weekDays" :key="day" class="text-center text-[10px] text-slate-500 py-1">
                {{ day }}
              </div>
            </div>
            <!-- Calendar cells -->
            <div class="grid grid-cols-7 gap-1.5">
              <div v-for="cell in calendarCells" :key="cell.id"
                class="rounded-lg border text-[10px] p-1.5 cursor-pointer transition-all hover:scale-[1.02] min-h-[72px] flex flex-col"
                :class="cell.classes">
                <span class="font-medium mb-1" :class="cell.dateClass">{{ cell.date }}</span>
                <div v-if="cell.post" class="flex-1">
                  <div class="flex items-center gap-1 mb-0.5">
                    <span class="text-[8px] px-1 py-0.5 rounded" :class="cell.platformClass">{{ cell.platform }}</span>
                  </div>
                  <p class="text-[9px] leading-tight" :class="cell.textClass">
                    {{ cell.postKey ? t(cell.postKey) : cell.post }}
                  </p>
                </div>
                <div v-if="cell.status" class="mt-auto text-[8px] font-medium" :class="cell.statusClass">
                  {{ cell.statusKey ? t(cell.statusKey) : cell.status }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right drawer (edit panel) -->
        <div class="w-52 border-l flex flex-col py-4 px-3 shrink-0 transition-colors"
          :class="isDark ? 'border-white/5 bg-forge-800/30' : 'border-slate-200 bg-slate-50/50'">
          <p class="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-3">{{ t('mockup.editPost') }}</p>
          
          <!-- Selected post editor mockup -->
          <div class="rounded-lg p-3 border transition-colors mb-3"
            :class="isDark ? 'bg-forge-950/60 border-white/5' : 'bg-white border-slate-200 shadow-sm'">
            <div class="flex items-center gap-1.5 mb-2">
              <span class="text-[9px] px-1.5 py-0.5 rounded-full transition-colors"
                :class="isDark ? 'bg-pink-500/15 text-pink-400' : 'bg-pink-50 text-pink-700 font-medium'">
                {{ t('mockup.instagram') }}
              </span>
              <span class="text-[9px] text-slate-500">{{ t('mockup.dialectEgy') }}</span>
            </div>
            <p class="text-[10px] leading-relaxed mb-2 transition-colors"
              :class="isDark ? 'text-slate-300' : 'text-slate-800'">
              قهوتك المفضلة الآن بطعم رمضان ☕<br />
              <span class="text-slate-500">اللي بيشتري اتنين يجيب واحد مجاناً</span>
            </p>
            <div class="text-[9px] text-slate-500 border-t pt-2 mt-2 transition-colors"
              :class="isDark ? 'border-white/5' : 'border-slate-100'">
              #القهوة #رمضان2026
            </div>
          </div>

          <!-- Status selector -->
          <p class="text-[10px] text-slate-500 mb-1.5">{{ t('mockup.status') }}</p>
          <div class="space-y-1 mb-4">
            <div v-for="status in statuses" :key="status.labelKey"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-[10px] transition-colors"
              :class="status.active 
                ? (isDark ? 'bg-blue-600/15 text-blue-400' : 'bg-blue-100 text-blue-700 font-medium') 
                : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')">
              <div class="w-1.5 h-1.5 rounded-full" :class="status.dot"></div>
              {{ t(status.labelKey) }}
            </div>
          </div>

          <!-- A/B Critic -->
          <div class="mt-auto p-2.5 rounded-lg border transition-colors"
            :class="isDark ? 'bg-forge-950/60 border-amber-500/15' : 'bg-amber-50/40 border-amber-200'">
            <p class="text-[9px] text-amber-600 dark:text-amber-400 font-medium mb-1">{{ t('mockup.abCritic') }}</p>
            <p class="text-[9px] text-slate-500 leading-relaxed">
              {{ t('mockup.abHint') }}
            </p>
            <button
              class="mt-2 w-full py-1 rounded-md text-[9px] transition-all"
              :class="isDark ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-100 text-amber-800 font-medium hover:bg-amber-200'">
              {{ t('mockup.viewVersionB') }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme.js'

const { t } = useI18n()
const { isDark } = useTheme()

const sidebarItems = [
  { label: 'mockup.nav.calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', badge: '12' },
  { label: 'mockup.nav.brandVault', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { label: 'mockup.nav.imageGen', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'mockup.nav.analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'mockup.nav.publish', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
  { label: 'mockup.nav.settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
]

const weekDays = computed(() => [
  t('dashboard.day.mon'), t('dashboard.day.tue'), t('dashboard.day.wed'),
  t('dashboard.day.thu'), t('dashboard.day.fri'), t('dashboard.day.sat'),
  t('dashboard.day.sun'),
])

const calendarCells = computed(() => [
  { id: 1, date: '26', post: true, postKey: 'mockup.post1', platform: 'IG', status: true, statusKey: 'dashboard.statusApproved', classes: isDark.value ? 'border-green-500/25 bg-green-500/5' : 'border-green-200 bg-green-50/60', dateClass: isDark.value ? 'text-white' : 'text-slate-800', platformClass: isDark.value ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700 font-medium', textClass: isDark.value ? 'text-slate-300' : 'text-slate-700', statusClass: isDark.value ? 'text-green-400' : 'text-green-700' },
  { id: 2, date: '27', post: true, postKey: 'mockup.post2', platform: 'FB', status: true, statusKey: 'dashboard.statusScheduled', classes: isDark.value ? 'border-blue-500/25 bg-blue-500/5' : 'border-blue-200 bg-blue-50/60', dateClass: isDark.value ? 'text-white' : 'text-slate-800', platformClass: isDark.value ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700 font-medium', textClass: isDark.value ? 'text-slate-300' : 'text-slate-700', statusClass: isDark.value ? 'text-blue-400' : 'text-blue-700' },
  { id: 3, date: '28', post: true, postKey: 'mockup.post3', platform: 'IG', status: true, statusKey: 'dashboard.statusDraft', classes: isDark.value ? 'border-white/8 bg-forge-800/30' : 'border-slate-200 bg-slate-50', dateClass: 'text-slate-400', platformClass: isDark.value ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700 font-medium', textClass: 'text-slate-400', statusClass: 'text-slate-500' },
  { id: 4, date: '29', post: null, postKey: null, platform: null, status: null, statusKey: null, classes: isDark.value ? 'border-white/5 bg-transparent' : 'border-slate-100 bg-transparent', dateClass: isDark.value ? 'text-slate-600' : 'text-slate-300', platformClass: '', textClass: '', statusClass: '' },
  { id: 5, date: '30', post: true, postKey: 'mockup.post5', platform: 'LI', status: true, statusKey: 'dashboard.statusPending', classes: isDark.value ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50/60', dateClass: isDark.value ? 'text-white' : 'text-slate-800', platformClass: isDark.value ? 'bg-blue-600/20 text-blue-300' : 'bg-indigo-100 text-indigo-700 font-medium', textClass: isDark.value ? 'text-slate-300' : 'text-slate-700', statusClass: isDark.value ? 'text-amber-400' : 'text-amber-700' },
  { id: 6, date: '31', post: true, postKey: 'mockup.post6', platform: 'IG', status: true, statusKey: 'dashboard.statusDraft', classes: isDark.value ? 'border-white/8 bg-forge-800/30' : 'border-slate-200 bg-slate-50', dateClass: 'text-slate-400', platformClass: isDark.value ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700 font-medium', textClass: isDark.value ? 'text-slate-300' : 'text-slate-600', statusClass: 'text-slate-500' },
  { id: 7, date: '1', post: null, postKey: null, platform: null, status: null, statusKey: null, classes: isDark.value ? 'border-white/5 bg-transparent' : 'border-slate-100 bg-transparent', dateClass: isDark.value ? 'text-slate-600' : 'text-slate-300', platformClass: '', textClass: '', statusClass: '' },
  { id: 8, date: '2', post: true, postKey: 'mockup.post8', platform: 'FB', status: true, statusKey: 'dashboard.statusApproved', classes: isDark.value ? 'border-green-500/25 bg-green-500/5' : 'border-green-200 bg-green-50/60', dateClass: isDark.value ? 'text-white' : 'text-slate-800', platformClass: isDark.value ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700 font-medium', textClass: isDark.value ? 'text-slate-300' : 'text-slate-700', statusClass: isDark.value ? 'text-green-400' : 'text-green-700' },
  { id: 9, date: '3', post: true, postKey: 'mockup.post9', platform: 'IG', status: true, statusKey: 'dashboard.statusScheduled', classes: isDark.value ? 'border-blue-500/25 bg-blue-500/5' : 'border-blue-200 bg-blue-50/60', dateClass: isDark.value ? 'text-white' : 'text-slate-800', platformClass: isDark.value ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700 font-medium', textClass: isDark.value ? 'text-slate-300' : 'text-slate-700', statusClass: isDark.value ? 'text-blue-400' : 'text-blue-700' },
  { id: 10, date: '4', post: null, postKey: null, platform: null, status: null, statusKey: null, classes: isDark.value ? 'border-white/5 bg-transparent' : 'border-slate-100 bg-transparent', dateClass: isDark.value ? 'text-slate-600' : 'text-slate-300', platformClass: '', textClass: '', statusClass: '' },
  { id: 11, date: '5', post: true, postKey: 'mockup.post11', platform: 'IG', status: true, statusKey: 'dashboard.statusPending', classes: isDark.value ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50/60', dateClass: isDark.value ? 'text-white' : 'text-slate-800', platformClass: isDark.value ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700 font-medium', textClass: isDark.value ? 'text-slate-300' : 'text-slate-700', statusClass: isDark.value ? 'text-amber-400' : 'text-amber-700' },
  { id: 12, date: '6', post: true, postKey: 'mockup.post12', platform: 'LI', status: true, statusKey: 'dashboard.statusDraft', classes: isDark.value ? 'border-white/8 bg-forge-800/30' : 'border-slate-200 bg-slate-50', dateClass: 'text-slate-400', platformClass: isDark.value ? 'bg-blue-600/20 text-blue-300' : 'bg-indigo-100 text-indigo-700 font-medium', textClass: 'text-slate-400', statusClass: 'text-slate-500' },
  { id: 13, date: '7', post: true, postKey: 'mockup.post13', platform: 'IG', status: true, statusKey: 'dashboard.statusDraft', classes: isDark.value ? 'border-white/8 bg-forge-800/30' : 'border-slate-200 bg-slate-50', dateClass: 'text-slate-400', platformClass: isDark.value ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700 font-medium', textClass: 'text-slate-400', statusClass: 'text-slate-500' },
  { id: 14, date: '8', post: null, postKey: null, platform: null, status: null, statusKey: null, classes: isDark.value ? 'border-white/5 bg-transparent' : 'border-slate-100 bg-transparent', dateClass: isDark.value ? 'text-slate-600' : 'text-slate-300', platformClass: '', textClass: '', statusClass: '' },
])

const statuses = [
  { labelKey: 'dashboard.statusDraft', dot: 'bg-slate-500', active: false },
  { labelKey: 'mockup.statusPendingReview', dot: 'bg-amber-400', active: true },
  { labelKey: 'dashboard.statusApproved', dot: 'bg-green-400', active: false },
  { labelKey: 'dashboard.statusScheduled', dot: 'bg-blue-400', active: false },
  { labelKey: 'dashboard.statusPublished', dot: 'bg-teal-400', active: false },
]
</script>