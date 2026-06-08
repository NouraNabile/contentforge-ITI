<template>
  <div class="admin-dashboard">

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-icon" :style="{ background: s.iconBg }">
          <span v-html="s.icon"></span>
        </div>
        <div class="stat-body">
          <p class="stat-label">{{ s.label }}</p>
          <p class="stat-value">{{ loading ? '—' : s.value }}</p>
          <p v-if="s.sub" class="stat-sub" :class="s.subColor">{{ s.sub }}</p>
        </div>
      </div>
    </div>

    <!-- Middle Row -->
    <div class="mid-row">

      <!-- Recent Users -->
      <div class="panel users-panel">
        <div class="panel-header">
          <h2 class="panel-title">Recent Users</h2>
          <RouterLink to="/admin/users" class="panel-link">View all →</RouterLink>
        </div>
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="5" class="empty-row">Loading...</td></tr>
              <tr v-else-if="!recentUsers.length"><td colspan="5" class="empty-row">No users yet</td></tr>
              <tr v-else v-for="u in recentUsers" :key="u._id">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ u.name?.[0]?.toUpperCase() }}</div>
                    <div>
                      <p class="user-name">{{ u.name }}</p>
                      <p class="user-email">{{ obfuscate(u.email) }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="plan-badge" :class="planClass(u)">{{ planLabel(u) }}</span></td>
                <td>
                  <span class="verif-dot" :class="u.isVerified ? 'verified' : 'pending'">
                    {{ u.isVerified ? '✓' : '!' }}
                  </span>
                </td>
                <td class="muted-cell">{{ formatDate(u.createdAt) }}</td>
                <td>
                  <button class="action-btn block-btn" @click="blockUser(u)">
                    {{ u.isBlocked ? 'Unblock' : 'Block' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Platform Health -->
      <div class="panel health-panel">
        <div class="panel-header">
          <h2 class="panel-title">Platform Health</h2>
        </div>
        <div class="health-items">
          <div class="health-item">
            <div class="health-label">
              <span>Server Uptime</span>
              <span class="health-val green">{{ uptimeStr }}</span>
            </div>
            <div class="health-bar"><div class="health-fill green-fill" style="width:99.8%"></div></div>
          </div>
          <div class="health-item">
              <div class="health-label">
              <span>Active Trials</span>
              <span class="health-val blue">{{ stats.activeTrialUsers ?? '—' }}</span>
            </div>
            <div class="health-bar">
              <div class="health-fill blue-fill"
                :style="{ width: stats.totalUsers ? (stats.activeTrialUsers / stats.totalUsers * 100) + '%' : '0%' }">
              </div>
            </div>
          </div>
          <div class="health-item">
            <div class="health-label">
              <span>Pending Verifications</span>
              <span class="health-val amber">{{ stats.pendingVerifications ?? '—' }}</span>
            </div>
            <div class="health-bar">
              <div class="health-fill amber-fill"
                :style="{ width: stats.totalUsers ? Math.min(stats.pendingVerifications / stats.totalUsers * 100, 100) + '%' : '0%' }">
              </div>
            </div>
          </div>
        </div>

        <div class="quick-stats">
          <div class="qs-item">
            <p class="qs-val">{{ stats.newUsersThisWeek ?? '—' }}</p>
            <p class="qs-label">New this week</p>
          </div>
          <div class="qs-item">
            <p class="qs-val" :class="stats.registrationGrowth >= 0 ? 'green' : 'red'">
              {{ stats.registrationGrowth >= 0 ? '+' : '' }}{{ stats.registrationGrowth ?? '—' }}%
            </p>
            <p class="qs-label">vs last week</p>
          </div>
          <div class="qs-item">
            <p class="qs-val">{{ stats.totalUsers ?? '—' }}</p>
            <p class="qs-label">Total users</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Trends Row -->
    <div class="panel trends-panel">
      <div class="panel-header">
        <h2 class="panel-title">Top Arabic Trends</h2>
        <RouterLink to="/admin/trends" class="panel-link">Manage →</RouterLink>
      </div>
      <div class="trends-list">
        <div v-if="loadingTrends" class="empty-row">Loading...</div>
        <div v-else v-for="(t, i) in trends" :key="t._id" class="trend-row">
          <span class="trend-rank">#{{ i + 1 }}</span>
          <span class="trend-topic">{{ t.tag }}</span>
          <span class="trend-cat">{{ t.category }}</span>
          <div class="trend-bar-wrap">
            <div class="trend-bar" :style="{ width: t.velocity + '%' }"></div>
          </div>
          <span class="trend-score">{{ t.velocity }}</span>
          <span class="trend-change" :class="t.change">
            {{ t.change === 'up' ? '↑' : t.change === 'down' ? '↓' : '→' }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import adminApi from '../../api/adminApi'

const loading       = ref(true)
const loadingTrends = ref(true)
const stats         = ref({})
const recentUsers   = ref([])
const trends        = ref([])

const uptimeStr = computed(() => {
  const s = stats.value.serverUptime || 0
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
})

const statCards = computed(() => [
  {
    label: 'Total Users',
    value: stats.value.totalUsers?.toLocaleString() ?? '—',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
    iconBg: 'rgba(59,130,246,0.12)',
    sub: `+${stats.value.newUsersThisWeek ?? 0} this week`,
    subColor: 'green',
  },
    {
    label: 'New Users (24h)',
    value: stats.value.newUsers24h ?? '—',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
    iconBg: 'rgba(168,85,247,0.12)',
    sub: 'Registered in last 24h',
    subColor: 'muted',
  },
  {
    label: 'Pending Verification',
    value: stats.value.pendingVerifications ?? '—',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
    iconBg: 'rgba(245,158,11,0.12)',
    sub: 'Awaiting OTP',
    subColor: 'amber',
  },
  {
    label: 'New Posts (24h)',
    value: stats.value.newPostsLast24h?.toLocaleString() ?? '—',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>`,
    iconBg: 'rgba(139,92,246,0.12)',
    sub: 'Content generated',
    subColor: 'muted',
  },
])

function obfuscate(email) {
  if (!email) return ''
  const [user, domain] = email.split('@')
  return user.slice(0, 2) + '****@' + domain
}

function planLabel(u) {
  if (u.isTrial) {
    const days = Math.ceil((new Date(u.trialEndsAt) - Date.now()) / 86400000)
    return days > 0 ? `Trial (${days}d left)` : 'Trial expired'
  }
  return u.plan || 'free'
}

function planClass(u) {
  if (u.isTrial) return 'trial'
  if (u.plan === 'pro') return 'pro'
  if (u.plan === 'enterprise') return 'enterprise'
  return 'free'
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'
}

async function blockUser(u) {
  await adminApi.blockUser(u._id)
  u.isBlocked = !u.isBlocked
}

onMounted(async () => {
  try {
    const [statsRes, usersRes] = await Promise.all([
      adminApi.getStats(),
      adminApi.getUsers({ limit: 6 }),
    ])
    stats.value       = statsRes
    recentUsers.value = usersRes.users || []
  } finally {
    loading.value = false
  }

  try {
    const t = await adminApi.getTrends()
    trends.value = t.trends || []
  } finally {
    loadingTrends.value = false
  }
})
</script>

<style scoped>
.admin-dashboard { display: flex; flex-direction: column; gap: 1.5rem; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.stat-card {
  display: flex; gap: 1rem; align-items: flex-start;
  background: var(--surface, #13151c);
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 14px; padding: 1.25rem;
}
.stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #a0aec0; }
.stat-label { font-size: 12px; color: var(--sub, #6b7280); margin: 0 0 4px; }
.stat-value { font-size: 26px; font-weight: 700; color: var(--text, #f0f2f5); margin: 0 0 4px; line-height: 1; }
.stat-sub   { font-size: 11px; margin: 0; }
.stat-body  { min-width: 0; }

/* Mid Row */
.mid-row { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; }

/* Panels */
.panel {
  background: var(--surface, #13151c);
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 14px; padding: 1.5rem;
}
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.panel-title  { font-size: 15px; font-weight: 600; color: var(--text, #f0f2f5); margin: 0; }
.panel-link   { font-size: 12px; color: #60a5fa; text-decoration: none; }
.panel-link:hover { text-decoration: underline; }

/* Table */
.table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.admin-table th { text-align: left; font-size: 11px; color: var(--sub, #6b7280); font-weight: 500; padding: 0 12px 10px; text-transform: uppercase; letter-spacing: 0.05em; }
.admin-table td { padding: 10px 12px; border-top: 1px solid var(--border, rgba(255,255,255,0.06)); color: var(--text, #f0f2f5); }
.empty-row { text-align: center; color: var(--sub, #6b7280); padding: 2rem !important; }
.muted-cell { color: var(--sub, #6b7280) !important; }

.user-cell  { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: white;
}
.user-name  { font-size: 13px; font-weight: 500; color: var(--text, #f0f2f5); margin: 0; }
.user-email { font-size: 11px; color: var(--sub, #6b7280); margin: 0; }

.plan-badge { font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 500; }
.plan-badge.trial      { background: rgba(245,158,11,0.12); color: #fbbf24; }
.plan-badge.free       { background: rgba(107,114,128,0.12); color: #9ca3af; }
.plan-badge.pro        { background: rgba(59,130,246,0.12);  color: #60a5fa; }
.plan-badge.enterprise { background: rgba(139,92,246,0.12);  color: #a78bfa; }

.verif-dot { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
.verif-dot.verified { background: rgba(16,185,129,0.15); color: #34d399; }
.verif-dot.pending  { background: rgba(245,158,11,0.15);  color: #fbbf24; }

.action-btn { font-size: 11px; padding: 4px 10px; border-radius: 6px; cursor: pointer; border: 1px solid; font-weight: 500; }
.block-btn  { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color: #f87171; }
.block-btn:hover { background: rgba(239,68,68,0.2); }

/* Health */
.health-items { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }
.health-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--sub, #6b7280); margin-bottom: 6px; }
.health-val   { font-weight: 600; }
.health-val.green { color: #34d399; }
.health-val.blue  { color: #60a5fa; }
.health-val.amber { color: #fbbf24; }
.health-bar   { height: 5px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
.health-fill  { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
.green-fill { background: #34d399; }
.blue-fill  { background: #60a5fa; }
.amber-fill { background: #fbbf24; }

.quick-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 1rem; }
.qs-item { background: rgba(255,255,255,0.03); border: 1px solid var(--border, rgba(255,255,255,0.06)); border-radius: 10px; padding: 0.75rem; text-align: center; }
.qs-val   { font-size: 18px; font-weight: 700; color: var(--text, #f0f2f5); margin: 0 0 2px; }
.qs-label { font-size: 10px; color: var(--sub, #6b7280); margin: 0; }

/* Colors */
.green { color: #34d399; }
.red   { color: #f87171; }
.amber { color: #fbbf24; }
.muted { color: var(--sub, #6b7280); }

/* Trends */
.trends-panel .panel-header { margin-bottom: 1rem; }
.trends-list { display: flex; flex-direction: column; gap: 0.5rem; }
.trend-row { display: grid; grid-template-columns: 28px 1fr 90px 120px 36px 24px; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border, rgba(255,255,255,0.04)); }
.trend-rank  { font-size: 12px; color: var(--sub, #6b7280); font-weight: 600; }
.trend-topic { font-size: 14px; color: var(--text, #f0f2f5); font-weight: 500; direction: rtl; }
.trend-cat   { font-size: 11px; color: var(--sub, #6b7280); }
.trend-bar-wrap { height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
.trend-bar  { height: 100%; background: linear-gradient(90deg, #3b82f6, #14b8a6); border-radius: 999px; }
.trend-score { font-size: 12px; color: var(--sub, #6b7280); text-align: right; }
.trend-change { font-size: 13px; font-weight: 700; }
.trend-change.up   { color: #34d399; }
.trend-change.down { color: #f87171; }
.trend-change.same { color: #6b7280; }

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .mid-row    { grid-template-columns: 1fr; }
}
</style>
