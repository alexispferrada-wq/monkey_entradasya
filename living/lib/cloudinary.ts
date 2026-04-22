import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function uploadQR(
  base64Data: string,
  publicId: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(base64Data, {
    public_id: publicId,
    folder: 'entradasya/qr',
    overwrite: true,
    resource_type: 'image',
    transformation: [{ width: 400, height: 400, crop: 'pad', background: 'white' }],
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export async function uploadEventImage(
  filePath: string,
  publicId: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    folder: 'entradasya/eventos',
    overwrite: true,
    transformation: [{ width: 1200, height: 630, crop: 'fill', gravity: 'auto' }],
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export { cloudinary }
