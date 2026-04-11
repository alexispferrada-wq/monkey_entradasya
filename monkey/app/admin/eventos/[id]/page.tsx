'use client'

import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import EventoForm from '../EventoForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarEventoPage({ params }: Props) {
  const { id } = await params
  const [evento] = await db
    .select()
    .from(eventos)
    .where(eq(eventos.id, id))
    .limit(1)

  if (!evento) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <a href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          ← Dashboard
        </a>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/eventos/${id}/invitaciones`}
            className="text-sm px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
          >
            Ver invitaciones →
          </Link>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={`https://entradasya.cl/scan/${evento.slug}`}
              readOnly
              className="text-sm px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-slate-300 w-64"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://entradasya.cl/scan/${evento.slug}`)
                alert('Link copiado')
              }}
              className="text-sm px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:border-primary/50 hover:text-white transition-all"
            >
              Copiar
            </button>
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-black text-white mb-8">Editar evento</h1>
      <EventoForm evento={evento} />
    </div>
  )
}
