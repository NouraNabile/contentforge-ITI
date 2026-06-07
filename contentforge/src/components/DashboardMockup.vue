<!-- DashboardMockup.vue -->
<template>
  <div class="relative max-w-5xl mx-auto">
    <!-- Glow behind card -->
    <div class="absolute inset-0 bg-blue-600/10 blur-2xl rounded-3xl"></div>

    <!-- Main window frame -->
    <div class="relative rounded-2xl border-subtle overflow-hidden bg-forge-900 card-glow">

      <!-- Window chrome -->
      <div class="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-forge-800/50">
        <div class="flex gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
        </div>
        <div class="flex-1 flex justify-center">
          <div class="px-4 py-1 rounded-md bg-forge-950/60 text-xs text-slate-500 font-mono">
            contentforge.app/dashboard
          </div>
        </div>
      </div>

      <!-- App layout -->
      <div class="flex h-[440px]">

        <!-- Sidebar -->
        <div class="w-52 border-r border-white/5 bg-forge-900 flex flex-col py-4 px-3 shrink-0">
          <!-- Brand selector -->
          <div class="flex items-center gap-2 px-2 py-2 rounded-lg bg-blue-600/10 border border-blue-500/20 mb-6">
            <div
              class="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white">
              A</div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-white truncate">{{ t('mockup.brandName') }}</p>
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
              :class="i === 0 ? 'bg-blue-600/15 text-blue-400' : 'text-slate-500 hover:text-slate-300'">
              <component :is="'svg'" class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
              </component>
              {{ item.label ? t(item.label) : '' }}
              <span v-if="item.badge"
                class="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400">
                {{ item.badge }}
              </span>

            </div>
          </nav>

          <!-- Stats summary -->
          <div class="mt-4 p-2.5 rounded-lg bg-forge-950/60 border-subtle">
            <p class="text-[10px] text-slate-500 mb-2">{{ t('mockup.thisMonth') }}</p>
            <div class="space-y-1.5">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">{{ t('mockup.postsGenerated') }}</span>
                <span class="text-teal-400 font-medium">84</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">{{ t('mockup.approved') }}</span>
                <span class="text-green-400 font-medium">61</span>
              </div>
            </div>
          </div>
        </div>


        <!-- Main content -->
        <div class="flex-1 overflow-hidden flex flex-col">

          <!-- Top bar -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
            <div>
              <h2 class="text-sm font-display font-600 text-white">{{ t('mockup.calendarTitle') }}</h2>
              <p class="text-[11px] text-slate-500">{{ t('mockup.calendarRange') }}</p>

            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
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
                  <!-- FIX 2: Added a safety check fallback for postKey -->
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
        <div class="w-52 border-l border-white/5 bg-forge-800/30 flex flex-col py-4 px-3 shrink-0">
          <p class="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-3">{{ t('mockup.editPost') }}</p>
          <!-- Selected post editor mockup -->
          <div class="bg-forge-950/60 rounded-lg p-3 border-subtle mb-3">
            <div class="flex items-center gap-1.5 mb-2">
              <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400">{{ t('mockup.instagram')
              }}</span>
              <span class="text-[9px] text-slate-500">{{ t('mockup.dialectEgy') }}</span>

            </div>
            <p class="text-[10px] text-slate-300 leading-relaxed mb-2">
              قهوتك المفضلة الآن بطعم رمضان ☕<br />
              <span class="text-slate-500">اللي بيشتري اتنين يجيب واحد مجاناً</span>
            </p>
            <div class="text-[9px] text-slate-500 border-t border-white/5 pt-2 mt-2">
              #القهوة #رمضان2026
            </div>

          </div>

          <!-- Status selector -->
          <p class="text-[10px] text-slate-500 mb-1.5">{{ t('mockup.status') }}</p>
          <div class="space-y-1 mb-4">
            <div v-for="status in statuses" :key="status.labelKey"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-[10px]"
              :class="status.active ? 'bg-blue-600/15 text-blue-400' : 'text-slate-500 hover:text-slate-300'">
              <div class="w-1.5 h-1.5 rounded-full" :class="status.dot"></div>
              {{ t(status.labelKey) }}
            </div>
          </div>


          <!-- A/B Critic -->
          <div class="mt-auto p-2.5 rounded-lg bg-forge-950/60 border border-amber-500/15">
            <p class="text-[9px] text-amber-400 font-medium mb-1">{{ t('mockup.abCritic') }}</p>
            <p class="text-[9px] text-slate-500 leading-relaxed">
              {{ t('mockup.abHint') }}
            </p>
            <button
              class="mt-2 w-full py-1 rounded-md bg-amber-500/10 text-amber-400 text-[9px] hover:bg-amber-500/20 transition-colors">
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

const { t, locale } = useI18n()

const sidebarItems = [
  { label: 'dashboard.calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', badge: '12' },
  { label: 'dashboard.brandVault', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { label: 'dashboard.imageGen', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'dashboard.analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'dashboard.publish', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
  { label: 'dashboard.settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
]

const weekDays = computed(() => [
  t('dashboard.day.mon'), t('dashboard.day.tue'), t('dashboard.day.wed'),
  t('dashboard.day.thu'), t('dashboard.day.fri'), t('dashboard.day.sat'),
  t('dashboard.day.sun'),
])


const calendarCells = [
  { id: 1, date: '26', post: 'Ramadan morning routine ☕', platform: 'IG', status: 'Approved', classes: 'border-green-500/25 bg-green-500/5', dateClass: 'text-white', platformClass: 'bg-pink-500/20 text-pink-400', textClass: 'text-slate-300', statusClass: 'text-green-400' },
  { id: 2, date: '27', post: 'لمة العيلة والقهوة', platform: 'FB', status: 'Scheduled', classes: 'border-blue-500/25 bg-blue-500/5', dateClass: 'text-white', platformClass: 'bg-blue-500/20 text-blue-400', textClass: 'text-slate-300', statusClass: 'text-blue-400' },
  { id: 3, date: '28', post: 'Product carousel — new flavors', platform: 'IG', status: 'Draft', classes: 'border-white/8 bg-forge-800/30', dateClass: 'text-slate-400', platformClass: 'bg-pink-500/20 text-pink-400', textClass: 'text-slate-400', statusClass: 'text-slate-500' },
  { id: 4, date: '29', post: null, platform: null, status: null, classes: 'border-white/5 bg-transparent', dateClass: 'text-slate-600', platformClass: '', textClass: '', statusClass: '' },
  { id: 5, date: '30', post: 'Brand story thread', platform: 'LI', status: 'Pending', classes: 'border-amber-500/20 bg-amber-500/5', dateClass: 'text-white', platformClass: 'bg-blue-600/20 text-blue-300', textClass: 'text-slate-300', statusClass: 'text-amber-400' },
  { id: 6, date: '31', post: 'اختار طعمك المفضل 🎯', platform: 'IG', status: 'Draft', classes: 'border-white/8 bg-forge-800/30', dateClass: 'text-slate-400', platformClass: 'bg-pink-500/20 text-pink-400', textClass: 'text-slate-300', statusClass: 'text-slate-500' },
  { id: 7, date: '1', post: null, platform: null, status: null, classes: 'border-white/5 bg-transparent', dateClass: 'text-slate-600', platformClass: '', textClass: '', statusClass: '' },
  { id: 8, date: '2', post: 'Customer highlight reel', platform: 'FB', status: 'Approved', classes: 'border-green-500/25 bg-green-500/5', dateClass: 'text-white', platformClass: 'bg-blue-500/20 text-blue-400', textClass: 'text-slate-300', statusClass: 'text-green-400' },
  { id: 9, date: '3', post: 'Tip: قهوتك أحسن بـ...', platform: 'IG', status: 'Scheduled', classes: 'border-blue-500/25 bg-blue-500/5', dateClass: 'text-white', platformClass: 'bg-pink-500/20 text-pink-400', textClass: 'text-slate-300', statusClass: 'text-blue-400' },
  { id: 10, date: '4', post: null, platform: null, status: null, classes: 'border-white/5 bg-transparent', dateClass: 'text-slate-600', platformClass: '', textClass: '', statusClass: '' },
  { id: 11, date: '5', post: 'Weekend promo — 2 for 1', platform: 'IG', status: 'Pending', classes: 'border-amber-500/20 bg-amber-500/5', dateClass: 'text-white', platformClass: 'bg-pink-500/20 text-pink-400', textClass: 'text-slate-300', statusClass: 'text-amber-400' },
  { id: 12, date: '6', post: 'Weekly roundup Arabic', platform: 'LI', status: 'Draft', classes: 'border-white/8 bg-forge-800/30', dateClass: 'text-slate-400', platformClass: 'bg-blue-600/20 text-blue-300', textClass: 'text-slate-400', statusClass: 'text-slate-500' },
  { id: 13, date: '7', post: 'ترند الأسبوع 🔥', platform: 'IG', status: 'Draft', classes: 'border-white/8 bg-forge-800/30', dateClass: 'text-slate-400', platformClass: 'bg-pink-500/20 text-pink-400', textClass: 'text-slate-400', statusClass: 'text-slate-500' },
  { id: 14, date: '8', post: null, platform: null, status: null, classes: 'border-white/5 bg-transparent', dateClass: 'text-slate-600', platformClass: '', textClass: '', statusClass: '' },
]

const statuses = [
  { labelKey: 'dashboard.statusDraft', dot: 'bg-slate-500', active: false },
  { labelKey: 'mockup.statusPendingReview', dot: 'bg-amber-400', active: true },
  { labelKey: 'dashboard.statusApproved', dot: 'bg-green-400', active: false },
  { labelKey: 'dashboard.statusScheduled', dot: 'bg-blue-400', active: false },
  { labelKey: 'dashboard.statusPublished', dot: 'bg-teal-400', active: false },
]

</script>
