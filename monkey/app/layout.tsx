import type { Metadata, Viewport } from 'next'
import './globals.css'
import JungleCorner from './components/JungleCorner'
import TropicalBackground from './components/TropicalBackground'
import ChatWidget from './components/ChatWidget'

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

        {/* Background — jungla tropical con palmeras */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <TropicalBackground />

          {/* Hojas tropicales en esquinas animadas */}
          <JungleCorner
            className="absolute top-0 left-0 opacity-75"
            style={{ width: 360, height: 360, animation: 'leaf-sway 7s ease-in-out infinite', transformOrigin: '0 0' }}
          />
          <JungleCorner flip
            className="absolute top-0 right-0 opacity-75"
            style={{ width: 360, height: 360, animation: 'leaf-sway-alt 8s ease-in-out infinite', transformOrigin: '100% 0' }}
          />
          <JungleCorner invert
            className="absolute bottom-0 left-0 opacity-55"
            style={{ width: 290, height: 290, animation: 'leaf-sway-alt 9s ease-in-out infinite', transformOrigin: '0 100%' }}
          />
          <JungleCorner flip invert
            className="absolute bottom-0 right-0 opacity-55"
            style={{ width: 290, height: 290, animation: 'leaf-sway 10s ease-in-out infinite', transformOrigin: '100% 100%' }}
          />
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <a href="/" className="flex items-center gap-3">
                <img
                  src="/monkey-logo.png"
                  alt="Monkey Restobar"
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ boxShadow: '0 0 16px rgba(245,194,0,0.35)' }}
                />
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

        {/* Chatbot flotante — desactivado temporalmente mientras se carga el contenido */}
        {/* <ChatWidget /> */}

      </body>
    </html>
  )
}
