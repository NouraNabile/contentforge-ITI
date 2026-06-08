import { ref, computed } from 'vue'
import i18n from '../locales/i18n.js'

const t = i18n.global.t

// Notifications use labelKeys — titles and messages are translated at render time
const notificationDefs = ref([
  { id: 1, type: 'success', titleKey: 'notifications.calendarGenerated.title', messageKey: 'notifications.calendarGenerated.message', timeKey: 'notifications.time.2min',  read: false, icon: '✦' },
  { id: 2, type: 'trend',   titleKey: 'notifications.trendAlert.title',        messageKey: 'notifications.trendAlert.message',        timeKey: 'notifications.time.15min', read: false, icon: '🔥' },
  { id: 3, type: 'warning', titleKey: 'notifications.postPending.title',       messageKey: 'notifications.postPending.message',       timeKey: 'notifications.time.1hr',   read: false, icon: '⏳' },
  { id: 4, type: 'info',    titleKey: 'notifications.brandUpdated.title',      messageKey: 'notifications.brandUpdated.message',      timeKey: 'notifications.time.3hr',   read: true,  icon: '🧠' },
  { id: 5, type: 'success', titleKey: 'notifications.postPublished.title',     messageKey: 'notifications.postPublished.message',     timeKey: 'notifications.time.5hr',   read: true,  icon: '📤' },
])

// Computed so AppLayout renders translated strings reactively
const notifications = computed(() =>
  notificationDefs.value.map(n => ({
    ...n,
    title:   i18n.global.t(n.titleKey),
    message: i18n.global.t(n.messageKey),
    time:    n.timeKey ? i18n.global.t(n.timeKey) : n.time,
  }))
)

const unreadCount = ref(notificationDefs.value.filter(n => !n.read).length)

export function useNotifications() {
  function markRead(id) {
    const n = notificationDefs.value.find(x => x.id === id)
    if (n && !n.read) { n.read = true; unreadCount.value = Math.max(0, unreadCount.value - 1) }
  }
  function markAllRead() {
    notificationDefs.value.forEach(n => n.read = true)
    unreadCount.value = 0
  }
  function addNotification(notif) {
    notificationDefs.value.unshift({ id: Date.now(), read: false, timeKey: 'notifications.time.justNow', ...notif })
    unreadCount.value++
  }
  return { notifications, unreadCount, markRead, markAllRead, addNotification }
}