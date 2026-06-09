// src/api/adminApi.js
import api from './client'

const adminApi = {
  getStats:    ()            => api.get('/admin/stats'),
  getUsers:    (params = {}) => api.get('/admin/users',   { params }),
  
  // 👇 التعديل هنا: بنمرر الـ reason وبنبعته في الـ Body
  blockUser:   (id, reason)  => api.put(`/admin/users/${id}/block`, { reason }),
  
  updateUser:  (id, data)    => api.put(`/admin/users/${id}`, data),
  deleteUser:  (id)          => api.delete(`/admin/users/${id}`),
  getPlans:    ()            => api.get('/admin/plans'),
  getTrends:   ()            => api.get('/admin/trends'),
  approveDeletion: (id) => api.put(`/admin/users/${id}/approve-deletion`),
  updateTrialDays: (days) => api.put('/admin/settings/trial-days', { trialDays: days }),
  getSettings:  ()       => api.get('/admin/settings'),
saveSettings: (data)   => api.put('/admin/settings', data),
}

export default adminApi