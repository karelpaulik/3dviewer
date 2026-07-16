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
const SHARE_CACHE_NAME_KEY = 'pending-glb-name';
const SHARE_FORM_FIELD_NAME = 'glb';
const SHARE_TARGET_QUERY_PARAM = 'share-target';
const SHARE_TARGET_QUERY_VALUE = 'glb';
const SHARE_TARGET_QUERY_ERROR = 'error';
const SHARE_TARGET_MESSAGE_TYPE = 'meshbex-share-glb';

const PRESERVED_CACHES = [CACHE_NAME, SHARE_CACHE_NAME];

// Pre-cache shell on install
const PRECACHE_URLS = ['/', '/index.html'];

function isFileLike(value) {
    return value != null && typeof value.arrayBuffer === 'function' && value.size > 0;
}

function isGlbLikeShareFile(file) {
    if (!isFileLike(file)) return false;
    const name = file.name || '';
    if (/\.glb$/i.test(name)) return true;
    const type = (file.type || '').toLowerCase();
    return type === 'model/gltf-binary'
        || type === 'application/octet-stream'
        || type === 'application/gltf-buffer';
}

function extractShareFile(formData) {
    const primary = formData.get(SHARE_FORM_FIELD_NAME);
    if (isGlbLikeShareFile(primary)) return primary;

    for (const [, value] of formData.entries()) {
        if (isGlbLikeShareFile(value)) return value;
    }

    // Android file managers often omit extension/MIME – accept the declared field if non-empty.
    if (isFileLike(primary)) return primary;

    return null;
}

function normalizeSharedFileName(name) {
    const base = (name || 'shared').trim() || 'shared';
    return /\.glb$/i.test(base) ? base : `${base}.glb`;
}

function buildShareRedirectUrl(baseUrl, shareTargetValue) {
    const redirect = new URL('./', baseUrl);
    redirect.searchParams.set(SHARE_TARGET_QUERY_PARAM, shareTargetValue);
    return redirect.href;
}

async function notifyShareClients() {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
        client.postMessage({ type: SHARE_TARGET_MESSAGE_TYPE });
    }
}

async function storeSharedFile(file) {
    const fileName = normalizeSharedFileName(file.name);
    const headers = new Headers();
    headers.set('x-filename', fileName);
    const cache = await caches.open(SHARE_CACHE_NAME);
    await cache.put(SHARE_CACHE_KEY, new Response(file, { headers }));
    await cache.put(SHARE_CACHE_NAME_KEY, new Response(fileName));
}

async function handleShareTargetPost(request, url) {
    try {
        const formData = await request.formData();
        const file = extractShareFile(formData);
        if (!file) {
            console.warn('[ShareTarget] Rejected share: no GLB file in form data.');
            return Response.redirect(buildShareRedirectUrl(url, SHARE_TARGET_QUERY_ERROR), 303);
        }

        await storeSharedFile(file);
        await notifyShareClients();

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
