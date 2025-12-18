const CACHE_NAME = "primko-cache-v2";

// ✅ HANYA PUBLIC & STATIC
const STATIC_CACHE_URLS = [
  "/",
  "/offline.html",
  "/favicon.ico",
];

// 🟢 INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
});

// 🟢 ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// 🟢 FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 🚫 JANGAN SENTUH API & AUTH & ADMIN
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/user")
  ) {
    return;
  }

  // 🖼️ STATIC FILES → cache-first
  if (
    req.destination === "style" ||
    req.destination === "script" ||
    req.destination === "image" ||
    req.destination === "font"
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 🌐 PAGE → network-first
  event.respondWith(networkFirst(req));
});

// ======================
// STRATEGY
// ======================

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;

  const fresh = await fetch(req);
  cache.put(req, fresh.clone());
  return fresh;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const fresh = await fetch(req);
    cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(req);
    return cached || caches.match("/offline.html");
  }
}
