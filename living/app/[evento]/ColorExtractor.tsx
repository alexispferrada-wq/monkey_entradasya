'use client'

import { useEffect } from 'react'

interface Props {
  imageUrl: string
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h, s, l }
}

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function darken(r: number, g: number, b: number, factor: number) {
  return {
    r: Math.round(r * factor),
    g: Math.round(g * factor),
    b: Math.round(b * factor),
  }
}

function extractVibrantColor(data: Uint8ClampedArray) {
  const candidates: { r: number; g: number; b: number; score: number }[] = []

  // Sample every 4th pixel for better coverage
  for (let i = 0; i < data.length; i += 4 * 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
    if (a < 128) continue // skip transparent

    const { s, l } = rgbToHsl(r, g, b)

    // Filtros amplios — posters de concierto tienen colores neon, brillantes o muy saturados
    // Excluir solo: casi blanco, casi negro, y completamente desaturado (gris)
    if (s < 0.12 || l < 0.08 || l > 0.95) continue

    // Score: premiar saturación alta + preferir colores medios-brillantes (no demasiado oscuros)
    // Ideal para posters: colores vibrants como magenta, cyan, amarillo, naranja
    const brightnessBonus = l > 0.35 ? 1.0 : 0.6 // penalizar los muy oscuros levemente
    const score = s * brightnessBonus * (1 - Math.abs(l - 0.55) * 0.8)
    candidates.push({ r, g, b, score })
  }

  // Si no hay candidatos con criterio estricto, intentar más laxo (imagen monocromática)
  if (candidates.length < 10) {
    for (let i = 0; i < data.length; i += 4 * 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
      if (a < 128) continue
      const { s, l } = rgbToHsl(r, g, b)
      if (s < 0.05 || l < 0.05 || l > 0.97) continue
      candidates.push({ r, g, b, score: s })
    }
  }

  if (candidates.length === 0) return null

  candidates.sort((a, b) => b.score - a.score)
  // Tomar el top 20% más vibrante y promediar
  const top = candidates.slice(0, Math.max(1, Math.floor(candidates.length * 0.2)))

  const r = Math.round(top.reduce((s, p) => s + p.r, 0) / top.length)
  const g = Math.round(top.reduce((s, p) => s + p.g, 0) / top.length)
  const b = Math.round(top.reduce((s, p) => s + p.b, 0) / top.length)

  return { r, g, b }
}

export default function ColorExtractor({ imageUrl }: Props) {
  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        // Use small size for performance — colors don't need full res
        canvas.width = 80
        canvas.height = 80
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0, 80, 80)
        const { data } = ctx.getImageData(0, 0, 80, 80)
        const color = extractVibrantColor(data)

        if (!color) {
          console.log('[ColorExtractor] No se encontró color vibrante en la imagen')
          return
        }

        const { r, g, b } = color
        console.log(`[ColorExtractor] Color extraído: rgb(${r},${g},${b})`)
        const dark = darken(r, g, b, 0.25)
        const mid = darken(r, g, b, 0.55)
        const lum = luminance(r, g, b)
        const textOnColor = lum > 140 ? '0,0,0' : '255,255,255'

        const root = document.documentElement
        root.style.setProperty('--evt-r', String(r))
        root.style.setProperty('--evt-g', String(g))
        root.style.setProperty('--evt-b', String(b))
        root.style.setProperty('--evt-color', `rgb(${r},${g},${b})`)
        root.style.setProperty('--evt-color-mid', `rgb(${mid.r},${mid.g},${mid.b})`)
        root.style.setProperty('--evt-color-dark', `rgb(${dark.r},${dark.g},${dark.b})`)
        root.style.setProperty('--evt-text', `rgb(${textOnColor})`)
      } catch {
        // Canvas cross-origin blocked — keep defaults
      }
    }

    // Use Cloudinary fl_progressive for faster color extraction
    const url = imageUrl.includes('cloudinary.com')
      ? imageUrl.replace('/upload/', '/upload/w_200,q_30/')
      : imageUrl
    img.src = url
  }, [imageUrl])

  return null
}
