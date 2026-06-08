// src/api/adminApi.js
import api from './client'

const adminApi = {
  getStats:       ()             => api.get('/admin/stats'),
  getUsers:       (params = {}) => api.get('/admin/users',   { params }),
  blockUser:      (id)          => api.put(`/admin/users/${id}/block`),
  updateUser:     (id, data)    => api.put(`/admin/users/${id}`, data),
  deleteUser:     (id)          => api.delete(`/admin/users/${id}`),
  getPlans:       ()            => api.get('/admin/plans'),
  getTrends:      ()            => api.get('/admin/trends'),
}

export default adminApi
