import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import CortesiaForm from './CortesiaForm'

export const dynamic = 'force-dynamic'

export default async function CortesiaPage() {
  const eventosDisponibles = await db
    .select({ id: eventos.id, nombre: eventos.nombre, fecha: eventos.fecha })
    .from(eventos)
    .where(and(eq(eventos.activo, true), isNull(eventos.deletedAt), gt(eventos.fecha, new Date())))
    .orderBy(eventos.fecha)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4"
            style={{ background: 'rgba(255,184,0,0.10)', border: '1px solid rgba(255,184,0,0.20)' }}>
            🎟
          </div>
          <h1 className="font-display text-4xl tracking-widest uppercase">
            <span className="living-title-l">Corte</span><span className="living-title-i">sí</span><span className="living-title-g">a</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Solicita tu entrada gratuita. El equipo de Living Club revisará tu solicitud y te contactará por email.
          </p>
        </div>

        {/* Aviso */}
        <div className="ticket-card rounded-xl p-4 flex gap-3">
          <span className="text-xl shrink-0">💡</span>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Las cortesías son limitadas y están sujetas a disponibilidad. Recibirás un email con tu QR si tu solicitud es aprobada.
          </p>
        </div>

        {/* Formulario */}
        <CortesiaForm eventos={eventosDisponibles} />

      </div>
    </div>
  )
}
