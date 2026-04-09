import EventoForm from '../EventoForm'

export default function NuevoEventoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
        ← Volver al dashboard
      </a>
      <h1 className="text-3xl font-black text-white mb-8">Nuevo evento</h1>
      <EventoForm />
    </div>
  )
}
