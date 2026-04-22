import LogoutButton from './LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-16 left-0 right-0 z-40 border-b border-amber-400/25 bg-[#170700]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-11">
          <div className="flex items-center gap-6 text-sm">
            <a href="/" className="shrink-0 flex items-center gap-2">
              <img
                src="/living-logo.png"
                alt="Living Club"
                className="h-7 w-auto object-contain"
              />
              <span className="hidden md:inline-flex text-[10px] font-black tracking-[0.18em] uppercase px-2 py-1 rounded-full border border-amber-400/35 text-amber-300 bg-amber-500/10">
                Living Admin
              </span>
            </a>
            <a href="/admin" className="text-zinc-300 hover:text-amber-300 transition-colors font-medium tracking-wide">
              Dashboard
            </a>
            <a href="/admin/cortesias" className="text-zinc-400 hover:text-amber-300 transition-colors tracking-wide">
              Cortesias
            </a>
            <a href="/admin/metricas" className="text-zinc-400 hover:text-amber-300 transition-colors tracking-wide">
              Métricas
            </a>
            <a href="/admin/socios" className="text-zinc-400 hover:text-amber-300 transition-colors tracking-wide">
              Club
            </a>
            <a href="/admin/eventos/nuevo" className="text-zinc-400 hover:text-amber-300 transition-colors tracking-wide">
              + Evento
            </a>
            <a href="/" target="_blank" className="text-zinc-600 hover:text-zinc-300 transition-colors text-xs tracking-wide">
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
