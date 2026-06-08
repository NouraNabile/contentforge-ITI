<template>
  <AppLayout>
    <div class="p-7 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">Connections</h1>
        <p class="text-sm theme-sub mt-1">
          Connect your social platforms, database, and API keys to enable
          publishing and data persistence.
        </p>
      </div>

      <!-- ───── SOCIAL PLATFORMS TAB ───── -->
      <div v-if="activeTab === 'Social Platforms'">
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="platform in socialPlatforms"
            :key="platform.name"
            class="rounded-2xl theme-surface theme-border p-5 flex flex-col gap-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  :class="platform.iconBg"
                >
                  {{ platform.icon }}
                </div>
                <div>
                  <p class="font-medium theme-text text-sm">
                    {{ platform.name }}
                  </p>
                  <p class="text-[11px] theme-muted">
                    {{ platform.handle || "Not connected" }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    :class="
                      platform.connected ? 'bg-green-400' : 'bg-slate-600'
                    "
                  ></div>
                  <span
                    class="text-[11px]"
                    :class="
                      platform.connected ? 'text-green-400' : 'theme-muted'
                    "
                  >
                    {{
                      platform.connected
                        ? "Connected"
                        : platform.comingSoon
                          ? "Coming Soon"
                          : "Disconnected"
                    }}
                  </span>
                </div>
                <button
                  @click="togglePlatform(platform)"
                  :disabled="platform.loading"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  :class="
                    platform.connected
                      ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20'
                      : platform.comingSoon
                        ? 'bg-slate-600/10 text-slate-400 border border-slate-500/20 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                  "
                >
                  <span v-if="platform.loading">...</span>
                  <span v-else>{{
                    platform.connected
                      ? "Disconnect"
                      : platform.comingSoon
                        ? "Coming Soon"
                        : "Connect"
                  }}</span>
                </button>
              </div>
            </div>

            <!-- Live stats from API -->
            <div
              v-if="platformStats[platform.name]"
              class="mt-2 pt-2 border-t"
              style="border-color: var(--border)"
            >
              <p class="text-[10px] theme-muted mb-1">Live Stats</p>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p class="text-sm font-medium theme-text">
                    {{
                      platformStats[
                        platform.name
                      ].followers?.toLocaleString() || 0
                    }}
                  </p>
                  <p class="text-[10px] theme-muted">Followers</p>
                </div>
                <div
                  v-if="platformStats[platform.name].totalPosts !== undefined"
                >
                  <p class="text-sm font-medium theme-text">
                    {{ platformStats[platform.name].totalPosts }}
                  </p>
                  <p class="text-[10px] theme-muted">Posts</p>
                </div>
                <div
                  v-if="platformStats[platform.name].following !== undefined"
                >
                  <p class="text-sm font-medium theme-text">
                    {{ platformStats[platform.name].following }}
                  </p>
                  <p class="text-[10px] theme-muted">Following</p>
                </div>
              </div>

              <!-- Recent posts -->
              <div
                v-if="platformStats[platform.name].recentPosts?.length"
                class="mt-2 space-y-1"
              >
                <p class="text-[10px] theme-muted">Recent Activity</p>
                <div
                  v-for="post in platformStats[platform.name].recentPosts.slice(
                    0,
                    2,
                  )"
                  :key="post.id"
                  class="flex justify-between text-[11px]"
                >
                  <span class="theme-text truncate max-w-[60%]">
                    {{ post.message || post.caption || "Media post" }}
                  </span>
                  <span class="theme-muted">
                    ❤️ {{ post.likes }} · 💬 {{ post.comments }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Permissions -->
            <div
              v-if="platform.connected && platform.permissions?.length"
              class="flex flex-wrap gap-1.5"
            >
              <span
                v-for="p in platform.permissions"
                :key="p"
                class="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/15"
              >
                ✓ {{ p }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ───── CONNECT MODAL (for non-OAuth platforms) ───── -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0, 0, 0, 0.6)"
        @click.self="closeModal"
      >
        <div
          class="rounded-2xl theme-surface theme-border p-6 w-full max-w-md mx-4 flex flex-col gap-5"
          style="max-height: 90vh"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                :class="activePlatform?.iconBg"
              >
                {{ activePlatform?.icon }}
              </div>
              <div>
                <p class="font-medium theme-text text-sm">
                  Connect {{ activePlatform?.name }}
                </p>
                <p class="text-[11px] theme-muted">
                  Fill in your account details
                </p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="text-xl theme-muted hover:theme-text transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Dynamic Form Fields -->
          <div
            class="flex flex-col gap-3 overflow-y-auto"
            style="max-height: 55vh"
          >
            <div v-for="field in currentFields" :key="field.key">
              <label class="text-xs theme-sub mb-1.5 block">{{
                field.label
              }}</label>
              <input
                v-model="formData[field.key]"
                :type="field.type || 'text'"
                :placeholder="field.placeholder"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40 transition-colors"
                style="border-color: var(--border)"
              />
            </div>
          </div>

          <!-- Modal Actions -->
          <div
            class="flex gap-3 pt-2 border-t"
            style="border-color: var(--border)"
          >
            <button
              @click="closeModal"
              :disabled="isSubmitting"
              class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="submitForm"
              :disabled="isSubmitting"
              class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <span
                v-if="isSubmitting"
                class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              <span>{{ isSubmitting ? "Connecting..." : "Connect ✓" }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import AppLayout from "../components/AppLayout.vue";
import api from "../api/client";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";

// ── Tab ───────────────────────────────────────────────────────────────────────
const activeTab = ref("Social Platforms");
const connections = ref([]);
const toast = useToast();
const route = useRoute();

// ── Stats ─────────────────────────────────────────────────────────────────────
const platformStats = ref({
  Facebook: null,
  Instagram: null,
});
let statsInterval = null;

// ── Modal state ───────────────────────────────────────────────────────────────
const showModal = ref(false);
const activePlatform = ref(null);
const formData = ref({});
const isSubmitting = ref(false);
const authUrl = ref("");

const currentFields = computed(() =>
  activePlatform.value ? (platformFields[activePlatform.value.name] ?? []) : [],
);

function openConnectModal(platform) {
  activePlatform.value = platform;
  formData.value = {};
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  activePlatform.value = null;
  formData.value = {};
  isSubmitting.value = false;
}

// ── Platforms ─────────────────────────────────────────────────────────────────
const socialPlatforms = ref([
  {
    name: "Instagram",
    icon: "📸",
    iconBg: "bg-pink-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: false,
    permissions: ["Read posts", "Publish", "Analytics"],
    stats: [],
  },
  {
    name: "Facebook",
    icon: "📘",
    iconBg: "bg-blue-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: false,
    permissions: ["Read", "Publish", "Insights"],
    stats: [],
  },
  {
    name: "LinkedIn",
    icon: "💼",
    iconBg: "bg-blue-700/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: true,
    permissions: [],
    stats: [],
  },
  {
    name: "Twitter/X",
    icon: "🐦",
    iconBg: "bg-sky-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: true,
    permissions: [],
    stats: [],
  },
  {
    name: "TikTok",
    icon: "🎵",
    iconBg: "bg-rose-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: true,
    permissions: [],
    stats: [],
  },
  {
    name: "YouTube",
    icon: "▶️",
    iconBg: "bg-red-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: true,
    permissions: [],
    stats: [],
  },
]);

// ── Platform fields (for manual-connect modal, kept for future use) ───────────
const platformFields = {
  LinkedIn: [
    {
      key: "profileUrl",
      label: "Profile URL",
      placeholder: "https://linkedin.com/in/...",
      type: "url",
    },
    {
      key: "email",
      label: "Email",
      placeholder: "you@email.com",
      type: "email",
    },
  ],
  "Twitter/X": [
    {
      key: "username",
      label: "Username",
      placeholder: "@yourhandle",
      type: "text",
    },
    {
      key: "email",
      label: "Email",
      placeholder: "you@email.com",
      type: "email",
    },
  ],
  TikTok: [
    {
      key: "username",
      label: "Username",
      placeholder: "@youraccount",
      type: "text",
    },
    {
      key: "email",
      label: "Email",
      placeholder: "you@email.com",
      type: "email",
    },
  ],
  YouTube: [
    {
      key: "channelName",
      label: "Channel Name",
      placeholder: "Your Channel",
      type: "text",
    },
    {
      key: "email",
      label: "Email",
      placeholder: "you@email.com",
      type: "email",
    },
  ],
};

async function loadAuthUrl() {
  try {
    const data = await api.get("/connections/meta/auth");
    authUrl.value = data.authUrl;
  } catch (err) {
    console.error("[Auth URL] Failed to load:", err);
  }
}
onMounted(async () => {
  // Check if we're in the popup after OAuth redirect
  if (window.opener && route.query.success === "true") {
    window.opener.postMessage("oauth-success", "*");
    window.close();
    return;
  }

  await refreshConnections();
  await fetchPlatformStats();
  await loadAuthUrl();

  // Poll stats every 30 seconds
  statsInterval = setInterval(() => {
    fetchPlatformStats();
  }, 30_000);

  // Also refresh connections every 60s
  setInterval(refreshConnections, 60_000);
});

onUnmounted(() => {
  if (statsInterval) clearInterval(statsInterval);
});

async function refreshConnections() {
  try {
    const data = await api.get("/connections");
    connections.value = data.connections || [];
    if (data?.connections) {
      data.connections.forEach((conn) => {
        const p = socialPlatforms.value.find((x) => x.name === conn.platform);
        if (p) {
          p.connected = conn.connected;
          p.handle = conn.handle || null;
          p.stats = conn.stats || [];
        }
      });
    }
  } catch {
    // backend not reachable — keep current UI state
  }
}

async function fetchPlatformStats() {
  for (const platform of ["facebook", "instagram"]) {
    try {
      const data = await api.get(`/posts/stats/${platform}`); // ← No { data }
      const key = platform.charAt(0).toUpperCase() + platform.slice(1);
      platformStats.value[key] = data;
    } catch (err) {
      console.log(`[Stats] ${platform}: not connected or error`, err.message);
    }
  }
}

// ── Connect / Disconnect ──────────────────────────────────────────────────────
async function togglePlatform(platform) {
  // Coming soon — show alert, do nothing else
  if (platform.comingSoon && !platform.connected) {
    alert(`${platform.name} integration is coming soon! Stay tuned. 🚀`);
    return;
  }

  platform.loading = true;

  try {
    if (!platform.connected) {
      // Facebook & Instagram → Meta OAuth popup
      if (platform.name === "Facebook" || platform.name === "Instagram") {
        const data = await api.get("/connections/meta/auth");
        console.log("[Meta Auth] Response:", data); // ← add this
        if (data?.authUrl) {
          console.log("[Meta Auth] Opening popup:", data.authUrl); // ← add this
          const popup = window.open(
            data.authUrl,
            "meta-oauth",
            "width=600,height=700",
          );

          // Listen for success message from popup
          const messageHandler = async (event) => {
            if (event.data === "oauth-success") {
              window.removeEventListener("message", messageHandler);
              popup.close();
              await refreshConnections();
              await fetchPlatformStats();
              toast.success("Connected successfully!");
            }
          };
          window.addEventListener("message", messageHandler);

          // Fallback: poll if popup closes without message
          const timer = setInterval(async () => {
            if (popup?.closed) {
              clearInterval(timer);
              window.removeEventListener("message", messageHandler);
              await refreshConnections();
              await fetchPlatformStats();
              platform.loading = false;
            }
          }, 500);
          return; // loading will be cleared inside the interval
        }
      }
    } else {
      // Disconnect
      await api.delete(`/connections/${platform.name.toLowerCase()}`);
      platform.connected = false;
      platform.handle = null;
      platform.stats = [];
      platformStats.value[platform.name] = null;
    }
  } catch (err) {
    console.error(`[${platform.name}] togglePlatform error:`, err);
  } finally {
    platform.loading = false;
  }
}

// submitForm is kept in case modal is used for future manual platforms
async function submitForm() {
  if (!activePlatform.value) return;
  isSubmitting.value = true;
  try {
    await api.post("/connections", {
      platform: activePlatform.value.name,
      handle:
        formData.value.username ||
        formData.value.pageName ||
        formData.value.channelName ||
        "",
      email: formData.value.email || null,
      connected: true,
    });
    await refreshConnections();
    closeModal();
  } catch (err) {
    console.error("submitForm error:", err);
    alert("Failed to connect. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>
