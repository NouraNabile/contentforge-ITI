<template>
  <section id="features" class="py-24 bg-forge-900 relative overflow-hidden">
    <div class="absolute inset-0 bg-grid opacity-30"></div>
    <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-6">
      <div class="text-center mb-16">
        <span class="text-xs font-medium text-teal-400 uppercase tracking-widest mb-4 block">Core Features</span>
        <h2 class="font-display text-4xl md:text-5xl font-700 text-white mb-4">
          Everything your Arabic brand<br/>
          <span class="text-gradient-arabic">actually needs</span>
        </h2>
        <p class="text-slate-400 max-w-xl mx-auto">Built from the ground up for Arab SMEs — not retrofitted from a Western tool.</p>
      </div>

      <!-- Big feature cards top row -->
      <div class="grid md:grid-cols-2 gap-5 mb-5">
        <div v-for="feat in bigFeatures" :key="feat.title"
          class="rounded-2xl border-subtle bg-forge-950 p-7 hover:border-white/15 transition-all duration-300 group"
          :class="feat.glow">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-xl" :class="feat.iconBg">
            {{ feat.emoji }}
          </div>
          <h3 class="font-display text-xl font-600 text-white mb-3">{{ feat.title }}</h3>
          <p class="text-slate-400 text-sm leading-relaxed mb-5">{{ feat.description }}</p>
          <div class="space-y-2">
            <div v-for="point in feat.points" :key="point"
              class="flex items-center gap-2 text-sm text-slate-400">
              <div class="w-1 h-1 rounded-full shrink-0" :class="feat.dotColor"></div>
              {{ point }}
            </div>
          </div>
        </div>
      </div>

      <!-- Small feature cards bottom row -->
      <div class="grid md:grid-cols-3 gap-5">
        <div v-for="feat in smallFeatures" :key="feat.title"
          class="rounded-2xl border-subtle bg-forge-950 p-6 hover:border-white/15 transition-all duration-300">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-4 text-lg" :class="feat.iconBg">
            {{ feat.emoji }}
          </div>
          <h3 class="font-display text-base font-600 text-white mb-2">{{ feat.title }}</h3>
          <p class="text-slate-500 text-sm leading-relaxed">{{ feat.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const bigFeatures = [
  {
    emoji: '🌍',
    title: 'Arabic & Cultural Intelligence',
    description: 'The only AI platform that generates posts in Egyptian, Gulf, and Levantine dialects — with automated cultural trend injection from X, Google Trends, and regional RSS feeds updated every hour.',
    points: [
      'Egyptian, Gulf, Levantine dialect per post',
      'Ramadan, Eid, and regional holidays auto-detected',
      'Hourly trend scraping with velocity scoring',
      'Bilingual output — Arabic + English in one calendar',
    ],
    iconBg: 'bg-blue-500/15 text-blue-300',
    dotColor: 'bg-blue-400',
    glow: 'card-glow',
  },
  {
    emoji: '🧠',
    title: 'RAG-Powered Brand Voice Memory',
    description: 'Your brand voice is stored permanently in a RAG pipeline using Google Embedding API and MongoDB Atlas. Every generation pulls only the 4 most relevant chunks — so content always sounds like you, not a generic AI.',
    points: [
      'Brand guidelines chunked into 300-word segments',
      'Top 10 past posts vectorized and stored',
      'Context cut from ~15K to ~1K focused tokens',
      'Voice memory persists across all sessions',
    ],
    iconBg: 'bg-purple-500/15 text-purple-300',
    dotColor: 'bg-purple-400',
    glow: '',
  },
]

const smallFeatures = [
  {
    emoji: '🗓️',
    title: 'Interactive 2-Week Calendar',
    description: 'Visual drag-and-drop grid with side drawer editing. Move posts, update statuses, and edit copy — all without regenerating.',
    iconBg: 'bg-teal-500/15 text-teal-300',
  },
  {
    emoji: '🎨',
    title: 'AI Image Generation',
    description: 'Create ad visuals and social graphics from a text prompt alongside every written post. DALL-E 3 integration per post card.',
    iconBg: 'bg-rose-500/15 text-rose-300',
  },
  {
    emoji: '⚡',
    title: 'A/B Critic Agent',
    description: 'Fires after every post to instantly produce a Version B with an alternative hook and CTA layout. Pick the winner in one click.',
    iconBg: 'bg-amber-500/15 text-amber-300',
  },
  {
    emoji: '📤',
    title: 'One-Click Publishing',
    description: 'Publish to Instagram, Facebook, LinkedIn, and more. Set best posting times per platform and queue content in advance.',
    iconBg: 'bg-green-500/15 text-green-300',
  },
  {
    emoji: '💾',
    title: 'Persistent Dashboard',
    description: 'Plans saved permanently to MongoDB Atlas. Return daily to track, edit, and update statuses without regenerating anything.',
    iconBg: 'bg-blue-500/15 text-blue-300',
  },
  {
    emoji: '🚀',
    title: 'Draft → Published Workflow',
    description: 'Built-in approval state machine: Draft → Pending Review → Approved → Scheduled → Published. Full team collaboration ready.',
    iconBg: 'bg-indigo-500/15 text-indigo-300',
  },
]
</script>
