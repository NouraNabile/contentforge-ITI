import { reactive, watch } from 'vue'

export const appStore = reactive({
  // Theme
  darkMode: true,

  // Notifications
  notifications: [
    { id: 1, type: 'success', title: 'Calendar Generated', message: 'Your 2-week Ramadan campaign is ready to review.', time: '2 min ago', read: false, icon: '🗓️' },
    { id: 2, type: 'trend', title: 'Trending Now', message: '#رمضان_كريم is up 340% in Egypt — inject into your next post?', time: '15 min ago', read: false, icon: '🔥' },
    { id: 3, type: 'info', title: 'Post Scheduled', message: '"Suhoor Energy" post is scheduled for tomorrow 6:00 AM.', time: '1 hr ago', read: false, icon: '⏰' },
    { id: 4, type: 'warning', title: 'Review Needed', message: '3 posts are still in Draft — approve before Friday.', time: '3 hr ago', read: true, icon: '⚠️' },
    { id: 5, type: 'success', title: 'Brand Vault Updated', message: 'Your brand guidelines have been re-embedded successfully.', time: '1 day ago', read: true, icon: '🧠' },
  ],

  // User
  user: { name: 'Noura', brand: 'Araby Coffee', plan: 'Growth' },

  // Sidebar collapsed state
  sidebarCollapsed: false,

  // Methods
  toggleTheme() {
    this.darkMode = !this.darkMode
    document.documentElement.classList.toggle('dark', this.darkMode)
    document.documentElement.classList.toggle('light', !this.darkMode)
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light')
  },

  markAllRead() {
    this.notifications.forEach(n => n.read = true)
  },

  markRead(id) {
    const n = this.notifications.find(n => n.id === id)
    if (n) n.read = true
  },

  addNotification(notif) {
    this.notifications.unshift({ id: Date.now(), read: false, time: 'Just now', ...notif })
  },

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length
  },

  initTheme() {
    const saved = localStorage.getItem('theme')
    this.darkMode = saved ? saved === 'dark' : true
    document.documentElement.classList.toggle('dark', this.darkMode)
    document.documentElement.classList.toggle('light', !this.darkMode)
  }
})
