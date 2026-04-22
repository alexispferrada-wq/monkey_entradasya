'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatbotTester() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '¡Hola! Soy **Mono** — Escríbeme algo para probar cómo respondo con la base de conocimiento actual.',
      }])
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setMessages([...newMessages, {
        role: 'assistant',
        content: `⚠️ Error: ${msg}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  function formatMessage(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  function resetChat() {
    setMessages([])
    setTimeout(() => {
      setMessages([{
        role: 'assistant',
        content: '✓ Chat reiniciado. Escríbeme algo para probar.',
      }])
    }, 50)
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }}>
            <img src="/living-logo.png" alt="Mono" className="w-7 h-7 object-contain" />
          </div>
          <div className="text-left">
            <div className="font-display text-primary tracking-wider uppercase text-sm">Probar chatbot</div>
            <div className="text-zinc-600 text-xs">Conversación de prueba en tiempo real</div>
          </div>
        </div>
        <span className="text-zinc-500 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="border-t border-white/5">
          {/* Messages */}
          <div className="h-80 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }}>
                    <img src="/living-logo.png" alt="Mono" className="w-5 h-5 object-contain" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'text-black rounded-br-sm' : 'text-zinc-200 rounded-bl-sm'
                  }`}
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #F5C200, #F97316)' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }}>
                  <img src="/living-logo.png" alt="Mono" className="w-5 h-5 object-contain" />
                </div>
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
              className="flex-1 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje de prueba..."
                disabled={loading}
                className="flex-1 bg-white/5 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40 transition-all disabled:opacity-50"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:scale-100 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
            <button
              onClick={resetChat}
              title="Reiniciar conversación"
              className="text-zinc-600 hover:text-zinc-400 text-xs px-2 py-2 rounded-lg hover:bg-white/5 transition-all flex-shrink-0"
            >
              ↺
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
