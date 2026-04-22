/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production to avoid leaking implementation details
  productionBrowserSourceMaps: false,
  // Enable gzip/brotli compression on all responses
  compress: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    // Serve modern formats — browser picks best supported
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  /**
   * API versioning: /api/v1/* → /api/*
   * Establishes a versioning contract without touching existing routes.
   * Future breaking changes go to /api/v2/*.
   */
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  /**
   * HTTPS redirect: force all HTTP traffic to HTTPS in production.
   * No-op in local dev (http://localhost is fine).
   */
  async redirects() {
    if (process.env.NODE_ENV !== 'production') return []
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://:path*',
        permanent: true,
      },
    ]
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      // Next.js App Router requires unsafe-inline for hydration scripts.
      // cdn.jsdelivr.net is needed for jsQR (QR scanner library loaded at runtime).
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
      // API calls (Groq/Resend/Cloudinary) are server-side only; client only calls 'self'
      // In dev, allow WebSocket connections for Next.js Fast Refresh (HMR)
      process.env.NODE_ENV === 'production'
        ? "connect-src 'self'"
        : "connect-src 'self' ws://localhost:* wss://localhost:*",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ')

    const securityHeaders = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]

    // CORS headers for public API endpoints (invitations, chat, socios)
    const corsHeaders = [
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
    ]

    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Service-Worker-Allowed', value: ' /' },
        ],
      },
      // CORS for public-facing API routes only
      {
        source: '/api/(invitaciones|chat|socios)/:path*',
        headers: corsHeaders,
      },
      // Security headers on all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
