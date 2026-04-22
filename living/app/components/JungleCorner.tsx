import React from 'react'

/**
 * JungleCorner — Decoración de hojas tropicales para esquinas
 * Elemento decorativo vegetal para Living Club
 *
 * Props:
 *  flip   → espeja horizontalmente (para esquinas derechas)
 *  invert → espeja verticalmente (para esquinas inferiores)
 */

interface Props {
  flip?: boolean
  invert?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function JungleCorner({ flip = false, invert = false, className = '', style }: Props) {
  let gTransform = ''
  if (flip && invert) gTransform = 'translate(300,300) scale(-1,-1)'
  else if (flip)      gTransform = 'translate(300,0) scale(-1,1)'
  else if (invert)    gTransform = 'translate(0,300) scale(1,-1)'

  return (
    <svg
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      <g transform={gTransform || undefined}>

        {/* ── CAPA TRASERA: hojas grandes y oscuras ── */}

        {/* Palma larga, ángulo bajo ~8° */}
        <path fill="#050e08"
          d="M0,0 C55,-12 145,-4 210,20 C238,32 245,48 238,58
             C195,65 95,30 0,0Z" />

        {/* Palma diagonal ~35° */}
        <path fill="#060f09"
          d="M0,0 C35,-2 95,32 142,72 C162,88 168,108 160,118
             C120,124 60,75 0,0Z" />

        {/* Palma empinada ~68° */}
        <path fill="#050d08"
          d="M0,0 C10,32 28,90 28,150 C28,178 20,196 10,198
             C-2,182 -6,115 0,0Z" />

        {/* Hoja ancha de fondo, muy baja */}
        <path fill="#040c07"
          d="M0,0 C30,-6 80,2 125,18 C148,26 155,38 150,46
             C112,52 45,22 0,0Z" />

        {/* ── CAPA MEDIA ── */}

        {/* Palma media, ángulo bajo */}
        <path fill="#0b2913"
          d="M0,0 C45,-8 118,4 172,26 C196,36 200,52 193,62
             C152,68 72,34 0,0Z" />

        {/* Palma media, diagonal */}
        <path fill="#0d3016"
          d="M0,0 C25,18 65,58 98,100 C115,124 118,146 110,156
             C88,162 48,118 0,0Z" />

        {/* Palma media, empinada */}
        <path fill="#0a2812"
          d="M0,0 C8,35 20,92 18,152 C17,178 10,194 4,195
             C-6,180 -8,112 0,0Z" />

        {/* Hoja monstera, forma redondeada */}
        <path fill="#0f3519"
          d="M0,0 C18,12 48,38 70,68 C84,86 86,104 78,112
             C58,112 28,72 0,0Z" />

        {/* ── CAPA FRONTAL: más brillante, más definida ── */}

        {/* Palma frontal, ángulo bajo — la más visible */}
        <path fill="#164821"
          d="M0,0 C38,-6 100,6 150,24 C172,34 176,48 170,58
             C130,64 62,30 0,0Z" />

        {/* Palma frontal, diagonal */}
        <path fill="#1a5226"
          d="M0,0 C20,16 55,52 84,92 C100,114 102,136 94,144
             C74,150 36,108 0,0Z" />

        {/* Palma frontal, empinada */}
        <path fill="#164a20"
          d="M0,0 C6,28 16,75 14,124 C13,148 7,162 2,163
             C-8,150 -8,90 0,0Z" />

        {/* Hoja pequeña de acento */}
        <path fill="#1c5a28"
          d="M0,0 C14,4 32,12 44,24 C50,30 50,38 44,42
             C32,42 12,22 0,0Z" />

        {/* Hoja muy baja, accent */}
        <path fill="#185025"
          d="M0,0 C22,2 55,8 80,18 C92,24 94,32 90,38
             C68,40 28,16 0,0Z" />

        {/* ── VENAS/NERVIOS: detalles de luz sobre las hojas ── */}

        {/* Nervio palma frontal baja */}
        <path stroke="#228036" strokeWidth="1.2" fill="none" strokeLinecap="round"
          d="M0,0 C38,-4 100,8 150,24 C172,34 174,52 170,58" />

        {/* Nervio palma frontal diagonal */}
        <path stroke="#228036" strokeWidth="1.2" fill="none" strokeLinecap="round"
          d="M0,0 C20,16 56,54 86,96 C100,116 102,138 94,144" />

        {/* Nervio palma frontal empinada */}
        <path stroke="#1d7030" strokeWidth="1" fill="none" strokeLinecap="round"
          d="M0,0 C6,28 16,75 14,124 C13,148 7,162 2,163" />

        {/* Nervio hoja monstera */}
        <path stroke="#1e7032" strokeWidth="1" fill="none" strokeLinecap="round"
          d="M0,0 C18,12 48,40 72,72 C84,88 86,106 78,112" />

        {/* ── PUNTOS DE BRILLO: pequeños reflejos de luz ── */}
        <ellipse cx="125" cy="22" rx="8" ry="3" fill="#22833a" opacity="0.5"
          transform="rotate(-8,125,22)" />
        <ellipse cx="75" cy="88" rx="6" ry="2.5" fill="none" stroke="#1e7030"
          strokeWidth="0.8" transform="rotate(35,75,88)" opacity="0.6" />

      </g>
    </svg>
  )
}
