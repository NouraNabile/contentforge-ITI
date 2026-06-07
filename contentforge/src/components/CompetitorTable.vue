<template>
  <section id="competitors" class="py-24 bg-forge-950 relative overflow-hidden">
    <div class="absolute inset-0 bg-grid opacity-40"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <div class="text-center mb-16">
        <span class="text-xs font-medium text-rose-400 uppercase tracking-widest mb-4 block">
          {{ t('competitors.eyebrow') }}
        </span>
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-4">
          {{ t('competitors.heading1') }}<br/>
          <span class="text-gradient-warm">{{ t('competitors.heading2') }}</span>
        </h2>
        <p class="text-slate-400 max-w-xl mx-auto">{{ t('competitors.subheading') }}</p>
      </div>

      <!-- Comparison table card -->
      <div class="rounded-2xl border-subtle bg-forge-900 overflow-hidden card-glow">

        <!-- Table header -->
        <div class="grid grid-cols-5 border-b border-white/5">
          <div class="p-5 col-span-1">
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">
              {{ t('competitors.featureCol') }}
            </p>
          </div>
          <div v-for="tool in tools" :key="tool.nameKey"
            class="p-5 text-center border-l border-white/5"
            :class="tool.highlight ? 'bg-blue-600/8' : ''">
            <div class="flex flex-col items-center gap-1">
              <span v-if="tool.highlight"
                class="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/25 text-blue-400 font-medium mb-1">
                {{ t('competitors.yourChoice') }}
              </span>
              <p class="font-display font-600 text-sm" :class="tool.highlight ? 'text-white' : 'text-slate-400'">
                {{ t(tool.nameKey) }}
              </p>
              <p class="text-[10px] text-slate-600">{{ t(tool.typeKey) }}</p>
            </div>
          </div>
        </div>

        <!-- Table rows -->
        <div v-for="(row, i) in tableRows" :key="row.featureKey"
          class="grid grid-cols-5 border-b border-white/5 last:border-0"
          :class="i % 2 === 0 ? 'bg-forge-950/30' : ''">
          <div class="p-4 flex items-center">
            <p class="text-sm text-slate-300">{{ t(row.featureKey) }}</p>
          </div>
          <div v-for="(cell, ci) in row.cells" :key="ci"
            class="p-4 flex items-center justify-center border-l border-white/5"
            :class="ci === 0 ? 'bg-blue-600/5' : ''">
            <span v-if="cell === true"    class="text-teal-400 text-base">✓</span>
            <span v-else-if="cell === false"   class="text-slate-700 text-base">✗</span>
            <span v-else-if="cell === 'partial'" class="text-amber-500 text-base">◑</span>
            <span v-else class="text-xs text-slate-400 text-center leading-tight">{{ t(cell) }}</span>
          </div>
        </div>
      </div>

      <!-- Key differentiators -->
      <div class="grid md:grid-cols-3 gap-4 mt-8">
        <div v-for="diff in differentiators" :key="diff.titleKey"
          class="p-5 rounded-xl border-subtle bg-forge-900 flex gap-4">
          <div class="text-2xl shrink-0">{{ diff.emoji }}</div>
          <div>
            <h4 class="font-display font-600 text-white text-sm mb-1">{{ t(diff.titleKey) }}</h4>
            <p class="text-slate-500 text-xs leading-relaxed">{{ t(diff.descKey) }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const tools = [
  { nameKey: 'competitors.tools.contentforge.name', typeKey: 'competitors.tools.contentforge.type', highlight: true },
  { nameKey: 'competitors.tools.postflex.name',     typeKey: 'competitors.tools.postflex.type',     highlight: false },
  { nameKey: 'competitors.tools.arwriter.name',     typeKey: 'competitors.tools.arwriter.type',     highlight: false },
  { nameKey: 'competitors.tools.jasper.name',       typeKey: 'competitors.tools.jasper.type',       highlight: false },
]

const tableRows = [
  { featureKey: 'competitors.rows.dialect',    cells: ['competitors.cells.dialects', 'partial', true, false] },
  { featureKey: 'competitors.rows.calendar',   cells: [true, false, false, 'partial'] },
  { featureKey: 'competitors.rows.rag',        cells: [true, false, false, 'partial'] },
  { featureKey: 'competitors.rows.trends',     cells: [true, false, false, false] },
  { featureKey: 'competitors.rows.dragdrop',   cells: [true, false, false, false] },
  { featureKey: 'competitors.rows.abcritic',   cells: [true, false, false, false] },
  { featureKey: 'competitors.rows.imagegen',   cells: [true, true, false, true] },
  { featureKey: 'competitors.rows.dashboard',  cells: [true, 'partial', true, true] },
  { featureKey: 'competitors.rows.publishing', cells: [true, false, true, true] },
  { featureKey: 'competitors.rows.affordable', cells: [true, true, true, false] },
]

const differentiators = [
  { emoji: '🇪🇬', titleKey: 'competitors.diff.jasper.title',   descKey: 'competitors.diff.jasper.desc' },
  { emoji: '📝',  titleKey: 'competitors.diff.arwriter.title', descKey: 'competitors.diff.arwriter.desc' },
  { emoji: '📅',  titleKey: 'competitors.diff.postflex.title', descKey: 'competitors.diff.postflex.desc' },
]
</script>