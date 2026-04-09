import type { Metadata } from 'next'
import ScannerClient from './ScannerClient'
import SwRegister from './SwRegister'

export const metadata: Metadata = {
  title: 'Scanner — Monkey | EntradasYa',
  description: 'Escáner de QR para anfitriones de eventos',
}

export default function ScannerPage() {
  return (
    <>
      <SwRegister />
      <ScannerClient />
    </>
  )
}
