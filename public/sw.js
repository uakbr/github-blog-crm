// Cache version - update this to invalidate old caches
const CACHE_VERSION = 'v1.0.0';

// Cache names
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const MARKDOWN_CACHE = `markdown-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/src/main.jsx',
  '/src/styles/globals.css',
  // Add other static assets
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first, then network
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    try {
      const networkResponse = await fetch(request);
      await updateCache(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      return new Response('Network error happened', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },

  // Network first, then cache
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      await updateCache(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      return new Response('Offline content not available', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    const networkResponsePromise = fetch(request).then(async (response) => {
      await updateCache(request, response.clone());
      return response;
    });

    return cachedResponse || networkResponsePromise;
  },
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => 
        Promise.all(
          keys
            .filter((key) => !key.includes(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
    return;
  }

  // Handle markdown files
  if (url.pathname.endsWith('.md')) {
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
    return;
  }

  // Handle images
  if (request.destination === 'image') {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
    return;
  }

  // Default strategy
  event.respondWith(CACHE_STRATEGIES.networkFirst(request));
});

// Update cache helper function
async function updateCache(request, response) {
  if (!response || response.status !== 200) {
    return;
  }

  const url = new URL(request.url);
  const cache = await caches.open(
    request.destination === 'image' ? IMAGE_CACHE :
    url.pathname.endsWith('.md') ? MARKDOWN_CACHE :
    DYNAMIC_CACHE
  );

  await cache.put(request, response);
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-markdown') {
    event.waitUntil(syncMarkdownFiles());
  }
});

// Sync markdown files
async function syncMarkdownFiles() {
  try {
    const cache = await caches.open(MARKDOWN_CACHE);
    const requests = await cache.keys();
    
    await Promise.all(
      requests.map(async (request) => {
        try {
          const response = await fetch(request);
          await cache.put(request, response);
        } catch (error) {
          console.error('Sync failed for:', request.url);
        }
      })
    );
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Periodic sync for content updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(syncMarkdownFiles());
  }
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Add better offline support
const OFFLINE_VERSION = 1;
const CACHE_NAME = `offline-${OFFLINE_VERSION}`;
const OFFLINE_URL = 'offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    })()
  );
});