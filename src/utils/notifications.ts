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

// Play a subtle notification chime using Web Audio API
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.1); // A5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (_e) {
    // Audio context may be restricted by autoplay policy
  }
}

// Check if browser supports notifications
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Update app icon badge on mobile home screen and taskbar (PWA Badge API)
export function updateAppBadge(count?: number) {
  if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
    try {
      if (typeof count === 'number' && count > 0) {
        (navigator as any).setAppBadge(count).catch(() => {});
      } else {
        (navigator as any).setAppBadge().catch(() => {});
      }
    } catch (_e) {
      // Ignored
    }
  }
}

export function clearAppBadge() {
  if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) {
    try {
      (navigator as any).clearAppBadge().catch(() => {});
    } catch (_e) {
      // Ignored
    }
  }
}

// Check current permission state
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Check if user has enabled reminders in app
export function areRemindersEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('habit_reminders_enabled') === 'true' && Notification.permission === 'granted';
}

// Enable reminders and ask for permission if needed
export async function requestReminderPermission(): Promise<{ granted: boolean; permission: string; error?: string }> {
  if (!isNotificationSupported()) {
    return { granted: false, permission: 'unsupported', error: 'Notifications are not supported in this browser.' };
  }

  try {
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }

    if (perm === 'granted') {
      localStorage.setItem('habit_reminders_enabled', 'true');
      return { granted: true, permission: perm };
    } else {
      localStorage.setItem('habit_reminders_enabled', 'false');
      return {
        granted: false,
        permission: perm,
        error: perm === 'denied'
          ? 'Notifications are blocked in your browser. Please click the site settings / lock icon in your address bar to allow notifications.'
          : 'Permission was not granted.',
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { granted: false, permission: 'error', error: message };
  }
}

// Disable reminders
export function disableReminders() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('habit_reminders_enabled', 'false');
}

export interface NotificationResult {
  success: boolean;
  quote: string;
  method?: 'service_worker' | 'native' | 'in_app';
  error?: string;
}

// Send a notification immediately
export async function sendHabitNotification(title: string, body: string): Promise<NotificationResult> {
  // Always play gentle chime
  playNotificationChime();

  if (!isNotificationSupported()) {
    return {
      success: false,
      quote: body,
      method: 'in_app',
      error: 'Browser does not support OS notifications.',
    };
  }

  if (Notification.permission !== 'granted') {
    return {
      success: false,
      quote: body,
      method: 'in_app',
      error: Notification.permission === 'denied'
        ? 'Notifications are blocked. Please allow notifications in your browser address bar.'
        : 'Notification permission has not been granted.',
    };
  }

  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: '/logo4.webp',
    badge: '/notification-badge.png',
    tag: 'habit-track-reminder',
    renotify: true,
  };

  // Set PWA app icon badge indicator on home screen
  updateAppBadge(1);

  // 1. Try Service Worker first (Required on Chrome for Android)
  if ('serviceWorker' in navigator) {
    try {
      // Check ready or registration
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)),
      ]);

      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return { success: true, quote: body, method: 'service_worker' };
      }

      // If ready didn't resolve, try getRegistration
      const fallbackReg = await navigator.serviceWorker.getRegistration();
      if (fallbackReg && fallbackReg.showNotification) {
        await fallbackReg.showNotification(title, options);
        return { success: true, quote: body, method: 'service_worker' };
      }
    } catch (_swErr) {
      // Continue to native fallback
    }
  }

  // 2. Try Standard Notification API
  try {
    new Notification(title, options);
    return { success: true, quote: body, method: 'native' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      quote: body,
      method: 'in_app',
      error: errorMsg,
    };
  }
}

// Send a test notification
export async function sendTestNotification(): Promise<NotificationResult> {
  const slots: NotificationSlot[] = ['morning', 'afternoon', 'evening'];
  const randomSlot = slots[Math.floor(Math.random() * slots.length)];
  const quote = getRandomQuote(randomSlot);

  return sendHabitNotification('🎯 HabitTrack Reminder', quote);
}

// Check and send scheduled reminder based on local device time
export function checkAndSendScheduledReminders() {
  if (!areRemindersEnabled()) return;

  const now = new Date();
  const currentHour = now.getHours(); // Local hour (0 - 23) in user's country
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 1. Morning Slot: 9:00 AM - 11:59 AM
  if (currentHour >= 9 && currentHour < 12) {
    const lastSent = localStorage.getItem('last_remind_morning');
    if (lastSent !== todayStr) {
      localStorage.setItem('last_remind_morning', todayStr);
      sendHabitNotification('🌅 Morning Habit Check!', getRandomQuote('morning'));
    }
  }

  // 2. Afternoon Slot: 2:00 PM - 4:59 PM
  else if (currentHour >= 14 && currentHour < 17) {
    const lastSent = localStorage.getItem('last_remind_afternoon');
    if (lastSent !== todayStr) {
      localStorage.setItem('last_remind_afternoon', todayStr);
      sendHabitNotification('📈 Midday Momentum Check!', getRandomQuote('afternoon'));
    }
  }

  // 3. Evening Slot: 8:00 PM - 10:59 PM
  else if (currentHour >= 20 && currentHour < 23) {
    const lastSent = localStorage.getItem('last_remind_evening');
    if (lastSent !== todayStr) {
      localStorage.setItem('last_remind_evening', todayStr);
      sendHabitNotification('🌙 Night Habit Wrap-Up!', getRandomQuote('evening'));
    }
  }
}
