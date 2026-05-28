<template>
  <AppLayout>
    <div class="flex h-full overflow-hidden">

      <!-- Left: Chat -->
      <div class="flex-1 flex flex-col min-w-0">

        <!-- Chat header -->
        <div class="px-6 py-4 border-b theme-glass flex items-center justify-between shrink-0" style="border-color:var(--border)">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-sm">🧠</div>
            <div>
              <p class="text-sm font-medium theme-text">ContentForge AI</p>
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <p class="text-[10px] theme-muted">Gemini 2.5 Flash · Brand voice loaded</p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="clearChat" class="text-xs theme-muted hover:theme-text px-3 py-1.5 rounded-lg theme-card theme-border transition-colors">Clear chat</button>
            <button @click="showUpload=true" class="text-xs text-blue-400 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-colors flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Upload Files
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div ref="msgContainer" class="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">

          <!-- Welcome -->
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center py-10">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-2xl mb-4">🧠</div>
            <h2 class="font-display text-xl font-600 theme-text mb-2">ContentForge AI Chat</h2>
            <p class="text-sm theme-sub max-w-md mb-6">Ask me to generate posts, adjust your brand voice, create campaigns, or upload your brand files to get started.</p>
            <div class="grid grid-cols-2 gap-2 w-full max-w-lg">
              <button v-for="s in suggestions" :key="s" @click="sendSuggestion(s)"
                class="text-left px-4 py-3 rounded-xl theme-surface theme-border text-xs theme-sub hover:theme-text hover:border-blue-500/30 transition-all">
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Message bubbles -->
          <div v-for="msg in messages" :key="msg.id"
            class="flex gap-3" :class="msg.role==='user' ? 'flex-row-reverse' : ''">

            <!-- Avatar -->
            <div class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
              :class="msg.role==='user' ? 'bg-gradient-to-br from-blue-500 to-teal-400 text-white' : 'bg-blue-600/15 text-blue-400'">
              {{ msg.role==='user' ? 'N' : '🧠' }}
            </div>

            <!-- Bubble -->
            <div class="max-w-[75%] flex flex-col gap-1" :class="msg.role==='user' ? 'items-end' : 'items-start'">
              <!-- File attachment -->
              <div v-if="msg.file" class="flex items-center gap-2 px-3 py-2 rounded-xl theme-card theme-border text-xs theme-sub mb-1">
                <span>📎</span> {{ msg.file }}
              </div>
              <div class="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                :class="msg.role==='user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'theme-surface theme-border theme-text rounded-tl-sm'">
                <div v-html="formatMsg(msg.content)"></div>
              </div>
              <!-- Quick actions for AI responses -->
              <div v-if="msg.role==='ai' && msg.actions" class="flex gap-2 flex-wrap mt-1">
                <button v-for="a in msg.actions" :key="a"
                  class="px-3 py-1 rounded-lg bg-blue-600/10 text-blue-400 text-[11px] border border-blue-500/20 hover:bg-blue-600/20 transition-colors">
                  {{ a }}
                </button>
              </div>
              <span class="text-[10px] theme-muted px-1">{{ msg.time }}</span>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex gap-3">
            <div class="w-7 h-7 rounded-full bg-blue-600/15 flex items-center justify-center text-xs">🧠</div>
            <div class="px-4 py-3 rounded-2xl theme-surface theme-border rounded-tl-sm">
              <div class="flex gap-1 items-center h-4">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:0ms"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:150ms"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:300ms"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input bar -->
        <div class="px-6 py-4 border-t shrink-0" style="border-color:var(--border)">
          <!-- Attached files preview -->
          <div v-if="attachedFiles.length" class="flex gap-2 flex-wrap mb-3">
            <div v-for="(f, i) in attachedFiles" :key="i"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 text-xs border border-blue-500/20">
              <span>📎</span>{{ f }}
              <button @click="attachedFiles.splice(i,1)" class="ml-1 hover:text-blue-200">×</button>
            </div>
          </div>
          <div class="flex gap-3 items-end">
            <label class="w-9 h-9 rounded-xl theme-card theme-border flex items-center justify-center theme-muted hover:theme-text cursor-pointer transition-colors shrink-0" title="Attach file">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
              <input type="file" class="hidden" @change="handleFileAttach" multiple accept=".pdf,.png,.jpg,.txt,.doc,.docx"/>
            </label>
            <textarea v-model="input" @keydown.enter.exact.prevent="sendMessage"
              placeholder="Ask me to generate a post, analyze your brand, create a campaign…"
              rows="1"
              class="flex-1 theme-input rounded-xl px-4 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40 resize-none transition-colors"
              style="border-color:var(--border); min-height:42px; max-height:120px"
              @input="autoGrow"></textarea>
            <button @click="sendMessage"
              class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors shrink-0 disabled:opacity-40"
              :disabled="!input.trim() && !attachedFiles.length">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
          </div>
          <p class="text-[10px] theme-muted mt-2 text-center">Enter to send · Shift+Enter for new line · Supports PDF, images, docs</p>
        </div>
      </div>

      <!-- Right: Context panel -->
      <div class="w-64 border-l shrink-0 overflow-y-auto p-4 space-y-4 scrollbar-thin" style="border-color:var(--border)">

        <!-- Brand context -->
        <div class="rounded-xl theme-surface theme-border p-4">
          <p class="text-xs font-medium theme-text mb-3">🧠 Brand Context Loaded</p>
          <div class="space-y-2">
            <div v-for="ctx in brandContext" :key="ctx.label" class="flex items-center justify-between">
              <span class="text-[11px] theme-sub">{{ ctx.label }}</span>
              <span class="text-[11px] font-medium" :class="ctx.color">{{ ctx.value }}</span>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t" style="border-color:var(--border)">
            <p class="text-[10px] theme-muted">RAG chunks active: <span class="text-blue-400 font-medium">4 / 47</span></p>
          </div>
        </div>

        <!-- Quick prompts -->
        <div class="rounded-xl theme-surface theme-border p-4">
          <p class="text-xs font-medium theme-text mb-3">⚡ Quick Prompts</p>
          <div class="space-y-1.5">
            <button v-for="p in quickPrompts" :key="p" @click="sendSuggestion(p)"
              class="w-full text-left px-3 py-2 rounded-lg theme-card theme-border text-[11px] theme-sub hover:theme-text hover:border-blue-500/20 transition-all">
              {{ p }}
            </button>
          </div>
        </div>

        <!-- Uploaded files -->
        <div class="rounded-xl theme-surface theme-border p-4">
          <p class="text-xs font-medium theme-text mb-3">📎 Session Files</p>
          <div v-if="sessionFiles.length" class="space-y-2">
            <div v-for="f in sessionFiles" :key="f.name"
              class="flex items-center gap-2 p-2 rounded-lg theme-card theme-border">
              <span class="text-sm">{{ f.icon }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-[11px] theme-text truncate">{{ f.name }}</p>
                <p class="text-[10px] theme-muted">{{ f.size }}</p>
              </div>
            </div>
          </div>
          <p v-else class="text-[11px] theme-muted">No files uploaded yet.</p>
          <label class="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed theme-muted hover:theme-text cursor-pointer transition-colors text-[11px]" style="border-color:var(--border)">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Upload file
            <input type="file" class="hidden" @change="handleSideUpload" multiple/>
          </label>
        </div>
      </div>
    </div>

    <!-- Upload modal -->
    <div v-if="showUpload" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="theme-surface rounded-2xl theme-border max-w-md w-full p-7 theme-shadow">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-lg font-600 theme-text">Upload Brand Files</h2>
          <button @click="showUpload=false" class="theme-muted hover:theme-text">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="border-2 border-dashed rounded-2xl p-8 text-center mb-4 transition-colors cursor-pointer hover:border-blue-500/40"
          style="border-color:var(--border)"
          @dragover.prevent @drop.prevent="handleDrop">
          <div class="text-3xl mb-3">📂</div>
          <p class="text-sm font-medium theme-text mb-1">Drop files here or click to browse</p>
          <p class="text-xs theme-muted mb-4">PDF, PNG, JPG, DOCX · max 20MB each</p>
          <label class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 cursor-pointer transition-colors">
            Browse Files
            <input type="file" class="hidden" multiple @change="handleModalUpload"/>
          </label>
        </div>
        <div v-if="pendingFiles.length" class="space-y-2 mb-4">
          <div v-for="f in pendingFiles" :key="f" class="flex items-center gap-2 px-3 py-2 rounded-lg theme-card theme-border text-xs theme-sub">
            <span>📄</span>{{ f }}
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="showUpload=false" class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">Cancel</button>
          <button @click="confirmUpload" class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors">Upload & Embed</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const input = ref('')
const isTyping = ref(false)
const showUpload = ref(false)
const attachedFiles = ref([])
const pendingFiles = ref([])
const msgContainer = ref(null)

const messages = ref([
  { id:1, role:'ai', time:'10:02 AM', content:'مرحباً! I\'m your ContentForge AI — I have your Araby Coffee brand voice loaded. Ask me to generate posts, plan a campaign, or upload new brand files.', actions:['Generate Instagram post','Plan Ramadan campaign','Analyze my brand voice'] }
])

const sessionFiles = ref([
  { name:'Brand_Guidelines_2026.pdf', size:'2.4 MB', icon:'📄' },
  { name:'top_10_posts.png',           size:'1.1 MB', icon:'🖼️' },
])

const brandContext = [
  { label:'Brand', value:'Araby Coffee', color:'theme-text' },
  { label:'Dialect', value:'Egyptian', color:'text-blue-400' },
  { label:'Tone', value:'Warm, Bold', color:'text-teal-400' },
  { label:'Chunks', value:'47 stored', color:'text-green-400' },
  { label:'Last updated', value:'2 hrs ago', color:'theme-muted' },
]

const suggestions = [
  '📅 Generate a Ramadan 2-week calendar',
  '✍️ Write an Instagram post in Egyptian Arabic',
  '🔥 What\'s trending in Egypt right now?',
  '🧠 Analyze my brand voice from my uploads',
  '📊 Compare my content to competitors',
  '🎨 Suggest image prompts for my posts',
]

const quickPrompts = [
  'Write 3 post variations for Iftar',
  'Create a Gulf Arabic caption',
  'Generate A/B hook options',
  'Suggest best posting times',
  'Translate my post to English',
  'Add trending hashtags',
]

const aiReplies = [
  { content:'Here\'s a 2-week Ramadan calendar for Araby Coffee — I\'ve injected the top trending topics from Egypt right now. Would you like me to adjust the tone or dialect?', actions:['Open in Calendar','Adjust dialect','Change tone'] },
  { content:'هذا النص الخاص بك بالعربية المصرية:\n\n"قهوتك المفضلة دلوقتي بطعم رمضان ☕ — اللي بيشتري اتنين يجيب واحد مجاناً!"\n\nI also have a Version B with a stronger hook. Want to see it?', actions:['See Version B','Add to drafts','Translate to English'] },
  { content:'Based on your brand guidelines, your voice is warm, community-first, and uses humor sparingly. Your top performing posts use first-person storytelling. Want me to generate content in this style?', actions:['Generate post','Update brand vault'] },
]

let replyIndex = 0

async function sendMessage() {
  if (!input.value.trim() && !attachedFiles.value.length) return
  const file = attachedFiles.value.length ? attachedFiles.value[0] : null
  messages.value.push({ id: Date.now(), role:'user', time: now(), content: input.value || 'See attached file', file })
  input.value = ''
  attachedFiles.value = []
  isTyping.value = true
  await nextTick(); scrollBottom()
  setTimeout(() => {
    isTyping.value = false
    const reply = aiReplies[replyIndex % aiReplies.length]
    replyIndex++
    messages.value.push({ id: Date.now()+1, role:'ai', time: now(), ...reply })
    nextTick(scrollBottom)
  }, 1400)
}

function sendSuggestion(s) { input.value = s; sendMessage() }
function clearChat() { messages.value = []; replyIndex = 0 }
function scrollBottom() { if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight }
function now() { return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }
function formatMsg(text) { return text.replace(/\n/g,'<br>') }
function autoGrow(e) { e.target.style.height='auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120)+'px' }

function handleFileAttach(e) {
  [...e.target.files].forEach(f => attachedFiles.value.push(f.name))
  e.target.value = ''
}
function handleSideUpload(e) {
  [...e.target.files].forEach(f => sessionFiles.value.unshift({ name:f.name, size:(f.size/1024/1024).toFixed(1)+' MB', icon:'📄' }))
  e.target.value = ''
}
function handleModalUpload(e) {
  [...e.target.files].forEach(f => pendingFiles.value.push(f.name))
  e.target.value = ''
}
function handleDrop(e) {
  [...e.dataTransfer.files].forEach(f => pendingFiles.value.push(f.name))
}
function confirmUpload() {
  pendingFiles.value.forEach(n => sessionFiles.value.unshift({ name:n, size:'—', icon:'📄' }))
  pendingFiles.value = []
  showUpload.value = false
}
</script>
