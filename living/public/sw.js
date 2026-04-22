// Bump this version to force all clients to adopt the new SW on next visit
const SW_VERSION   = 'v2'
const CACHE_NAME   = `living-scanner-${SW_VERSION}`
const STATIC_ASSETS = ['/scanner', '/manifest.json']

// ── Install: pre-cache static shell ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  // Take control immediately without waiting for existing tabs to close
  self.skipWaiting()
})

// ── Activate: purge stale caches from previous SW versions ───────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  )
  self.clients.claim()
})

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Network-first with a 4-second timeout.
 * Falls back to the cache on timeout or network error.
 */
async function networkFirstWithTimeout(request, timeoutMs = 4000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(request, { signal: controller.signal })
    clearTimeout(timer)
    if (response.ok) {
      const clone = response.clone()
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
    }
    return response
  } catch {
    clearTimeout(timer)
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response('Sin conexión', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Cache-first. Fetches and updates the cache in the background when a
 * cached response is served (stale-while-revalidate pattern).
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    // Refresh in background so the next visit gets the updated asset
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response))
        }
      })
      .catch(() => {/* offline — ignore */})
    return cached
  }

  // Not cached yet: fetch and store
  try {
    const response = await fetch(request)
    if (response.ok) {
      const clone = response.clone()
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
    }
    return response
  } catch {
    return new Response('Sin conexión', { status: 503, statusText: 'Service Unavailable' })
  }
}

// ── Fetch: route by request type ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept same-origin GET requests — Cache API doesn't support POST/PUT/etc.
  if (url.origin !== self.location.origin) return
  if (request.method !== 'GET') return

  // API calls: network-first with timeout (QR scanner must validate live)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithTimeout(request, 4000))
    return
  }

  // Static assets (_next/static, icons, fonts): cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/)
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML navigation pages: network-first (ensures fresh server-rendered content)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithTimeout(request, 4000))
    return
  }

  // Everything else: cache-first
  event.respondWith(cacheFirst(request))
})
