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

        {/* Background — jungla tropical con palmeras */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">

          {/* Gradientes de fondo */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(10,40,20,0.9)_0%,rgba(5,5,5,1)_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(10,40,20,0.6)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,194,0,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,194,0,0.06)_0%,transparent_50%)]" />

          {/* Palmera izquierda */}
          <svg className="absolute bottom-0 left-0 opacity-40" style={{ width: 320, height: 520, animation: 'leaf-sway 8s ease-in-out infinite', transformOrigin: 'bottom center' }} viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Tronco */}
            <path d="M90 400 Q85 320 80 260 Q78 200 88 150" stroke="#2d5a27" strokeWidth="12" strokeLinecap="round" fill="none"/>
            {/* Hojas principales */}
            <path d="M88 150 Q40 100 10 60" stroke="#1a6b2a" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M88 150 Q60 80 80 20" stroke="#1a6b2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M88 150 Q120 90 160 50" stroke="#1a6b2a" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M88 150 Q130 120 180 110" stroke="#1a6b2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M88 150 Q50 140 10 150" stroke="#1a6b2a" strokeWidth="4" strokeLinecap="round" fill="none"/>
            {/* Hojillas */}
            <path d="M40 108 Q25 90 15 72" stroke="#155220" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M70 65 Q65 45 72 25" stroke="#155220" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M130 78 Q148 60 158 42" stroke="#155220" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M148 125 Q168 115 175 102" stroke="#155220" strokeWidth="3" strokeLinecap="round" fill="none"/>
          </svg>

          {/* Palmera derecha */}
          <svg className="absolute bottom-0 right-0 opacity-40" style={{ width: 320, height: 520, animation: 'leaf-sway-alt 9s ease-in-out infinite', transformOrigin: 'bottom center' }} viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Tronco inclinado a la izquierda */}
            <path d="M110 400 Q115 320 120 260 Q122 200 112 150" stroke="#2d5a27" strokeWidth="12" strokeLinecap="round" fill="none"/>
            {/* Hojas */}
            <path d="M112 150 Q160 100 190 60" stroke="#1a6b2a" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M112 150 Q140 80 120 20" stroke="#1a6b2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M112 150 Q80 90 40 50" stroke="#1a6b2a" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M112 150 Q70 120 20 110" stroke="#1a6b2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M112 150 Q150 140 190 150" stroke="#1a6b2a" strokeWidth="4" strokeLinecap="round" fill="none"/>
            {/* Hojillas */}
            <path d="M160 108 Q175 90 185 72" stroke="#155220" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M130 65 Q135 45 128 25" stroke="#155220" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M70 78 Q52 60 42 42" stroke="#155220" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M52 125 Q32 115 25 102" stroke="#155220" strokeWidth="3" strokeLinecap="round" fill="none"/>
          </svg>

          {/* Palmera centro-izquierda más alta */}
          <svg className="absolute bottom-0 left-1/4 opacity-20" style={{ width: 200, height: 600, animation: 'leaf-sway 11s ease-in-out infinite', transformOrigin: 'bottom center' }} viewBox="0 0 120 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 500 Q58 380 55 280 Q53 200 58 120" stroke="#1a5c20" strokeWidth="8" strokeLinecap="round" fill="none"/>
            <path d="M58 120 Q20 70 5 20" stroke="#1a6b2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M58 120 Q70 50 60 5" stroke="#1a6b2a" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <path d="M58 120 Q90 70 115 30" stroke="#1a6b2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M58 120 Q100 100 115 90" stroke="#1a6b2a" strokeWidth="3" strokeLinecap="round" fill="none"/>
          </svg>

          {/* Palmera centro-derecha */}
          <svg className="absolute bottom-0 right-1/4 opacity-20" style={{ width: 200, height: 500, animation: 'leaf-sway-alt 12s ease-in-out infinite', transformOrigin: 'bottom center' }} viewBox="0 0 120 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 500 Q62 380 65 280 Q67 200 62 120" stroke="#1a5c20" strokeWidth="8" strokeLinecap="round" fill="none"/>
            <path d="M62 120 Q100 70 115 20" stroke="#1a6b2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M62 120 Q50 50 60 5" stroke="#1a6b2a" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <path d="M62 120 Q30 70 5 30" stroke="#1a6b2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M62 120 Q20 100 5 90" stroke="#1a6b2a" strokeWidth="3" strokeLinecap="round" fill="none"/>
          </svg>

          {/* Velo oscuro central para legibilidad */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(5,5,5,0.5)_0%,transparent_100%)]" />

          {/* Hojas tropicales en esquinas */}
          <JungleCorner
            className="absolute top-0 left-0 opacity-80"
            style={{ width: 340, height: 340, animation: 'leaf-sway 7s ease-in-out infinite', transformOrigin: '0 0' }}
          />
          <JungleCorner flip
            className="absolute top-0 right-0 opacity-80"
            style={{ width: 340, height: 340, animation: 'leaf-sway-alt 8s ease-in-out infinite', transformOrigin: '100% 0' }}
          />
          <JungleCorner invert
            className="absolute bottom-0 left-0 opacity-60"
            style={{ width: 280, height: 280, animation: 'leaf-sway-alt 9s ease-in-out infinite', transformOrigin: '0 100%' }}
          />
          <JungleCorner flip invert
            className="absolute bottom-0 right-0 opacity-60"
            style={{ width: 280, height: 280, animation: 'leaf-sway 10s ease-in-out infinite', transformOrigin: '100% 100%' }}
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

      </body>
    </html>
  )
}
