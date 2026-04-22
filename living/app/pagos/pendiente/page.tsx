import Link from 'next/link'

export default function PagoPendientePage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }}>
          ⏳
        </div>

        <div>
          <h1 className="font-display text-4xl text-white tracking-widest uppercase mb-2">
            Pago pendiente
          </h1>
          <p className="text-zinc-400">
            Tu pago está siendo procesado. Recibirás un email de confirmación cuando se acredite.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-primary/20">
          <p className="text-zinc-400 text-sm">
            Los pagos en efectivo (Rapipago, PagoFácil) pueden demorar hasta 2 días hábiles.
            No cierres esta ventana todavía.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl font-bold text-black transition-all duration-200 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #FFE600, #F97316)' }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
