export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
const MAX_IMAGE_SIDE = 2048

export type UploadCheck = 'ok' | 'not-image' | 'too-large'

export function validateImageFile(file: { type: string; size: number }): UploadCheck {
  if (!file.type.startsWith('image/')) return 'not-image'
  if (file.size > MAX_UPLOAD_BYTES) return 'too-large'
  return 'ok'
}

export interface PreparedImage {
  /** Object URL; revoke it when the image is no longer needed. */
  url: string
  aspect: number
}

/**
 * Decodes and re-encodes the upload, capped at MAX_IMAGE_SIDE. Re-encoding also applies EXIF
 * orientation and drops metadata such as GPS location. Nothing leaves the device.
 */
export async function prepareUploadedImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#fff' // JPEG has no alpha: transparent PNGs would turn black
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Image encoding failed'))), 'image/jpeg', 0.9),
    )
    return { url: URL.createObjectURL(blob), aspect: canvas.width / canvas.height }
  } finally {
    bitmap.close()
  }
}
