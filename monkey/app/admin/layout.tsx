import LogoutButton from './LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-16 left-0 right-0 z-40 border-b border-primary/10 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-11">
          <div className="flex items-center gap-6 text-sm">
            <a href="/admin" className="text-zinc-400 hover:text-primary transition-colors font-medium tracking-wide">
              Dashboard
            </a>
            <a href="/admin/socios" className="text-zinc-500 hover:text-primary transition-colors tracking-wide">
              🐒 Club
            </a>
            <a href="/admin/eventos/nuevo" className="text-zinc-500 hover:text-primary transition-colors tracking-wide">
              + Nuevo evento
            </a>
            <a href="/admin/chatbot" className="text-zinc-500 hover:text-primary transition-colors tracking-wide">
              🤖 Chatbot
            </a>
            <a href="/" target="_blank" className="text-zinc-700 hover:text-zinc-400 transition-colors text-xs tracking-wide">
              Ver sitio ↗
            </a>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <div className="pt-11">
        {children}
      </div>
    </div>
  )
}
