// Service Worker for GestureX Racing PWA
const CACHE_NAME = 'gesturex-racing-v3'; // Updated version to force refresh
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/gesturex-theme.css',
  '/css/homepage-modern.css',
  '/css/enhancements.css',
  '/css/modern-ui.css',
  '/css/pwa-enhancements.css',
  '/js/main.js',
  '/js/vehicle.js',
  '/js/gameManager.js',
  '/js/carSelector.js',
  '/js/gestureControl.js',
  '/js/settingsManager.js',
  '/js/obstacles.js',
  '/js/debugHelper.js',
  '/js/backgroundMusic.js',
  '/js/menuHelpers.js',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network First strategy for HTML/CSS/JS, Cache First for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Network first for HTML, CSS, and JS files to always get fresh content
  if (event.request.destination === 'document' || 
      url.pathname.endsWith('.html') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache complete responses (not partial 206 responses)
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
  } else {
    // Cache first for images, fonts, models, etc.
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((fetchResponse) => {
            // Only cache complete responses (status 200), not partial (206) or large GLB models
            if (fetchResponse && fetchResponse.status === 200 && event.request.url.indexOf('.glb') === -1) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
            }
            return fetchResponse;
          });
        })
    );
  }
});
