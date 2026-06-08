<!-- AdminUsers.vue -->
<template>
  <div class="admin-users">

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" :placeholder="t('admin.users.searchPlaceholder')" class="search-input" @input="onSearch"/>
      </div>
      <div class="filters">
        <select v-model="planFilter" @change="fetchUsers(1)" class="filter-select">
          <option value="">{{ t('admin.users.allPlans') }}</option>
          <option value="free">{{ t('admin.plan.free') }}</option>
          <option value="pro">{{ t('admin.plan.pro') }}</option>
          <option value="enterprise">{{ t('admin.plan.enterprise') }}</option>
        </select>
      </div>
      <div class="total-badge">{{ t('admin.users.totalCount', { n: total }) }}</div>
    </div>

    <!-- Table -->
    <div class="panel">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.table.user') }}</th>
              <th>{{ t('admin.table.phone') }}</th>
              <th>{{ t('admin.table.plan') }}</th>
              <th>{{ t('admin.table.trialEnds') }}</th>
              <th>{{ t('admin.table.verified') }}</th>
              <th>{{ t('admin.table.joined') }}</th>
              <th>{{ t('admin.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="empty-row">{{ t('admin.loading') }}</td></tr>
            <tr v-else-if="!users.length"><td colspan="7" class="empty-row">{{ t('admin.users.noUsers') }}</td></tr>
            <tr v-else v-for="u in users" :key="u._id" :class="{ blocked: u.isBlocked }">
              <td>
                <div class="user-cell">
                  <div class="user-avatar" :class="{ blocked: u.isBlocked }">{{ u.name?.[0]?.toUpperCase() }}</div>
                  <div>
                    <p class="user-name">{{ u.name }} <span v-if="u.isAdmin" class="admin-tag">{{ t('admin.role') }}</span></p>
                    <p class="user-email">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="muted">{{ u.phone || '—' }}</td>
              <td><span class="plan-badge" :class="planClass(u)">{{ planLabel(u) }}</span></td>
              <td class="muted">{{ u.isTrial ? formatDate(u.trialEndsAt) : '—' }}</td>
              <td>
                <span class="verif-dot" :class="u.isVerified ? 'verified' : 'pending'">
                  {{ u.isVerified ? '✓' : '!' }}
                </span>
              </td>
              <td class="muted">{{ formatDate(u.createdAt) }}</td>
              <td>
                <div class="action-row">
                  <button class="act-btn block-btn" @click="toggleBlock(u)" :disabled="u.isAdmin">
                    {{ u.isBlocked ? t('admin.action.unblock') : t('admin.action.block') }}
                  </button>
                  <button class="act-btn edit-btn" @click="openEdit(u)">{{ t('admin.action.edit') }}</button>
                  <button class="act-btn delete-btn" @click="confirmDelete(u)" :disabled="u.isAdmin">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="pages > 1">
        <button class="page-btn" :disabled="page === 1"       @click="fetchUsers(page - 1)">{{ t('admin.pagination.prev') }}</button>
        <span class="page-info">{{ t('admin.pagination.pageOf', { page, pages }) }}</span>
        <button class="page-btn" :disabled="page === pages"   @click="fetchUsers(page + 1)">{{ t('admin.pagination.next') }}</button>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editUser" class="modal-overlay" @click.self="editUser = null">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ t('admin.users.editTitle', { name: editUser.name }) }}</h3>
          <button class="modal-close" @click="editUser = null">✕</button>
        </div>
        <div class="modal-body">
          <label class="field-label">{{ t('admin.table.plan') }}</label>
          <select v-model="editForm.plan" class="filter-select full">
            <option value="free">{{ t('admin.plan.free') }}</option>
<option value="pro">{{ t('admin.plan.pro') }}</option>
<option value="enterprise">{{ t('admin.plan.enterprise') }}</option>
          </select>

          <label class="field-label">{{ t('admin.users.trialActive') }}</label>
          <div class="toggle-row">
            <input type="checkbox" v-model="editForm.isTrial" id="isTrial"/>
            <label for="isTrial" class="toggle-label">{{ editForm.isTrial ? t('common.yes') : t('common.no') }}</label>
          </div>

          <div v-if="editForm.isTrial">
            <label class="field-label">{{ t('admin.users.trialEndsAt') }}</label>
            <input type="date" v-model="editForm.trialEndsAt" class="filter-select full"/>
          </div>

          <label class="field-label">{{ t('admin.users.emailVerified') }}</label>
          <div class="toggle-row">
            <input type="checkbox" v-model="editForm.isVerified" id="isVerified"/>
            <label for="isVerified" class="toggle-label">{{ editForm.isVerified ? t('admin.users.verified') : t('admin.users.notVerified') }}</label>
          </div>
          <!-- Is Admin -->
          <div class="form-group flex items-center gap-2" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: #fff;">
          <input 
            type="checkbox" 
            id="is-admin" 
            v-model="editForm.isAdmin" 
            class="custom-checkbox"
          />
          <label for="is-admin" class="checkbox-label">{{ t('admin.users.isAdmin') }}</label>
        </div>
        </div>
        <div class="modal-footer">
          <button class="act-btn edit-btn" @click="saveEdit" :disabled="saving">
            {{ saving ? t('admin.users.saving') : t('admin.users.saveChanges') }}
          </button>
          <button class="act-btn cancel" @click="editUser = null">{{ t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>{{ t('admin.users.deleteTitle') }}</h3>
          <button class="modal-close" @click="deleteTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p style="color:var(--sub,#6b7280); font-size:14px;">
            {{ t('admin.users.deleteConfirm', { name: deleteTarget.name }) }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="act-btn delete-btn" @click="doDelete" :disabled="saving">
            {{ saving ? t('admin.users.deleting') : t('admin.users.confirmDelete') }}
          </button>
          <button class="act-btn" @click="deleteTarget = null">{{ t('common.cancel') }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminApi from '../../api/adminApi'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const users        = ref([])
const loading      = ref(true)
const total        = ref(0)
const page         = ref(1)
const pages        = ref(1)
const search       = ref('')
const planFilter   = ref('')
const editUser     = ref(null)
const editForm     = ref({})
const deleteTarget = ref(null)
const saving       = ref(false)
// const Admin       = ref(false)
let searchTimer

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchUsers(1), 400)
}

async function fetchUsers(p = 1) {
  loading.value = true
  page.value    = p
  try {
    const res     = await adminApi.getUsers({ page: p, limit: 20, search: search.value, plan: planFilter.value })
    users.value   = res.users  || []
    total.value   = res.total  || 0
    pages.value   = res.pages  || 1
  } finally {
    loading.value = false
  }
}

async function toggleBlock(u) {
  const res   = await adminApi.blockUser(u._id)
  u.isBlocked = res.isBlocked
}

function openEdit(u) {
  editUser.value = u
  editForm.value = {
    plan:        u.plan || 'free',
    isTrial:     !!u.isTrial,
    trialEndsAt: u.trialEndsAt ? u.trialEndsAt.slice(0, 10) : '',
    isVerified:  !!u.isVerified,
    isAdmin:     !!u.isAdmin,
  }
}

async function saveEdit() {
  saving.value = true
  try {
    const updated = await adminApi.updateUser(editUser.value._id, {
      plan:        editForm.value.plan,
      isTrial:     editForm.value.isTrial,
      trialEndsAt: editForm.value.trialEndsAt ? new Date(editForm.value.trialEndsAt) : null,
      isVerified:  editForm.value.isVerified,
      isAdmin:     editForm.value.isAdmin,
    })
    console.log("البيانات الراجعة من السيرفر بعد التعديل:", updated)
    const idx = users.value.findIndex(u => u._id === editUser.value._id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], ...updated.user }
    editUser.value = null
  } finally {
    saving.value = false
  }
}

function confirmDelete(u) { deleteTarget.value = u }

async function doDelete() {
  saving.value = true
  try {
    await adminApi.deleteUser(deleteTarget.value._id)
    users.value    = users.value.filter(u => u._id !== deleteTarget.value._id)
    total.value   -= 1
    deleteTarget.value = null
  } finally {
    saving.value = false
  }
}

function planLabel(u) {
  if (u.isTrial) {
    const days = Math.ceil((new Date(u.trialEndsAt) - Date.now()) / 86400000)
    return days > 0
      ? t('admin.plan.trialDays', { days })
      : t('admin.plan.trialExpired')
  }
  return u.plan || t('admin.plan.free')
}

function planClass(u) {
  if (u.isTrial) return new Date(u.trialEndsAt) > Date.now() ? 'trial' : 'expired'
  if (u.plan === 'pro') return 'pro'
  if (u.plan === 'enterprise') return 'enterprise'
  return 'free'
}
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'
}

onMounted(() => fetchUsers())
</script>

<style scoped>
[dir="rtl"] .admin-table th,
[dir="rtl"] .admin-table td {
  text-align: right;
}

[dir="rtl"] .user-cell {
  flex-direction: row;
}

[dir="rtl"] .toolbar {
  flex-direction: row-reverse;
}

[dir="rtl"] .search-icon {
  left: auto;
  right: 12px;
}

[dir="rtl"] .search-input {
  padding: 9px 36px 9px 12px;
}

[dir="rtl"] .action-row {
  justify-content: flex-end;
}

[dir="rtl"] .pagination {
  flex-direction: row-reverse;
}

.admin-users { display: flex; flex-direction: column; gap: 1.25rem; }

.toolbar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 220px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--sub, #6b7280); }
.search-input {
  width: 100%; padding: 9px 12px 9px 36px; border-radius: 10px;
  background: var(--surface, #13151c); border: 1px solid var(--border, rgba(255,255,255,0.08));
  color: var(--text, #f0f2f5); font-size: 13px; outline: none;
}
.search-input:focus { border-color: rgba(59,130,246,0.4); }
.filter-select {
  padding: 9px 12px; border-radius: 10px;
  background: var(--surface, #13151c); border: 1px solid var(--border, rgba(255,255,255,0.08));
  color: var(--text, #f0f2f5); font-size: 13px; outline: none; cursor: pointer;
}
.filter-select.full { width: 100%; margin-bottom: 1rem; }
.total-badge { font-size: 12px; color: var(--sub, #6b7280); white-space: nowrap; }

.panel {
  background: var(--surface, #13151c);
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 14px; overflow: hidden;
}
.table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.admin-table th {
  text-align: left; font-size: 11px; color: var(--sub, #6b7280); font-weight: 500;
  padding: 12px 14px; text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border, rgba(255,255,255,0.06));
  background: rgba(255,255,255,0.02);
}
.admin-table td { padding: 11px 14px; border-bottom: 1px solid var(--border, rgba(255,255,255,0.04)); color: var(--text, #f0f2f5); }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr.blocked { opacity: 0.5; }
.empty-row { text-align: center; color: var(--sub, #6b7280); padding: 3rem !important; }
.muted { color: var(--sub, #6b7280) !important; font-size: 12px; }

.user-cell  { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: white;
}
.user-avatar.blocked { background: #374151; }
.user-name  { font-size: 13px; font-weight: 500; color: var(--text, #f0f2f5); margin: 0; display: flex; align-items: center; gap: 6px; }
.user-email { font-size: 11px; color: var(--sub, #6b7280); margin: 0; }
.admin-tag  { font-size: 10px; background: rgba(139,92,246,0.15); color: #a78bfa; border-radius: 4px; padding: 1px 5px; }

.plan-badge { font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 500; }
.plan-badge.trial      { background: rgba(245,158,11,0.12); color: #fbbf24; }
.plan-badge.expired    { background: rgba(239,68,68,0.12);  color: #f87171; }
.plan-badge.free       { background: rgba(107,114,128,0.12); color: #9ca3af; }
.plan-badge.pro        { background: rgba(59,130,246,0.12);  color: #60a5fa; }
.plan-badge.enterprise { background: rgba(139,92,246,0.12);  color: #a78bfa; }

.verif-dot { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
.verif-dot.verified { background: rgba(16,185,129,0.15); color: #34d399; }
.verif-dot.pending  { background: rgba(245,158,11,0.15);  color: #fbbf24; }

.action-row { display: flex; align-items: center; gap: 6px; }
.act-btn    { font-size: 11px; padding: 4px 10px; border-radius: 6px; cursor: pointer; border: 1px solid; font-weight: 500; transition: all 0.15s; background: transparent; }
.act-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.block-btn  { border-color: rgba(239,68,68,0.2); color: #f87171; }
.block-btn:hover:not(:disabled) { background: rgba(239,68,68,0.1); }
.edit-btn   { border-color: rgba(59,130,246,0.2); color: #60a5fa; }
.edit-btn:hover { background: rgba(59,130,246,0.1); }
.delete-btn { border-color: rgba(239,68,68,0.2); color: #f87171; }
.delete-btn:hover:not(:disabled) { background: rgba(239,68,68,0.15); }

.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1rem; border-top: 1px solid var(--border, rgba(255,255,255,0.06)); }
.page-btn   { font-size: 13px; padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border, rgba(255,255,255,0.08)); background: transparent; color: var(--text, #f0f2f5); cursor: pointer; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-info  { font-size: 13px; color: var(--sub, #6b7280); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal {
  background: var(--surface, #13151c); border: 1px solid var(--border, rgba(255,255,255,0.1));
  border-radius: 16px; width: 420px; max-width: 90vw;
}
.modal-sm { width: 360px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border, rgba(255,255,255,0.06)); }
.modal-header h3 { font-size: 15px; font-weight: 600; color: var(--text, #f0f2f5); margin: 0; }
.modal-close { background: none; border: none; cursor: pointer; color: var(--sub, #6b7280); font-size: 16px; }
.modal-body { padding: 1.5rem; }
.modal-footer { display: flex; gap: 0.75rem; padding: 1.25rem 1.5rem; border-top: 1px solid var(--border, rgba(255,255,255,0.06)); justify-content: flex-end; }
.field-label { display: block; font-size: 12px; color: var(--sub, #6b7280); margin-bottom: 6px; font-weight: 500; }
.toggle-row { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; }
.toggle-label { font-size: 13px; color: var(--text, #f0f2f5); cursor: pointer; }
.cancel { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.1); color: var(--text, #f0f2f5); }
.cancel:hover { background: rgba(255,255,255,0.15); }
</style>
