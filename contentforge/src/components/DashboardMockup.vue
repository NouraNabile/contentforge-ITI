<!-- DashboardMockup.vue -->
<template>
  <div class="relative max-w-7xl mx-auto" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- Glow behind card -->
    <div class="absolute inset-0 bg-blue-600/10 blur-3xl rounded-3xl pointer-events-none"></div>

    <!-- Main window frame -->
    <div class="relative rounded-2xl overflow-hidden border transition-all duration-300"
      :class="isDark
        ? 'border-white/10 bg-forge-950 card-glow'
        : 'border-slate-200 bg-white shadow-2xl'">

      <!-- Top Navbar (mirrors AppLayout header) -->
      <header class="flex items-center justify-between px-3 sm:px-4 py-3 border-b transition-colors"
        :class="isDark ? 'border-white/5 bg-forge-900' : 'border-slate-200 bg-slate-50'">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <RouterLink to="/" class="flex items-center gap-2 shrink-0">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <span class="font-display font-700 text-base" :class="isDark ? 'text-white' : 'text-slate-900'">ContentForge</span>
          </RouterLink>
          <span class="hidden md:block shrink-0" :class="isDark ? 'text-slate-600' : 'text-slate-300'">|</span>
          <span class="hidden md:block text-sm truncate" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
            {{ t('layout.nav.calendar') }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button class="hidden sm:flex text-xs px-2 sm:px-3 py-1.5 rounded-lg border transition-colors items-center gap-1.5 cursor-default"
            :class="isDark ? 'border-white/10 text-slate-400 bg-white/5' : 'border-slate-200 text-slate-600 bg-white'">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="hidden md:inline">{{ t('layout.contactUs') }}</span>
          </button>
          <button class="text-xs px-2 sm:px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 sm:gap-1.5 cursor-default"
            :class="isDark ? 'border-white/10 text-slate-400 bg-white/5' : 'border-slate-200 text-slate-600 bg-white'">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
            </svg>
            <span class="hidden sm:inline">{{ locale === 'en' ? 'عربي' : 'English' }}</span>
            <span class="sm:hidden">{{ locale === 'en' ? 'ع' : 'EN' }}</span>
          </button>
          <button class="w-8 h-8 rounded-xl border flex items-center justify-center transition-colors shrink-0 cursor-default"
            :class="isDark ? 'border-white/10 text-slate-400 bg-white/5' : 'border-slate-200 text-slate-600 bg-white'">
            <svg v-if="isDark" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <button class="w-8 h-8 rounded-xl border flex items-center justify-center transition-colors relative shrink-0 cursor-default"
            :class="isDark ? 'border-white/10 text-slate-400 bg-white/5' : 'border-slate-200 text-slate-600 bg-white'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
            M
          </div>
        </div>
      </header>

      <!-- Body -->
      <div class="flex min-h-[520px]">

        <!-- Sidebar (mirrors AppLayout sidebar) -->
        <aside class="hidden md:flex w-56 border-e flex-col py-5 px-3 shrink-0 transition-colors overflow-y-auto"
          :class="isDark ? 'border-white/5 bg-forge-900' : 'border-slate-200 bg-slate-50'">
          <!-- Brand chip -->
          <div class="mb-5 px-2">
            <p class="text-[10px] uppercase tracking-wider mb-2 font-medium" :class="isDark ? 'text-slate-500' : 'text-slate-400'">
              {{ t('layout.activeBrand') }}
            </p>
            <div class="flex items-center gap-2.5 p-2.5 rounded-xl border cursor-default transition-colors"
              :class="isDark ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shrink-0">A</div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium truncate" :class="isDark ? 'text-white' : 'text-slate-900'">Manar</p>
                <p class="text-[10px]" :class="isDark ? 'text-slate-500' : 'text-slate-500'">Free</p>
              </div>
              <svg class="w-3 h-3 shrink-0" :class="isDark ? 'text-slate-500' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Nav items -->
          <nav class="space-y-0.5 flex-1">
            <div v-for="(item, i) in sidebarItems" :key="item.label"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors cursor-default border"
              :class="i === 0
                ? (isDark ? 'bg-blue-600/15 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700 font-semibold border-blue-200')
                : (isDark ? 'text-slate-400 border-transparent' : 'text-slate-600 border-transparent')">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
              </svg>
              {{ t(item.label) }}
              <span v-if="item.badge" class="ms-auto text-[9px] px-1.5 py-0.5 rounded-full"
                :class="isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'">
                {{ item.badge }}
              </span>
            </div>
          </nav>

          <!-- Quick stats -->
          <div class="mt-4 p-3 rounded-xl border transition-colors"
            :class="isDark ? 'bg-forge-950/60 border-white/5' : 'bg-white border-slate-200 shadow-sm'">
            <div class="flex items-center justify-between mb-2">
              <p class="text-[10px] font-medium uppercase tracking-wider" :class="isDark ? 'text-slate-500' : 'text-slate-400'">
                June 2026
              </p>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ t('layout.stats.generated') }}</span>
                <span class="text-[11px] font-medium text-blue-400">7</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ t('layout.stats.approved') }}</span>
                <span class="text-[11px] font-medium text-green-400">1</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ t('layout.stats.scheduled') }}</span>
                <span class="text-[11px] font-medium text-blue-400">0</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ t('layout.stats.published') }}</span>
                <span class="text-[11px] font-medium text-teal-400">0</span>
              </div>
            </div>
          </div>

          <!-- Bottom actions -->
          <div class="flex flex-col gap-1 px-1 pb-2 mt-3">
            <button class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors w-full cursor-default"
              :class="isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-600 hover:text-rose-600'">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {{ t('layout.deleteAccount') }}
            </button>
            <button class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors w-full cursor-default"
              :class="isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-600 hover:text-rose-600'">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {{ t('layout.logout') }}
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-hidden flex flex-col transition-colors min-w-0"
          :class="isDark ? 'bg-forge-950' : 'bg-white'">

          <!-- Page toolbar -->
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors"
            :class="isDark ? 'border-white/5 bg-forge-900' : 'border-slate-200 bg-slate-50'">
            <div class="min-w-0">
              <h1 class="font-display text-base sm:text-lg font-600 truncate" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ t('dashboard.title') }}
              </h1>
              <p class="text-xs mt-0.5" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                10 Jun – 18 Jun 2026 · 6 posts planned
              </p>
            </div>
            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
              <span class="text-[11px] px-2.5 py-1.5 rounded-lg border cursor-default"
                :class="isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 font-medium'">
                ✦ #الذهب
              </span>
              <button class="px-2.5 py-2 rounded-xl bg-green-600 text-white flex items-center cursor-default">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button class="px-2.5 py-2 rounded-xl border flex items-center cursor-default"
                :class="isDark ? 'border-white/10 text-slate-400 bg-white/5' : 'border-slate-200 text-slate-600 bg-white'">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v5h5" />
                </svg>
              </button>
              <button class="px-2.5 py-2 rounded-xl border flex items-center cursor-default"
                :class="isDark ? 'border-rose-500/20 text-rose-400 bg-rose-600/10' : 'border-rose-200 text-rose-600 bg-rose-50'">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button class="px-2.5 py-2 rounded-xl border flex items-center cursor-default"
                :class="isDark ? 'border-white/10 text-slate-400 bg-white/5' : 'border-slate-200 text-slate-600 bg-white'">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Calendar + Trends -->
          <div class="flex flex-1 overflow-hidden">
            <!-- Calendar area -->
            <div class="flex-1 overflow-auto p-3 sm:p-6">
              <div class="overflow-x-auto">
                <div class="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 min-w-[560px]">
                  <div v-for="d in weekDays" :key="d" class="text-center text-[10px] sm:text-[11px] font-medium py-1"
                    :class="isDark ? 'text-slate-500' : 'text-slate-400'">
                    {{ d }}
                  </div>
                </div>

                <div class="space-y-2 sm:space-y-3 min-w-[560px]">
                  <!-- Week 1 -->
                  <div class="grid grid-cols-7 gap-1.5 sm:gap-3">
                    <div v-for="cell in week1" :key="cell.id"
                      class="rounded-xl border p-1.5 sm:p-2 flex flex-col min-h-[100px] sm:min-h-[140px] transition-colors relative overflow-hidden cursor-default"
                      :class="cell.classes">
                      <div class="flex items-center justify-between mb-1 sm:mb-2 px-0.5 sm:px-1">
                        <span class="text-[9px] sm:text-[11px] font-semibold tracking-wide" :class="cell.dateClass">
                          {{ cell.date }}
                        </span>
                      </div>
                      <div class="flex flex-col gap-1 sm:gap-2 flex-1 overflow-hidden">
                        <template v-if="cell.post">
                          <div class="relative rounded-lg border p-1.5 sm:p-2.5 flex flex-col justify-between w-full aspect-square shrink-0 select-none"
                            :class="cell.postClasses">
                            <div class="flex items-start justify-between">
                              <span class="text-[7px] sm:text-[9px] font-mono opacity-60 text-left"
                                :class="isDark ? 'text-slate-400' : 'text-slate-500'">{{ cell.date }}</span>
                              <span class="text-[7px] sm:text-[8px] px-1 py-0.5 rounded font-medium" :class="cell.platformClass">
                                {{ cell.platform }}
                              </span>
                            </div>
                            <p class="text-[8px] sm:text-[10px] leading-snug flex-1 line-clamp-3 mt-1 text-right font-arabic"
                              :class="isDark ? 'text-slate-300' : 'text-slate-700'" dir="rtl">
                              {{ cell.postText }}
                            </p>
                            <div class="flex items-center mt-1 pt-1 border-t" :class="isDark ? 'border-white/5' : 'border-slate-100'">
                              <span class="text-[7px] sm:text-[8px] font-medium tracking-wide flex items-center gap-1" :class="cell.statusClass">
                                <span class="w-1.5 h-1.5 rounded-full" :class="cell.statusDot"></span>
                                {{ cell.statusText }}
                              </span>
                            </div>
                          </div>
                        </template>
                        <div v-else class="text-[9px] sm:text-[10px] flex-1 flex items-center justify-center opacity-40 italic py-2 sm:py-4"
                          :class="isDark ? 'text-slate-600' : 'text-slate-400'">—</div>
                      </div>
                    </div>
                  </div>

                  <!-- Week 2 -->
                  <div class="grid grid-cols-7 gap-1.5 sm:gap-3">
                    <div v-for="cell in week2" :key="cell.id"
                      class="rounded-xl border p-1.5 sm:p-2 flex flex-col min-h-[100px] sm:min-h-[140px] transition-colors relative overflow-hidden cursor-default"
                      :class="cell.classes">
                      <div class="flex items-center justify-between mb-1 sm:mb-2 px-0.5 sm:px-1">
                        <span class="text-[9px] sm:text-[11px] font-semibold tracking-wide" :class="cell.dateClass">
                          {{ cell.date }}
                        </span>
                      </div>
                      <div class="flex flex-col gap-1 sm:gap-2 flex-1 overflow-hidden">
                        <template v-if="cell.post">
                          <div class="relative rounded-lg border p-1.5 sm:p-2.5 flex flex-col justify-between w-full aspect-square shrink-0 select-none"
                            :class="cell.postClasses">
                            <div class="flex items-start justify-between">
                              <span class="text-[7px] sm:text-[9px] font-mono opacity-60 text-left"
                                :class="isDark ? 'text-slate-400' : 'text-slate-500'">{{ cell.date }}</span>
                              <span class="text-[7px] sm:text-[8px] px-1 py-0.5 rounded font-medium" :class="cell.platformClass">
                                {{ cell.platform }}
                              </span>
                            </div>
                            <p class="text-[8px] sm:text-[10px] leading-snug flex-1 line-clamp-3 mt-1 text-right font-arabic"
                              :class="isDark ? 'text-slate-300' : 'text-slate-700'" dir="rtl">
                              {{ cell.postText }}
                            </p>
                            <div class="flex items-center mt-1 pt-1 border-t" :class="isDark ? 'border-white/5' : 'border-slate-100'">
                              <span class="text-[7px] sm:text-[8px] font-medium tracking-wide flex items-center gap-1" :class="cell.statusClass">
                                <span class="w-1.5 h-1.5 rounded-full" :class="cell.statusDot"></span>
                                {{ cell.statusText }}
                              </span>
                            </div>
                          </div>
                        </template>
                        <div v-else class="text-[9px] sm:text-[10px] flex-1 flex items-center justify-center opacity-40 italic py-2 sm:py-4"
                          :class="isDark ? 'text-slate-600' : 'text-slate-400'">—</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Legend -->
                <div class="flex items-center gap-3 sm:gap-5 flex-wrap mt-4 sm:mt-5 pt-4 border-t"
                  :class="isDark ? 'border-white/5' : 'border-slate-200'">
                  <p class="text-[11px] font-medium" :class="isDark ? 'text-slate-500' : 'text-slate-400'">
                    {{ t('dashboard.status') }}:
                  </p>
                  <div v-for="s in legend" :key="s.labelKey" class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full" :class="s.dot"></div>
                    <span class="text-[10px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ t(s.labelKey) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Trends panel (hidden on mobile/tablet) -->
            <div class="hidden lg:flex w-52 border-l flex-col py-4 px-3 shrink-0 transition-colors overflow-y-auto"
              :class="isDark ? 'border-white/5 bg-forge-900' : 'border-slate-200 bg-slate-50'">
              <div class="rounded-xl border p-3"
                :class="isDark ? 'bg-forge-950/60 border-white/5' : 'bg-white border-slate-200 shadow-sm'">
                <div class="flex items-center justify-between mb-3">
                  <p class="text-xs font-medium" :class="isDark ? 'text-white' : 'text-slate-900'">
                    🔥 {{ t('dashboard.trendingNow') }}
                  </p>
                  <span class="text-[9px]" :class="isDark ? 'text-slate-500' : 'text-slate-400'">٣:٤٢ م</span>
                </div>
                <div class="space-y-2">
                  <div v-for="trend in trends" :key="trend.tag" class="flex items-center justify-between">
                    <span class="text-[11px]" :class="isDark ? 'text-slate-300' : 'text-slate-700'">{{ trend.tag }}</span>
                    <span class="text-[10px] font-medium" :class="trend.color">{{ trend.change }}</span>
                  </div>
                </div>
                <button class="w-full mt-3 py-1.5 rounded-lg border text-[10px] transition-colors cursor-default"
                  :class="isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'">
                  {{ t('dashboard.injectTrend') }} →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import { useLang } from '../composables/useLang.js'

const { t, locale } = useI18n()
const { isDark } = useTheme()

const sidebarItems = [
  { label: 'layout.nav.calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', badge: '12' },
  { label: 'layout.nav.drafts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', badge: '2' },
  { label: 'layout.nav.branding', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { label: 'layout.nav.chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z' },
  { label: 'layout.nav.connections', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { label: 'layout.nav.poster', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'layout.nav.payment', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

const weekDays = computed(() => [
  t('dashboard.day.mon'), t('dashboard.day.tue'), t('dashboard.day.wed'),
  t('dashboard.day.thu'), t('dashboard.day.fri'), t('dashboard.day.sat'),
  t('dashboard.day.sun'),
])

const legend = [
  { labelKey: 'dashboard.statusDraft', dot: 'bg-slate-500' },
  { labelKey: 'dashboard.statusApproved', dot: 'bg-green-400' },
  { labelKey: 'dashboard.statusScheduled', dot: 'bg-blue-400' },
  { labelKey: 'dashboard.statusPublished', dot: 'bg-indigo-400' },
]

const trends = [
  { tag: '#الذهب', change: '+200%', color: 'text-green-400' },
  { tag: 'ثانوية عامة', change: '+170%', color: 'text-green-400' },
  { tag: 'منى زكي', change: '+140%', color: 'text-teal-400' },
  { tag: '#الدب', change: '+125%', color: 'text-teal-400' },
  { tag: '#btc', change: '+155%', color: 'text-green-400' },
  { tag: 'سعر الذهب اليوم', change: '+95%', color: 'text-teal-400' },
  { tag: '#البحرين', change: '+80%', color: 'text-teal-400' },
  { tag: 'ماء الشرب', change: '+185%', color: 'text-green-400' },
  { tag: 'تركي آل الشيخ', change: '+65%', color: 'text-teal-400' },
  { tag: '#مدافع', change: '+110%', color: 'text-teal-400' },
]

// Helper to build a cell
function makeCell(id, date, post = null) {
  const hasPost = !!post
  const baseClasses = isDark.value
    ? (hasPost ? 'border-white/10 bg-forge-900/40' : 'border-white/5 bg-transparent')
    : (hasPost ? 'border-slate-200 bg-white' : 'border-slate-100 bg-transparent')
  const dateClass = isDark.value ? 'text-white' : 'text-slate-800'

  let postClasses = ''
  let platformClass = ''
  let statusClass = ''
  let statusDot = ''
  let statusText = 'Draft'

  if (hasPost) {
    // All mock posts are Draft in the screenshot
    postClasses = isDark.value
      ? 'bg-slate-500/5 border-slate-500/20 text-slate-300'
      : 'bg-slate-50 border-slate-200 text-slate-700'
    platformClass = post.platform === 'Instagram'
      ? (isDark.value ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700 font-medium')
      : (isDark.value ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700 font-medium')
    statusClass = isDark.value ? 'text-slate-400' : 'text-slate-500'
    statusDot = 'bg-slate-500'
    statusText = 'Draft'
  }

  return {
    id,
    date,
    post: hasPost,
    postText: post?.text || '',
    platform: post?.platform || '',
    classes: baseClasses,
    dateClass,
    postClasses,
    platformClass,
    statusClass,
    statusDot,
    statusText,
  }
}

const week1 = computed(() => [
  makeCell('w1d1', '', null), // Mon
  makeCell('w1d2', '', null), // Tue
  makeCell('w1d3', 'Jun 10', {
    platform: 'Instagram',
    text: 'أول يوم قطار مفتاح القهوة المنضبطة اللي بتعدل المزاج. ولا كأنك قاعد مع أحمد ملوي في فيلم بيضحكك، رونان ملوش آخر. كل أجازة لها طعمها الخاص.',
  }),
  makeCell('w1d4', 'Jun 11', {
    platform: 'Facebook',
    text: 'سر الذهب طالع دزل، بين مزاجنا مع قهوة عربي تايبتا في رمضان. اللمة تحلي والقهوة بتجمعنا. كل سنة وانتي طيبين يا حبايب. أهلاً أهلاً.',
  }),
  makeCell('w1d5', 'Jun 12', null), // Fri
  makeCell('w1d6', 'Jun 13', {
    platform: 'Instagram',
    text: 'صوت المدفع اللي بينبهنا بالذكريات الجميلة. مش أحلى من كوباية قهوة عربي بعد الفطار. بتفصلنا عن دوخة الدنيا. #القهوة #رمضان',
  }),
  makeCell('w1d7', 'Jun 14', {
    platform: 'Facebook',
    text: 'اكل بينكام من القريدس بين إيدا تكريرنا كله على الرشن. المعيطوط زي ما الناس بتهم بـ #الذهب. إحنا نهتم بتفاصيل القهوة. #القهوة_العربية',
  }),
])

const week2 = computed(() => [
  makeCell('w2d1', 'Jun 15', null), // Mon
  makeCell('w2d2', 'Jun 16', {
    platform: 'Instagram',
    text: 'سواء كنت متابع أخبار #البحرين أو مركز في دراما رمضان، القهوة هي الرفيق اللي مبيخونك. متشكر لصاحبك اللي بيفكرك دايماً.',
  }),
  makeCell('w2d3', 'Jun 17', {
    platform: 'Facebook',
    text: 'أداء ثابت زي أداء حسن شحاتة في الملعب. بوعدكم بأطلى جودة في كل كوباية. قهوة عربي مش مجرد مشروب، دي خبرة.',
  }),
  makeCell('w2d4', 'Jun 18', null), // Thu
  makeCell('w2d5', '', null),
  makeCell('w2d6', '', null),
  makeCell('w2d7', '', null),
])
</script>

<style scoped>
.card-glow {
  box-shadow: 0 0 60px -15px rgba(59, 130, 246, 0.15);
}
.font-arabic {
  font-family: 'Tajawal', 'Cairo', system-ui, sans-serif;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>