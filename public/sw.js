// Bedobe CAD Explorer – Service Worker
// Strategy:
//   - HTML navigation: network-first (always try to get fresh version)
//   - Assets (JS, CSS, images, draco, models): cache-first, update in background
//   - AR session model: dedicated cache (bedobe-ar-v1), written by the page
//   - Cross-origin requests (analytics, CDN): pass through, do not cache

const CACHE_NAME = 'bedobe-v1';
const AR_CACHE = 'bedobe-ar-v1';
const AR_MODEL_SUFFIX = '/ar-session/current.glb';

// Pre-cache shell on install
const PRECACHE_URLS = ['/', '/index.html'];

function isArModelRequest(url) {
    return url.pathname.endsWith(AR_MODEL_SUFFIX);
}

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
    );
    // Activate immediately without waiting for old SW to be unregistered
    self.skipWaiting();
});

// Remove old caches on activate (keep app + AR caches)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME && key !== AR_CACHE)
                    .map(key => caches.delete(key))
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

    // AR model: serve from dedicated cache (Scene Viewer needs a real HTTPS URL)
    if (isArModelRequest(url)) {
        event.respondWith(
            caches.open(AR_CACHE).then(cache =>
                cache.match(req).then(cached => {
                    if (cached) {
                        const headers = new Headers(cached.headers);
                        headers.set('Access-Control-Allow-Origin', '*');
                        return cached.blob().then(body => new Response(body, {
                            status: cached.status,
                            statusText: cached.statusText,
                            headers,
                        }));
                    }
                    return new Response('AR model not published', {
                        status: 404,
                        statusText: 'AR model not found',
                        headers: {
                            'Content-Type': 'text/plain',
                            'Access-Control-Allow-Origin': '*',
                        },
                    });
                })
            )
        );
        return;
    }

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
