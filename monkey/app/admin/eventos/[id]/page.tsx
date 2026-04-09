import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import EventoForm from '../EventoForm'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

export default async function EditarEventoPage({ params }: Props) {
  const [evento] = await db
    .select()
    .from(eventos)
    .where(eq(eventos.id, params.id))
    .limit(1)

  if (!evento) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <a href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          ← Dashboard
        </a>
        <Link
          href={`/admin/eventos/${params.id}/invitaciones`}
          className="text-sm px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
        >
          Ver invitaciones →
        </Link>
      </div>
      <h1 className="text-3xl font-black text-white mb-8">Editar evento</h1>
      <EventoForm evento={evento} />
    </div>
  )
}
