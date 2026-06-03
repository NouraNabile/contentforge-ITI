<template>
  <AppLayout>
    <div class="p-7 max-w-5xl mx-auto">
      <!-- Page header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="font-display text-2xl font-700 theme-text">Brand Vault</h1>
          <p class="text-sm theme-sub mt-1">
            Your brand's identity, voice, and memory — stored permanently in
            RAG.
          </p>
        </div>
        <div class="flex items-center gap-2">
          
          <button
            @click="saveAll"
            class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            💾 Save & Re-embed
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-8 border-b border-theme pb-1">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-2 text-sm font-medium transition-all rounded-t-lg"
          :class="
            activeTab === tab
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'theme-sub hover:theme-text'
          "
        >
          {{ tab }}
        </button>
      </div>

      <!-- TAB: Brand Identity -->
      <div v-if="activeTab === 'Brand Identity'" class="space-y-6">
        <div class="grid md:grid-cols-2 gap-5">
          <div class="theme-surface rounded-2xl theme-border p-6 space-y-5">
            <h3
              class="font-display font-600 text-base theme-text flex items-center gap-2"
            >
              🏷️ Basic Info
            </h3>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">Brand Name</label>
              <input
                v-model="brand.name"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text focus:outline-none focus:border-blue-500/40 transition-colors"
                placeholder="e.g. Araby Coffee"
              />
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block"
                >Industry / Niche</label
              >
              <input
                v-model="brand.industry"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text focus:outline-none focus:border-blue-500/40 transition-colors"
                placeholder="e.g. F&B, Coffee, Specialty drinks"
              />
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block"
                >Primary Market</label
              >
              <select
                v-model="brand.market"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text focus:outline-none"
              >
                <option>Egypt</option>
                <option>Saudi Arabia</option>
                <option>UAE</option>
                <option>Kuwait</option>
                <option>Jordan</option>
                <option>Lebanon</option>
                <option>GCC (All)</option>
                <option>MENA (All)</option>
              </select>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block"
                >Target Audience</label
              >
              <textarea
                v-model="brand.audience"
                rows="3"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40 transition-colors"
                placeholder="Egyptian millennials aged 22-35, urban, coffee enthusiasts..."
              ></textarea>
            </div>
          </div>

          <div class="theme-surface rounded-2xl theme-border p-6 space-y-5">
            <h3
              class="font-display font-600 text-base theme-text flex items-center gap-2"
            >
              🎨 Visual Identity
            </h3>
            <div>
              <label class="text-xs theme-sub mb-2 block">Brand Colors</label>
              <div class="flex flex-wrap gap-2 mb-3">
                <div
                  v-for="(color, i) in brand.colors"
                  :key="i"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg theme-border theme-card"
                >
                  <div
                    class="w-4 h-4 rounded-full border border-white/10"
                    :style="`background:${color}`"
                  ></div>
                  <span class="text-xs theme-sub font-mono">{{ color }}</span>
                  <button
                    @click="brand.colors.splice(i, 1)"
                    class="text-muted hover:text-red-400 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newColor"
                  type="color"
                  class="w-10 h-9 rounded-lg theme-border cursor-pointer bg-transparent"
                />
                <input
                  v-model="newColorHex"
                  type="text"
                  placeholder="#3B82F6"
                  class="flex-1 px-3 py-2 rounded-xl theme-border theme-input text-xs theme-text focus:outline-none"
                />
                <button
                  @click="addColor"
                  class="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs hover:bg-blue-500 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block"
                >Brand Font / Typography Style</label
              >
              <input
                v-model="brand.font"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text focus:outline-none focus:border-blue-500/40"
                placeholder="Modern, clean sans-serif — e.g. Cairo font"
              />
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">Logo Upload</label>
              <div
                class="border-2 border-dashed border-theme rounded-xl p-6 text-center hover:border-blue-500/40 transition-colors cursor-pointer"
                @click="$refs.logoInput.click()"
              >
                <div class="text-2xl mb-2">🖼️</div>
                <p class="text-xs theme-sub">Click to upload logo (PNG/SVG)</p>
                <p class="text-[10px] text-muted mt-1">Max 2MB</p>
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleLogo"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Brand Voice -->
        <div class="theme-surface rounded-2xl theme-border p-6 space-y-5">
          <h3
            class="font-display font-600 text-base theme-text flex items-center gap-2"
          >
            🎤 Brand Voice & Tone
          </h3>
          <div class="grid md:grid-cols-2 gap-5">
            <div>
              <label class="text-xs theme-sub mb-1.5 block"
                >Voice Description</label
              >
              <textarea
                v-model="brand.voice"
                rows="4"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40"
                placeholder="Warm, friendly, and community-driven. We speak like a friend, not a brand. We celebrate Egyptian culture and daily moments..."
              ></textarea>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-xs theme-sub mb-2 block">Tone Sliders</label>
                <div v-for="tone in tones" :key="tone.label" class="mb-3">
                  <div class="flex justify-between text-[11px] theme-sub mb-1">
                    <span>{{ tone.left }}</span
                    ><span>{{ tone.right }}</span>
                  </div>
                  <input
                    type="range"
                    v-model="tone.value"
                    min="0"
                    max="100"
                    class="w-full h-1.5 rounded-full appearance-none theme-card accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label class="text-xs theme-sub mb-2 block"
                  >Preferred Dialect</label
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="d in dialects"
                    :key="d"
                    @click="toggleDialect(d)"
                    class="px-3 py-1.5 rounded-lg text-xs transition-colors"
                    :class="
                      brand.dialects.includes(d)
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        : 'theme-border theme-sub hover:theme-text'
                    "
                  >
                    {{ d }}
                  </button>
                </div>
              </div>
            </div>
          </div>

           <!-- Section 4: Platforms -->
        <div>
          <h3 class="text-sm font-medium theme-text mb-4 flex items-center gap-2">📱 Target Platforms</h3>
          <div class="flex flex-wrap gap-2">
            <button v-for="p in platformOptions" :key="p.name"
              @click="toggleItem(brand.platforms, p.name)"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all"
              :class="brand.platforms.includes(p.name)
                ? 'bg-blue-600/15 border-blue-500/30 text-blue-400'
                : 'theme-card theme-border theme-sub hover:theme-text'">
              {{ p.icon }} {{ p.name }}
            </button>
          </div>
        </div>
          <div class="grid md:grid-cols-2 gap-5">
            <div>
              <label class="text-xs theme-sub mb-1.5 block"
                >Topics to Always Cover</label
              >
              <textarea
                v-model="brand.topicsInclude"
                rows="3"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40"
                placeholder="Coffee culture, Egyptian daily life, Ramadan moments, morning routines..."
              ></textarea>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block"
                >Topics to Avoid</label
              >
              <textarea
                v-model="brand.topicsExclude"
                rows="3"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40"
                placeholder="Politics, religion debates, competitor names, alcohol..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Top Posts Upload -->
      <div v-if="activeTab === 'Top Posts'" class="space-y-6">
        <div class="theme-surface rounded-2xl theme-border p-6">
          <h3 class="font-display font-600 text-base theme-text mb-2">
            📊 Upload Top 10 Past Posts
          </h3>
          <p class="text-sm theme-sub mb-6">
            These posts will be chunked into 300-word segments, vectorized using
            Google Embedding API, and stored in MongoDB Atlas to power your
            brand voice RAG pipeline.
          </p>

          <div
            v-for="(post, i) in topPosts"
            :key="i"
            class="mb-4 p-4 rounded-xl theme-border theme-card"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-medium theme-sub"
                >Post #{{ i + 1 }}</span
              >
              <div class="flex items-center gap-2">
                <span
                  v-if="post.embedded"
                  class="flex items-center gap-1 text-[10px] text-teal-400"
                >
                  <div class="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                  Embedded
                </span>
                <button
                  @click="topPosts.splice(i, 1)"
                  class="text-muted hover:text-red-400 text-xs transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
            <div class="grid md:grid-cols-3 gap-3 mb-3">
              <select
                v-model="post.platform"
                class="px-3 py-2 rounded-lg theme-border theme-input text-xs theme-text focus:outline-none"
              >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>LinkedIn</option>
                <option>Twitter/X</option>
              </select>
              <input
                v-model="post.date"
                type="month"
                class="px-3 py-2 rounded-lg theme-border theme-input text-xs theme-text focus:outline-none"
              />
              <input
                v-model="post.engagement"
                type="text"
                placeholder="Engagement (e.g. 2.4K likes)"
                class="px-3 py-2 rounded-lg theme-border theme-input text-xs theme-text focus:outline-none"
              />
            </div>
            <textarea
              v-model="post.content"
              rows="3"
              class="w-full px-3 py-2 rounded-lg theme-border theme-input text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40"
              :placeholder="`Paste post #${i + 1} content here...`"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="addPost"
              :disabled="topPosts.length >= 10"
              class="flex-1 py-3 rounded-xl border-2 border-dashed border-theme text-sm theme-sub hover:border-blue-500/40 hover:text-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Add Post ({{ topPosts.length }}/10)
            </button>
            <button
              @click="embedAll"
              class="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              🧠 Embed in RAG
            </button>
          </div>

          <!-- RAG status -->
          <div
            class="mt-5 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-blue-400 text-sm">🔗</span>
              <p class="text-xs font-medium text-blue-300">
                RAG Pipeline Status
              </p>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center">
                <p class="text-lg font-display font-700 text-white">
                  {{ topPosts.filter((p) => p.embedded).length }}
                </p>
                <p class="text-[10px] text-muted">Posts Embedded</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-display font-700 text-teal-400">~1K</p>
                <p class="text-[10px] text-muted">Avg Tokens/Request</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-display font-700 text-green-400">✓</p>
                <p class="text-[10px] text-muted">Atlas Connected</p>
              </div>
            </div>
          </div>
        </div>

        <!-- PDF Upload -->
        <div class="theme-surface rounded-2xl theme-border p-6">
          <h3 class="font-display font-600 text-base theme-text mb-2">
            📄 Upload Brand Guidelines PDF
          </h3>
          <p class="text-sm theme-sub mb-4">
            Upload your brand guidelines document. It will be parsed and chunked
            automatically.
          </p>
          <div
            class="border-2 border-dashed border-theme rounded-xl p-10 text-center hover:border-blue-500/40 transition-colors cursor-pointer"
            @click="$refs.pdfInput.click()"
          >
            <div class="text-4xl mb-3">📑</div>
            <p class="text-sm theme-sub font-medium">
              Drag & drop your PDF here
            </p>
            <p class="text-xs text-muted mt-1">or click to browse · Max 10MB</p>
            <input ref="pdfInput" type="file" accept=".pdf" class="hidden" />
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from "../components/AppLayout.vue";
import { ref } from "vue";
import brandApi from "../api/brandApi";

const activeTab = ref("Brand Identity");
const tabs = ["Brand Identity", "Top Posts"];
const showUri = ref(false);
const connectionResult = ref(null);
const newColor = ref("#3B82F6");
const newColorHex = ref("#3B82F6");

const brand = ref({
  name: "Araby Coffee",
  industry: "F&B / Specialty Coffee",
  market: "Egypt",
  audience:
    "Egyptian millennials aged 22–35, urban professionals, coffee enthusiasts",
  colors: ["#1E3A5F", "#C8A96E", "#F5F0E8"],
  font: "Cairo — modern Arabic/Latin pairing",
  voice:
    "Warm, friendly, and community-driven. We speak like a friend who loves coffee.",
  dialects: ["Arabic (EGY)", "English"],
  topicsInclude:
    "Coffee culture, Egyptian daily life, Ramadan moments, morning routines",
  topicsExclude: "Politics, religion debates, competitor brand names",
  platforms: []
  
});

const platformOptions = [
  { name: "Instagram", icon: "📸" },
  { name: "Facebook", icon: "📘" },
  { name: "LinkedIn", icon: "💼" },
  { name: "X", icon: "𝕏" },
  { name: "TikTok", icon: "🎵" }
];
const tones = ref([
  { label: "Formal–Casual", left: "Formal", right: "Casual", value: 70 },
  { label: "Serious–Playful", left: "Serious", right: "Playful", value: 65 },
  {
    label: "Professional–Friendly",
    left: "Professional",
    right: "Friendly",
    value: 75,
  },
]);

const dialects = [
  "Arabic (EGY)",
  "Arabic (Gulf)",
  "Levantine Arabic",
  "English",
  "Bilingual",
];


const topPosts = ref([
  {
    platform: "Instagram",
    date: "2026-03",
    engagement: "2.4K likes",
    content: "قهوتك المفضلة الآن بطعم رمضان ☕",
    embedded: true,
  },
  {
    platform: "Facebook",
    date: "2026-02",
    engagement: "1.8K shares",
    content: "لمة العيلة مش كاملة من غير قهوة عربي",
    embedded: true,
  },
]);

const mongo = ref({
  uri: "mongodb+srv://admin:****@cluster0.araby.mongodb.net",
  database: "contentforge_db",
  cluster: "cluster0.araby",
  region: "AWS / eu-west-1 (Ireland)",
});

const collections = [
  {
    name: "brands",
    icon: "🏷️",
    fields: [
      "_id",
      "name",
      "guidelines_chunks[]",
      "embedding_vectors[]",
      "dialect",
      "created_at",
    ],
  },
  {
    name: "calendars",
    icon: "🗓️",
    fields: [
      "_id",
      "brand_id",
      "posts[]",
      "status",
      "generated_at",
      "approved_at",
    ],
  },
  {
    name: "posts",
    icon: "📝",
    fields: [
      "_id",
      "calendar_id",
      "platform",
      "copy",
      "hashtags",
      "dialect",
      "status",
      "scheduled_at",
    ],
  },
  {
    name: "trends",
    icon: "🔥",
    fields: ["_id", "tag", "velocity", "region", "source", "scraped_at"],
  },
  {
    name: "users",
    icon: "👤",
    fields: ["_id", "email", "name", "plan", "brands[]", "created_at"],
  },
  {
    name: "ab_variants",
    icon: "⚡",
    fields: ["_id", "post_id", "version_b_copy", "hook_type", "score"],
  },
  
];

const aiConfig = ref({
  geminiKey: "",
  model: "gemini-2.5-flash",
  embeddingKey: "",
  maxTokens: 1000000,
});

function addColor() {
  if (newColorHex.value) brand.value.colors.push(newColorHex.value);
}
function toggleDialect(d) {
  const i = brand.value.dialects.indexOf(d);
  i === -1 ? brand.value.dialects.push(d) : brand.value.dialects.splice(i, 1);
}
function addPost() {
  topPosts.value.push({
    platform: "Instagram",
    date: "",
    engagement: "",
    content: "",
    embedded: false,
  });
}
function embedAll() {
  topPosts.value.forEach((p) => {
    if (p.content) p.embedded = true;
  });
}
function testConnection() {
  connectionResult.value = null;
  setTimeout(() => {
    connectionResult.value = "ok";
  }, 1200);
}
function saveMongo() {
  alert("MongoDB config saved!");
}


const currentBrandId = ref(localStorage.getItem("cf_brandId") || null);

// ── جيبي الـ brand من الـ DB أول ما الصفحة تفتح ──
// onMounted(async () => {
//   try {
//     const brands = await brandApi.getMyBrands();
//     if (brands?.length) {
//       const b = brands[0];
//       currentBrandId.value = b._id;
//       localStorage.setItem("cf_brandId", b._id); // حدّثي الـ localStorage بالـ ID الصح
//       // امليلي الـ form بالبيانات الموجودة
//       brand.value = {
//         name: b.name || "",
//         industry: b.industry || "",
//         website: b.website || "",
//         targetAudience: b.targetAudience || "",
//         dialects: b.dialects || [],
//         tones: b.tones || [],
//         platforms: b.platforms || [],
//         avoidTopics: b.avoidTopics || "",
//       };
//     }
//   } catch {
//     // مش متصل — هيفضل الـ form فاضي
//   }
// });

// ── عدلي الـ saveAll ──
async function saveAll() {
  try {
    let result;
    if (currentBrandId.value) {
      // brand موجود → update
      result = await brandApi.updateBrand(currentBrandId.value, brand.value);
    } else {
      // brand جديد → create
      result = await brandApi.saveBrand(brand.value);
      currentBrandId.value = result.brand._id;
      localStorage.setItem("cf_brandId", result.brand._id);
    }
    await brandApi.embedBrand(result.brand._id);
    alert("Saved & embedded successfully!");
  } catch (err) {
    alert("Save failed: " + err.message);
  }
}
function handleLogo(e) {
  console.log(e.target.files[0]);
}
</script>
