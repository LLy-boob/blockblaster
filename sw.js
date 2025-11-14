/* ========================================
   sw.js — BLOCK BLASTER PWA (FIXED)
   ======================================== */
const CACHE_NAME = 'blockblaster-v1.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/menja/dist/ads.js',
  '/menja/dist/LLydra.jpg',
  '/menja/dist/icon-192.png',
  '/menja/dist/icon-512.png',
  '/menja/dist/icon-512-maskable.png',
  '/menja/dist/manifest.json',
  '/music.mp3',
  '/track1.mp3',
  'https://www.transparenttextures.com/patterns/black-linen.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .catch(err => console.error('SW Install failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(net => {
        if (!net.ok) return net;
        if (url.pathname.includes('propellerads')) return net;

        const clone = net.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return net;
      }).catch(() => {
        if (url.pathname.endsWith('.html')) return caches.match('/index.html');
      });
    })
  );
});