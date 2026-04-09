import { db } from './index'
import { invitaciones, eventos } from './schema'

async function reset() {
  console.log('Borrando todas las invitaciones...')
  await db.delete(invitaciones)
  console.log('Borrando todos los eventos...')
  await db.delete(eventos)
  console.log('✅ Base de datos limpia')
  process.exit(0)
}

reset().catch((e) => {
  console.error(e)
  process.exit(1)
})
