import Link from 'next/link'

export default function CortesiaConfirmadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Ícono */}
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,184,0,0.15), rgba(255,90,31,0.10))', border: '1px solid rgba(255,184,0,0.25)' }}>
          🎟
        </div>

        {/* Título */}
        <div>
          <h1 className="font-display text-4xl tracking-widest uppercase mb-2">
            <span className="living-title-l">Solici</span><span className="living-title-i">tud</span>
            <br />
            <span className="living-title-l">Envia</span><span className="living-title-g">da</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Recibimos tu solicitud de cortesía. Nuestro equipo la revisará y te escribiremos al email que ingresaste.
          </p>
        </div>

        {/* Info */}
        <div className="ticket-card rounded-2xl p-5 text-left space-y-3">
          {[
            { icon: '📩', text: 'Recibirás un email con tu QR si tu solicitud es aprobada.' },
            { icon: '⏱',  text: 'El tiempo de respuesta es de 24-48 horas.' },
            { icon: '📱', text: 'También podemos contactarte por WhatsApp.' },
          ].map((item) => (
            <div key={item.icon} className="flex items-start gap-3">
              <span className="text-lg shrink-0">{item.icon}</span>
              <p className="text-zinc-400 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link href="/" className="btn-primary rounded-2xl py-3.5 text-base shimmer-bar">
            Volver al inicio
          </Link>
          <Link href="/cortesia" className="btn-secondary rounded-2xl py-3.5 text-base">
            Solicitar otra cortesía
          </Link>
        </div>

      </div>
    </div>
  )
}
