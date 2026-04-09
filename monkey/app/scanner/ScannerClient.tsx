'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type ResultadoScan = {
  valido: boolean
  nombre?: string
  email?: string
  evento?: string
  lugar?: string
  razon?: string
  usadoEn?: string
} | null

type EstadoScanner = 'idle' | 'scanning' | 'validating' | 'result'

declare global {
  interface Window {
    jsQR: (
      data: Uint8ClampedArray,
      width: number,
      height: number
    ) => { data: string } | null
  }
}

export default function ScannerClient() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animRef = useRef<number>(0)
  const jsQRLoadedRef = useRef(false)

  const [estado, setEstado] = useState<EstadoScanner>('idle')
  const [resultado, setResultado] = useState<ResultadoScan>(null)
  const [error, setError] = useState('')
  const [scanCount, setScanCount] = useState(0)

  // Cargar jsQR desde CDN
  useEffect(() => {
    if (jsQRLoadedRef.current) return
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
    script.onload = () => { jsQRLoadedRef.current = true }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  const detenerCamara = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const escanear = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animRef.current = requestAnimationFrame(escanear)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    if (window.jsQR) {
      const code = window.jsQR(imageData.data, imageData.width, imageData.height)
      if (code?.data) {
        // Extraer token de la URL
        const match = code.data.match(/\/invitacion\/([a-f0-9-]{36})/i)
        if (match) {
          validarToken(match[1])
          return
        }
      }
    }

    animRef.current = requestAnimationFrame(escanear)
  }, [])

  async function iniciarCamara() {
    setError('')
    setEstado('scanning')
    setResultado(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      animRef.current = requestAnimationFrame(escanear)
    } catch {
      setEstado('idle')
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  async function validarToken(token: string) {
    detenerCamara()
    setEstado('validating')

    try {
      const res = await fetch('/api/scanner/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      setResultado(data)
      setScanCount((c) => c + 1)
    } catch {
      setResultado({ valido: false, razon: 'Error de conexión. Intenta de nuevo.' })
    }

    setEstado('result')
  }

  function resetear() {
    setResultado(null)
    setEstado('idle')
  }

  useEffect(() => () => detenerCamara(), [detenerCamara])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header scanner */}
      <div className="glass border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-10" style={{top: '64px'}}>
        <div>
          <p className="text-sm font-bold text-white">Modo Anfitrión</p>
          <p className="text-xs text-slate-500">{scanCount} escaneados hoy</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${estado === 'scanning' ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs text-slate-400 capitalize">
            {estado === 'idle' ? 'Listo' : estado === 'scanning' ? 'Escaneando' : estado === 'validating' ? 'Validando...' : 'Resultado'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">

        {/* IDLE */}
        {estado === 'idle' && (
          <div className="text-center max-w-sm animate-fade-in">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-purple-600 opacity-20 animate-pulse-slow" />
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                📷
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-3">Scanner QR</h1>
            <p className="text-slate-400 mb-8">
              Escanea el código QR del invitado para validar su acceso al evento.
            </p>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-3 text-sm mb-6">
                {error}
              </div>
            )}

            <button onClick={iniciarCamara} className="btn-primary w-full text-lg">
              Iniciar cámara
            </button>

            <p className="text-slate-600 text-xs mt-4">
              Asegúrate de tener buena iluminación
            </p>
          </div>
        )}

        {/* SCANNING */}
        {estado === 'scanning' && (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-square">
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Marco de escaneo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-56 h-56">
                  {/* Esquinas */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  {/* Línea animada */}
                  <div className="absolute inset-x-0 h-0.5 bg-primary/70 animate-bounce" style={{top: '50%'}} />
                </div>
              </div>

              {/* Overlay oscuro alrededor */}
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse 200px 200px at center, transparent 60%, rgba(0,0,0,0.7) 100%)'
              }} />
            </div>

            <p className="text-center text-slate-400 text-sm mt-4">
              Apunta al QR del invitado
            </p>

            <button
              onClick={() => { detenerCamara(); setEstado('idle') }}
              className="w-full mt-4 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* VALIDATING */}
        {estado === 'validating' && (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6">
              <svg className="animate-spin w-full h-full text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-slate-300 text-lg font-medium">Validando invitación...</p>
          </div>
        )}

        {/* RESULT */}
        {estado === 'result' && resultado && (
          <div className="w-full max-w-sm animate-slide-up">

            {resultado.valido ? (
              /* VÁLIDO */
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="bg-green-500/20 border-b border-green-500/20 p-6 text-center">
                  <div className="text-6xl mb-3">✅</div>
                  <h2 className="text-2xl font-black text-green-400">¡Acceso permitido!</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-slate-500 text-xs">Invitado</p>
                    <p className="text-white font-bold text-xl">{resultado.nombre}</p>
                    <p className="text-slate-400 text-sm">{resultado.email}</p>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div>
                    <p className="text-slate-500 text-xs">Evento</p>
                    <p className="text-slate-200 font-medium">{resultado.evento}</p>
                    {resultado.lugar && (
                      <p className="text-slate-400 text-sm">{resultado.lugar}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* INVÁLIDO */
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="bg-rose-500/20 border-b border-rose-500/20 p-6 text-center">
                  <div className="text-6xl mb-3">❌</div>
                  <h2 className="text-2xl font-black text-rose-400">Acceso denegado</h2>
                </div>
                <div className="p-6">
                  <p className="text-slate-300 text-center">{resultado.razon}</p>
                  {resultado.nombre && (
                    <>
                      <div className="h-px bg-white/5 my-4" />
                      <p className="text-slate-500 text-xs">Invitado</p>
                      <p className="text-slate-300">{resultado.nombre}</p>
                    </>
                  )}
                  {resultado.usadoEn && (
                    <p className="text-slate-500 text-xs mt-2">
                      Usado el {new Date(resultado.usadoEn).toLocaleString('es-CL')}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button onClick={resetear} className="btn-primary w-full mt-4 text-center">
              Escanear otro →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
