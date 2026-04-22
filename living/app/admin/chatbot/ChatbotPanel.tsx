'use client'

import { useState } from 'react'
import type { ChatbotDoc } from '@/lib/db/schema'

interface Props {
  docs: ChatbotDoc[]
  categorias: Record<string, { label: string; emoji: string }>
}

const CATEGORIAS_LIST = ['ambiente', 'template', 'horarios', 'info', 'faq', 'menu', 'reservas']

export default function ChatbotPanel({ docs: initialDocs, categorias }: Props) {
  const [docs, setDocs] = useState(initialDocs)
  const [editing, setEditing] = useState<ChatbotDoc | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [form, setForm] = useState({
    clave: '', categoria: 'info', titulo: '', contenido: '', orden: 0,
  })

  function startEdit(doc: ChatbotDoc) {
    setEditing(doc)
    setCreating(false)
    setError('')
    setSuccess('')
  }

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm({ clave: '', categoria: 'info', titulo: '', contenido: '', orden: docs.length * 10 })
    setError('')
    setSuccess('')
  }

  function cancelEdit() {
    setEditing(null)
    setCreating(false)
    setError('')
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/chatbot/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editing.titulo,
          contenido: editing.contenido,
          categoria: editing.categoria,
          activo: editing.activo,
          orden: editing.orden,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      const updated = await res.json()
      setDocs(docs.map(d => d.id === updated.id ? updated : d))
      setEditing(null)
      setSuccess('✓ Guardado correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al guardar el documento')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(doc: ChatbotDoc) {
    try {
      const res = await fetch(`/api/admin/chatbot/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doc, activo: !doc.activo }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setDocs(docs.map(d => d.id === updated.id ? updated : d))
    } catch {
      setError('Error al actualizar')
    }
  }

  async function deleteDoc(doc: ChatbotDoc) {
    if (!confirm(`¿Eliminar "${doc.titulo}"? Esta acción no se puede deshacer.`)) return
    try {
      await fetch(`/api/admin/chatbot/${doc.id}`, { method: 'DELETE' })
      setDocs(docs.filter(d => d.id !== doc.id))
      if (editing?.id === doc.id) setEditing(null)
    } catch {
      setError('Error al eliminar')
    }
  }

  async function createDoc() {
    if (!form.clave || !form.titulo || !form.contenido) {
      setError('Clave, título y contenido son requeridos')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear')
      }
      const newDoc = await res.json()
      setDocs([...docs, newDoc].sort((a, b) => a.orden - b.orden))
      setCreating(false)
      setSuccess('✓ Documento creado')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear')
    } finally {
      setSaving(false)
    }
  }

  // Group by category
  const grouped = CATEGORIAS_LIST.reduce((acc, cat) => {
    const catDocs = docs.filter(d => d.categoria === cat)
    if (catDocs.length > 0) acc[cat] = catDocs
    return acc
  }, {} as Record<string, ChatbotDoc[]>)

  // Add any uncategorized
  const otherDocs = docs.filter(d => !CATEGORIAS_LIST.includes(d.categoria))
  if (otherDocs.length > 0) grouped['otros'] = otherDocs

  return (
    <div className="flex gap-6 flex-col lg:flex-row">

      {/* LEFT: Document list */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400 text-sm">{docs.length} documentos en la base de conocimiento</span>
          <button
            onClick={startCreate}
            className="btn-primary py-2 px-4 text-sm"
          >
            + Agregar documento
          </button>
        </div>

        {success && (
          <div className="glass-card rounded-xl p-3 mb-4 border-green-500/30 text-green-400 text-sm">{success}</div>
        )}
        {error && !editing && !creating && (
          <div className="glass-card rounded-xl p-3 mb-4 border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catDocs]) => {
            const catInfo = categorias[cat] || { label: cat, emoji: '📄' }
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-white/5">
                  <span>{catInfo.emoji}</span>
                  <span className="text-zinc-400 text-xs font-bold tracking-wider uppercase">{catInfo.label}</span>
                  <span className="text-zinc-700 text-xs">({catDocs.length})</span>
                </div>
                <div className="space-y-2">
                  {catDocs.map(doc => (
                    <div
                      key={doc.id}
                      className={`glass-card rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                        editing?.id === doc.id ? 'border-primary/50' : 'hover:border-white/15'
                      } ${!doc.activo ? 'opacity-40' : ''}`}
                      onClick={() => startEdit(doc)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-white text-sm font-medium truncate">{doc.titulo}</div>
                          <div className="text-zinc-600 text-xs font-mono mt-0.5">{doc.clave}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleActive(doc) }}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                              doc.activo
                                ? 'border-green-500/30 text-green-500 bg-green-500/10'
                                : 'border-zinc-700 text-zinc-600'
                            }`}
                            title={doc.activo ? 'Activo — click para desactivar' : 'Inactivo — click para activar'}
                          >
                            {doc.activo ? 'activo' : 'inactivo'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteDoc(doc) }}
                            className="text-zinc-700 hover:text-red-400 transition-colors text-sm"
                            title="Eliminar"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <p className="text-zinc-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {doc.contenido.slice(0, 120)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT: Editor */}
      {(editing || creating) && (
        <div className="lg:w-[480px] lg:flex-shrink-0">
          <div className="glass-card rounded-2xl p-5 sticky top-28">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-primary tracking-wider uppercase text-sm">
                {creating ? 'Nuevo documento' : 'Editar documento'}
              </h3>
              <button onClick={cancelEdit} className="text-zinc-600 hover:text-zinc-300 text-lg">✕</button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-2 text-xs mb-3">{error}</div>
            )}

            <div className="space-y-3">
              {creating && (
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Clave única <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.clave}
                    onChange={e => setForm({ ...form, clave: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="ej: horario_viernes"
                    className="input-glass text-sm font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Categoría <span className="text-red-400">*</span></label>
                <select
                  value={creating ? form.categoria : editing?.categoria}
                  onChange={e => creating
                    ? setForm({ ...form, categoria: e.target.value })
                    : setEditing(editing ? { ...editing, categoria: e.target.value } : null)
                  }
                  className="input-glass text-sm"
                >
                  {CATEGORIAS_LIST.map(c => (
                    <option key={c} value={c}>{categorias[c]?.emoji} {categorias[c]?.label || c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Título <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={creating ? form.titulo : editing?.titulo || ''}
                  onChange={e => creating
                    ? setForm({ ...form, titulo: e.target.value })
                    : setEditing(editing ? { ...editing, titulo: e.target.value } : null)
                  }
                  className="input-glass text-sm"
                  placeholder="Nombre descriptivo del documento"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">
                  Contenido <span className="text-red-400">*</span>
                  <span className="text-zinc-700 normal-case ml-2 font-normal">— El bot lee esto literalmente</span>
                </label>
                <textarea
                  value={creating ? form.contenido : editing?.contenido || ''}
                  onChange={e => creating
                    ? setForm({ ...form, contenido: e.target.value })
                    : setEditing(editing ? { ...editing, contenido: e.target.value } : null)
                  }
                  rows={14}
                  className="input-glass text-sm font-mono resize-y leading-relaxed"
                  placeholder="Escribe aquí el contenido que el bot debe conocer..."
                  style={{ minHeight: '200px' }}
                />
                <div className="text-zinc-700 text-[10px] mt-1">
                  {(creating ? form.contenido : editing?.contenido || '').length} caracteres
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Orden</label>
                <input
                  type="number"
                  value={creating ? form.orden : editing?.orden || 0}
                  onChange={e => creating
                    ? setForm({ ...form, orden: Number(e.target.value) })
                    : setEditing(editing ? { ...editing, orden: Number(e.target.value) } : null)
                  }
                  className="input-glass text-sm w-24"
                />
              </div>

              {!creating && editing && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Activo</label>
                  <button
                    onClick={() => setEditing({ ...editing, activo: !editing.activo })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${editing.activo ? 'bg-green-600' : 'bg-zinc-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${editing.activo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={creating ? createDoc : saveEdit}
                disabled={saving}
                className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
              >
                {saving ? 'Guardando...' : creating ? 'Crear documento' : 'Guardar cambios'}
              </button>
              <button
                onClick={cancelEdit}
                className="btn-secondary py-2.5 px-4 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
