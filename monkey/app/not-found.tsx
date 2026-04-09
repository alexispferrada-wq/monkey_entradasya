import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl mb-6">🎭</div>
        <h1 className="text-5xl font-black gradient-text mb-4">404</h1>
        <p className="text-slate-400 text-xl mb-2">Página no encontrada</p>
        <p className="text-slate-600 mb-8">
          El evento o la invitación que buscas no existe.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Ver eventos disponibles →
        </Link>
      </div>
    </div>
  )
}
