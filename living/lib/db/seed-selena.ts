/**
 * Seed: Evento Selena Doble Oficial — Living Club
 * Ejecutar con: npm run db:seed-selena
 */
import { db } from './index'
import { eventos } from './schema'
import { eq } from 'drizzle-orm'

async function seed() {
  console.log('Creando evento Selena Doble Oficial...')

  // Verificar si ya existe
  const [existe] = await db
    .select()
    .from(eventos)
    .where(eq(eventos.slug, 'selena-doble-oficial'))
    .limit(1)

  if (existe) {
    console.log('⚠️  El evento ya existe. Actualizando...')
    await db
      .update(eventos)
      .set({
        nombre: 'Selena Doble Oficial',
        descripcion: '¡Una Noche Imperdible! Música en vivo, Karaoke, Comida y Entretencion. Nueva carta de carnes a la parrilla · Nuevo salón más grande · Iluminación renovada · Sonido full profesional.',
        fecha: new Date('2026-04-11T22:00:00-04:00'),
        lugar: 'Gran Salón Living — Av. Concha y Toro 1060, Local 3',
        cuposTotal: 100,
        cuposDisponibles: 100,
        activo: true,
      })
      .where(eq(eventos.slug, 'selena-doble-oficial'))
    console.log('✅ Evento actualizado')
    process.exit(0)
  }

  await db.insert(eventos).values({
    nombre: 'Selena Doble Oficial',
    descripcion: '¡Una Noche Imperdible! Música en vivo, Karaoke, Comida y Entretencion. Nueva carta de carnes a la parrilla · Nuevo salón más grande · Iluminación renovada · Sonido full profesional.',
    fecha: new Date('2026-04-11T22:00:00-04:00'),
    lugar: 'Gran Salón Living — Av. Concha y Toro 1060, Local 3',
    cuposTotal: 100,
    cuposDisponibles: 100,
    slug: 'selena-doble-oficial',
    activo: true,
  })

  console.log('✅ Evento creado: Selena Doble Oficial — Sábado 11 Abril 2026')
  console.log('👉 Ahora sube el flyer en: http://localhost:3001/admin/eventos')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
