import type { Metadata, Viewport } from 'next'
import './globals.css'
import ChatWidget from './components/ChatWidget'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://monkey.entradasya.cl'
// Imagen OG por defecto (logo Monkey sobre fondo oscuro vía Cloudinary)
const OG_DEFAULT = 'https://res.cloudinary.com/dqsz4ua73/image/upload/w_1200,h_630,c_pad,g_center,b_black,f_jpg,q_80/v1775919972/logo300xp_s0gh7w.png'

export const metadata: Metadata = {
  title: {
    default: 'Monkey Restobar — Invitaciones y Eventos',
    template: '%s · Monkey',
  },
  description: 'Solicita tu invitación gratuita para los eventos de Monkey Restobar. Entrada con QR personal en minutos.',
  manifest: '/manifest.json',
  metadataBase: new URL(BASE_URL),
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  'theme-color': '#1a0e00',
  'color-scheme': 'dark',
  },
  icons: {
    icon: '/monkey-logo.png',
    shortcut: '/monkey-logo.png',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: 'Monkey Restobar — Invitaciones y Eventos',
    description: 'Solicita tu invitación gratuita. Entrada con QR personal en minutos.',
    url: BASE_URL,
    siteName: 'Monkey Restobar',
    type: 'website',
    locale: 'es_CL',
    images: [{ url: OG_DEFAULT, width: 1200, height: 630, alt: 'Monkey Restobar' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monkey Restobar — Invitaciones y Eventos',
    description: 'Solicita tu invitación gratuita. Entrada con QR personal en minutos.',
    images: [OG_DEFAULT],
  },
}

export const viewport: Viewport = {
  themeColor: '#1a0e00',
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
      <body className="bg-darker text-white antialiased min-h-screen" style={{ backgroundColor: '#050505' }} data-project="monkey">

        {/* Background — imagen Cloudinary */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <img
            src="https://res.cloudinary.com/dqsz4ua73/image/upload/q_auto/f_auto/v1775919165/Gemini_Generated_Image_zjq5wzjq5wzjq5wz_kcpqql.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.25 }}
          />
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <a href="/" className="flex items-center gap-2">
                <img
                  src="/monkey-logo.png"
                  alt="Monkey Restobar"
                  className="h-10 w-auto object-contain"
                />
                <span className="hidden sm:inline-flex text-[10px] uppercase tracking-[0.2em] font-black text-amber-300 border border-amber-400/30 px-2 py-1 rounded-full bg-amber-500/10">
                  Monkey
                </span>
              </a>

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
