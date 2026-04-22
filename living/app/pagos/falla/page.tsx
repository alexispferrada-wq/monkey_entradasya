'use client'
import Link from 'next/link'

export default function PagoFallaPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
          ✕
        </div>

        <div>
          <h1 className="font-display text-4xl text-white tracking-widest uppercase mb-2">
            Pago rechazado
          </h1>
          <p className="text-zinc-400">
            El pago no pudo procesarse. Puedes intentarlo nuevamente o elegir otro método de pago.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-red-500/20 text-left space-y-2">
          <p className="text-zinc-400 text-sm">Posibles causas:</p>
          <ul className="text-zinc-500 text-sm space-y-1 list-disc list-inside">
            <li>Fondos insuficientes en la tarjeta</li>
            <li>Datos de tarjeta incorrectos</li>
            <li>Límite de compra superado</li>
            <li>Transacción bloqueada por el banco</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-semibold text-zinc-300 border border-white/10 hover:border-white/20 transition-all"
          >
            Volver al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl font-bold text-black transition-all duration-200 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FFE600, #F97316)' }}
          >
            Reintentar pago
          </button>
        </div>
      </div>
    </div>
  )
}
