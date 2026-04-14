import type { Metadata } from 'next'
import Link from 'next/link'
import NormalForm from './NormalForm'

export const metadata: Metadata = {
  title: 'Reserva Terraza — Monkey Restobar',
  description: 'Reserva tu mesa en la terraza de Monkey Restobar. Gratuito, sujeto a disponibilidad.',
}

export default function ReservaNormalPage() {
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
            <span className="text-3xl">🏖️</span>
            <div>
              <h1 className="font-display text-2xl text-white uppercase tracking-wide">
                Terraza
              </h1>
              <span className="text-green-400 text-xs font-bold uppercase tracking-wide">
                Reserva gratuita
              </span>
            </div>
          </div>
          <p className="text-zinc-500 text-sm mt-2">
            Mesa en el sector fumadores. Completa el formulario y te confirmamos por correo.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <NormalForm />
        </div>

      </div>
    </main>
  )
}
