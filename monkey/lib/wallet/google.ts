import { GoogleAuth } from 'google-auth-library'
import type { Socio } from '@/lib/db/schema'

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID!
const CLASS_SUFFIX = 'club_monkey'
const CLASS_ID = `${ISSUER_ID}.${CLASS_SUFFIX}`

// Niveles y sus colores/labels
export const NIVELES = {
  bronze: { label: 'Bronze', color: '#CD7F32', puntosMin: 0, puntosMax: 499 },
  silver: { label: 'Silver', color: '#C0C0C0', puntosMin: 500, puntosMax: 1499 },
  gold:   { label: 'Gold',   color: '#F5C200', puntosMin: 1500, puntosMax: 2999 },
  vip:    { label: 'VIP',    color: '#F5C200', puntosMin: 3000, puntosMax: Infinity },
} as const

export function calcularNivel(puntos: number): 'bronze' | 'silver' | 'gold' | 'vip' {
  if (puntos >= 3000) return 'vip'
  if (puntos >= 1500) return 'gold'
  if (puntos >= 500) return 'silver'
  return 'bronze'
}

function getAuth() {
  const credentialsB64 = process.env.GOOGLE_WALLET_CREDENTIALS_BASE64
  if (!credentialsB64) throw new Error('GOOGLE_WALLET_CREDENTIALS_BASE64 no configurado')
  const credentials = JSON.parse(Buffer.from(credentialsB64, 'base64').toString('utf-8'))
  return new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  })
}

async function getClient() {
  return getAuth().getClient()
}

// Definición de la clase de lealtad (template compartido para todos los socios)
function buildLoyaltyClass() {
  return {
    id: CLASS_ID,
    issuerName: 'Monkey Restobar',
    programName: 'Club Monkey',
    programLogo: {
      sourceUri: { uri: 'https://res.cloudinary.com/dqsz4ua73/image/upload/v1/entradasya/monkey-logo' },
      contentDescription: { defaultValue: { language: 'es', value: 'Logo Monkey Restobar' } },
    },
    rewardsTier: 'MIEMBRO',
    rewardsTierLabel: 'Nivel',
    loyaltyPoints: {
      label: 'Puntos',
      balance: { string: '0' },
    },
    hexBackgroundColor: '#050505',
    heroImage: {
      sourceUri: { uri: 'https://res.cloudinary.com/dqsz4ua73/image/upload/v1/entradasya/monkey-hero' },
      contentDescription: { defaultValue: { language: 'es', value: 'Monkey Restobar' } },
    },
    reviewStatus: 'UNDER_REVIEW',
  }
}

// Crea o actualiza la clase de lealtad en Google Wallet
export async function ensureLoyaltyClass() {
  const client = await getClient()
  const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1'

  try {
    await (client as any).request({ url: `${baseUrl}/loyaltyClass/${CLASS_ID}`, method: 'GET' })
    // Ya existe, actualizar
    await (client as any).request({
      url: `${baseUrl}/loyaltyClass/${CLASS_ID}`,
      method: 'PUT',
      data: buildLoyaltyClass(),
    })
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // No existe, crear
      await (client as any).request({
        url: `${baseUrl}/loyaltyClass`,
        method: 'POST',
        data: buildLoyaltyClass(),
      })
    } else {
      throw err
    }
  }
}

// Construye el objeto de lealtad para un socio específico
function buildLoyaltyObject(socio: Socio) {
  const nivel = NIVELES[socio.nivel]
  const objectId = `${ISSUER_ID}.socio_${socio.id.replace(/-/g, '_')}`

  return {
    id: objectId,
    classId: CLASS_ID,
    state: socio.activo ? 'ACTIVE' : 'INACTIVE',
    loyaltyPoints: {
      label: 'Puntos',
      balance: { string: String(socio.puntos) },
    },
    secondaryLoyaltyPoints: {
      label: 'Nivel',
      balance: { string: nivel.label },
    },
    barcode: {
      type: 'QR_CODE',
      value: `monkey-club:${socio.id}`,
      alternateText: socio.email,
    },
    cardTitle: { defaultValue: { language: 'es', value: 'Club Monkey' } },
    header: { defaultValue: { language: 'es', value: socio.nombre } },
    subheader: { defaultValue: { language: 'es', value: `${nivel.label} Member` } },
    hexBackgroundColor: '#050505',
    textModulesData: [
      {
        id: 'nivel',
        header: 'Nivel',
        body: nivel.label,
      },
      {
        id: 'puntos',
        header: 'Puntos acumulados',
        body: String(socio.puntos),
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://monkey.entradasya.cl'}/club`,
          description: 'Mi cuenta Club Monkey',
          id: 'club_link',
        },
      ],
    },
  }
}

// Crea el objeto de lealtad en Google Wallet y retorna el objectId
export async function crearPaseSocio(socio: Socio): Promise<string> {
  const client = await getClient()
  const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1'
  const objectId = `${ISSUER_ID}.socio_${socio.id.replace(/-/g, '_')}`
  const loyaltyObject = buildLoyaltyObject(socio)

  try {
    await (client as any).request({ url: `${baseUrl}/loyaltyObject/${objectId}`, method: 'GET' })
    // Ya existe, actualizar
    await (client as any).request({
      url: `${baseUrl}/loyaltyObject/${objectId}`,
      method: 'PUT',
      data: loyaltyObject,
    })
  } catch (err: any) {
    if (err?.response?.status === 404) {
      await (client as any).request({
        url: `${baseUrl}/loyaltyObject`,
        method: 'POST',
        data: loyaltyObject,
      })
    } else {
      throw err
    }
  }

  return objectId
}

// Actualiza puntos y nivel en Google Wallet (llamar después de sumar puntos)
export async function actualizarPuntosWallet(socio: Socio) {
  if (!socio.googlePassObjectId) return
  const client = await getClient()
  const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1'
  const nivel = NIVELES[socio.nivel]

  await (client as any).request({
    url: `${baseUrl}/loyaltyObject/${socio.googlePassObjectId}`,
    method: 'PATCH',
    data: {
      loyaltyPoints: { label: 'Puntos', balance: { string: String(socio.puntos) } },
      secondaryLoyaltyPoints: { label: 'Nivel', balance: { string: nivel.label } },
      textModulesData: [
        { id: 'nivel', header: 'Nivel', body: nivel.label },
        { id: 'puntos', header: 'Puntos acumulados', body: String(socio.puntos) },
      ],
    },
  })
}

// Genera el JWT firmado para el link "Add to Google Wallet"
export async function generarLinkWallet(socio: Socio): Promise<string> {
  const credentialsB64 = process.env.GOOGLE_WALLET_CREDENTIALS_BASE64
  if (!credentialsB64) throw new Error('GOOGLE_WALLET_CREDENTIALS_BASE64 no configurado')
  const credentials = JSON.parse(Buffer.from(credentialsB64, 'base64').toString('utf-8'))

  const objectId = `${ISSUER_ID}.socio_${socio.id.replace(/-/g, '_')}`

  const payload = {
    iss: credentials.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [process.env.NEXT_PUBLIC_BASE_URL || 'https://monkey.entradasya.cl'],
    payload: {
      loyaltyObjects: [{ id: objectId }],
    },
  }

  // Firmar con la private key del service account
  const { default: jwt } = await import('jsonwebtoken')
  const token = jwt.sign(payload, credentials.private_key, { algorithm: 'RS256' })
  return `https://pay.google.com/gp/v/save/${token}`
}
