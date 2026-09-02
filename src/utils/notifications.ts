// Funny notification quotes by time of day
export const FUNNY_QUOTES = {
  morning: [
    "🌅 Rise and shine! Your habits won't complete themselves (we checked, they're lazy too).",
    "☕ Good morning! Don't let your streak look as tired as you feel.",
    "📈 Morning champ! Your consistency graph woke up early and is starving for green checkmarks.",
    "☀️ New day, fresh grid! Knock out a habit before procrastination even rolls out of bed.",
    "🚀 Good morning! The secret to winning today starts with one little checkmark.",
  ],
  afternoon: [
    "📊 Midday check! Your consistency graph is waiting for an increment... don't leave it hanging!",
    "🍕 Afternoon slump? Ticking a habit burns 0 calories but boosts 100% pride.",
    "👀 Your habits are watching you scroll... time to mark at least one done!",
    "⚡ Half the day has passed! Did you conquer your habits or did procrastination win round 1?",
    "🎯 Quick check-in: 1 habit done right now makes your evening 100% guilt-free!",
  ],
  evening: [
    "🌙 Bedtime check! Sleep hits different when your habit row is painted with checkmarks.",
    "📉 Don't let your graph cry tonight! One more checkmark before you hit the pillow.",
    "🛌 Future You is begging Present You to tick today's habits before sleeping!",
    "🔋 You wouldn't sleep without charging your phone, right? Charge your streak too!",
    "🏆 Final wrap-up: Show today who's boss before midnight resets the clock!",
  ],
};

export type NotificationSlot = 'morning' | 'afternoon' | 'evening';

// Get a random quote for a slot
export function getRandomQuote(slot: NotificationSlot): string {
  const quotes = FUNNY_QUOTES[slot];
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
}

// Check if browser supports notifications
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Check current permission state
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Check if user has enabled reminders in app
export function areRemindersEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('habit_reminders_enabled') === 'true' && Notification.permission === 'granted';
}

// Enable reminders and ask for permission if needed
export async function requestReminderPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('habit_reminders_enabled', 'true');
      return true;
    } else {
      localStorage.setItem('habit_reminders_enabled', 'false');
      return false;
    }
  } catch (_err) {
    return false;
  }
}

// Disable reminders
export function disableReminders() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('habit_reminders_enabled', 'false');
}

// Send a notification immediately
export async function sendHabitNotification(title: string, body: string): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: '/logo4.webp',
    badge: '/favicon-32x32.png',
    tag: 'habit-track-reminder',
    renotify: true,
  };

  // Try via Service Worker first (preferred for PWAs)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options);
        return true;
      }
    } catch (_err) {
      // Fallback below
    }
  }

  // Fallback to standard Notification
  try {
    new Notification(title, options);
    return true;
  } catch (_err) {
    return false;
  }
}

// Send a test notification
export async function sendTestNotification(): Promise<boolean> {
  const slots: NotificationSlot[] = ['morning', 'afternoon', 'evening'];
  const randomSlot = slots[Math.floor(Math.random() * slots.length)];
  const quote = getRandomQuote(randomSlot);

  return sendHabitNotification('🎯 HabitTrack Reminder (Test)', quote);
}

// Check and send scheduled reminder based on local device time
export function checkAndSendScheduledReminders() {
  if (!areRemindersEnabled()) return;

  const now = new Date();
  const currentHour = now.getHours(); // Local hour (0 - 23) in user's country
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 1. Morning Slot: 9:00 AM - 11:59 AM (hours 9, 10, 11)
  if (currentHour >= 9 && currentHour < 12) {
    const lastSent = localStorage.getItem('last_remind_morning');
    if (lastSent !== todayStr) {
      localStorage.setItem('last_remind_morning', todayStr);
      sendHabitNotification('🌅 Morning Habit Check!', getRandomQuote('morning'));
    }
  }

  // 2. Afternoon Slot: 2:00 PM - 4:59 PM (hours 14, 15, 16)
  else if (currentHour >= 14 && currentHour < 17) {
    const lastSent = localStorage.getItem('last_remind_afternoon');
    if (lastSent !== todayStr) {
      localStorage.setItem('last_remind_afternoon', todayStr);
      sendHabitNotification('📈 Midday Momentum Check!', getRandomQuote('afternoon'));
    }
  }

  // 3. Evening Slot: 8:00 PM - 10:59 PM (hours 20, 21, 22)
  else if (currentHour >= 20 && currentHour < 23) {
    const lastSent = localStorage.getItem('last_remind_evening');
    if (lastSent !== todayStr) {
      localStorage.setItem('last_remind_evening', todayStr);
      sendHabitNotification('🌙 Night Habit Wrap-Up!', getRandomQuote('evening'));
    }
  }
}
