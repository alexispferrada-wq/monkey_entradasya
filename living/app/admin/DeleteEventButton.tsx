'use client'

interface Props {
  eventoId: string
  nombreEvento: string
}

export default function DeleteEventButton({ eventoId, nombreEvento }: Props) {
  function handleSubmit(e: React.FormEvent) {
    if (!confirm(`¿Estás seguro de eliminar "${nombreEvento}"?`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={`/api/admin/eventos/${eventoId}`} method="post" className="inline" onSubmit={handleSubmit}>
      <input type="hidden" name="_method" value="delete" />
      <button
        type="submit"
        className="text-sm px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
      >
        Eliminar
      </button>
    </form>
  )
}
