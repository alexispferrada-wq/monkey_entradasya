import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import InvitacionForm from './InvitacionForm'
import ColorExtractor from './ColorExtractor'
import ClaveGate from './ClaveGate'

export const revalidate = 60

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://living.entradasya.cl'

interface Props {
  params: Promise<{ evento: string }>
}

// ─── Transforma URL de Cloudinary a 1200×630 para OG ──────────
// WhatsApp, iMessage, Telegram leen og:image en este formato landscape
function ogImageUrl(url: string): string {
  if (!url.includes('res.cloudinary.com')) return url
  return url.replace('/upload/', '/upload/w_1200,h_630,c_fill,g_auto,f_jpg,q_80/')
}

// ─── Metadata dinámica por evento ─────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { evento: slug } = await params
  const [evento] = await db
    .select()
    .from(eventos)
    .where(eq(eventos.slug, slug))
    .limit(1)

  if (!evento) return { title: 'Evento — Living Club' }

  const titulo = evento.nombre
  const descripcion =
    evento.descripcion ??
    `Solicita tu invitación gratuita para ${evento.nombre} en Living Club. Entrada gratuita con QR personal.`
  const imagen = evento.imagenUrl ? ogImageUrl(evento.imagenUrl) : null
  const url = `${BASE_URL}/${slug}`

  return {
    title: `${titulo} — Living Club`,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      url,
      siteName: 'Living Club',
      type: 'website',
      locale: 'es_CL',
      ...(imagen && {
        images: [
          {
            url: imagen,
            width: 1200,
            height: 630,
            alt: titulo,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
      ...(imagen && { images: [imagen] }),
    },
  }
}

function formatFechaCompleta(fecha: Date): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Santiago',
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
      {evento.imagenUrl && <ColorExtractor imageUrl={evento.imagenUrl} />}

      <div className="min-h-screen py-6 px-4 evento-bg">
        <div className="max-w-5xl mx-auto">

          {/* Back — tap target grande */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 active:text-white transition-colors mb-6 text-sm tracking-widest uppercase font-medium min-h-[44px]"
          >
            ← Volver
          </a>

          {/* Layout: en móvil apilado, en desktop lado a lado */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start animate-slide-up">

            {/* Flyer: en móvil ancho completo pero con max-w para no ser gigante */}
            <div className="w-full lg:w-[360px] shrink-0 max-w-xs mx-auto lg:max-w-none lg:mx-0">
              <div
                className="relative w-full rounded-2xl overflow-hidden bg-black evento-glow"
                style={{ aspectRatio: '3/4' }}
              >
                {evento.imagenUrl ? (
                  <Image
                    src={evento.imagenUrl}
                    alt={evento.nombre}
                    fill
                    className="object-contain"
                    priority
                    quality={95}
                    sizes="(max-width: 1024px) 320px, 360px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                    <span className="font-display text-5xl text-primary/20 tracking-widest">LIVING</span>
                  </div>
                )}

                {/* Badge cupos */}
                <div className="absolute top-3 right-3 z-10">
                  {agotado ? (
                    <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      Agotado
                    </span>
                  ) : (
                    <span className="bg-primary text-black text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {evento.cuposDisponibles} cupos
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info + formulario */}
            <div className="flex-1 min-w-0 w-full">
              <div className="glass-card rounded-2xl overflow-hidden evento-border" style={{ borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="p-4 sm:p-6">

                  {/* Lugar */}
                  <p className="evento-label text-xs font-bold uppercase tracking-widest mb-1.5">{evento.lugar}</p>

                  {/* Título */}
                  <h1 className="font-display text-2xl sm:text-3xl text-white mb-2 tracking-wide uppercase leading-tight">
                    {evento.nombre}
                  </h1>

                  {evento.descripcion && (
                    <p className="text-zinc-500 mb-4 text-sm leading-relaxed">{evento.descripcion}</p>
                  )}

                  <div className="evento-divider mb-4" />

                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                    <div className="glass-card rounded-xl p-3 evento-border" style={{ borderWidth: '1px', borderStyle: 'solid' }}>
                      <p className="evento-label text-xs mb-1 font-bold uppercase tracking-wider">Fecha y hora</p>
                      <p className="text-white font-medium text-sm capitalize leading-snug">
                        {formatFechaCompleta(evento.fecha)}
                      </p>
                    </div>
                    <div className="glass-card rounded-xl p-3 evento-border" style={{ borderWidth: '1px', borderStyle: 'solid' }}>
                      <p className="evento-label text-xs mb-1 font-bold uppercase tracking-wider">Lugar</p>
                      <p className="text-white font-medium text-sm">{evento.lugar}</p>
                    </div>
                  </div>

                  {/* Formulario / Clave gate / Agotado */}
                  {agotado ? (
                    <div className="text-center py-8">
                      <div className="font-display text-4xl text-zinc-700 mb-4 tracking-wide">AGOTADO</div>
                      <p className="text-zinc-500 text-sm">Las invitaciones para este evento se agotaron.</p>
                    </div>
                  ) : evento.tipo === 'cumpleanos' ? (
                    <ClaveGate
                      slug={evento.slug}
                      eventoId={evento.id}
                      eventoNombre={evento.nombre}
                    />
                  ) : (
                    <InvitacionForm
                      eventoId={evento.id}
                      eventoNombre={evento.nombre}
                    />
                  )}
                </div>
              </div>

              <p className="text-center text-zinc-700 text-xs mt-4 tracking-widest uppercase">
                Evento Living Club
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
