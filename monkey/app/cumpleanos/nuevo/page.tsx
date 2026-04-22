import CumpleanosForm from './CumpleanosForm'

export const metadata = {
  title: 'Evento de Cumpleaños — Monkey Restobar',
  description: 'Crea tu evento de cumpleaños privado en Monkey Restobar.',
}

export default function CumpleanosNuevoPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <a
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-sm tracking-widest uppercase font-medium"
        >
          ← Volver
        </a>

        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎂</div>
          <h1 className="font-display text-4xl text-white uppercase tracking-widest mb-3">
            Evento de <span className="gradient-text">Cumpleaños</span>
          </h1>
          <div className="jungle-divider max-w-xs mx-auto mb-4" />
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
            Crea tu evento privado en segundos. Tus invitados recibirán un <strong className="text-white">QR personal de acceso</strong> — una entrada por persona.
          </p>
        </div>

        <CumpleanosForm />
      </div>
    </div>
  )
}
