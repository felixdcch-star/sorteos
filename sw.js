const CACHE_NAME = 'sorteos-v1';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', event => {
    console.log('[SW] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Cacheando archivos');
            return cache.addAll(FILES_TO_CACHE).catch(err => {
                console.log('[SW] Error cacheando:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[SW] Activado');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200) {
                    return response;
                }
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});