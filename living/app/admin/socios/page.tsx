import { db } from '@/lib/db'
import { socios } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import SociosPanel from './SociosPanel'

export const revalidate = 0

export default async function SociosAdminPage() {
  const lista = await db.select().from(socios).orderBy(desc(socios.puntos))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-primary tracking-widest uppercase">Club Living</h1>
        <p className="text-zinc-500 text-sm mt-1">Gestión de socios y puntos de lealtad</p>
      </div>

      {/* Stats resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total socios', value: lista.length },
          { label: 'Bronze', value: lista.filter(s => s.nivel === 'bronze').length },
          { label: 'Silver / Gold', value: lista.filter(s => s.nivel === 'silver' || s.nivel === 'gold').length },
          { label: 'VIP', value: lista.filter(s => s.nivel === 'vip').length },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <p className="text-primary font-black text-2xl">{value}</p>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      <SociosPanel sociosIniciales={lista} />
    </div>
  )
}
