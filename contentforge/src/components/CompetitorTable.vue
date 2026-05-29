<template>
  <section id="competitors" class="py-24 bg-forge-950 relative overflow-hidden">
    <div class="absolute inset-0 bg-grid opacity-40"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <div class="text-center mb-16">
        <span class="text-xs font-medium text-rose-400 uppercase tracking-widest mb-4 block">Why ContentForge</span>
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-4">
          Built for Arab brands.<br/>
          <span class="text-gradient-warm">Not an afterthought.</span>
        </h2>
        <p class="text-slate-400 max-w-xl mx-auto">Every competitor was built for English-first markets and bolted on Arabic as a feature. ContentForge starts from the Arab brand experience.</p>
      </div>

      <!-- Comparison table card -->
      <div class="rounded-2xl border-subtle bg-forge-900 overflow-hidden card-glow">

        <!-- Table header -->
        <div class="grid grid-cols-5 border-b border-white/5">
          <div class="p-5 col-span-1">
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Feature</p>
          </div>
          <div v-for="tool in tools" :key="tool.name"
            class="p-5 text-center border-l border-white/5"
            :class="tool.highlight ? 'bg-blue-600/8' : ''">
            <div class="flex flex-col items-center gap-1">
              <span v-if="tool.highlight"
                class="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/25 text-blue-400 font-medium mb-1">
                ✦ Your Choice
              </span>
              <p class="font-display font-600 text-sm" :class="tool.highlight ? 'text-white' : 'text-slate-400'">
                {{ tool.name }}
              </p>
              <p class="text-[10px] text-slate-600">{{ tool.type }}</p>
            </div>
          </div>
        </div>

        <!-- Table rows -->
        <div v-for="(row, i) in tableRows" :key="row.feature"
          class="grid grid-cols-5 border-b border-white/5 last:border-0"
          :class="i % 2 === 0 ? 'bg-forge-950/30' : ''">
          <div class="p-4 flex items-center">
            <p class="text-sm text-slate-300">{{ row.feature }}</p>
          </div>
          <div v-for="(cell, ci) in row.cells" :key="ci"
            class="p-4 flex items-center justify-center border-l border-white/5"
            :class="ci === 0 ? 'bg-blue-600/5' : ''">
            <span v-if="cell === true" class="text-teal-400 text-base">✓</span>
            <span v-else-if="cell === false" class="text-slate-700 text-base">✗</span>
            <span v-else-if="cell === 'partial'" class="text-amber-500 text-base">◑</span>
            <span v-else class="text-xs text-slate-400 text-center leading-tight">{{ cell }}</span>
          </div>
        </div>
      </div>

      <!-- Key differentiators -->
      <div class="grid md:grid-cols-3 gap-4 mt-8">
        <div v-for="diff in differentiators" :key="diff.title"
          class="p-5 rounded-xl border-subtle bg-forge-900 flex gap-4">
          <div class="text-2xl shrink-0">{{ diff.emoji }}</div>
          <div>
            <h4 class="font-display font-600 text-white text-sm mb-1">{{ diff.title }}</h4>
            <p class="text-slate-500 text-xs leading-relaxed">{{ diff.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const tools = [
  { name: 'ContentForge', type: 'Arab-first AI', highlight: true },
  { name: 'PostFlex AI', type: 'All-in-one', highlight: false },
  { name: 'ARWriter', type: 'Arabic writer', highlight: false },
  { name: 'Jasper', type: 'Enterprise AI', highlight: false },
]

const tableRows = [
  { feature: 'Arabic dialect support', cells: ['EGY · Gulf · Lev', 'partial', true, false] },
  { feature: '2-week content calendar', cells: [true, false, false, 'partial'] },
  { feature: 'RAG brand voice memory', cells: [true, false, false, 'partial'] },
  { feature: 'Cultural trend injection', cells: [true, false, false, false] },
  { feature: 'Drag-and-drop calendar', cells: [true, false, false, false] },
  { feature: 'A/B Critic Agent', cells: [true, false, false, false] },
  { feature: 'AI image generation', cells: [true, true, false, true] },
  { feature: 'Persistent dashboard', cells: [true, 'partial', true, true] },
  { feature: 'One-click publishing', cells: [true, false, true, true] },
  { feature: 'Affordable for Arab SMEs', cells: [true, true, true, false] },
]

const differentiators = [
  {
    emoji: '🇪🇬',
    title: 'vs. Jasper',
    description: 'Jasper is enterprise-priced, English-first, and requires weeks of setup. ContentForge is affordable, Arabic-native, and generates a full calendar in 2 minutes.',
  },
  {
    emoji: '📝',
    title: 'vs. ARWriter',
    description: 'ARWriter writes and publishes but has no calendar management, no RAG brand memory, and no image generation. ContentForge is the complete workflow.',
  },
  {
    emoji: '📅',
    title: 'vs. PostFlex AI',
    description: 'PostFlex AI has limited scheduling and fewer templates. ContentForge delivers a complete AI-generated 2-week strategy with live cultural trend awareness.',
  },
]
</script>
