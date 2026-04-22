export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { z } from 'zod'
import { enviarEmailOrganizadorCumpleanos } from '@/lib/email'

// ─── 20 palabras para generar la clave ───────────────────────
const PALABRAS = [
  'SOL', 'LUNA', 'MAR', 'SELVA', 'JUNGLA',
  'MONO', 'LORO', 'TIGRE', 'PALMA', 'VERDE',
  'AZUL', 'DORADO', 'NOCHE', 'BRISA', 'PUMA',
  'JAGUAR', 'COCO', 'MANGO', 'CORAL', 'FIESTA',
]

function generarClave(): string {
  const shuffled = [...PALABRAS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 4).join(' ')
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6)
}

const schema = z.object({
  // Datos del organizador
  organizadorNombre: z.string().min(2).max(150).trim(),
  organizadorEmail:  z.string().email().trim(),
  organizadorRut:    z.string().min(7).max(12),
  organizadorTelefono: z.string().min(8).max(20).trim(),
  // Datos del evento
  cumpleañeroNombre: z.string().min(2).max(100).trim(),
  edad:              z.number().int().min(1).max(120),
  cantidadInvitados: z.number().int().min(1).max(500),
  lugar:             z.enum(['GENERAL', 'VIP', 'OPEN']),
  fecha:             z.string().min(1), // ISO date string
  hora:              z.string().min(1), // HH:MM
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Combinar fecha + hora en timestamp
    const fechaEvento = new Date(`${data.fecha}T${data.hora}:00`)
    if (isNaN(fechaEvento.getTime())) {
      return NextResponse.json({ error: 'Fecha u hora inválida.' }, { status: 400 })
    }

    const clave = generarClave()
    const baseSlug = `cumpleanos-${slugify(data.cumpleañeroNombre)}`
    const slug = `${baseSlug}-${randomSuffix()}`

    const precioGrill = data.lugar === 'VIP' ? 10000 : 0
    const nombreEvento = `🎂 Cumpleaños de ${data.cumpleañeroNombre}`
    const descripcion = `Evento privado · ${data.cumpleañeroNombre} cumple ${data.edad} años · ${data.cantidadInvitados} invitados esperados${precioGrill ? ' · Modalidad VIP $10.000' : ''}`

    // Crear el evento
    const [evento] = await db
      .insert(eventos)
      .values({
        nombre: nombreEvento,
        descripcion,
        fecha: fechaEvento,
        lugar: data.lugar,
        cuposTotal: data.cantidadInvitados,
        cuposDisponibles: data.cantidadInvitados,
        activo: true,
        destacado: false,
        slug,
        tipo: 'cumpleanos',
        clave,
        organizadorEmail: data.organizadorEmail.toLowerCase(),
        cumpleañeroNombre: data.cumpleañeroNombre,
        edadCumpleanos: data.edad,
      })
      .returning()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://living.entradasya.cl'
    const linkEvento = `${baseUrl}/${slug}`

    // Enviar email al organizador
    await enviarEmailOrganizadorCumpleanos({
      organizadorNombre: data.organizadorNombre,
      organizadorEmail:  data.organizadorEmail.toLowerCase(),
      cumpleañeroNombre: data.cumpleañeroNombre,
      edad:              data.edad,
      lugar:             data.lugar,
      fecha:             fechaEvento,
      cantidadInvitados: data.cantidadInvitados,
      clave,
      linkEvento,
      precio:            precioGrill,
    })

    return NextResponse.json({ ok: true, slug, linkEvento }, { status: 201 })

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos.', details: err.errors }, { status: 400 })
    }
    console.error('[POST /api/cumpleanos]', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
