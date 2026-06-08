<!-- AdminPlans.vue -->
<template>
  <div class="admin-plans">

    <!-- Plan Counts -->
    <div class="counts-grid">
      <div class="count-card" v-for="c in countCards" :key="c.label">
        <p class="count-val" :class="c.color">{{ loading ? '—' : c.value }}</p>
        <p class="count-label">{{ c.label }}</p>
      </div>
    </div>

    <!-- Trial Users Table -->
    <div class="panel">
      <div class="panel-header">
        <h2 class="panel-title">{{ t('admin.plans.trialUsers') }}</h2>
        <div class="header-tabs">
          <button class="tab" :class="{ active: tab === 'active' }" @click="tab = 'active'">{{ t('admin.plans.tabActive') }}</button>
          <button class="tab" :class="{ active: tab === 'expired' }" @click="tab = 'expired'">{{ t('admin.plans.tabExpired') }}</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.table.user') }}</th>
              <th>{{ t('admin.plans.trialEnds') }}</th>
              <th>{{ t('admin.plans.daysLeft') }}</th>
              <th>{{ t('admin.table.status') }}</th>
              <th>{{ t('admin.table.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="empty-row">{{ t('admin.loading') }}</td>
            </tr>
            <tr v-else-if="!filteredTrialUsers.length">
              <td colspan="5" class="empty-row">{{ tab === 'active' ? t('admin.plans.noActive') : t('admin.plans.noExpired') }}</td>
            </tr>
            <tr v-else v-for="u in filteredTrialUsers" :key="u._id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ u.name?.[0]?.toUpperCase() }}</div>
                  <div>
                    <p class="user-name">{{ u.name }}</p>
                    <p class="user-email">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="muted">{{ formatDate(u.trialEndsAt) }}</td>
              <td>
                <span :class="daysClass(u)">{{ daysLeft(u) }}</span>
              </td>
              <td>
                <span class="plan-badge" :class="isExpired(u) ? 'expired' : 'trial'">
                  {{ isExpired(u) ? t('admin.plan.trialExpired') : t('admin.plan.trialActive') }}
                </span>
              </td>
              <td>
                <button class="act-btn extend-btn" @click="extendTrial(u)">{{ t('admin.plans.extend7') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import adminApi from '../../api/adminApi'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()


const loading = ref(true)
const counts = ref({})
const trialUsers = ref([])
const tab = ref('active')

// countCards
const countCards = computed(() => [
  { label: t('admin.plans.freeUsers'), value: counts.value.free ?? '—', color: 'gray' },
  { label: t('admin.plans.activeTrials'), value: counts.value.trial ?? '—', color: 'amber' },
  { label: t('admin.plans.proUsers'), value: counts.value.pro ?? '—', color: 'blue' },
  { label: t('admin.plans.enterprise'), value: counts.value.enterprise ?? '—', color: 'purple' },
  { label: t('admin.plans.expiredTrials'), value: counts.value.expiredTrials ?? '—', color: 'red' },
])

const filteredTrialUsers = computed(() =>
  trialUsers.value.filter(u => tab.value === 'expired' ? isExpired(u) : !isExpired(u))
)

function isExpired(u) { return new Date(u.trialEndsAt) < new Date() }
function daysLeft(u) {
  const d = Math.ceil((new Date(u.trialEndsAt) - Date.now()) / 86400000)
  return isExpired(u)
    ? t('admin.plans.daysAgo', { n: Math.abs(d) })
    : t('admin.plans.daysRemaining', { n: d })
}
function daysClass(u) {
  if (isExpired(u)) return 'days-expired'
  const d = Math.ceil((new Date(u.trialEndsAt) - Date.now()) / 86400000)
  return d <= 3 ? 'days-warn' : 'days-ok'
}
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'
}

async function extendTrial(u) {
  const newEnd = new Date(Math.max(new Date(u.trialEndsAt), Date.now()))
  newEnd.setDate(newEnd.getDate() + 7)
  await adminApi.updateUser(u._id, { trialEndsAt: newEnd, isTrial: true })
  u.trialEndsAt = newEnd.toISOString()
}

onMounted(async () => {
  try {
    const res = await adminApi.getPlans()
    counts.value = res.counts || {}
    trialUsers.value = res.trialUsers || []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
[dir="rtl"] .admin-table th,
[dir="rtl"] .admin-table td {
  text-align: right;
}

[dir="rtl"] .user-cell {
  flex-direction: row;
}

[dir="rtl"] .panel-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .header-tabs {
  flex-direction: row-reverse;
}

[dir="rtl"] .act-btn {
  direction: ltr;
}

.admin-plans {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.counts-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.count-card {
  background: var(--surface, #13151c);
  border: 1px solid var(--border, rgba(255, 255, 255, 0.06));
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
}

.count-val {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px;
}

.count-label {
  font-size: 12px;
  color: var(--sub, #6b7280);
  margin: 0;
}

.gray {
  color: #9ca3af;
}

.amber {
  color: #fbbf24;
}

.blue {
  color: #60a5fa;
}

.purple {
  color: #a78bfa;
}

.red {
  color: #f87171;
}

.panel {
  background: var(--surface, #13151c);
  border: 1px solid var(--border, rgba(255, 255, 255, 0.06));
  border-radius: 14px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.06));
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text, #f0f2f5);
  margin: 0;
}

.header-tabs {
  display: flex;
  gap: 4px;
}

.tab {
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  background: transparent;
  color: var(--sub, #6b7280);
  cursor: pointer;
}

.tab.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.admin-table th {
  text-align: left;
  font-size: 11px;
  color: var(--sub, #6b7280);
  font-weight: 500;
  padding: 12px 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admin-table td {
  padding: 11px 14px;
  border-top: 1px solid var(--border, rgba(255, 255, 255, 0.04));
  color: var(--text, #f0f2f5);
}

.empty-row {
  text-align: center;
  color: var(--sub, #6b7280);
  padding: 2.5rem !important;
}

.muted {
  color: var(--sub, #6b7280) !important;
  font-size: 12px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text, #f0f2f5);
  margin: 0;
}

.user-email {
  font-size: 11px;
  color: var(--sub, #6b7280);
  margin: 0;
}

.plan-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 500;
}

.plan-badge.trial {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}

.plan-badge.expired {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.days-ok {
  color: #34d399;
  font-size: 12px;
  font-weight: 500;
}

.days-warn {
  color: #fbbf24;
  font-size: 12px;
  font-weight: 500;
}

.days-expired {
  color: #f87171;
  font-size: 12px;
  font-weight: 500;
}

.act-btn {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid;
  font-weight: 500;
  transition: all 0.15s;
  background: transparent;
}

.extend-btn {
  border-color: rgba(20, 184, 166, 0.2);
  color: #2dd4bf;
}

.extend-btn:hover {
  background: rgba(20, 184, 166, 0.1);
}

@media (max-width: 900px) {
  .counts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
