import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import InvitacionForm from './InvitacionForm'

export const revalidate = 0

interface Props {
  params: { evento: string }
}

function formatFechaCompleta(fecha: Date): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function EventoPage({ params }: Props) {
  const [evento] = await db
    .select()
    .from(eventos)
    .where(eq(eventos.slug, params.evento))
    .limit(1)

  if (!evento || !evento.activo) notFound()

  const agotado = evento.cuposDisponibles <= 0

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm"
        >
          ← Volver a eventos
        </a>

        {/* Card del evento */}
        <div className="glass-card rounded-3xl overflow-hidden animate-slide-up">

          {/* Imagen */}
          <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-900">
            {evento.imagenUrl ? (
              <Image
                src={evento.imagenUrl}
                alt={evento.nombre}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-10">
                🎉
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

            {/* Badge cupos */}
            <div className="absolute bottom-4 left-6">
              {agotado ? (
                <span className="bg-rose-500/90 text-white text-sm font-bold px-4 py-2 rounded-full">
                  Sin cupos disponibles
                </span>
              ) : (
                <span className="bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-bold px-4 py-2 rounded-full">
                  {evento.cuposDisponibles} invitaciones disponibles
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Info */}
            <h1 className="text-3xl font-black text-white mb-3">{evento.nombre}</h1>
            {evento.descripcion && (
              <p className="text-slate-400 mb-6">{evento.descripcion}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glass-card rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">Fecha y hora</p>
                <p className="text-white font-medium text-sm capitalize">
                  {formatFechaCompleta(evento.fecha)}
                </p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">Lugar</p>
                <p className="text-white font-medium text-sm">{evento.lugar}</p>
              </div>
            </div>

            {/* Formulario */}
            {agotado ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">😔</div>
                <p className="text-slate-400">
                  Las invitaciones para este evento se agotaron.
                </p>
              </div>
            ) : (
              <InvitacionForm eventoId={evento.id} eventoNombre={evento.nombre} />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
