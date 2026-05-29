import { ref } from 'vue'

const notifications = ref([
  { id: 1, type: 'success', title: 'Calendar Generated', message: 'Your 2-week Ramadan campaign is ready to review.', time: '2 min ago', read: false, icon: '✦' },
  { id: 2, type: 'trend',   title: 'Trend Alert',       message: '#رمضان_كريم is up 340% in Egypt right now.', time: '15 min ago', read: false, icon: '🔥' },
  { id: 3, type: 'warning', title: 'Post Pending Review',message: '"Suhoor Energy" post needs approval before 8 AM.', time: '1 hr ago', read: false, icon: '⏳' },
  { id: 4, type: 'info',    title: 'Brand Voice Updated', message: 'Your brand vault was re-embedded successfully.', time: '3 hr ago', read: true,  icon: '🧠' },
  { id: 5, type: 'success', title: 'Post Published',     message: 'Instagram post published — 1.2K impressions so far.', time: '5 hr ago', read: true, icon: '📤' },
])

const unreadCount = ref(notifications.value.filter(n => !n.read).length)

export function useNotifications() {
  function markRead(id) {
    const n = notifications.value.find(x => x.id === id)
    if (n && !n.read) { n.read = true; unreadCount.value = Math.max(0, unreadCount.value - 1) }
  }
  function markAllRead() {
    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0
  }
  function addNotification(notif) {
    notifications.value.unshift({ id: Date.now(), read: false, time: 'Just now', ...notif })
    unreadCount.value++
  }
  return { notifications, unreadCount, markRead, markAllRead, addNotification }
}
