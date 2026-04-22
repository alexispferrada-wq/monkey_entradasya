import type { Metadata } from 'next'
import ScannerGate from './ScannerGate'
import SwRegister from './SwRegister'

export const metadata: Metadata = {
  title: 'Scanner — Living Club | EntradasYa',
  description: 'Escáner de QR para anfitriones de eventos',
}

export default function ScannerPage() {
  return (
    <>
      <SwRegister />
      <ScannerGate />
    </>
  )
}
