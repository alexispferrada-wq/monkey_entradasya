'use client'

import { useEffect } from 'react'

export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] Registrado:', reg.scope))
        .catch((err) => console.warn('[SW] Error:', err))
    }
  }, [])

  return null
}
