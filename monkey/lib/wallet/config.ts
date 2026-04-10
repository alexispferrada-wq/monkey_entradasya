// Constantes puras — importable desde client y server components

export const NIVELES = {
  bronze: { label: 'Bronze', color: '#CD7F32', puntosMin: 0,    puntosMax: 499 },
  silver: { label: 'Silver', color: '#C0C0C0', puntosMin: 500,  puntosMax: 1499 },
  gold:   { label: 'Gold',   color: '#F5C200', puntosMin: 1500, puntosMax: 2999 },
  vip:    { label: 'VIP',    color: '#F5C200', puntosMin: 3000, puntosMax: Infinity },
} as const

export type NivelKey = keyof typeof NIVELES

export function calcularNivel(puntos: number): NivelKey {
  if (puntos >= 3000) return 'vip'
  if (puntos >= 1500) return 'gold'
  if (puntos >= 500)  return 'silver'
  return 'bronze'
}
