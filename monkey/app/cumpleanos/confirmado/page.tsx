import Link from 'next/link'

export default function CumpleanosConfirmadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-widest mb-4">
          ¡Tu evento está listo!
        </h1>
        <div className="jungle-divider max-w-xs mx-auto mb-6" />
        <div className="glass-card rounded-2xl p-5 sm:p-8 space-y-4 text-left mb-6">
          <p className="text-zinc-300 text-sm leading-relaxed">
            📧 <strong className="text-white">Revisa tu correo.</strong> Te enviamos la <strong className="text-primary">clave secreta del evento</strong> y el enlace para compartir con tus invitados.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            🔑 Cada invitado deberá ingresar la clave para registrarse y recibirá su <strong className="text-white">QR personal de acceso</strong>.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            🎟️ <strong className="text-white">Un QR = una entrada.</strong> No es transferible. En el ingreso se podría solicitar carnet de identidad para verificar la identidad.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-primary text-black font-black py-3 px-8 rounded-xl uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
