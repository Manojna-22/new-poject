import axios from 'axios'

const TOKEN_KEY = 'hmi_token'
const USER_KEY = 'hmi_user'

export const tokenStore = {
  get:   () => localStorage.getItem(TOKEN_KEY),
  set:   (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const userStore = {
  get:   () => {
    const raw = localStorage.getItem(USER_KEY)
    try { return raw ? JSON.parse(raw) : null } catch { return null }
  },
  set:   (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => localStorage.removeItem(USER_KEY),
}

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-handle 401 (token expired/invalid) globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      const path = window.location.pathname
      if (path !== '/login' && path !== '/signup') {
        tokenStore.clear()
        userStore.clear()
        window.location.href = '/login?reason=expired'
      }
    }
    return Promise.reject(err)
  }
)

export const extractError = (err) => {
  if (err?.response?.data) {
    const d = err.response.data
    if (d.fieldErrors) {
      const first = Object.entries(d.fieldErrors)[0]
      return first ? `${first[0]}: ${first[1]}` : d.message || 'Validation failed'
    }
    return d.message || d.error || 'Request failed'
  }
  return err.message || 'Network error'
}

/* ============ Auth ============ */

export const authApi = {
  signin: (data) => api.post('/auth/signin', data),
  signup: (data) => api.post('/auth/signup', data),
  signout: () => api.post('/auth/signout'),
}

/* ============ Alarms ============ */

export const alarmApi = {
  list: (params) => api.get('/alarms', { params }),
  get:  (id) => api.get(`/alarms/${id}`),
  create: (data) => api.post('/alarms', data),
  update: (id, data) => api.put(`/alarms/${id}`, data),
  delete: (id) => api.delete(`/alarms/${id}`),
  stats: () => api.get('/alarms/stats'),
}

/* ============ Events ============ */

export const eventApi = {
  list: (params) => api.get('/events', { params }),
  acknowledge: (alarmId, note) =>
    api.post(`/events/acknowledge/${alarmId}`, note ? { note } : {}),
  raise:  (alarmId, note) => api.post('/events', { alarmId, state: 'ACTIVE', note }),
  clear:  (alarmId, note) => api.post('/events', { alarmId, state: 'CLEARED', note }),
  delete: (id) => api.delete(`/events/${id}`),
}

export default api
