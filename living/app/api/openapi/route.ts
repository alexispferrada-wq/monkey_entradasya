import { NextResponse } from 'next/server'

/**
 * GET /api/openapi
 * Returns the OpenAPI 3.0 specification for all Living Club API endpoints.
 * Consume with Swagger UI, Insomnia, Postman, or any OpenAPI-compatible tool.
 */
export async function GET() {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Living Club API',
      version: '1.0.0',
      description: 'API para gestión de eventos, invitaciones, socios y chatbot de Living Club.',
      contact: { email: 'admin@entradasya.cl' },
    },
    servers: [
      { url: process.env.NEXT_PUBLIC_BASE_URL || 'https://living.entradasya.cl', description: 'Producción' },
      { url: 'http://localhost:3000', description: 'Desarrollo local' },
    ],
    tags: [
      { name: 'auth',       description: 'Autenticación del panel admin' },
      { name: 'public',     description: 'Endpoints públicos sin autenticación' },
      { name: 'admin',      description: 'Endpoints del panel admin (requieren cookie admin_token)' },
      { name: 'scanner',    description: 'Validación de QR en acceso al evento' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'admin_token',
          description: 'JWT de sesión admin emitido por POST /api/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Descripción del error' },
          },
        },
        StructuredError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code:    { type: 'string', example: 'NOT_FOUND' },
                message: { type: 'string', example: 'Recurso no encontrado' },
                details: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
              },
            },
          },
        },
        Evento: {
          type: 'object',
          properties: {
            id:               { type: 'string', format: 'uuid' },
            nombre:           { type: 'string' },
            descripcion:      { type: 'string', nullable: true },
            fecha:            { type: 'string', format: 'date-time' },
            lugar:            { type: 'string' },
            imagenUrl:        { type: 'string', nullable: true },
            imagenPublicId:   { type: 'string', nullable: true },
            cuposTotal:       { type: 'integer' },
            cuposDisponibles: { type: 'integer' },
            activo:           { type: 'boolean' },
            slug:             { type: 'string' },
            deletedAt:        { type: 'string', format: 'date-time', nullable: true },
            createdAt:        { type: 'string', format: 'date-time' },
          },
        },
        Invitacion: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            eventoId:    { type: 'string', format: 'uuid' },
            nombre:      { type: 'string' },
            email:       { type: 'string', format: 'email' },
            token:       { type: 'string', format: 'uuid' },
            estado:      { type: 'string', enum: ['pendiente', 'enviada', 'usada', 'cancelada'] },
            qrImageUrl:  { type: 'string', nullable: true },
            createdAt:   { type: 'string', format: 'date-time' },
            usedAt:      { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Socio: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            nombre:    { type: 'string' },
            email:     { type: 'string', format: 'email' },
            telefono:  { type: 'string', nullable: true },
            puntos:    { type: 'integer' },
            nivel:     { type: 'string', enum: ['bronze', 'silver', 'gold', 'vip'] },
            activo:    { type: 'boolean' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ChatbotDoc: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            clave:     { type: 'string', example: 'ambiente_lounge' },
            categoria: { type: 'string', enum: ['ambiente', 'template', 'horarios', 'info', 'faq', 'menu', 'reservas'] },
            titulo:    { type: 'string' },
            contenido: { type: 'string' },
            activo:    { type: 'boolean' },
            orden:     { type: 'integer' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      // ── AUTH ─────────────────────────────────────────────────────────────────
      '/api/auth/login': {
        post: {
          tags: ['auth'],
          summary: 'Iniciar sesión en el panel admin',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['usuario', 'password'],
                  properties: {
                    usuario:  { type: 'string', example: 'admin' },
                    password: { type: 'string', format: 'password' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login exitoso — sets admin_token (15m) + admin_refresh_token (7d) httpOnly cookies',
              content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' } } } } },
            },
            '401': { description: 'Credenciales incorrectas' },
            '429': { description: 'Demasiados intentos — rate limited (3/min)' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['auth'],
          summary: 'Cerrar sesión — borra ambas cookies',
          responses: {
            '200': { description: 'Logout exitoso' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['auth'],
          summary: 'Renovar access token usando el refresh token cookie',
          responses: {
            '200': { description: 'Nuevo admin_token cookie emitido (15m)' },
            '401': { description: 'Refresh token inválido, expirado, o UA fingerprint diferente' },
          },
        },
      },

      // ── PUBLIC ───────────────────────────────────────────────────────────────
      '/api/invitaciones': {
        post: {
          tags: ['public'],
          summary: 'Solicitar invitación a un evento',
          description: 'Genera QR, sube a Cloudinary, envía email con invitación. Rate limited: 5/min por IP.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['eventoId', 'nombre', 'email'],
                  properties: {
                    eventoId: { type: 'string', format: 'uuid' },
                    nombre:   { type: 'string', minLength: 2, maxLength: 100 },
                    email:    { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Invitación creada y email enviado', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, token: { type: 'string', format: 'uuid' } } } } } },
            '400': { description: 'Datos inválidos o correo descartable' },
            '404': { description: 'Evento no encontrado o inactivo' },
            '409': { description: 'Sin cupos o email ya registrado para este evento' },
          },
        },
      },
      '/api/socios': {
        post: {
          tags: ['public'],
          summary: 'Registrar nuevo socio del Club Living',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre', 'email'],
                  properties: {
                    nombre:   { type: 'string', minLength: 2, maxLength: 100 },
                    email:    { type: 'string', format: 'email' },
                    telefono: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Socio registrado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Socio' } } } },
            '400': { description: 'Datos inválidos o correo descartable' },
            '409': { description: 'Email ya registrado' },
          },
        },
      },
      '/api/chat': {
        post: {
          tags: ['public'],
          summary: 'Chat con el asistente virtual de Living Club',
          description: 'Envía historial de mensajes al LLM (Groq llama-3.3-70b). Puede crear reservas vía tool calling. Rate limited: 10/min por IP.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['messages'],
                  properties: {
                    messages: {
                      type: 'array',
                      maxItems: 20,
                      items: {
                        type: 'object',
                        required: ['role', 'content'],
                        properties: {
                          role:    { type: 'string', enum: ['user', 'assistant'] },
                          content: { type: 'string', maxLength: 500 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Respuesta del asistente', content: { 'application/json': { schema: { type: 'object', properties: { reply: { type: 'string' } } } } } },
            '400': { description: 'Mensajes inválidos' },
            '429': { description: 'Rate limited (10/min)' },
          },
        },
      },

      // ── SCANNER ──────────────────────────────────────────────────────────────
      '/api/scanner/validate': {
        post: {
          tags: ['scanner'],
          summary: 'Validar y marcar como usada una invitación por su token QR',
          description: 'Rate limited: 10/min por IP.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['token'], properties: { token: { type: 'string', format: 'uuid' } } },
              },
            },
          },
          responses: {
            '200': { description: 'Invitación válida y marcada como usada', content: { 'application/json': { schema: { type: 'object', properties: { valido: { type: 'boolean' }, nombre: { type: 'string' }, email: { type: 'string' }, evento: { type: 'string' }, lugar: { type: 'string' } } } } } },
            '404': { description: 'Token no encontrado' },
            '409': { description: 'Invitación ya usada o cancelada' },
          },
        },
      },

      // ── ADMIN — EVENTOS ──────────────────────────────────────────────────────
      '/api/admin/eventos': {
        get: {
          tags: ['admin'],
          summary: 'Listar todos los eventos (sin soft-deleted)',
          security: [{ cookieAuth: [] }],
          responses: {
            '200': { description: 'Lista de eventos', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Evento' } } } } },
          },
        },
        post: {
          tags: ['admin'],
          summary: 'Crear nuevo evento',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre', 'fecha', 'lugar', 'slug'],
                  properties: {
                    nombre:      { type: 'string' },
                    descripcion: { type: 'string' },
                    fecha:       { type: 'string', format: 'date-time' },
                    lugar:       { type: 'string' },
                    cuposTotal:  { type: 'integer', minimum: 1 },
                    slug:        { type: 'string', pattern: '^[a-z0-9-]+$' },
                    activo:      { type: 'boolean' },
                    imagenUrl:   { type: 'string', format: 'uri' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Evento creado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Evento' } } } },
            '409': { description: 'Slug duplicado' },
          },
        },
      },
      '/api/admin/eventos/{id}': {
        get: {
          tags: ['admin'],
          summary: 'Obtener evento por ID (incluye stats de invitaciones)',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Evento con totalInvitaciones y usadas' },
            '404': { description: 'No encontrado' },
          },
        },
        put: {
          tags: ['admin'],
          summary: 'Actualizar evento',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Evento actualizado' }, '400': { description: 'Validación fallida' } },
        },
        delete: {
          tags: ['admin'],
          summary: 'Soft-delete evento (deletedAt = now, activo = false)',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/admin/eventos/{id}/invitaciones': {
        get: {
          tags: ['admin'],
          summary: 'Listar invitaciones de un evento',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Lista de invitaciones (max 1000)', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Invitacion' } } } } } },
        },
      },

      // ── ADMIN — SOCIOS ───────────────────────────────────────────────────────
      '/api/admin/socios': {
        get: {
          tags: ['admin'],
          summary: 'Listar socios activos (max 500, ordenados por puntos desc)',
          security: [{ cookieAuth: [] }],
          responses: { '200': { description: 'Lista de socios', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Socio' } } } } } },
        },
      },
      '/api/admin/socios/{id}/puntos': {
        post: {
          tags: ['admin'],
          summary: 'Sumar o restar puntos a un socio',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['puntos', 'motivo'],
                  properties: {
                    puntos: { type: 'integer', not: { const: 0 }, description: 'Positivo para sumar, negativo para restar' },
                    motivo: { type: 'string', minLength: 2, maxLength: 200 },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Socio actualizado con nuevos puntos y nivel', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Socio' } } } },
            '404': { description: 'Socio no encontrado' },
          },
        },
      },

      // ── ADMIN — CHATBOT ──────────────────────────────────────────────────────
      '/api/admin/chatbot': {
        get: {
          tags: ['admin'],
          summary: 'Listar documentos de conocimiento del chatbot',
          security: [{ cookieAuth: [] }],
          responses: { '200': { description: 'Lista ordenada por orden + categoria', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/ChatbotDoc' } } } } } },
        },
        post: {
          tags: ['admin'],
          summary: 'Crear documento de conocimiento',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['clave', 'categoria', 'titulo', 'contenido'],
                  properties: {
                    clave:     { type: 'string', pattern: '^[a-z0-9_]+$', minLength: 2, maxLength: 100 },
                    categoria: { type: 'string', enum: ['ambiente', 'template', 'horarios', 'info', 'faq', 'menu', 'reservas'] },
                    titulo:    { type: 'string', minLength: 2, maxLength: 200 },
                    contenido: { type: 'string', minLength: 10, maxLength: 10000 },
                    orden:     { type: 'integer', minimum: 0, maximum: 9999 },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Documento creado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ChatbotDoc' } } } },
            '400': { description: 'Validación fallida' },
          },
        },
      },
      '/api/admin/chatbot/{id}': {
        put: {
          tags: ['admin'],
          summary: 'Actualizar documento de conocimiento (todos los campos opcionales)',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Documento actualizado' }, '404': { description: 'No encontrado' } },
        },
        delete: {
          tags: ['admin'],
          summary: 'Eliminar documento de conocimiento',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
      },

      // ── ADMIN — UPLOAD ───────────────────────────────────────────────────────
      '/api/admin/upload': {
        post: {
          tags: ['admin'],
          summary: 'Subir imagen a Cloudinary (max 10 MB, solo JPEG/PNG/WebP/GIF)',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } },
              },
            },
          },
          responses: {
            '200': {
              description: 'Imagen subida',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      url:       { type: 'string', format: 'uri' },
                      publicId:  { type: 'string' },
                      width:     { type: 'integer' },
                      height:    { type: 'integer' },
                      format:    { type: 'string' },
                      bytes:     { type: 'integer' },
                    },
                  },
                },
              },
            },
            '400': { description: 'Tipo no permitido o archivo supera 10 MB' },
          },
        },
      },
    },
  }

  return NextResponse.json(spec, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
