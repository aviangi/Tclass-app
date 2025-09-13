
const CACHE_NAME = 'teachers-class-manager-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/index.tsx',
    '/manifest.json',
    '/metadata.json',
    '/types.ts',
    '/App.tsx',
    '/hooks/useClassManager.ts',
    '/components/Header.tsx',
    '/components/Dashboard.tsx',
    '/components/ClassList.tsx',
    '/components/ClassCard.tsx',
    '/components/AddClassModal.tsx',
    '/components/RemindersModal.tsx',
    '/components/icons.tsx',
    '/utils/dateUtils.ts',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg'
];

// Install event: cache all essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: serve from cache first, then fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // If the request is in the cache, return it.
            if (response) {
                return response;
            }
            // Otherwise, fetch it from the network.
            return fetch(event.request);
        })
    );
});
