<template>
  <div class="admin-users">

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" placeholder="Search by name or email…" class="search-input" @input="onSearch"/>
      </div>
      <div class="filters">
        <select v-model="planFilter" @change="fetchUsers(1)" class="filter-select">
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
      <div class="total-badge">{{ total }} users</div>
    </div>

    <!-- Table -->
    <div class="panel">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Phone</th>
              <th>Plan</th>
              <th>Trial Ends</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="empty-row">Loading users…</td></tr>
            <tr v-else-if="!users.length"><td colspan="7" class="empty-row">No users found</td></tr>
              <tr v-else v-for="u in users" :key="u._id" :class="{ blocked: u.isBlocked, deleting: u._approving }">              <td>
                <div class="user-cell">
                  <div class="user-avatar" :class="{ blocked: u.isBlocked }">{{ u.name?.[0]?.toUpperCase() }}</div>
                  <div>
                    <p class="user-name">{{ u.name }} <span v-if="u.isAdmin" class="admin-tag">Admin</span></p>
                    <p class="user-email">{{ u.email }}</p>
                    <span v-if="u.isAskToDelete" 
                      style="background:#FCEBEB; color:#E24B4A; font-size:10px; padding:2px 8px; border-radius:20px; display:inline-block; margin-top:4px;">
                      Deletion Requested
                    </span>
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
              <td >
                 <div class="action-row">
  <button 
    class="act-btn" 
    :class="u.blockStatus === 'warning' ? 'warning-btn' : u.isBlocked ? 'unblock-btn' : 'block-btn'"
    @click="handleBlockAction(u)"
    :disabled="u.isAdmin"
  >
    {{ u.blockStatus === 'warning' ? 'Cancel Warning' : u.isBlocked ? 'Unblock' : 'Block' }}
  </button>
  <button class="act-btn edit-btn" @click="openEdit(u)">Edit</button>
  <button class="act-btn delete-btn" @click="confirmDelete(u)" :disabled="u.isAdmin">✕</button>
  <button v-if="u.isAskToDelete" class="act-btn approve-btn" @click="approveDeletion(u)">
    Approve Deletion
  </button>
</div>
<br />
<p v-if="u.blockStatus === 'warning' && u.gracePeriodExpiresAt" class="timer-sub">
  Ends in: {{ getRemainingTime(u.gracePeriodExpiresAt) }}
</p>
               
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="pages > 1">
        <button class="page-btn" :disabled="page === 1"       @click="fetchUsers(page - 1)">← Prev</button>
        <span class="page-info">Page {{ page }} of {{ pages }}</span>
        <button class="page-btn" :disabled="page === pages"   @click="fetchUsers(page + 1)">Next →</button>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editUser" class="modal-overlay" @click.self="editUser = null">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit User — {{ editUser.name }}</h3>
          <button class="modal-close" @click="editUser = null">✕</button>
        </div>
        <div class="modal-body">
          <label class="field-label">Plan</label>
          <select v-model="editForm.plan" class="filter-select full">
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <label class="field-label">Trial Active</label>
          <div class="toggle-row">
            <input type="checkbox" v-model="editForm.isTrial" id="isTrial"/>
            <label for="isTrial" class="toggle-label">{{ editForm.isTrial ? 'Yes' : 'No' }}</label>
          </div>

          <div v-if="editForm.isTrial">
            <label class="field-label">Trial Ends At</label>
            <input type="date" v-model="editForm.trialEndsAt" class="filter-select full"/>
          </div>

          <label class="field-label">Email Verified</label>
          <div class="toggle-row">
            <input type="checkbox" v-model="editForm.isVerified" id="isVerified"/>
            <label for="isVerified" class="toggle-label">{{ editForm.isVerified ? 'Verified' : 'Not verified' }}</label>
          </div>
          <!-- Is Admin -->
          <div class="form-group flex items-center gap-2" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: #fff;">
          <input 
            type="checkbox" 
            id="is-admin" 
            v-model="editForm.isAdmin" 
            class="custom-checkbox"
          />
          <label for="is-admin" class="checkbox-label">Is Admin</label>
        </div>
        </div>
        <div class="modal-footer">
          <button class="act-btn edit-btn" @click="saveEdit" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
          <button class="act-btn cancel" @click="editUser = null">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>Delete User</h3>
          <button class="modal-close" @click="deleteTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p style="color:var(--sub,#6b7280); font-size:14px;">
            Are you sure you want to permanently delete <strong style="color:var(--text,#f0f2f5)">{{ deleteTarget.name }}</strong>? This cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button class="act-btn delete-btn" @click="doDelete" :disabled="saving">
            {{ saving ? 'Deleting…' : 'Yes, delete' }}
          </button>
          <button class="act-btn" @click="deleteTarget = null">Cancel</button>
        </div>
      </div>
    </div>
<!-- //////////////////////////////////////////// Block Warning Modal -->
 
    <div v-if="showReasonModal" class="modal-overlay" @click.self="closeModal">
  <div class="modal-content">
    <h3>Issue Policy Violation Warning</h3>
    <p>Please provide a reason. The user will receive an email and a 24-hour grace period before final block.</p>
    
    <textarea 
      v-model="blockReason" 
      placeholder="e.g., Using abusive language in content generation..."
      rows="3"
    ></textarea>
    
    <div class="modal-actions">
      <button class="cancel-modal-btn" @click="closeModal">Cancel</button>
      <button class="confirm-modal-btn" :disabled="!blockReason.trim()" @click="submitBlockWarning">
        Confirm & Send Alert
      </button>
    </div>
  </div>
</div>
  </div>
  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminApi from '../../api/adminApi'

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

const showReasonModal = ref(false)
const blockReason = ref('')
const selectedUser = ref(null)

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchUsers(1), 400)
}

async function fetchUsers(p = 1) {
  loading.value = true
  page.value    = p
  try {
    const res = await adminApi.getUsers({ page: p, limit: 20, search: search.value, plan: planFilter.value })
    
    // 🌟 التعديل هنا: هنفلتر الـ users اللي جايين ونشيل منهم أي حد الـ isDeleted بتاعه بـ true
    const fetchedUsers = (res.users || []).filter(u => u.isDeleted !== true)
    
    users.value = fetchedUsers.map(u => {
      const savedStatus = localStorage.getItem(`user_status_${u._id}`)
      if (savedStatus) {
        const parsed = JSON.parse(savedStatus)
        u.blockStatus = parsed.blockStatus
        u.gracePeriodExpiresAt = parsed.gracePeriodExpiresAt
      }
      return u
    })

    // تعديل الـ total عشان يعكس العدد الحقيقي بعد الفلترة في الـ UI
    total.value   = fetchedUsers.length
    pages.value   = res.pages  || 1
  } finally {
    loading.value = false
  }
}

// async function toggleBlock(u) {
//   const res   = await adminApi.blockUser(u._id)
//   u.isBlocked = res.isBlocked
// }


// 2. عند الضغط على Confirm داخل الـ Modal (حفظ التحذير وإرساله للـ DB)
async function submitBlockWarning() {
  if (!blockReason.value.trim() || !selectedUser.value) return

  const userToUpdate = selectedUser.value
  
  try {
    // 🌟 بننادي السيرفر عشان يِقفل الحساب في الـ DB حقيقي وتِسمع في قاعدة البيانات
    const res = await adminApi.blockUser(userToUpdate._id, blockReason.value.trim())
    
    // بنحدث البيانات في الفرونت إند عشان تاخد شكل التحذير الأصفر والعداد
    userToUpdate.isBlocked = res.isBlocked // هتبقى true في الـ DB وهتسمع فوراً
    userToUpdate.blockStatus = 'warning'
    userToUpdate.gracePeriodExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    // 💾 بنحفظ حالة الـ warning في المتصفح عشان لما تعملي Refresh تفتكر إن الـ true دي عبارة عن warning
    localStorage.setItem(`user_status_${userToUpdate._id}`, JSON.stringify({
      blockStatus: 'warning',
      gracePeriodExpiresAt: userToUpdate.gracePeriodExpiresAt
    }))

    closeModal()
    alert("Warning issued and saved to DB successfully!")
  } catch (error) {
    console.error("Error saving warning to DB:", error)
    alert("Failed to sync with database.")
  }
}

async function executeToggleBlock(u) {
  try {
    // 🌟 لو عليه warning أو متبلك وعايزين نلغيه، بنفهم الفرونت إند يصفر الحالة فوراً
    const res = await adminApi.blockUser(u._id)
    
    if (u.blockStatus === 'warning') {
      // لو كان تحذير وألغيناه، المتسخدم يرجع نشط تماماً والـ isBlocked تفضل false
      u.isBlocked = false
      u.blockStatus = null
    } else {
      // لو كان بلوك حقيقي وفكناه أو العكس
      u.isBlocked = res.isBlocked
      u.blockStatus = null
    }
    
    // بنشيلها من ذاكرة المتصفح عشان تثبت بعد الريفريش
    localStorage.removeItem(`user_status_${u._id}`)
  } catch (error) {
    console.error("Error toggling block:", error)
  }
}

// 4. دالة إغلاق المودال
function closeModal() {
  showReasonModal.value = false
  selectedUser.value = null
  blockReason.value = ''
}
function handleBlockAction(u) {
  selectedUser.value = u
  if (u.isBlocked || u.blockStatus === 'warning') {
    executeToggleBlock(u)
  } else {
    blockReason.value = ''
    showReasonModal.value = true
  }
}

// دالة حساب الوقت المتبقي عشان العداد ميطلعش خطأ
function getRemainingTime(expiry) {
  if (!expiry) return '24h'
  const diff = new Date(expiry) - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${mins}m`
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
    return days > 0 ? `Trial (${days}d)` : 'Trial expired'
  }
  return u.plan || 'free'
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
async function approveDeletion(u) {
  try {
    const idx = users.value.findIndex(x => x._id === u._id)
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], _approving: true }
    }
    
    // اضربي السيرفر
    await adminApi.approveDeletion(u._id)
    
    // استني لفة الـ أنيميشن وبعدها حدثي اللستة بالكامل من السيرفر النظيف
    setTimeout(async () => {
      await fetchUsers(page.value)
    }, 1500)

  } catch (err) {
    console.error("Error approving deletion:", err)
    const idx = users.value.findIndex(x => x._id === u._id)
    if (idx !== -1) users.value[idx]._approving = false
  }
}
onMounted(() => fetchUsers())
</script>

<style scoped>
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
/* خلفية الشاشة المعتمة التي تغطي الصفحة بالكامل */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75); /* درجة عتمة ممتازة لتركيز الانتباه */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* رقم عالي جداً ليظهر فوق كل عناصر الجدول والـ Sidebar */
  backdrop-filter: blur(4px); /* تأثير ضبابي خفيف للخلفية ليعطي مظهر مودرن */
}

/* صندوق الرسالة الأبيض/المظلم في المنتصف */
.modal-content {
  background: #13151c; /* نفس لون الـ surface الداكن في لوحة التحكم */
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.75rem;
  border-radius: 14px;
  width: 440px;
  max-width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
}

/* العنوان الرئيسي داخل الرسالة */
.modal-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #f0f2f5;
  margin-top: 0;
  margin-bottom: 8px;
}

/* النص الوصفي */
.modal-content p {
  font-size: 13px;
  color: #6b7280; /* لون رمادي خفيف للمساعدة */
  line-height: 1.5;
  margin-bottom: 1rem;
}

/* صندوق الكتابة (السبب) */
.modal-content textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f0f2f5;
  padding: 12px;
  border-radius: 8px;
  margin: 12px 0;
  resize: none; /* لمنع المستخدم من تخريب أبعاد الصندوق */
  font-size: 13px;
  font-family: inherit;
  outline: none;
}

.modal-content textarea:focus {
  border-color: #3b82f6; /* يتحول للأزرق عند الكتابة */
}

/* الحاوية السفلية للأزرار */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1rem;
}

/* التصميم الأساسي لأزرار المودال */
.cancel-modal-btn, .confirm-modal-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: background 0.2s ease;
}

/* زر الإلغاء */
.cancel-modal-btn {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.cancel-modal-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* زر التأكيد وإرسال التنبيه */
.confirm-modal-btn {
  background: #3b82f6;
  color: #ffffff;
}

.confirm-modal-btn:hover:not(:disabled) {
  background: #2563eb;
}

/* حالة زر التأكيد عندما يكون معطلاً (حتى يكتب المستخدم السبب) */
.confirm-modal-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.action-row { display: flex; align-items: center; gap: 6px; }
.act-btn    { font-size: 11px; padding: 4px 10px; border-radius: 6px; cursor: pointer; border: 1px solid; font-weight: 500; transition: all 0.15s; background: transparent; }
.act-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* لون زر الـ Block العادي (أحمر خفيف) */
.block-btn  { border-color: rgba(239,68,68,0.2); color: #f87171; }
.block-btn:hover:not(:disabled) { background: rgba(239,68,68,0.1); }

/* لون زر إلغاء التحذير (أصفر) */
.warning-btn { border-color: rgba(245,158,11,0.3); color: #fbbf24; }
.warning-btn:hover:not(:disabled) { background: rgba(245,158,11,0.1); }

/* لون زر فك الحظر (أخضر) */
.unblock-btn { border-color: rgba(16,185,129,0.3); color: #34d399; }
.unblock-btn:hover:not(:disabled) { background: rgba(16,185,129,0.1); }

/* زر التعديل (أزرق) */
.edit-btn   { border-color: rgba(59,130,246,0.2); color: #60a5fa; }
.edit-btn:hover { background: rgba(59,130,246,0.1); }

/* زر الحذف (أحمر) */
.delete-btn { border-color: rgba(239,68,68,0.2); color: #f87171; }
.delete-btn:hover:not(:disabled) { background: rgba(239,68,68,0.15); }

.timer-sub { font-size: 10px; color: #fbbf24; margin: 4px 0 0 2px; }
.approve-btn { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color: #f87171; }
.deleting {
  opacity: 0.4;
  filter: blur(2px);
  transition: all 1.5s ease;
  pointer-events: none;
}
</style>
