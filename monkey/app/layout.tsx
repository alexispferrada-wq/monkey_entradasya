import type { Metadata, Viewport } from 'next'
import './globals.css'
import ChatWidget from './components/ChatWidget'

export const metadata: Metadata = {
  title: 'Monkey Restobar — Invitaciones',
  description: 'Solicita tu invitación gratuita para los eventos de Monkey Restobar.',
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
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
              <a href="/" className="flex items-center">
                <img
                  src="https://res.cloudinary.com/dqsz4ua73/image/upload/v1775919972/logo300xp_s0gh7w.png"
                  alt="Monkey Restobar"
                  className="h-10 w-auto object-contain"
                />
              </a>

            </div>
          </div>
        </nav>

        <main className="relative z-10 pt-16">
          {children}
        </main>

        {/* Chatbot flotante */}
        <ChatWidget />

      </body>
    </html>
  )
}
