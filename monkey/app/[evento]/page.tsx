import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import InvitacionForm from './InvitacionForm'
import ColorExtractor from './ColorExtractor'

// Revalidar cada 60s: reduce queries a la DB manteniendo datos frescos
export const revalidate = 60

interface Props {
  params: Promise<{ evento: string }>
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
  const { evento: eventoSlug } = await params
  const [evento] = await db
    .select()
    .from(eventos)
    .where(eq(eventos.slug, eventoSlug))
    .limit(1)

  if (!evento || !evento.activo) notFound()

  const agotado = evento.cuposDisponibles <= 0

  return (
    <>
      {/* Extrae colores del flyer y los aplica como CSS vars */}
      {evento.imagenUrl && <ColorExtractor imageUrl={evento.imagenUrl} />}

<div className="min-h-screen py-12 px-4 evento-bg">

        <div className="max-w-2xl mx-auto relative z-10">

          {/* Back */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-sm tracking-widest uppercase font-medium"
          >
            ← Volver
          </a>

          {/* Card */}
          <div className="glass-card rounded-2xl overflow-hidden animate-slide-up evento-border evento-glow" style={{ borderWidth: '1px', borderStyle: 'solid' }}>

            {/* Imagen */}
            <div className="relative h-80 bg-black">
              {evento.imagenUrl ? (
                <Image
                  src={evento.imagenUrl}
                  alt={evento.nombre}
                  fill
                  className="object-cover"
                  priority
                  quality={85}
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <span className="font-display text-5xl text-primary/20 tracking-widest">MONKEY</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Badge cupos */}
              <div className="absolute bottom-4 left-6">
                {agotado ? (
                  <span className="bg-red-600 text-white text-sm font-black px-4 py-2 rounded-full uppercase tracking-wider">
                    Sin cupos disponibles
                  </span>
                ) : (
                  <span className="evento-badge text-sm font-black px-4 py-2 rounded-full uppercase tracking-wider">
                    {evento.cuposDisponibles} invitaciones disponibles
                  </span>
                )}
              </div>
            </div>

            <div className="p-8">
              {/* Título */}
              <h1 className="font-display text-4xl sm:text-5xl text-white mb-2 tracking-wide uppercase leading-none">
                {evento.nombre}
              </h1>
              {evento.descripcion && (
                <p className="text-zinc-500 mb-6 text-sm leading-relaxed">{evento.descripcion}</p>
              )}

              <div className="evento-divider mb-6" />

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass-card rounded-xl p-4 evento-border" style={{ borderWidth: '1px', borderStyle: 'solid' }}>
                  <p className="evento-label text-xs mb-1 font-bold uppercase tracking-wider">Fecha y hora</p>
                  <p className="text-white font-medium text-sm capitalize">
                    {formatFechaCompleta(evento.fecha)}
                  </p>
                </div>
                <div className="glass-card rounded-xl p-4 evento-border" style={{ borderWidth: '1px', borderStyle: 'solid' }}>
                  <p className="evento-label text-xs mb-1 font-bold uppercase tracking-wider">Lugar</p>
                  <p className="text-white font-medium text-sm">{evento.lugar}</p>
                </div>
              </div>

              {/* Formulario */}
              {agotado ? (
                <div className="text-center py-8">
                  <div className="font-display text-5xl text-zinc-700 mb-4 tracking-wide">AGOTADO</div>
                  <p className="text-zinc-500">Las invitaciones para este evento se agotaron.</p>
                </div>
              ) : (
                <InvitacionForm
                  eventoId={evento.id}
                  eventoNombre={evento.nombre}
                />
              )}
            </div>
          </div>

          <p className="text-center text-zinc-700 text-xs mt-6 tracking-widest uppercase">
            Monkey Restobar · Av. Concha y Toro 1060, Local 3
          </p>
        </div>
      </div>
    </>
  )
}
