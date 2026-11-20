// =========================================================
// GYTO SUCCESS COMPANY – Service Worker v3
// Bumped version forces all browsers to clear old cache
// =========================================================

const CACHE_NAME   = 'gyto-v3';
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/products.html',
  '/contact.html',
  '/recruitment.html',
  '/security-tips.html',
  '/privacy-policy.html',
  '/terms-of-service.html',
  '/admin.html',
  '/css/style.css',
  '/css/compat.css',
  '/js/main.js',
  '/js/database.js',
  '/images/logo.png',
  '/images/HOME PAGE.png',
  '/images/PAGE ABOVE FOOTER PAGE.jpeg',
  '/images/PAGE BELOW HEADER SECTION.jpeg',
  '/images/A SECURITY PARTNER YOU CAN TRUST.jpeg',
  '/images/WHO WE ARE.jpeg',
  '/images/WHY CHOOSE GYTO SUCCESS COMPANY LIMITED.jpg',
  '/images/MANNED GUARDING.jpeg',
  '/images/CCTV AND SURVEILLANCE.png',
  '/images/MOBILE PATROLS.jpeg',
  '/images/ALARMS SYSTEMS.jpg',
  '/images/EVENT SECURITY.jpg',
  '/images/SECURITY TRAINING.jpeg',
  '/images/DOG SECTION.jpeg',
  '/manifest.json'
];

// Install — cache all core assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Add assets one by one so a single missing file doesn't break everything
      return Promise.allSettled(
        CACHE_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
});

// Activate — delete ALL old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache fresh copy
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // If page not cached and offline, return index
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
