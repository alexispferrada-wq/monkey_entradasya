import type { Metadata } from 'next'
import Link from 'next/link'
import GrillForm from './GrillForm'

export const metadata: Metadata = {
  title: 'Reserva Monkey Grill — Monkey Restobar',
  description: 'Reserva tu mesa en Monkey Grill. Piso 2 con ambiente exclusivo. Consumo mínimo $10.000.',
}

export default function ReservaGrillPage() {
  return (
    <main className="min-h-screen pt-20 pb-safe-bottom bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/reservas"
            className="inline-flex items-center gap-1.5 text-zinc-500 text-sm hover:text-white transition-colors mb-5"
          >
            ← Volver
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔥</span>
            <div>
              <h1 className="font-display text-2xl text-white uppercase tracking-wide">
                Monkey Grill
              </h1>
              <span className="text-primary text-xs font-bold uppercase tracking-wide">
                Consumo mínimo $10.000
              </span>
            </div>
          </div>
          <p className="text-zinc-500 text-sm mt-2">
            Ambiente exclusivo en el piso 2. Reserva requiere comprobante de pago.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <GrillForm />
        </div>

      </div>
    </main>
  )
}
