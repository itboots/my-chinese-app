const CACHE_NAME = 'chinese-app-v2'; // 更新版本号强制刷新缓存
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/hanzi.html',
    '/pinyin.html',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/hanzi-writer@3.5/dist/hanzi-writer.min.js',
    'https://unpkg.com/pinyin-pro',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 缓存优先策略：如果有缓存就直接返回，不等待网络
            if (cachedResponse) {
                return cachedResponse;
            }

            // 没有缓存时才请求网络
            return fetch(event.request).then((response) => {
                // 只缓存成功的 GET 请求
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }

                // 克隆响应并缓存
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // 网络失败时返回离线页面或默认响应
                return new Response('离线模式', { status: 503 });
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
