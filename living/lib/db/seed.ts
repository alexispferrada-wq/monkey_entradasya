/**
 * Seed: crea un evento de prueba en la base de datos
 * Ejecutar con: npx tsx lib/db/seed.ts
 */
import { db } from './index'
import { eventos } from './schema'

async function seed() {
  console.log('Seeding...')

  await db.insert(eventos).values([
    {
      nombre: 'Noche de Gala EntradasYa',
      descripcion: 'Una noche exclusiva para celebrar el lanzamiento de la plataforma. Música en vivo, cocktails y networking.',
      fecha: new Date('2024-12-20T21:00:00-03:00'),
      lugar: 'W Hotel Santiago, El Bosque Norte 5, Las Condes',
      cuposTotal: 150,
      cuposDisponibles: 150,
      slug: 'noche-de-gala-entradasya',
      activo: true,
    },
    {
      nombre: 'After Office — Living Launch',
      descripcion: 'Celebremos el lanzamiento de Living Club con los mejores de la industria de eventos en Chile.',
      fecha: new Date('2024-11-30T19:30:00-03:00'),
      lugar: 'Terraza Bellavista, Santiago',
      cuposTotal: 80,
      cuposDisponibles: 80,
      slug: 'after-office-living-launch',
      activo: true,
    },
  ])

  console.log('✅ Seed completado')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
