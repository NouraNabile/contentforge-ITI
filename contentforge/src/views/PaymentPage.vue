<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 class="text-2xl font-bold theme-text">{{ t("payment.title") }}</h1>
        <p class="text-sm theme-muted mt-1">{{ t("payment.subtitle") }}</p>
      </div>

      <div class="rounded-2xl theme-surface theme-border p-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="text-xs theme-muted mb-1">
              {{ t("payment.currentPlan") }}
            </p>
            <div class="flex items-center gap-2">
              <span class="text-xl font-bold theme-text capitalize">{{
                planLabel
              }}</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full font-medium" :class="statusBadgeClass">
                {{ statusLabel }}
              </span>
            </div>
            <p v-if="subscription?.currentPeriodEnd" class="text-xs theme-muted mt-1.5">
              {{ t("payment.renewsOn") }}
              {{ formatDate(subscription.currentPeriodEnd) }}
              <span v-if="subscription.cancelAtPeriodEnd" class="text-rose-400 ml-1">({{ t("payment.cancelAtEnd")
                }})</span>
            </p>
          </div>
          <div v-if="subscription?.card" class="flex items-center gap-3 px-4 py-3 rounded-xl theme-card theme-border">
            <svg class="w-8 h-5 text-blue-400" viewBox="0 0 32 20" fill="currentColor">
              <rect width="32" height="20" rx="3" fill="currentColor" opacity=".15" />
              <rect y="6" width="32" height="5" fill="currentColor" opacity=".4" />
            </svg>
            <div>
              <p class="text-xs font-medium theme-text capitalize">
                {{ subscription.card.brand }} •••• {{ subscription.card.last4 }}
              </p>
              <p class="text-[10px] theme-muted">
                {{ subscription.card.expMonth }}/{{ subscription.card.expYear }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mt-5">
          <button v-if="currentPlan !== 'free'" @click="openPortal" :disabled="portalLoading"
            class="flex items-center gap-2 px-4 py-2 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors disabled:opacity-50">
            <svg v-if="portalLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ t("payment.manageSubscription") }}
          </button>
        </div>
      </div>

      <!-- ── Billing Toggle ── -->
      <div class="flex items-center justify-center gap-3 select-none">
        <span class="text-sm transition-colors cursor-pointer"
          :class="!annual ? 'theme-text font-medium' : 'theme-muted'" @click="annual = false">
          {{ t("pricing.monthly") }}
        </span>

        <button @click="annual = !annual" type="button"
          class="relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500/40"
          :class="annual ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-white/10'">
          <span
            class="absolute top-0.5 start-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm"
            :class="toggleKnobClass"></span>
        </button>

        <span class="text-sm transition-colors cursor-pointer flex items-center gap-1.5"
          :class="annual ? 'theme-text font-medium' : 'theme-muted'" @click="annual = true">
          {{ t("pricing.annual") }}
          <span
            class="text-[11px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-medium">
            {{ t("pricing.save20") }}
          </span>
        </span>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="plan in plans" :key="plan.key"
          class="relative rounded-2xl p-5 flex flex-col gap-4 transition-all border" :class="[
            plan.popular
              ? 'theme-surface border-blue-500/40'
              : 'theme-card theme-border',
            currentPlan === plan.key ? 'ring-2 ring-blue-500/50' : '',
          ]">
          <div v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] px-3 py-0.5 rounded-full bg-blue-600 text-white font-medium whitespace-nowrap">
            {{ t("pricing.mostPopular") }}
          </div>

          <div>
            <p class="text-base font-bold theme-text">{{ plan.name }}</p>
            <p class="text-xs theme-muted mt-0.5">{{ plan.tagline }}</p>
          </div>

          <div class="flex items-end gap-1">
            <span class="text-3xl font-bold theme-text">${{ annual ? plan.annualPrice : plan.monthlyPrice }}</span>
            <span class="text-xs theme-muted mb-1">{{
              t("pricing.perMonth")
            }}</span>
            <span v-if="annual" class="ml-auto text-[11px] text-green-400 line-through-none">
              {{ t("pricing.wasPrice", { price: plan.monthlyPrice }) }}
            </span>
          </div>

          <ul class="space-y-1.5 flex-1">
            <li v-for="f in plan.features" :key="f" class="flex items-start gap-2 text-xs theme-sub">
              <svg class="w-3.5 h-3.5 text-green-400 shrink-0 mt-px" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ f }}
            </li>
          </ul>

          <button @click="subscribe(plan.key)" :disabled="checkoutLoading === plan.key || currentPlan === plan.key"
            class="w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50" :class="currentPlan === plan.key
                ? 'bg-green-500/15 text-green-400 border border-green-500/20 cursor-default'
                : plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'theme-surface theme-border theme-sub hover:theme-text'
              ">
            <svg v-if="checkoutLoading === plan.key" class="w-4 h-4 animate-spin inline mr-2" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{
              currentPlan === plan.key
                ? "✓ " + t("payment.currentPlanBtn")
                : t("pricing.plans." + plan.key + ".cta")
            }}
          </button>
        </div>
      </div>

      <p v-if="errorMsg" class="text-sm text-rose-400 text-center">
        {{ errorMsg }}
      </p>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import AppLayout from "../components/AppLayout.vue";
import paymentApi from "../api/paymentApi";
import { useAuthStore } from "../stores/authStore";
import { useLang } from "../composables/useLang.js";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const { locale: langLocale } = useLang();

// ── State ──────────────────────────────────────────────────────────────────────
const annual = ref(false);
const subscription = ref(null);
const currentPlan = ref(authStore.user?.plan || "free");
const subStatus = ref("free");
const checkoutLoading = ref(null);
const portalLoading = ref(false);
const errorMsg = ref("");

// ── Plans data ────────────────────────────────────────────────────────────────
const plans = computed(() => [
  {
    key: "starter",
    name: t("pricing.plans.starter.name"),
    tagline: t("pricing.plans.starter.tagline"),
    monthlyPrice: 29,
    annualPrice: 23,
    popular: false,
    features: [
      t("pricing.plans.starter.f1"),
      t("pricing.plans.starter.f2"),
      t("pricing.plans.starter.f3"),
      t("pricing.plans.starter.f4"),
      t("pricing.plans.starter.f5"),
      t("pricing.plans.starter.f6"),
    ],
  },
  {
    key: "growth",
    name: t("pricing.plans.growth.name"),
    tagline: t("pricing.plans.growth.tagline"),
    monthlyPrice: 79,
    annualPrice: 63,
    popular: true,
    features: [
      t("pricing.plans.growth.f1"),
      t("pricing.plans.growth.f2"),
      t("pricing.plans.growth.f3"),
      t("pricing.plans.growth.f4"),
      t("pricing.plans.growth.f5"),
      t("pricing.plans.growth.f6"),
    ],
  },
  {
    key: "agency",
    name: t("pricing.plans.agency.name"),
    tagline: t("pricing.plans.agency.tagline"),
    monthlyPrice: 199,
    annualPrice: 159,
    popular: false,
    features: [
      t("pricing.plans.agency.f1"),
      t("pricing.plans.agency.f2"),
      t("pricing.plans.agency.f3"),
      t("pricing.plans.agency.f4"),
      t("pricing.plans.agency.f5"),
      t("pricing.plans.agency.f6"),
    ],
  },
]);

// ── Computed ──────────────────────────────────────────────────────────────────
const isRtl = computed(() => {
  const current = locale.value || langLocale.value || 'en';
  return current === 'ar';
});

const toggleKnobClass = computed(() => {
  if (annual.value) {
    return isRtl.value ? "-translate-x-5" : "translate-x-5";
  }
  return "translate-x-0";
});

const planLabel = computed(() => {
  const map = {
    free: "Free",
    starter: "Starter",
    growth: "Growth",
    agency: "Agency",
    enterprise: "Enterprise",
  };
  return map[currentPlan.value] || currentPlan.value;
});

const statusLabel = computed(() => {
  const map = {
    active: t("payment.statusActive"),
    trialing: t("payment.statusTrial"),
    past_due: t("payment.statusPastDue"),
    canceled: t("payment.statusCanceled"),
    free: t("payment.statusFree"),
  };
  return map[subStatus.value] || subStatus.value;
});

const statusBadgeClass = computed(
  () =>
  ({
    active: "bg-green-500/15 text-green-400 border border-green-500/20",
    trialing: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    past_due: "bg-rose-500/15  text-rose-400  border border-rose-500/20",
    canceled: "bg-slate-500/15 text-slate-400 border border-slate-500/20",
    free: "bg-slate-500/15 text-slate-400 border border-slate-500/20",
  }[subStatus.value] || "bg-slate-500/15 text-slate-400")
);

// ── Methods ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function subscribe(planKey) {
  if (currentPlan.value === planKey) return;
  checkoutLoading.value = planKey;
  errorMsg.value = "";
  try {
    const key = annual.value ? `${planKey}_annual` : `${planKey}_monthly`;
    const url = await paymentApi.checkout(key);
    window.location.href = url;
  } catch (e) {
    errorMsg.value = e.message || t("payment.errorGeneric");
  } finally {
    checkoutLoading.value = null;
  }
}

async function openPortal() {
  portalLoading.value = true;
  errorMsg.value = "";
  try {
    const url = await paymentApi.openPortal();
    window.location.href = url;
  } catch (e) {
    errorMsg.value = e.message || t("payment.errorGeneric");
  } finally {
    portalLoading.value = false;
  }
}

async function loadStatus() {
  try {
    const data = await paymentApi.getStatus();
    currentPlan.value = data.plan;
    subStatus.value = data.status;
    subscription.value = data.subscription;
  } catch {
    /* silent */
  }
}

onMounted(loadStatus);
</script>