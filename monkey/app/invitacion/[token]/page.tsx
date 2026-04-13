import { db } from '@/lib/db'
import { invitaciones, eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Image from 'next/image'

interface Props {
  params: Promise<{ token: string }>
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

const estadoConfig = {
  pendiente: { label: 'Pendiente de activación', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: '⏳' },
  enviada: { label: 'Activa — Lista para usar', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: '✅' },
  usada: { label: 'Utilizada', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30', icon: '🎫' },
  cancelada: { label: 'Cancelada', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', icon: '❌' },
}

export default async function InvitacionPage({ params }: Props) {
  const { token } = await params
  const [result] = await db
    .select({
      invitacion: invitaciones,
      evento: eventos,
    })
    .from(invitaciones)
    .innerJoin(eventos, eq(invitaciones.eventoId, eventos.id))
    .where(eq(invitaciones.token, token))
    .limit(1)

  if (!result) notFound()

  const { invitacion, evento } = result
  const config = estadoConfig[invitacion.estado]

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl glow-primary">
            🎟️
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Tu Invitación</h1>
          <p className="text-slate-400 text-sm">Muestra este QR al ingresar al evento</p>
        </div>

        {/* Card principal */}
        <div className="glass-card rounded-3xl overflow-hidden">

          {/* Estado */}
          <div className={`border-b border-white/5 p-5 flex items-center gap-3 ${config.bg} border`}>
            <span className="text-2xl">{config.icon}</span>
            <div>
              <p className={`font-bold ${config.color}`}>{config.label}</p>
              <p className="text-slate-500 text-xs">Estado de tu invitación</p>
            </div>
          </div>

          <div className="p-6">
            {/* QR Code */}
            {invitacion.qrImageUrl && (
              <div className="text-center mb-6">
                {/* QR grande para fácil escaneo en móvil */}
                <div className="bg-white p-4 rounded-2xl inline-block mb-3 shadow-xl">
                  <Image
                    src={invitacion.qrImageUrl}
                    alt="QR de acceso"
                    width={260}
                    height={260}
                    quality={100}
                    className="block"
                    priority
                  />
                </div>
                <p className="text-slate-400 text-sm font-medium">
                  Muestra este QR al ingresar
                </p>
              </div>
            )}

            {/* Datos del invitado */}
            <div className="glass-card rounded-2xl p-4 mb-4">
              <p className="text-slate-500 text-xs mb-1">Invitado</p>
              <p className="text-white font-bold text-lg">{invitacion.nombre}</p>
              <p className="text-slate-400 text-sm">{invitacion.email}</p>
            </div>

            {/* Datos del evento */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-slate-500 text-xs mb-3">Evento</p>
              <h2 className="text-white font-bold text-xl mb-3">{evento.nombre}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>📅</span>
                  <span className="text-slate-300 capitalize">{formatFechaCompleta(evento.fecha)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>📍</span>
                  <span className="text-slate-300">{evento.lugar}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de la card */}
          {invitacion.estado === 'usada' && (
            <div className="border-t border-white/5 p-4 text-center">
              <p className="text-slate-500 text-sm">
                Esta invitación fue utilizada el{' '}
                {invitacion.usedAt
                  ? new Date(invitacion.usedAt).toLocaleDateString('es-CL')
                  : '—'}
              </p>
            </div>
          )}
        </div>

        {/* Aviso de seguridad */}
        <div className="mt-6 glass-card rounded-2xl p-4 text-center">
          <p className="text-slate-500 text-xs">
            🔒 Esta invitación es personal e intransferible.
            Solo puede ser usada una vez.
          </p>
        </div>
      </div>
    </div>
  )
}
