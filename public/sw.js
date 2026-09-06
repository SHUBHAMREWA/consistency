// HabitTrack PWA Service Worker
const CACHE_NAME = 'habittrack-v1';

// Pre-cache core application shell and assets
const PRECACHE_ASSETS = [
  '/',
  '/about',
  '/how-to-use',
  '/privacy-policy',
  '/terms',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon.png',
  '/logo4.webp',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/notification-badge.png',
];

// Install: Cache critical assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('Pre-caching partial assets fallback:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions and claim all open clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-first for HTML pages (navigations), Stale-While-Revalidate for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle standard GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip chrome-extension, internal protocols, or cross-origin third-party trackers
  if (
    url.origin !== self.origin &&
    !url.hostname.includes('fonts.googleapis.com') &&
    !url.hostname.includes('fonts.gstatic.com')
  ) {
    return;
  }

  // 1. Navigation (HTML Pages): Network-first with Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response('Offline - HabitTrack', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, WebP, PNG, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// -------------------------------------------------------------
// NOTIFICATIONS & PUSH HANDLERS
// -------------------------------------------------------------

// Notification Click: Focus existing app window or open a new window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If an app window is already open, focus it
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no app window is open, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// Notification Close: Clean up notification state if needed
self.addEventListener('notificationclose', (event) => {
  // Notification dismissed by user
});

// Push Notification: Handle Web Push API messages from server
self.addEventListener('push', (event) => {
  let payload = {
    title: '🎯 HabitTrack Reminder',
    body: 'Time to check in on your habits today!',
    icon: '/logo4.webp',
    badge: '/notification-badge.png',
    tag: 'habit-track-reminder',
    url: '/',
  };

  if (event.data) {
    try {
      payload = Object.assign(payload, event.data.json());
    } catch (_e) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/logo4.webp',
      badge: payload.badge || '/notification-badge.png',
      tag: payload.tag || 'habit-track-reminder',
      renotify: true,
      vibrate: [150, 80, 150],
      data: { url: payload.url || '/' },
    })
  );
});

// Client Message: Allow frontend application to command the Service Worker
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || '🎯 HabitTrack', options || {});
  }
});
