import QRCode from 'qrcode'
import { uploadQR } from './cloudinary'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://living.entradasya.cl'

export async function generateQR(token: string): Promise<{ url: string; publicId: string }> {
  const link = `${BASE_URL}/entrada/${token}`
  const base64 = await QRCode.toDataURL(link, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })
  return uploadQR(base64, `ticket-${token}`)
}
