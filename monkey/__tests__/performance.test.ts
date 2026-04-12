/**
 * Performance benchmarks — verify that pure functions meet latency budgets.
 * These run in Jest (Node.js) and measure CPU time, not network time.
 *
 * Dashboard / page load SLAs (< 2s, < 500ms) are validated in Playwright
 * E2E tests that run against the actual server (see e2e/ directory).
 */

import { isDisposableEmail } from '@/lib/email-validation'
import { buildSystemPromptFromDocs } from '@/lib/chatbot/system-prompt'
import type { ChatbotDoc } from '@/lib/db/schema'

// ── Helper ─────────────────────────────────────────────────────────────────────
function bench(label: string, fn: () => void, iterations = 1000): number {
  // Warm up
  fn()
  const start = performance.now()
  for (let i = 0; i < iterations; i++) fn()
  const total = performance.now() - start
  const perOp = total / iterations
  console.log(`  [perf] ${label}: ${perOp.toFixed(4)}ms / op (${iterations} iterations)`)
  return perOp
}

// ── isDisposableEmail ──────────────────────────────────────────────────────────
describe('isDisposableEmail() performance', () => {
  it('Set.has() lookup completes in < 0.01ms per call', () => {
    const perOp = bench('isDisposableEmail(gmail)', () => {
      isDisposableEmail('user@gmail.com')
    })
    expect(perOp).toBeLessThan(0.01)
  })

  it('disposable domain detection completes in < 0.01ms per call', () => {
    const perOp = bench('isDisposableEmail(mailinator)', () => {
      isDisposableEmail('test@mailinator.com')
    })
    expect(perOp).toBeLessThan(0.01)
  })
})

// ── buildSystemPromptFromDocs ──────────────────────────────────────────────────
describe('buildSystemPromptFromDocs() performance', () => {
  function makeDocs(count: number): ChatbotDoc[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `id-${i}`,
      clave: `doc_${i}`,
      categoria: ['info', 'ambiente', 'horarios', 'faq', 'menu', 'reservas', 'template'][i % 7],
      titulo: `Documento de prueba ${i}`,
      contenido: `Contenido detallado del documento número ${i}. `.repeat(20),
      activo: true,
      orden: i,
      updatedAt: new Date(),
    }))
  }

  const EVENTS = Array.from({ length: 5 }, (_, i) => ({
    nombre: `Evento ${i + 1}`,
    fecha: new Date(Date.now() + i * 7 * 24 * 3600 * 1000),
    slug: `evento-${i + 1}`,
    cuposDisponibles: 50 - i * 10,
  }))

  it('builds prompt for 10 docs in < 5ms', () => {
    const docs = makeDocs(10)
    const start = performance.now()
    buildSystemPromptFromDocs(docs, EVENTS)
    const elapsed = performance.now() - start
    console.log(`  [perf] buildSystemPromptFromDocs(10 docs): ${elapsed.toFixed(2)}ms`)
    expect(elapsed).toBeLessThan(5)
  })

  it('builds prompt for 50 docs in < 20ms', () => {
    const docs = makeDocs(50)
    const start = performance.now()
    buildSystemPromptFromDocs(docs, EVENTS)
    const elapsed = performance.now() - start
    console.log(`  [perf] buildSystemPromptFromDocs(50 docs): ${elapsed.toFixed(2)}ms`)
    expect(elapsed).toBeLessThan(20)
  })

  it('builds prompt for 100 docs in < 50ms', () => {
    const docs = makeDocs(100)
    const start = performance.now()
    buildSystemPromptFromDocs(docs, EVENTS)
    const elapsed = performance.now() - start
    console.log(`  [perf] buildSystemPromptFromDocs(100 docs): ${elapsed.toFixed(2)}ms`)
    expect(elapsed).toBeLessThan(50)
  })

  it('handles empty docs array in < 1ms', () => {
    const start = performance.now()
    buildSystemPromptFromDocs([], [])
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(1)
  })
})

// ── Email validation throughput ────────────────────────────────────────────────
describe('Email validation throughput', () => {
  const SAMPLE_EMAILS = [
    'valid@gmail.com', 'test@mailinator.com', 'user@outlook.com',
    'me@yopmail.com', 'hi@empresa.cl', 'a@guerrillamail.com',
    'ok@hotmail.com', 'no@trashmail.com', 'yes@yahoo.com', 'no2@maildrop.cc',
  ]

  it('validates 10,000 emails in < 50ms', () => {
    const start = performance.now()
    for (let i = 0; i < 10000; i++) {
      isDisposableEmail(SAMPLE_EMAILS[i % SAMPLE_EMAILS.length])
    }
    const elapsed = performance.now() - start
    console.log(`  [perf] 10k email validations: ${elapsed.toFixed(2)}ms`)
    expect(elapsed).toBeLessThan(50)
  })
})
