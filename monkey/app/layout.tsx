import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Monkey — EntradasYa | Invitaciones',
  description: 'Solicita tu invitación para los mejores eventos exclusivos.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Monkey Scanner',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-darker text-white antialiased min-h-screen">
        {/* Background gradients — igual que landing */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(244,63,94,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1)_0%,transparent_50%)]" />
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2">
                <svg viewBox="0 0 100 100" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#6366f1'}} />
                      <stop offset="100%" style={{stopColor: '#f43f5e'}} />
                    </linearGradient>
                  </defs>
                  <rect width="100" height="100" rx="20" fill="url(#g)" />
                  <path d="M30 35 L30 30 Q30 25 35 25 L40 25 M60 25 L65 25 Q70 25 70 30 L70 35 M70 45 L70 55 Q55 50 55 65 Q55 80 70 75 L70 85 Q70 90 65 90 L35 90 Q30 90 30 85 L30 75 Q45 80 45 65 Q45 50 30 55 L30 45"
                    stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
                <span className="font-bold text-lg">
                  <span className="gradient-text">Monkey</span>
                  <span className="text-slate-400 text-sm font-normal ml-1">by EntradasYa</span>
                </span>
              </a>
              <a
                href="/scanner"
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="hidden sm:inline">Soy anfitrión</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </a>
            </div>
          </div>
        </nav>

        <main className="relative z-10 pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}
