// Bedobe CAD Explorer – Service Worker
// Strategy:
//   - HTML navigation: network-first (always try to get fresh version)
//   - Assets (JS, CSS, images, draco, models): cache-first, update in background
//   - Cross-origin requests (analytics, CDN): pass through, do not cache

const CACHE_NAME = 'bedobe-v1';

// Pre-cache shell on install
const PRECACHE_URLS = ['/', '/index.html'];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
    );
    // Activate immediately without waiting for old SW to be unregistered
    self.skipWaiting();
});

// Remove old caches on activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const req = event.request;

    // Only handle GET requests from same origin
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    const isNavigation = req.mode === 'navigate';

    if (isNavigation) {
        // Network-first for HTML pages
        event.respondWith(
            fetch(req)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
                    return response;
                })
                .catch(() => caches.match(req).then(cached => cached || caches.match('/index.html')))
        );
    } else {
        // Cache-first for all other assets, update cache in background (stale-while-revalidate)
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(req).then(cached => {
                    const networkFetch = fetch(req).then(response => {
                        if (response.ok) cache.put(req, response.clone());
                        return response;
                    }).catch(() => undefined);

                    return cached || networkFetch;
                })
            )
        );
    }
});
