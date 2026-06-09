<!-- AdminTrends.vue -->
<template>
  <div class="admin-trends">
    <div class="panel">
      <div class="panel-header">
        <h2 class="panel-title">Top Arabic Trends</h2>
        <span class="total-badge">{{ trends.length }} topics</span>
      </div>
      <div v-if="loading" class="empty-row">Loading trends…</div>
      <div v-else class="trends-list">
        <div v-for="(t, i) in trends" :key="t._id" class="trend-row">
          <span class="trend-rank">#{{ i + 1 }}</span>
          <div class="trend-info">
            <span class="trend-topic">{{ t.tag }}</span>
            <span class="trend-cat">{{ t.category }}</span>
          </div>
          <div class="trend-bar-wrap">
            <div class="trend-bar" :style="{ width: t.velocity + '%' }"></div>
          </div>
          <span class="trend-score">{{ t.velocity }}</span>
          <span class="trend-change" :class="t.change">
            {{ t.change === 'up' ? '↑' : t.change === 'down' ? '↓' : '→' }}
          </span>
        </div>
        <div v-if="!trends.length" class="empty-row">No trends data yet</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminApi from '../../api/adminApi'
const trends  = ref([])
const loading = ref(true)
onMounted(async () => {
  try   { const r = await adminApi.getTrends(); trends.value = r.trends || [] }
  finally { loading.value = false }
})
</script>

<style scoped>
.admin-trends { display: flex; flex-direction: column; gap: 1.25rem; }
.panel { background: var(--surface,#13151c); border: 1px solid var(--border,rgba(255,255,255,0.06)); border-radius: 14px; padding: 1.5rem; }
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.panel-title  { font-size: 15px; font-weight: 600; color: var(--text,#f0f2f5); margin: 0; }
.total-badge  { font-size: 12px; color: var(--sub,#6b7280); }
.empty-row    { text-align: center; color: var(--sub,#6b7280); padding: 2rem 0; }
.trends-list  { display: flex; flex-direction: column; }
.trend-row    { display: grid; grid-template-columns: 32px 1fr 140px 40px 24px; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border,rgba(255,255,255,0.04)); }
.trend-row:last-child { border-bottom: none; }
.trend-rank  { font-size: 12px; color: var(--sub,#6b7280); font-weight: 700; }
.trend-info  { display: flex; flex-direction: column; gap: 2px; }
.trend-topic { font-size: 14px; color: var(--text,#f0f2f5); font-weight: 500; direction: rtl; }
.trend-cat   { font-size: 11px; color: var(--sub,#6b7280); }
.trend-bar-wrap { height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
.trend-bar  { height: 100%; background: linear-gradient(90deg,#3b82f6,#14b8a6); border-radius: 999px; }
.trend-score { font-size: 12px; color: var(--sub,#6b7280); text-align: right; }
.trend-change { font-size: 13px; font-weight: 700; }
.trend-change.up   { color: #34d399; }
.trend-change.down { color: #f87171; }
.trend-change.same { color: #6b7280; }
</style>
