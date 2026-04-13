import ReservaForm from './ReservaForm'

export const metadata = {
  title: 'Reservas — Monkey Restobar',
  description: 'Haz tu reserva en Monkey Restobar.',
}

export default function ReservasPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-zinc-950">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-primary uppercase tracking-widest mb-4">Reservas</h1>
          <p className="text-zinc-400">Asegura tu mesa en Monkey Restobar.</p>
        </div>
        <ReservaForm />
      </div>
    </main>
  )
}