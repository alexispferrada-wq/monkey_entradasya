import { db } from '@/lib/db'
import { tickets, eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EntradaPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const rows = await db
    .select({ ticket: tickets, evento: eventos })
    .from(tickets)
    .innerJoin(eventos, eq(tickets.eventoId, eventos.id))
    .where(eq(tickets.token, token))
    .limit(1)

  if (!rows[0]) notFound()

  const { ticket, evento } = rows[0]

  const esPagado = ticket.estado === 'pagado'
  const esUsado  = ticket.estado === 'usado'

  const fechaEvento = new Date(evento.fecha).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const horaEvento = new Date(evento.fecha).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full space-y-5">

        {/* Estado badge */}
        <div className="text-center">
          {esUsado ? (
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-zinc-800 text-zinc-400">
              Entrada usada
            </span>
          ) : esPagado ? (
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
              ✓ Entrada válida
            </span>
          ) : (
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              Pago pendiente
            </span>
          )}
        </div>

        {/* Card de entrada */}
        <div className="glass-card rounded-2xl overflow-hidden border border-primary/20">
          {evento.imagenUrl && (
            <img src={evento.imagenUrl} alt={evento.nombre} className="w-full h-40 object-cover" />
          )}
          <div className="p-6 space-y-4">
            <div>
              <h1 className="font-display text-2xl text-primary tracking-widest uppercase leading-tight">
                {evento.nombre}
              </h1>
              <p className="text-zinc-400 text-sm mt-1 capitalize">{fechaEvento} · {horaEvento}</p>
              <p className="text-zinc-500 text-sm">{evento.lugar}</p>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Titular</span>
                <span className="text-zinc-200 font-medium">{ticket.nombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Entradas</span>
                <span className="text-zinc-200 font-medium">{ticket.cantidad}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Total pagado</span>
                <span className="text-primary font-bold">
                  ${ticket.montoTotal.toLocaleString('es-CL')}
                </span>
              </div>
            </div>

            {ticket.qrImageUrl && esPagado && !esUsado && (
              <div className="border-t border-white/5 pt-4 text-center">
                <p className="text-zinc-500 text-xs mb-3 uppercase tracking-widest">Código de entrada</p>
                <img
                  src={ticket.qrImageUrl}
                  alt="QR entrada"
                  className="w-48 h-48 mx-auto rounded-xl"
                />
                <p className="text-zinc-600 text-xs mt-2">Presenta este código en la puerta</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
