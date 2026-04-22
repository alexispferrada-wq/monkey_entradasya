import { db } from '@/lib/db'
import { tickets, eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PagoExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>
}) {
  const { ticket: ticketId } = await searchParams
  let ticket = null
  let evento = null

  if (ticketId) {
    const rows = await db
      .select({ ticket: tickets, evento: eventos })
      .from(tickets)
      .innerJoin(eventos, eq(tickets.eventoId, eventos.id))
      .where(eq(tickets.id, ticketId))
      .limit(1)

    if (rows[0]) {
      ticket = rows[0].ticket
      evento = rows[0].evento
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          ✓
        </div>

        <div>
          <h1 className="font-display text-4xl text-white tracking-widest uppercase mb-2">
            ¡Pago exitoso!
          </h1>
          {evento && (
            <p className="text-zinc-400">
              Tu entrada para <span className="text-primary font-semibold">{evento.nombre}</span> está confirmada.
            </p>
          )}
        </div>

        {ticket?.qrImageUrl && (
          <div className="glass-card rounded-2xl p-6 border border-green-500/20">
            <p className="text-zinc-400 text-sm mb-4">Tu código QR de entrada</p>
            <img
              src={ticket.qrImageUrl}
              alt="QR de entrada"
              className="w-48 h-48 mx-auto rounded-xl"
            />
            <p className="text-zinc-600 text-xs mt-3">Presenta este código en la puerta</p>
          </div>
        )}

        {!ticket?.qrImageUrl && (
          <div className="glass-card rounded-2xl p-6 border border-primary/20">
            <p className="text-zinc-400 text-sm">
              Tu QR de entrada será enviado a{' '}
              <span className="text-primary">{ticket?.email}</span> en minutos.
            </p>
          </div>
        )}

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
