<template>
  <section id="how-it-works" class="py-24 bg-forge-950 relative overflow-hidden">

    <div class="absolute inset-0 bg-grid opacity-50"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <!-- Section header -->
      <div class="text-center mb-16">
        <span class="text-xs font-medium text-blue-400 uppercase tracking-widest mb-4 block">How it works</span>
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-4">
          From brief to calendar<br/>
          <span class="text-gradient-blue">in under 2 minutes</span>
        </h2>
        <p class="text-slate-400 max-w-xl mx-auto">
          One workflow — start to publish. No back-and-forth, no agency retainer.
        </p>
      </div>

      <!-- Step connector line (desktop) -->
      <div class="hidden md:block absolute left-1/2 top-[380px] bottom-24 w-px bg-gradient-to-b from-blue-500/30 via-teal-500/20 to-transparent -translate-x-1/2 z-0"></div>

      <!-- Steps -->
      <div class="space-y-6">
        <div v-for="(step, i) in steps" :key="step.number"
          class="relative flex flex-col md:flex-row items-center gap-8"
          :class="i % 2 === 1 ? 'md:flex-row-reverse' : ''">

          <!-- Step content -->
          <div class="flex-1 max-w-md">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-display shrink-0"
                :class="step.numberClass">
                {{ step.number }}
              </div>
              <span class="text-xs text-slate-500 uppercase tracking-wider">Step {{ step.number }}</span>
            </div>
            <h3 class="font-display text-2xl font-600 text-white mb-3">{{ step.title }}</h3>
            <p class="text-slate-400 leading-relaxed mb-4">{{ step.description }}</p>
            <ul class="space-y-2">
              <li v-for="bullet in step.bullets" :key="bullet"
                class="flex items-start gap-2 text-sm text-slate-400">
                <svg class="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ bullet }}
              </li>
            </ul>
          </div>

          <!-- Step visual card -->
          <div class="flex-1 max-w-md w-full">
            <div class="rounded-2xl border-subtle p-5 bg-forge-900" :class="step.cardGlow">
              <component :is="step.visual" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineComponent, h } from 'vue'

// Inline visual mini-components for each step
const UploadVisual = defineComponent({
  render() {
    return h('div', { class: 'space-y-3' }, [
      h('p', { class: 'text-xs text-slate-500 font-medium mb-3' }, 'Brand Vault Setup'),
      h('div', { class: 'flex gap-2 flex-wrap' }, [
        h('div', { class: 'px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/20 text-xs text-blue-400 flex items-center gap-1.5' }, ['📄 Brand Guidelines.pdf']),
        h('div', { class: 'px-3 py-1.5 rounded-lg bg-teal-600/15 border border-teal-500/20 text-xs text-teal-400 flex items-center gap-1.5' }, ['🖼️ Top 10 Posts']),
        h('div', { class: 'px-3 py-1.5 rounded-lg bg-purple-600/15 border border-purple-500/20 text-xs text-purple-400 flex items-center gap-1.5' }, ['🎨 Brand Colors']),
      ]),
      h('div', { class: 'mt-4 p-3 rounded-lg bg-forge-950/60 border-subtle' }, [
        h('p', { class: 'text-xs text-slate-500 mb-1' }, 'Dialect Preference'),
        h('div', { class: 'flex gap-2' }, [
          h('span', { class: 'px-2 py-1 rounded-md bg-blue-600/20 text-blue-300 text-xs' }, 'Egyptian ✓'),
          h('span', { class: 'px-2 py-1 rounded-md bg-forge-800 text-slate-500 text-xs' }, 'Gulf'),
          h('span', { class: 'px-2 py-1 rounded-md bg-forge-800 text-slate-500 text-xs' }, 'Levantine'),
        ]),
      ]),
    ])
  }
})

const BriefVisual = defineComponent({
  render() {
    return h('div', { class: 'space-y-3' }, [
      h('p', { class: 'text-xs text-slate-500 mb-3' }, 'Campaign Brief'),
      h('div', { class: 'p-3 rounded-lg bg-forge-950/60 border-subtle' }, [
        h('p', { class: 'text-xs text-slate-400 italic' }, '"Create a 2-week Ramadan campaign for our new cold brew line targeting Egyptian millennials. Focus on iftar moments and morning suhoor energy."'),
      ]),
      h('div', { class: 'flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/15' }, [
        h('span', {}, '✦'),
        h('span', {}, 'Trend detected: #رمضان_كريم trending in Egypt (+340%)'),
      ]),
    ])
  }
})

const CalendarVisual = defineComponent({
  render() {
    return h('div', { class: 'space-y-2' }, [
      h('p', { class: 'text-xs text-slate-500 mb-3' }, 'Generated Calendar (2 weeks)'),
      h('div', { class: 'grid grid-cols-4 gap-1.5' }, [
        ...['Mon', 'Tue', 'Wed', 'Thu'].map(d =>
          h('div', { class: 'text-center text-[10px] text-slate-600 pb-1' }, d)
        ),
        ...['IG Story', 'FB Post', 'REST', 'LI Article'].map((p, i) =>
          h('div', {
            class: `rounded-lg p-1.5 text-[9px] min-h-[48px] flex flex-col gap-0.5 border ${
              i === 2 ? 'border-white/5 bg-transparent text-slate-600 items-center justify-center' :
              i === 0 ? 'border-pink-500/25 bg-pink-500/5 text-pink-400' :
              i === 1 ? 'border-blue-500/25 bg-blue-500/5 text-blue-400' :
              'border-blue-600/25 bg-blue-600/5 text-blue-300'
            }`
          }, [
            h('span', { class: 'font-medium' }, i === 2 ? '—' : p),
            i !== 2 && h('span', { class: 'text-slate-500 leading-tight' }, ['Suhoor', 'Iftar', 'Brand story'][i] || ''),
          ])
        ),
        ...['TW Thread', 'IG Reel', 'FB Cover', 'REST'].map((p, i) =>
          h('div', {
            class: `rounded-lg p-1.5 text-[9px] min-h-[48px] flex flex-col gap-0.5 border ${
              i === 3 ? 'border-white/5 bg-transparent text-slate-600 items-center justify-center' :
              'border-teal-500/25 bg-teal-500/5 text-teal-400'
            }`
          }, [
            h('span', { class: 'font-medium' }, i === 3 ? '—' : p),
            i !== 3 && h('span', { class: 'text-slate-500 leading-tight' }, 'Arabic content'),
          ])
        ),
      ]),
    ])
  }
})

const ApproveVisual = defineComponent({
  render() {
    return h('div', { class: 'space-y-3' }, [
      h('p', { class: 'text-xs text-slate-500 mb-3' }, 'Review & Approve'),
      h('div', { class: 'space-y-2' }, [
        ...['Suhoor Energy Post', 'Iftar Promo', 'Brand Story'].map((title, i) =>
          h('div', { class: 'flex items-center justify-between p-2.5 rounded-lg border-subtle bg-forge-950/40' }, [
            h('div', {}, [
              h('p', { class: 'text-xs text-slate-300' }, title),
              h('p', { class: 'text-[10px] text-slate-500' }, ['Instagram · Arabic (EGY)', 'Facebook · Bilingual', 'LinkedIn · English'][i]),
            ]),
            h('span', {
              class: `text-[9px] px-2 py-1 rounded-full font-medium ${
                ['bg-green-500/15 text-green-400', 'bg-amber-500/15 text-amber-400', 'bg-slate-700 text-slate-400'][i]
              }`
            }, ['Approved ✓', 'Pending', 'Draft'][i]),
          ])
        ),
      ]),
      h('button', { class: 'w-full mt-3 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors' }, '✦ Approve All & Save to Dashboard'),
    ])
  }
})

const steps = [
  {
    number: '01',
    numberClass: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    cardGlow: 'card-glow',
    title: 'Upload your Brand Vault once',
    description: 'Upload your brand guidelines and top 10 past posts. ContentForge learns your voice, colors, audience, and positioning — permanently stored in RAG memory.',
    bullets: [
      'Brand guidelines via PDF or form',
      'Dialect preference (Egyptian, Gulf, Levantine)',
      'Tone, CTA style, topics to avoid',
    ],
    visual: UploadVisual,
  },
  {
    number: '02',
    numberClass: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    cardGlow: 'card-glow-warm',
    title: 'Type one brief — watch trends auto-inject',
    description: 'Describe your campaign goal in plain language. ContentForge pulls live trending topics from X, Google Trends, and regional RSS feeds to align your content with what\'s viral right now.',
    bullets: [
      'One sentence brief triggers the full engine',
      'Hourly trend scraping from regional sources',
      'Cultural moments auto-detected (Ramadan, Eid, etc.)',
    ],
    visual: BriefVisual,
  },
  {
    number: '03',
    numberClass: 'border-teal-500/40 text-teal-400 bg-teal-500/10',
    cardGlow: '',
    title: 'Get a visual 2-week calendar',
    description: 'An interactive calendar grid appears with every post planned — drag and drop to reschedule, open the side drawer to edit copy, and see A/B variants from the Critic Agent instantly.',
    bullets: [
      'Drag-and-drop rescheduling',
      'Side drawer for inline copy editing',
      'A/B Critic generates alternative hooks',
    ],
    visual: CalendarVisual,
  },
  {
    number: '04',
    numberClass: 'border-green-500/40 text-green-400 bg-green-500/10',
    cardGlow: '',
    title: 'Approve, schedule & publish',
    description: 'Review each post, update statuses, and hit Approve Plan to save the entire campaign to your dashboard permanently. Publish to Instagram, Facebook, and LinkedIn in one click.',
    bullets: [
      'Draft → Pending → Approved → Scheduled → Published',
      'One-click publish to all major platforms',
      'Calendar loads instantly on return — no regeneration',
    ],
    visual: ApproveVisual,
  },
]
</script>
