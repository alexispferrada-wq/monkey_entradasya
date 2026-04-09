import type { Metadata, Viewport } from 'next'
import './globals.css'
import JungleCorner from './components/JungleCorner'

export const metadata: Metadata = {
  title: 'Monkey Restobar — Invitaciones',
  description: 'Solicita tu invitación gratuita para los eventos de Monkey Restobar.',
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
  themeColor: '#050505',
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
      <body className="bg-darker text-white antialiased min-h-screen" style={{ backgroundColor: '#050505' }}>

        {/* Background — jungla oscura con destellos dorados */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(21,83,42,0.25)_0%,transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(21,83,42,0.2)_0%,transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,194,0,0.07)_0%,transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,5,0)_0%,rgba(5,5,5,0.6)_100%)]" />

          {/* Hojas tropicales en esquinas — estilo Monkey Restobar */}
          <JungleCorner
            className="absolute top-0 left-0 opacity-70"
            style={{ width: 320, height: 320, animation: 'leaf-sway 7s ease-in-out infinite', transformOrigin: '0 0' }}
          />
          <JungleCorner flip
            className="absolute top-0 right-0 opacity-70"
            style={{ width: 320, height: 320, animation: 'leaf-sway-alt 8s ease-in-out infinite', transformOrigin: '100% 0' }}
          />
          <JungleCorner invert
            className="absolute bottom-0 left-0 opacity-55"
            style={{ width: 260, height: 260, animation: 'leaf-sway-alt 9s ease-in-out infinite', transformOrigin: '0 100%' }}
          />
          <JungleCorner flip invert
            className="absolute bottom-0 right-0 opacity-55"
            style={{ width: 260, height: 260, animation: 'leaf-sway 10s ease-in-out infinite', transformOrigin: '100% 100%' }}
          />
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <a href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 16px rgba(245,194,0,0.35)' }}>
                  <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Cara de mono estilizada */}
                    <circle cx="20" cy="20" r="12" fill="#1a1a1a" />
                    <circle cx="15" cy="17" r="2.5" fill="#1a1a1a" stroke="#1a1a1a" />
                    <circle cx="25" cy="17" r="2.5" fill="#1a1a1a" stroke="#1a1a1a" />
                    <circle cx="15.5" cy="17" r="1" fill="white" />
                    <circle cx="25.5" cy="17" r="1" fill="white" />
                    <path d="M16 23 Q20 26 24 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    {/* Orejas */}
                    <circle cx="8" cy="20" r="4" fill="#2a1a00" stroke="#F5C200" strokeWidth="1" />
                    <circle cx="32" cy="20" r="4" fill="#2a1a00" stroke="#F5C200" strokeWidth="1" />
                  </svg>
                </div>
                <div className="leading-none">
                  <span className="font-display text-xl text-primary tracking-wider">MONKEY</span>
                  <span className="block text-[10px] text-zinc-500 tracking-widest uppercase">Restobar</span>
                </div>
              </a>

              {/* Scanner link */}
              <a
                href="/scanner"
                className="text-sm text-zinc-400 hover:text-primary transition-colors flex items-center gap-2 font-medium"
              >
                <span className="hidden sm:inline tracking-wide">Soy anfitrión</span>
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
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
