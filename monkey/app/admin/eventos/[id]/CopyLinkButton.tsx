'use client'

interface Props {
  scanUrl: string
}

export default function CopyLinkButton({ scanUrl }: Props) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={scanUrl}
        readOnly
        className="text-sm px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-slate-300 w-64"
      />
      <button
        onClick={() => {
          navigator.clipboard.writeText(scanUrl)
          alert('Link copiado')
        }}
        className="text-sm px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:border-primary/50 hover:text-white transition-all"
      >
        Copiar
      </button>
    </div>
  )
}
