import type { Metadata, Viewport } from 'next'
import './globals.css'
import ChatWidget from './components/ChatWidget'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://living.entradasya.cl'
// Imagen OG por defecto temporal mientras llega el branding final de Living Club
const OG_DEFAULT = 'https://res.cloudinary.com/dqsz4ua73/image/upload/w_1200,h_630,c_pad,g_center,b_black,f_jpg,q_80/v1775919972/logo300xp_s0gh7w.png'

export const metadata: Metadata = {
  title: {
    default: 'Living Club — Invitaciones y Eventos',
    template: '%s · Living',
  },
  description: 'Solicita tu invitación gratuita para los eventos de Living Club. Entrada con QR personal en minutos.',
  manifest: '/manifest.json',
  metadataBase: new URL(BASE_URL),
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  'theme-color': '#1a0900',
  'color-scheme': 'dark',
  },
  icons: {
    icon: '/living-logo.png',
    shortcut: '/living-logo.png',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: 'Living Club — Invitaciones y Eventos',
    description: 'Solicita tu invitación gratuita. Entrada con QR personal en minutos.',
    url: BASE_URL,
    siteName: 'Living Club',
    type: 'website',
    locale: 'es_CL',
    images: [{ url: OG_DEFAULT, width: 1200, height: 630, alt: 'Living Club' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Living Club — Invitaciones y Eventos',
    description: 'Solicita tu invitación gratuita. Entrada con QR personal en minutos.',
    images: [OG_DEFAULT],
  },
}

export const viewport: Viewport = {
  themeColor: '#1a0900',
  width: 'device-width',
  initialScale: 1,
  // viewport-fit=cover: el contenido llega a los bordes en iPhone con notch
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-darker text-white antialiased min-h-screen" style={{ backgroundColor: '#070200' }} data-project="living">

        {/* Background — atmósfera reggae dancehall */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Glow rojo */}
          <div style={{
            position:'absolute', width:'100%', height:'55%',
            bottom:0, left:0,
            background:'radial-gradient(ellipse 70% 50% at 20% 100%, rgba(220,55,30,0.22) 0%, transparent 65%)',
            filter:'blur(32px)',
          }} />
          {/* Glow dorado */}
          <div style={{
            position:'absolute', width:'100%', height:'60%',
            bottom:0, left:0,
            background:'radial-gradient(ellipse 80% 55% at 50% 100%, rgba(246,196,0,0.18) 0%, transparent 65%)',
            filter:'blur(34px)',
          }} />
          {/* Glow verde */}
          <div style={{
            position:'absolute', width:'100%', height:'55%',
            bottom:0, left:0,
            background:'radial-gradient(ellipse 70% 50% at 80% 100%, rgba(76,175,80,0.20) 0%, transparent 65%)',
            filter:'blur(30px)',
          }} />
          {/* Vignette oscura */}
          <div style={{
            position:'absolute', inset:0,
            background:'radial-gradient(ellipse 85% 85% at 50% 40%, transparent 30%, rgba(0,0,0,0.55) 100%)',
          }} />
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid rgba(246,196,0,0.22)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <a href="/" className="flex items-center gap-2 group">
                <img
                  src="/living-logo.png"
                  alt="Living Club"
                  className="h-9 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(245,194,0,0.6)]"
                />
                <span className="hidden sm:inline-flex text-[10px] uppercase tracking-[0.2em] font-black text-amber-300 border border-amber-400/30 px-2 py-1 rounded-full bg-amber-500/10">
                  Dancehall Club
                </span>
              </a>

              {/* Nav links desktop */}
              <div className="hidden sm:flex items-center gap-1">
                {[
                  { href: '/#lineup', label: 'Shows' },
                  { href: '/club',    label: 'Club' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-zinc-400 hover:text-amber-200 text-xs font-semibold uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-amber-500/10 transition-all duration-200"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* CTA derecha */}
              <a
                href="/#lineup"
                className="hidden sm:flex items-center gap-1.5 btn-primary !py-2 !px-4 !text-xs !min-h-0 !rounded-xl"
              >
                Entradas
              </a>

              {/* Móvil */}
              <div className="sm:hidden">
                <a
                  href="/#lineup"
                  className="flex items-center gap-1 text-xs font-bold text-slate-900 px-3 py-2 rounded-xl"
                  style={{ background: 'linear-gradient(135deg,#dd3b22,#f6c400,#4caf50)' }}
                >
                  Entradas
                </a>
              </div>

            </div>
          </div>
        </nav>

        {/* pt-16 = navbar height; safe-pt cubre el notch en iPhone */}
        <main className="relative z-10 pt-16">
          {children}
        </main>

        {/* Chatbot flotante */}
        <ChatWidget />

      </body>
    </html>
  )
}
