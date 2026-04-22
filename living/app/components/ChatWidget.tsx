'use client'

import { useState, useRef, useEffect } from 'react'
import { RESTAURANT_INFO } from '@/lib/chatbot/knowledge'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { label: '🍹 Ver menú', text: '¿Cuál es el menú?' },
  { label: '📅 Registro evento', text: 'Quiero registrarme a un evento' },
  { label: '🎟️ Eventos', text: '¿Qué eventos tienen próximamente?' },
  { label: '📍 Ubicación evento', text: '¿Dónde será el próximo evento?' },
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && !started) {
      setStarted(true)
      setMessages([{
        role: 'assistant',
        content: '¡Hola! Soy el asistente de **Living Club**.\n\n¿En qué puedo ayudarte hoy? Puedo contarte sobre el menú, eventos, reservas o lo que necesites.',
      }])
    }
  }, [open, started])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Ups, hubo un error. Para consultas urgentes, puedes escribirnos directamente por WhatsApp 👇',
      }])
    } finally {
      setLoading(false)
    }
  }

  function formatMessage(content: string) {
    // Basic markdown: bold, line breaks
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  const whatsappUrl = `https://wa.me/${RESTAURANT_INFO.whatsapp.replace(/\D/g, '')}`

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${open ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)', boxShadow: '0 0 30px rgba(245,194,0,0.4)' }}
        aria-label="Abrir chat"
      >
        <img src="https://res.cloudinary.com/dqsz4ua73/image/upload/q_auto/f_auto/v1776784565/Gemini_Generated_Image_7qzuv17qzuv17qzu_1_xhsqy0.png" alt="Living Club" className="w-9 h-9 object-contain" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }} />
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
        style={{
          width: 'min(400px, 100vw)',
          height: 'min(620px, 100dvh)',
          borderRadius: 'clamp(0px, 4vw, 20px) clamp(0px, 4vw, 20px) 0 0',
        }}
      >
        <div className="flex flex-col h-full rounded-t-2xl sm:rounded-2xl sm:mb-6 sm:mr-6 overflow-hidden"
          style={{ background: '#0a0a0a', border: '1px solid rgba(245,194,0,0.2)', boxShadow: '0 -4px 60px rgba(0,0,0,0.8)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
            style={{ background: '#0d0d0d', borderColor: 'rgba(245,194,0,0.15)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }}>
              <img src="https://res.cloudinary.com/dqsz4ua73/image/upload/q_auto/f_auto/v1776784565/Gemini_Generated_Image_7qzuv17qzuv17qzu_1_xhsqy0.png" alt="Living Club" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-sm text-primary tracking-wider uppercase">Living Club</div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Asistente de Living Club
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-zinc-500 hover:text-green-400 transition-colors flex items-center gap-1"
                title="Hablar con un humano"
              >
                <span>💬</span>
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }}>
                    <img src="https://res.cloudinary.com/dqsz4ua73/image/upload/q_auto/f_auto/v1776784565/Gemini_Generated_Image_7qzuv17qzuv17qzu_1_xhsqy0.png" alt="Living Club" className="w-5 h-5 object-contain" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-black rounded-br-sm'
                      : 'text-zinc-200 rounded-bl-sm'
                  }`}
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #F5C200, #F97316)' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }}>
                  <img src="https://res.cloudinary.com/dqsz4ua73/image/upload/q_auto/f_auto/v1776784565/Gemini_Generated_Image_7qzuv17qzuv17qzu_1_xhsqy0.png" alt="Living Club" className="w-5 h-5 object-contain" />
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

          {/* Quick actions — only show at start */}
          {messages.length <= 1 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.text}
                  onClick={() => sendMessage(action.text)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                  style={{ background: 'rgba(245,194,0,0.1)', border: '1px solid rgba(245,194,0,0.25)', color: '#d4a800' }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t flex-shrink-0"
            style={{ borderColor: 'rgba(245,194,0,0.1)', background: '#0d0d0d' }}>
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu consulta..."
                disabled={loading}
                className="flex-1 bg-white/5 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 transition-all disabled:opacity-50"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:scale-100 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #F5C200, #F97316)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>

            {/* Human escalation link */}
            <div className="mt-2 text-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-zinc-600 hover:text-green-400 transition-colors"
              >
                💬 Hablar con una persona real →
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
