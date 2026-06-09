<template>
  <AppLayout>
    <div class="p-7 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">Connections</h1>
        <p class="text-sm theme-sub mt-1">
          Connect your social platforms to enable one-click publishing from
          ContentForge.
        </p>
      </div>

      <!-- ───── ACTIVE PLATFORMS ───── -->
      <div class="mb-8">
        <h2
          class="text-xs font-semibold theme-muted uppercase tracking-wider mb-3"
        >
          Active Platforms
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="platform in activePlatforms"
            :key="platform.name"
            class="rounded-2xl theme-surface theme-border p-5 flex flex-col gap-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  :class="[platform.iconBg, platform.iconColor]"
                >
                  <div class="w-5 h-5" v-html="platform.icon"></div>
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
                    {{ platform.connected ? "Connected" : "Disconnected" }}
                  </span>
                </div>
                <button
                  @click="togglePlatform(platform)"
                  :disabled="platform.loading"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  :class="
                    platform.connected
                      ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
                  "
                >
                  <span v-if="platform.loading">...</span>
                  <span v-else>{{
                    platform.connected ? "Disconnect" : "Connect"
                  }}</span>
                </button>
              </div>
            </div>

            <!-- Live stats -->
            <div
              v-if="platform.connected"
              class="mt-2 pt-3 border-t"
              style="border-color: var(--border)"
            >
              <p class="text-[10px] theme-muted mb-2">Live Stats</p>
              <div
                class="grid gap-2 text-center"
                :class="
                  platformStats[platform.name]?.following !== undefined
                    ? 'grid-cols-3'
                    : 'grid-cols-2'
                "
              >
                <div>
                  <p class="text-sm font-semibold theme-text">
                    {{
                      platformStats[
                        platform.name
                      ]?.followers?.toLocaleString() ?? "—"
                    }}
                  </p>
                  <p class="text-[10px] theme-muted">Followers</p>
                </div>
                <div>
                  <p class="text-sm font-semibold theme-text">
                    {{
                      platformStats[
                        platform.name
                      ]?.totalPosts?.toLocaleString() ?? "—"
                    }}
                  </p>
                  <p class="text-[10px] theme-muted">Posts</p>
                </div>
                <div
                  v-if="platformStats[platform.name]?.following !== undefined"
                >
                  <p class="text-sm font-semibold theme-text">
                    {{
                      platformStats[
                        platform.name
                      ]?.following?.toLocaleString() ?? "—"
                    }}
                  </p>
                  <p class="text-[10px] theme-muted">Following</p>
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

      <!-- ───── COMING SOON PLATFORMS ───── -->
      <div>
        <h2
          class="text-xs font-semibold theme-muted uppercase tracking-wider mb-3"
        >
          Coming Soon
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div
            v-for="platform in comingSoonPlatforms"
            :key="platform.name"
            class="rounded-2xl theme-surface theme-border p-5 flex flex-col gap-3 opacity-50"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="[platform.iconBg, platform.iconColor]"
              >
                <div class="w-5 h-5" v-html="platform.icon"></div>
              </div>
              <div>
                <p class="font-medium theme-text text-sm">
                  {{ platform.name }}
                </p>
                <p class="text-[11px] theme-muted">
                  Integration in development
                </p>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span
                class="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/15"
              >
                🔜 Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ───── CONNECT MODAL (for future manual platforms) ───── -->
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
                class="w-9 h-9 rounded-xl flex items-center justify-center"
                :class="[activePlatform?.iconBg, activePlatform?.iconColor]"
              >
                <div class="w-5 h-5" v-html="activePlatform?.icon"></div>
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

// ── Toast & Route ─────────────────────────────────────────────────────────────
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

// ── All platforms data ────────────────────────────────────────────────────────
const allPlatforms = ref([
  {
    name: "Instagram",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/></svg>`,
    iconColor: "text-pink-500",
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
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    iconColor: "text-blue-600",
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
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    iconColor: "text-blue-700",
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
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    iconColor: "text-sky-500",
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
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
    iconColor: "text-rose-500",
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
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    iconColor: "text-red-600",
    iconBg: "bg-red-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: true,
    permissions: [],
    stats: [],
  },
]);

// ── Computed: Active platforms only ─────────────────────────────────────────────
const activePlatforms = computed(() =>
  allPlatforms.value.filter((p) => !p.comingSoon),
);

// ── Computed: Coming soon platforms only ─────────────────────────────────────
const comingSoonPlatforms = computed(() =>
  allPlatforms.value.filter((p) => p.comingSoon),
);

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

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Check if we're in the popup after OAuth redirect
  if (window.opener && route.query.success === "true") {
    window.opener.postMessage("oauth-success", "*");
    window.close();
    return;
  }

  await refreshConnections();
  await fetchPlatformStats();

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

// ── Data Loading ──────────────────────────────────────────────────────────────
async function refreshConnections() {
  try {
    const data = await api.get("/connections");
    if (data?.connections) {
      data.connections.forEach((conn) => {
        const p = allPlatforms.value.find((x) => x.name === conn.platform);
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
      const data = await api.get(`/posts/stats/${platform}`);
      const key = platform.charAt(0).toUpperCase() + platform.slice(1);
      platformStats.value[key] = data;
    } catch (err) {
      console.log(`[Stats] ${platform}: not connected or error`, err.message);
    }
  }
}

// ── Connect / Disconnect ──────────────────────────────────────────────────────
async function togglePlatform(platform) {
  platform.loading = true;

  try {
    if (!platform.connected) {
      // Facebook & Instagram → Meta OAuth popup
      if (platform.name === "Facebook" || platform.name === "Instagram") {
        const data = await api.get("/connections/meta/auth");
        if (data?.authUrl) {
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
              toast.success(`${platform.name} connected successfully!`);
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
          return;
        }
      }
    } else {
      // Disconnect
      await api.delete(`/connections/${platform.name.toLowerCase()}`);
      platform.connected = false;
      platform.handle = null;
      platform.stats = [];
      platformStats.value[platform.name] = null;
      toast.info(`${platform.name} disconnected.`);
    }
  } catch (err) {
    console.error(`[${platform.name}] togglePlatform error:`, err);
    toast.error(
      `Failed to ${platform.connected ? "disconnect" : "connect"} ${platform.name}`,
    );
  } finally {
    platform.loading = false;
  }
}

// ── Modal form submission (for future manual platforms) ───────────────────────
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
    toast.success(`${activePlatform.value.name} connected!`);
  } catch (err) {
    console.error("submitForm error:", err);
    toast.error("Failed to connect. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>
