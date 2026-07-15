// Meshbex CAD Explorer – Service Worker
// Strategy:
//   - HTML navigation: network-first (always try to get fresh version)
//   - Assets (JS, CSS, images, draco, models): cache-first, update in background
//   - Cross-origin requests (analytics, CDN): pass through, do not cache
//   - Share target: POST ./share-glb → cache file → redirect to app

const CACHE_NAME = 'meshbex-v1';

// Keep in sync with src/shareTargetConstants.js
const SHARE_ACTION_SUFFIX = '/share-glb';
const SHARE_CACHE_NAME = 'meshbex-share-v1';
const SHARE_CACHE_KEY = 'pending-glb';
const SHARE_FORM_FIELD_NAME = 'glb';
const SHARE_TARGET_QUERY_PARAM = 'share-target';
const SHARE_TARGET_QUERY_VALUE = 'glb';
const SHARE_TARGET_QUERY_ERROR = 'error';

const PRESERVED_CACHES = [CACHE_NAME, SHARE_CACHE_NAME];

// Pre-cache shell on install
const PRECACHE_URLS = ['/', '/index.html'];

function isValidGlbShareFile(file) {
    return file instanceof File && /\.glb$/i.test(file.name || '');
}

function buildShareRedirectUrl(baseUrl, shareTargetValue) {
    const redirect = new URL('./', baseUrl);
    redirect.searchParams.set(SHARE_TARGET_QUERY_PARAM, shareTargetValue);
    return redirect.href;
}

async function handleShareTargetPost(request, url) {
    try {
        const formData = await request.formData();
        const file = formData.get(SHARE_FORM_FIELD_NAME);
        if (!isValidGlbShareFile(file)) {
            console.warn('[ShareTarget] Rejected share: not a .glb file.');
            return Response.redirect(buildShareRedirectUrl(url, SHARE_TARGET_QUERY_ERROR), 303);
        }

        const headers = new Headers();
        headers.set('x-filename', file.name);
        const cache = await caches.open(SHARE_CACHE_NAME);
        await cache.put(SHARE_CACHE_KEY, new Response(file, { headers }));

        return Response.redirect(buildShareRedirectUrl(url, SHARE_TARGET_QUERY_VALUE), 303);
    } catch (err) {
        console.error('[ShareTarget] Failed to handle POST:', err);
        return Response.redirect(buildShareRedirectUrl(url, SHARE_TARGET_QUERY_ERROR), 303);
    }
}

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
                keys.filter(key => !PRESERVED_CACHES.includes(key)).map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    if (url.origin !== self.location.origin) return;

    if (req.method === 'POST' && url.pathname.endsWith(SHARE_ACTION_SUFFIX)) {
        event.respondWith(handleShareTargetPost(req, url));
        return;
    }

    // Only handle GET requests from same origin
    if (req.method !== 'GET') return;

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
