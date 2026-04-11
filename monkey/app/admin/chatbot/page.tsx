import { db } from '@/lib/db'
import { chatbotDocs } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import ChatbotPanel from './ChatbotPanel'

export const dynamic = 'force-dynamic'

const CATEGORIAS: Record<string, { label: string; emoji: string }> = {
  ambiente:  { label: 'Ambientes',         emoji: '🏠' },
  reservas:  { label: 'Reservas',          emoji: '📅' },
  template:  { label: 'Templates de respuesta', emoji: '💬' },
  horarios:  { label: 'Horarios',          emoji: '🕗' },
  info:      { label: 'Info general',      emoji: 'ℹ️' },
  faq:       { label: 'Preguntas frecuentes', emoji: '❓' },
  menu:      { label: 'Menú',              emoji: '🍽️' },
}

export default async function ChatbotAdminPage() {
  const docs = await db
    .select()
    .from(chatbotDocs)
    .orderBy(asc(chatbotDocs.orden), asc(chatbotDocs.categoria))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🤖</span>
          <div>
            <h1 className="font-display text-3xl text-primary tracking-widest uppercase">Chatbot Mono</h1>
            <p className="text-zinc-500 text-sm">Base de conocimiento — todo lo que sabe el bot</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 mt-4 border-yellow-500/20">
          <p className="text-zinc-400 text-sm">
            <span className="text-primary font-bold">Estado:</span>{' '}
            <span className="text-zinc-500">Desactivado temporalmente</span>
            {' · '}
            <span className="text-zinc-600 text-xs">Para activarlo, descomenta &lt;ChatWidget /&gt; en layout.tsx</span>
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Aquí puedes editar todo el contenido que el chatbot usa para responder. Los cambios son inmediatos.
          </p>
        </div>
      </div>

      <ChatbotPanel docs={docs} categorias={CATEGORIAS} />
    </div>
  )
}
