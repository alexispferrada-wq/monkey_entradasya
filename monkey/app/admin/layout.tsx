import LogoutButton from './LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Sidebar / top nav admin */}
      <nav className="fixed top-16 left-0 right-0 z-40 border-b border-white/5 bg-slate-900/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          <div className="flex items-center gap-6 text-sm">
            <a href="/admin" className="text-slate-400 hover:text-white transition-colors font-medium">
              Dashboard
            </a>
            <a href="/admin/eventos/nuevo" className="text-slate-400 hover:text-white transition-colors">
              + Nuevo evento
            </a>
            <a href="/" target="_blank" className="text-slate-500 hover:text-slate-300 transition-colors text-xs">
              Ver sitio ↗
            </a>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <div className="pt-12">
        {children}
      </div>
    </div>
  )
}
