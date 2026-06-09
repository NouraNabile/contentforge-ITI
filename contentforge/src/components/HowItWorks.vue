<template>
  <section id="how-it-works" class="py-24 bg-forge-950 relative overflow-hidden">

    <div class="absolute inset-0 bg-grid opacity-50"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <!-- Section header -->
      <div class="text-center mb-16">
        <span class="text-xs font-medium text-blue-400 uppercase tracking-widest mb-4 block">
          {{ t('howItWorks.eyebrow') }}
        </span>
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-4">
          {{ t('howItWorks.heading') }}<br />
          <span class="text-gradient-blue">{{ t('howItWorks.headingAccent') }}</span>
        </h2>
        <p class="text-slate-400 max-w-xl mx-auto">
          {{ t('howItWorks.subheading') }}
        </p>
      </div>

      <!-- Step connector line — desktop only -->
      <div class="hidden md:block absolute left-1/2 top-[380px] bottom-24 w-px bg-gradient-to-b from-blue-500/30 via-teal-500/20 to-transparent -translate-x-1/2 z-0"></div>

      <!-- Steps -->
      <div class="space-y-8 md:space-y-6">
        <div
          v-for="(step, i) in steps" :key="step.number"
          class="relative flex flex-col md:flex-row items-center gap-6 md:gap-8"
          :class="i % 2 === 1 ? 'md:flex-row-reverse' : ''">

          <!-- Step content -->
          <div class="flex-1 max-w-md w-full">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-display shrink-0"
                :class="step.numberClass">
                {{ step.number }}
              </div>
              <span class="text-xs text-slate-500 uppercase tracking-wider">Step {{ step.number }}</span>
            </div>
            <h3 class="font-display text-xl md:text-2xl font-600 text-white mb-3">
              {{ t(`howItWorks.steps.${step.key}.title`) }}
            </h3>
            <p class="text-slate-400 leading-relaxed mb-4 text-sm md:text-base">
              {{ t(`howItWorks.steps.${step.key}.description`) }}
            </p>
            <ul class="space-y-2">
              <li v-for="n in 3" :key="n" class="flex items-start gap-2 text-sm text-slate-400">
                <svg class="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t(`howItWorks.steps.${step.key}.b${n}`) }}
              </li>
            </ul>
          </div>

          <!-- Step visual card -->
          <div class="flex-1 max-w-md w-full">
            <div class="rounded-2xl border-subtle p-4 md:p-5 bg-forge-900" :class="step.cardGlow">
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
import { useI18n } from 'vue-i18n'
 
const { t } = useI18n()
 
const UploadVisual = defineComponent({
  setup() { return { t: useI18n().t } },
  render() {
    return h('div', { class: 'space-y-3' }, [
      h('p', { class: 'text-xs text-slate-500 font-medium mb-3' }, this.t('howItWorks.visual.brandVaultSetup')),
      h('div', { class: 'flex gap-2 flex-wrap' }, [
        h('div', { class: 'px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/20 text-xs text-blue-400 flex items-center gap-1.5' }, ['📄 Brand Guidelines.pdf']),
        h('div', { class: 'px-3 py-1.5 rounded-lg bg-teal-600/15 border border-teal-500/20 text-xs text-teal-400 flex items-center gap-1.5' }, ['🖼️ ', this.t('howItWorks.visual.brandVaultSetup').includes('Brand') ? 'Top 10 Posts' : 'أفضل 10 منشورات']),
        h('div', { class: 'px-3 py-1.5 rounded-lg bg-purple-600/15 border border-purple-500/20 text-xs text-purple-400 flex items-center gap-1.5' }, ['🎨 ', this.t('howItWorks.visual.dialectPreference').includes('Dialect') ? 'Brand Colors' : 'ألوان العلامة']),
      ]),
      h('div', { class: 'mt-4 p-3 rounded-lg bg-forge-950/60 border-subtle' }, [
        h('p', { class: 'text-xs text-slate-500 mb-1' }, this.t('howItWorks.visual.dialectPreference')),
        h('div', { class: 'flex gap-2' }, [
          h('span', { class: 'px-2 py-1 rounded-md bg-blue-600/20 text-blue-300 text-xs' }, this.t('howItWorks.visual.egyptian')),
          h('span', { class: 'px-2 py-1 rounded-md bg-forge-800 text-slate-500 text-xs' }, this.t('howItWorks.visual.gulf')),
          h('span', { class: 'px-2 py-1 rounded-md bg-forge-800 text-slate-500 text-xs' }, this.t('howItWorks.visual.levantine')),
        ]),
      ]),
    ])
  }
})
 
const BriefVisual = defineComponent({
  setup() { return { t: useI18n().t } },
  render() {
    return h('div', { class: 'space-y-3' }, [
      h('p', { class: 'text-xs text-slate-500 mb-3' }, this.t('howItWorks.visual.campaignBrief')),
      h('div', { class: 'p-3 rounded-lg bg-forge-950/60 border-subtle' }, [
        h('p', { class: 'text-xs text-slate-400 italic' }, this.t('howItWorks.visual.briefQuote')),
      ]),
      h('div', { class: 'flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/15' }, [
        h('span', {}, '✦'),
        h('span', {}, this.t('howItWorks.visual.trendDetected')),
      ]),
    ])
  }
})
 
const CalendarVisual = defineComponent({
  setup() { return { t: useI18n().t } },
  render() {
    const days = ['mon', 'tue', 'wed', 'thu'].map(d => this.t(`howItWorks.visual.${d}`))
    const row1Keys = ['igStory', 'fbPost', 'rest', 'liArticle']
    const row1Labels = ['suhoor', 'iftar', null, 'brandStoryLabel']
    const row2Keys = ['twThread', 'igReel', 'fbCover', 'rest']
 
    return h('div', { class: 'space-y-2' }, [
      h('p', { class: 'text-xs text-slate-500 mb-3' }, this.t('howItWorks.visual.generatedCalendar')),
      h('div', { class: 'grid grid-cols-4 gap-1.5' }, [
        ...days.map(d => h('div', { class: 'text-center text-[10px] text-slate-600 pb-1' }, d)),
        ...row1Keys.map((key, i) => {
          const isRest = key === 'rest'
          const colorClass = isRest
            ? 'border-white/5 bg-transparent text-slate-600 items-center justify-center'
            : i === 0 ? 'border-pink-500/25 bg-pink-500/5 text-pink-400'
            : i === 1 ? 'border-blue-500/25 bg-blue-500/5 text-blue-400'
            : 'border-blue-600/25 bg-blue-600/5 text-blue-300'
          return h('div', { class: `rounded-lg p-1.5 text-[9px] min-h-[48px] flex flex-col gap-0.5 border ${colorClass}` }, [
            h('span', { class: 'font-medium' }, isRest ? '—' : this.t(`howItWorks.visual.${key}`)),
            !isRest && row1Labels[i] && h('span', { class: 'text-slate-500 leading-tight' }, this.t(`howItWorks.visual.${row1Labels[i]}`)),
          ])
        }),
        ...row2Keys.map((key, i) => {
          const isRest = key === 'rest'
          return h('div', { class: `rounded-lg p-1.5 text-[9px] min-h-[48px] flex flex-col gap-0.5 border ${isRest ? 'border-white/5 bg-transparent text-slate-600 items-center justify-center' : 'border-teal-500/25 bg-teal-500/5 text-teal-400'}` }, [
            h('span', { class: 'font-medium' }, isRest ? '—' : this.t(`howItWorks.visual.${key}`)),
            !isRest && h('span', { class: 'text-slate-500 leading-tight' }, this.t('howItWorks.visual.arabicContent')),
          ])
        }),
      ]),
    ])
  }
})
 
const ApproveVisual = defineComponent({
  setup() { return { t: useI18n().t } },
  render() {
    const posts = [
      { titleKey: 'suhoorPost', metaKey: 'igEgy',      statusKey: 'approved', statusClass: 'bg-green-500/15 text-green-400' },
      { titleKey: 'iftarPromo', metaKey: 'fbBilingual', statusKey: 'pending',  statusClass: 'bg-amber-500/15 text-amber-400' },
      { titleKey: 'brandStory', metaKey: 'liEnglish',   statusKey: 'draft',    statusClass: 'bg-slate-700 text-slate-400' },
    ]
    return h('div', { class: 'space-y-3' }, [
      h('p', { class: 'text-xs text-slate-500 mb-3' }, this.t('howItWorks.visual.reviewApprove')),
      h('div', { class: 'space-y-2' }, posts.map(p =>
        h('div', { class: 'flex items-center justify-between p-2.5 rounded-lg border-subtle bg-forge-950/40' }, [
          h('div', {}, [
            h('p', { class: 'text-xs text-slate-300' }, this.t(`howItWorks.visual.${p.titleKey}`)),
            h('p', { class: 'text-[10px] text-slate-500' }, this.t(`howItWorks.visual.${p.metaKey}`)),
          ]),
          h('span', { class: `text-[9px] px-2 py-1 rounded-full font-medium ${p.statusClass}` }, this.t(`howItWorks.visual.${p.statusKey}`)),
        ])
      )),
      h('button', { class: 'w-full mt-3 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors' }, this.t('howItWorks.visual.approveAll')),
    ])
  }
})
 
const steps = [
  { key: 's01', number: '01', numberClass: 'border-blue-500/40 text-blue-400 bg-blue-500/10',   cardGlow: 'card-glow',      visual: UploadVisual  },
  { key: 's02', number: '02', numberClass: 'border-amber-500/40 text-amber-400 bg-amber-500/10', cardGlow: 'card-glow-warm', visual: BriefVisual   },
  { key: 's03', number: '03', numberClass: 'border-teal-500/40 text-teal-400 bg-teal-500/10',    cardGlow: '',               visual: CalendarVisual },
  { key: 's04', number: '04', numberClass: 'border-green-500/40 text-green-400 bg-green-500/10', cardGlow: '',               visual: ApproveVisual },
]

</script>
