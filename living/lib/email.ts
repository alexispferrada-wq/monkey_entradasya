import { Resend } from 'resend'
import type { Evento, Invitacion, Reserva } from './db/schema'

export async function enviarEmailOrganizadorCumpleanos(data: {
  organizadorNombre: string
  organizadorEmail: string
  cumpleañeroNombre: string
  edad: number
  lugar: string
  fecha: Date
  cantidadInvitados: number
  clave: string
  linkEvento: string
  precio: number
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const fechaStr = new Date(data.fecha).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  await resend.emails.send({
    from: 'Living Club <invitaciones@entradasya.cl>',
    to: data.organizadorEmail,
    subject: `🎂 Cumpleaños de ${data.cumpleañeroNombre} — Tu evento está listo`,
    html: buildEmailOrganizadorCumpleanos({ ...data, fechaStr }),
  })
}

function buildEmailOrganizadorCumpleanos(data: {
  organizadorNombre: string
  cumpleañeroNombre: string
  edad: number
  lugar: string
  fechaStr: string
  cantidadInvitados: number
  clave: string
  linkEvento: string
  precio: number
}): string {
  const palabrasClave = data.clave.split(' ')
  const pildasHTML = palabrasClave
    .map(p => `<span style="background:#F5C200;color:#000;font-weight:900;padding:6px 14px;border-radius:8px;font-size:15px;letter-spacing:2px;display:inline-block;margin:3px;">${p}</span>`)
    .join(' ')

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header gorila -->
  <tr><td style="padding-bottom:0;line-height:0;font-size:0;">
    <img src="https://res.cloudinary.com/dqsz4ua73/image/upload/w_600,h_220,c_fill,g_auto,f_jpg,q_85/v1776100172/entradasya/eventos/g71klelokr1caj9dynz2.png"
         alt="Living Club" width="600" style="width:100%;display:block;border-radius:16px 16px 0 0;max-width:600px;">
  </td></tr>
  <tr><td align="center" style="background:#111;padding:16px 24px;border-bottom:2px solid rgba(245,194,0,0.4);">
    <div style="font-size:26px;font-weight:900;color:#F5C200;letter-spacing:6px;text-transform:uppercase;">LIVING CLUB</div>
    <div style="font-size:10px;color:#6b7280;letter-spacing:5px;text-transform:uppercase;margin-top:3px;">EVENTOS</div>
  </td></tr>

  <!-- Card principal -->
  <tr><td style="background:#0a0a0a;border:1px solid rgba(245,194,0,0.3);border-top:0;border-radius:0 0 20px 20px;padding:40px 36px;">

    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="background:#a855f7;color:#fff;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:5px 14px;border-radius:100px;">
        🎂 CUMPLEAÑOS CONFIRMADO
      </td></tr>
    </table>

    <p style="color:#9ca3af;font-size:14px;margin:0 0 6px;">Hola, <strong style="color:#d1d5db;">${data.organizadorNombre}</strong></p>
    <h1 style="color:#fff;font-size:26px;font-weight:900;margin:0 0 12px;">¡El evento de ${data.cumpleañeroNombre} está listo!</h1>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 28px;">
      Hemos creado la página del evento automáticamente. Comparte el enlace y la clave con tus invitados para que puedan registrarse y recibir su <strong style="color:#F5C200;">QR personal de acceso</strong>.
    </p>

    <!-- Detalles del evento -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(245,194,0,0.2);border-radius:14px;margin-bottom:28px;">
      <tr><td style="padding:24px 28px;">
        <div style="font-size:18px;font-weight:900;color:#F5C200;letter-spacing:1px;text-transform:uppercase;margin-bottom:18px;">Detalles del evento</div>
        <table width="100%" style="margin-bottom:10px;"><tr>
          <td width="20" style="font-size:14px;">🎂</td>
          <td style="padding-left:10px;color:#e5e7eb;font-size:14px;"><strong>${data.cumpleañeroNombre}</strong> cumple <strong>${data.edad} años</strong></td>
        </tr></table>
        <table width="100%" style="margin-bottom:10px;"><tr>
          <td width="20" style="font-size:14px;">📅</td>
          <td style="padding-left:10px;color:#e5e7eb;font-size:14px;text-transform:capitalize;">${data.fechaStr}</td>
        </tr></table>
        <table width="100%" style="margin-bottom:10px;"><tr>
          <td width="20" style="font-size:14px;">📍</td>
          <td style="padding-left:10px;color:#e5e7eb;font-size:14px;">${data.lugar}</td>
        </tr></table>
        <table width="100%" style="margin-bottom:0;"><tr>
          <td width="20" style="font-size:14px;">👥</td>
          <td style="padding-left:10px;color:#e5e7eb;font-size:14px;">${data.cantidadInvitados} invitados esperados</td>
        </tr></table>
        ${data.precio > 0 ? `
        <table width="100%" style="margin-top:10px;"><tr>
          <td width="20" style="font-size:14px;">💳</td>
          <td style="padding-left:10px;color:#F5C200;font-size:14px;font-weight:700;">Acceso VIP: $${data.precio.toLocaleString('es-CL')} — Coordina el pago con nosotros.</td>
        </tr></table>` : ''}
      </td></tr>
    </table>

    <!-- La clave -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:2px solid #F5C200;border-radius:14px;margin-bottom:28px;">
      <tr><td style="padding:24px 28px;text-align:center;">
        <div style="font-size:11px;color:#6b7280;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;font-weight:700;">🔑 Clave secreta del evento</div>
        <div style="margin-bottom:14px;">${pildasHTML}</div>
        <p style="color:#6b7280;font-size:12px;margin:0;line-height:1.6;">
          <strong style="color:#9ca3af;">Guarda esta clave.</strong> Es la única forma de que tus invitados puedan registrarse al evento. Compártela solo con las personas que quieras invitar.
        </p>
      </td></tr>
    </table>

    <!-- Enlace del evento -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td align="center">
        <p style="color:#9ca3af;font-size:13px;margin:0 0 12px;">Comparte este enlace con tus invitados:</p>
        <a href="${data.linkEvento}" style="background:#F5C200;color:#000;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:14px;font-weight:900;display:inline-block;letter-spacing:2px;text-transform:uppercase;">
          VER PÁGINA DEL EVENTO →
        </a>
        <p style="color:#374151;font-size:11px;margin:10px 0 0;word-break:break-all;">${data.linkEvento}</p>
      </td></tr>
    </table>

    <!-- Cómo funciona -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid rgba(255,255,255,0.06);border-radius:14px;margin-bottom:24px;">
      <tr><td style="padding:24px 28px;">
        <div style="font-size:13px;font-weight:900;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">¿Cómo funciona?</div>
        <table width="100%" style="margin-bottom:10px;"><tr>
          <td width="24" style="font-size:14px;vertical-align:top;padding-top:2px;">1️⃣</td>
          <td style="padding-left:10px;color:#9ca3af;font-size:13px;line-height:1.6;">Envía el enlace y la clave a cada invitado.</td>
        </tr></table>
        <table width="100%" style="margin-bottom:10px;"><tr>
          <td width="24" style="font-size:14px;vertical-align:top;padding-top:2px;">2️⃣</td>
          <td style="padding-left:10px;color:#9ca3af;font-size:13px;line-height:1.6;">Cada invitado entra al enlace, ingresa la clave y llena sus datos (nombre, RUT y correo).</td>
        </tr></table>
        <table width="100%" style="margin-bottom:10px;"><tr>
          <td width="24" style="font-size:14px;vertical-align:top;padding-top:2px;">3️⃣</td>
          <td style="padding-left:10px;color:#9ca3af;font-size:13px;line-height:1.6;">Cada invitado recibe su <strong style="color:#F5C200;">QR personal de acceso</strong> por correo. <strong style="color:#d1d5db;">Un QR = una entrada.</strong> No es transferible.</td>
        </tr></table>
        <table width="100%" style="margin-bottom:0;"><tr>
          <td width="24" style="font-size:14px;vertical-align:top;padding-top:2px;">4️⃣</td>
          <td style="padding-left:10px;color:#9ca3af;font-size:13px;line-height:1.6;">En la puerta presentan su QR para ingresar. <strong style="color:#ef4444;">Por razones de seguridad y control, se podría solicitar el carnet de identidad para verificar la identidad del portador del QR.</strong></td>
        </tr></table>
      </td></tr>
    </table>

    <p style="color:#374151;font-size:12px;text-align:center;margin:0;line-height:1.6;">
      ¿Tienes dudas? Contáctanos por WhatsApp.<br>
      Evento Living Club
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="padding-top:24px;text-align:center;">
    <div style="font-size:11px;color:#374151;">Powered by EntradasYa</div>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`.trim()
}

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function enviarInvitacion(
  invitacion: Invitacion,
  evento: Evento
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://living.entradasya.cl'
  const linkInvitacion = `${baseUrl}/invitacion/${invitacion.token}`

  const fechaFormateada = new Date(evento.fecha).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  await resend.emails.send({
    from: 'Living Club <invitaciones@entradasya.cl>',
    to: invitacion.email,
    subject: `LIVING CLUB — Tu invitación: ${evento.nombre}`,
    html: buildEmailHTML({
      nombreInvitado: invitacion.nombre,
      nombreEvento: evento.nombre,
      fecha: fechaFormateada,
      lugar: evento.lugar,
      qrImageUrl: invitacion.qrImageUrl || '',
      linkInvitacion,
    }),
  })
}

// ─────────────────────────────────────────────────────────
// RESERVAS EMAILS
// ─────────────────────────────────────────────────────────

const SECTOR_LABELS: Record<string, string> = {
  terraza:    'Acceso general',
  grill:      'Acceso VIP',
  cumpleanos: 'Evento privado — Living Club',
  show:       'Evento — Living Club',
}

export async function enviarConfirmacionReserva(reserva: Reserva): Promise<void> {
  const esTerraza    = reserva.tipo === 'terraza'
  const esGrill      = reserva.tipo === 'grill'
  const esCumpleanos = reserva.tipo === 'cumpleanos'
  const esShow       = reserva.tipo === 'show'

  const sector = reserva.nombreEvento || SECTOR_LABELS[reserva.tipo] || reserva.tipo

  let subject: string
  let bodyHtml: string

  if (esTerraza) {
    subject  = 'LIVING CLUB — ¡Reserva Confirmada!'
    bodyHtml = buildReservaEmailHTML({
      nombre:       reserva.nombre,
      titulo:       '¡Reserva Confirmada!',
      badge:        'ACCESO GENERAL · CONFIRMADO',
      badgeColor:   '#22c55e',
      sector:       'Evento Living Club',
      fecha:        reserva.fecha,
      hora:         reserva.hora,
      personas:     reserva.personas,
      mensaje:      'Tu reserva en <strong>Living Club</strong> está confirmada. No necesitas ningún pago. Solo preséntate a la hora indicada.',
      monto:        null,
      eventoUrl:    null,
    })
  } else if (esGrill) {
    subject  = 'LIVING CLUB — Acceso VIP Aprobado ✓'
    bodyHtml = buildReservaEmailHTML({
      nombre:       reserva.nombre,
      titulo:       '¡Reserva Aprobada!',
      badge:        'ACCESO VIP · APROBADO',
      badgeColor:   '#F5C200',
      sector:       'Evento Living Club',
      fecha:        reserva.fecha,
      hora:         reserva.hora,
      personas:     reserva.personas,
      mensaje:      'Tu comprobante de pago fue revisado y <strong>aprobado</strong>. Preséntate a la hora indicada. ¡Los esperamos!',
      monto:        10000,
      eventoUrl:    null,
    })
  } else if (esShow) {
    subject  = `LIVING CLUB — Reserva de Show Aprobada ✓`
    bodyHtml = buildReservaEmailHTML({
      nombre:       reserva.nombre,
      titulo:       '¡Reserva de Show Aprobada!',
      badge:        'SHOW · APROBADA',
      badgeColor:   '#F5C200',
      sector,
      fecha:        reserva.fecha,
      hora:         reserva.hora,
      personas:     reserva.personas,
      mensaje:      reserva.monto > 0
        ? 'Tu comprobante de pago fue revisado y <strong>aprobado</strong>. Preséntate a la hora indicada con tu confirmación. ¡Los esperamos!'
        : 'Tu reserva para el show está <strong>confirmada</strong>. Preséntate a la hora indicada. ¡Los esperamos!',
      monto:        reserva.monto > 0 ? reserva.monto : null,
      eventoUrl:    null,
    })
  } else {
    // cumpleaños
    const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL || 'https://living.entradasya.cl'
    const eventoUrl = reserva.eventoId ? `${baseUrl}/${reserva.eventoId}` : null
    subject  = 'LIVING CLUB — ¡Celebración Confirmada! 🎂'
    bodyHtml = buildReservaEmailHTML({
      nombre:       reserva.nombre,
      titulo:       '¡Celebración Confirmada!',
      badge:        'CUMPLEAÑOS · CONFIRMADO',
      badgeColor:   '#a855f7',
      sector:       'Celebración — Living Club',
      fecha:        reserva.fecha,
      hora:         reserva.hora,
      personas:     reserva.personas,
      mensaje:      'Tu evento de cumpleaños en Living Club está <strong>confirmado</strong>.' +
        (eventoUrl ? ' Comparte el siguiente enlace con tus invitados para que soliciten su QR de acceso.' : ''),
      monto:        null,
      eventoUrl,
    })
  }

  await resend.emails.send({
    from:    'Living Club <invitaciones@entradasya.cl>',
    to:      reserva.email,
    subject,
    html:    bodyHtml,
  })
}

export async function enviarNotificacionAdminReserva(reserva: Reserva): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@entradasya.cl'
  const tipoLabels: Record<string, string> = {
    terraza:    'Acceso general (Gratis)',
    grill:      'Acceso VIP ($10.000)',
    cumpleanos: 'Cumpleaños',
    show:       'Show / Evento',
  }
  const tipoLabel = reserva.tipo === 'show' && reserva.nombreEvento
    ? `Show: ${reserva.nombreEvento}`
    : (tipoLabels[reserva.tipo] ?? reserva.tipo)

  await resend.emails.send({
    from: 'Living Club <invitaciones@entradasya.cl>',
    to: adminEmail,
    subject: `📋 Nueva reserva: ${tipoLabel} — ${reserva.nombre}`,
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:24px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding-bottom:0;line-height:0;font-size:0;">
    <img src="https://res.cloudinary.com/dqsz4ua73/image/upload/w_600,h_180,c_fill,g_auto,f_jpg,q_85/v1776100172/entradasya/eventos/g71klelokr1caj9dynz2.png"
         alt="Living Club" width="600" style="width:100%;display:block;border-radius:16px 16px 0 0;max-width:600px;">
  </td></tr>
  <tr><td align="center" style="background:#111;padding:14px 24px;border-bottom:2px solid rgba(245,194,0,0.4);">
    <div style="font-size:22px;font-weight:900;color:#F5C200;letter-spacing:5px;text-transform:uppercase;">LIVING CLUB</div>
    <div style="font-size:10px;color:#6b7280;letter-spacing:4px;text-transform:uppercase;margin-top:2px;">NUEVA RESERVA</div>
  </td></tr>
  <tr><td style="background:#0a0a0a;border:1px solid rgba(245,194,0,0.3);border-top:0;border-radius:0 0 16px 16px;padding:28px 28px;">
    <div style="font-size:11px;color:#F5C200;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">📋 ${tipoLabel}</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="color:#6b7280;font-size:12px;">Nombre</span><br>
        <strong style="color:#fff;font-size:15px;">${reserva.nombre}</strong>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="color:#6b7280;font-size:12px;">Contacto</span><br>
        <span style="color:#d1d5db;font-size:13px;">${reserva.email} · ${reserva.telefono}</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="color:#6b7280;font-size:12px;">Fecha y hora</span><br>
        <strong style="color:#F5C200;font-size:14px;">${reserva.fecha} — ${reserva.hora} hrs</strong>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="color:#6b7280;font-size:12px;">Personas</span><br>
        <span style="color:#d1d5db;font-size:13px;">${reserva.personas} persona${reserva.personas !== 1 ? 's' : ''}</span>
      </td></tr>
      ${reserva.notas ? `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="color:#6b7280;font-size:12px;">Notas</span><br>
        <span style="color:#d1d5db;font-size:13px;">${reserva.notas}</span>
      </td></tr>` : ''}
      ${reserva.comprobantePagoUrl ? `<tr><td style="padding:8px 0;">
        <span style="color:#6b7280;font-size:12px;">Comprobante</span><br>
        <a href="${reserva.comprobantePagoUrl}" style="color:#F5C200;font-size:13px;">Ver comprobante →</a>
      </td></tr>` : ''}
    </table>
    <div style="margin-top:20px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://living.entradasya.cl'}/admin/reservas"
         style="background:#F5C200;color:#000;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:13px;font-weight:900;display:inline-block;letter-spacing:2px;text-transform:uppercase;">
        VER EN ADMIN →
      </a>
    </div>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
  })
}

export async function enviarRechazoReserva(reserva: Reserva, motivo?: string): Promise<void> {
  const sector = SECTOR_LABELS[reserva.tipo] ?? reserva.tipo
  await resend.emails.send({
    from:    'Living Club <invitaciones@entradasya.cl>',
    to:      reserva.email,
    subject: 'LIVING CLUB — Tu reserva no pudo ser procesada',
    html:    buildReservaEmailHTML({
      nombre:     reserva.nombre,
      titulo:     'Reserva No Aprobada',
      badge:      'RESERVA RECHAZADA',
      badgeColor: '#ef4444',
      sector,
      fecha:      reserva.fecha,
      hora:       reserva.hora,
      personas:   reserva.personas,
      mensaje:    motivo
        ? `Tu reserva no pudo ser aprobada. Motivo: <strong>${motivo}</strong>. Contáctanos por WhatsApp para más información.`
        : 'Tu reserva no pudo ser aprobada en esta oportunidad. Contáctanos por WhatsApp para más información.',
      monto:      null,
      eventoUrl:  null,
    }),
  })
}

function buildReservaEmailHTML(data: {
  nombre: string
  titulo: string
  badge: string
  badgeColor: string
  sector: string
  fecha: string
  hora: string
  personas: number
  mensaje: string
  monto: number | null
  eventoUrl: string | null
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#050505;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header gorila -->
        <tr><td style="padding-bottom:0;line-height:0;font-size:0;">
          <img src="https://res.cloudinary.com/dqsz4ua73/image/upload/w_600,h_220,c_fill,g_auto,f_jpg,q_85/v1776100172/entradasya/eventos/g71klelokr1caj9dynz2.png"
               alt="Living Club" width="600" style="width:100%;display:block;border-radius:16px 16px 0 0;max-width:600px;">
        </td></tr>
        <tr><td align="center" style="background:#111;padding:16px 24px;border-bottom:2px solid rgba(245,194,0,0.4);">
          <div style="font-size:26px;font-weight:900;color:#F5C200;letter-spacing:6px;text-transform:uppercase;">LIVING CLUB</div>
          <div style="font-size:10px;color:#6b7280;letter-spacing:5px;text-transform:uppercase;margin-top:3px;">EVENTOS</div>
        </td></tr>

        <!-- Card -->
        <tr><td style="background-color:#0a0a0a;border:1px solid rgba(245,194,0,0.25);border-top:0;border-radius:0 0 20px 20px;padding:40px 36px;">
          <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td style="background-color:${data.badgeColor};color:#000;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:5px 14px;border-radius:100px;">
              ${data.badge}
            </td></tr>
          </table>

          <p style="color:#9ca3af;font-size:14px;margin:0 0 6px 0;">Hola, <strong style="color:#d1d5db;">${data.nombre}</strong></p>
          <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 16px 0;">${data.titulo}</h1>
          <p style="color:#9ca3af;font-size:14px;margin:0 0 32px 0;line-height:1.7;">${data.mensaje}</p>

          <!-- Detalle reserva -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111;border:1px solid rgba(245,194,0,0.2);border-radius:14px;margin-bottom:32px;">
            <tr><td style="padding:24px 28px;">
              <div style="font-size:18px;font-weight:900;color:#F5C200;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;">${data.sector}</div>

              <table width="100%" style="margin-bottom:12px;"><tr>
                <td width="20" style="font-size:14px;">📅</td>
                <td style="padding-left:10px;color:#e5e7eb;font-size:14px;">${data.fecha} — ${data.hora} hrs</td>
              </tr></table>

              <table width="100%" style="margin-bottom:12px;"><tr>
                <td width="20" style="font-size:14px;">👥</td>
                <td style="padding-left:10px;color:#e5e7eb;font-size:14px;">${data.personas} persona${data.personas !== 1 ? 's' : ''}</td>
              </tr></table>

              ${data.monto ? `
              <table width="100%" style="margin-bottom:0;"><tr>
                <td width="20" style="font-size:14px;">💳</td>
                <td style="padding-left:10px;color:#e5e7eb;font-size:14px;">Pago confirmado: <strong style="color:#F5C200;">$${data.monto.toLocaleString('es-CL')}</strong></td>
              </tr></table>` : ''}
            </td></tr>
          </table>

          ${data.eventoUrl ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td align="center">
              <p style="color:#9ca3af;font-size:13px;margin:0 0 12px 0;">Comparte este enlace con tus invitados:</p>
              <a href="${data.eventoUrl}" style="background-color:#F5C200;color:#000;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:14px;font-weight:900;display:inline-block;letter-spacing:2px;text-transform:uppercase;">
                VER EVENTO →
              </a>
            </td></tr>
          </table>` : ''}

          <p style="color:#374151;font-size:12px;text-align:center;margin:0;">
            ¿Consultas? Escríbenos por WhatsApp o llámanos directamente.<br>
            Evento Living Club
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center;">
          <div style="color:#374151;font-size:11px;">Powered by EntradasYa</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`.trim()
}

// ─────────────────────────────────────────────────────────
// INVITACIONES EMAILS
// ─────────────────────────────────────────────────────────

function buildEmailHTML(data: {
  nombreInvitado: string
  nombreEvento: string
  fecha: string
  lugar: string
  qrImageUrl: string
  linkInvitacion: string
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Invitación — ${data.nombreEvento}</title>
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ══ HEADER — Gorila ══ -->
          <tr>
            <td style="padding-bottom:0;line-height:0;font-size:0;">
              <img src="https://res.cloudinary.com/dqsz4ua73/image/upload/w_600,h_220,c_fill,g_auto,f_jpg,q_85/v1776100172/entradasya/eventos/g71klelokr1caj9dynz2.png"
                    alt="Living Club" width="600" style="width:100%;display:block;border-radius:16px 16px 0 0;max-width:600px;">
            </td>
          </tr>
          <tr>
            <td align="center" style="background:#111;padding:16px 24px;border-bottom:2px solid rgba(245,194,0,0.4);margin-bottom:28px;">
              <div style="font-size:26px;font-weight:900;color:#F5C200;letter-spacing:6px;text-transform:uppercase;">LIVING CLUB</div>
              <div style="font-size:10px;color:#6b7280;letter-spacing:5px;text-transform:uppercase;margin-top:3px;">EVENTOS</div>
            </td>
          </tr>

          <!-- Divider dorado -->
          <tr>
            <td style="padding-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,#F5C200,transparent);opacity:0.5;font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ CARD PRINCIPAL ══ -->
          <tr>
            <td style="background-color:#0a0a0a;border:1px solid rgba(245,194,0,0.25);border-radius:20px;padding:40px 36px;">

              <!-- Etiqueta INVITACIÓN -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#F5C200;color:#000000;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:5px 14px;border-radius:100px;">
                    INVITACIÓN PERSONAL
                  </td>
                </tr>
              </table>

              <!-- Saludo -->
              <p style="color:#9ca3af;font-size:14px;margin:0 0 6px 0;">Hola, <strong style="color:#d1d5db;">${data.nombreInvitado}</strong></p>
              <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 8px 0;line-height:1.2;letter-spacing:1px;text-transform:uppercase;">
                Tienes una invitación
              </h1>
              <p style="color:#4b5563;font-size:14px;margin:0 0 32px 0;line-height:1.6;">
                Estás invitado/a a la noche que viene. Presenta tu QR personal al anfitrión para ingresar.
              </p>

              <!-- ══ INFO EVENTO ══ -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid rgba(245,194,0,0.2);border-radius:14px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">

                    <!-- Nombre evento -->
                    <div style="font-size:22px;font-weight:900;color:#F5C200;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;line-height:1.2;">
                      ${data.nombreEvento}
                    </div>

                    <!-- Fila: Fecha -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td width="20" style="vertical-align:top;padding-top:2px;font-size:14px;">📅</td>
                        <td style="padding-left:10px;">
                          <div style="color:#6b7280;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:3px;">Fecha y hora</div>
                          <div style="color:#e5e7eb;font-size:14px;font-weight:600;text-transform:capitalize;">${data.fecha}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Fila: Lugar -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="20" style="vertical-align:top;padding-top:2px;font-size:14px;">📍</td>
                        <td style="padding-left:10px;">
                          <div style="color:#6b7280;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:3px;">Lugar</div>
                          <div style="color:#e5e7eb;font-size:14px;font-weight:600;">${data.lugar}</div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- ══ QR CODE ══ -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <div style="font-size:11px;color:#6b7280;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;font-weight:700;">Tu código de acceso</div>
                    <!-- Marco dorado del QR -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;background-color:#F5C200;border-radius:16px;padding:3px;">
                      <tr>
                        <td align="center" style="background-color:#ffffff;border-radius:13px;padding:16px;">
                          <img src="${data.qrImageUrl}" alt="QR de acceso" width="200" height="200" style="display:block;border-radius:4px;">
                        </td>
                      </tr>
                    </table>
                    <div style="color:#374151;font-size:12px;margin-top:12px;">
                      Intransferible — válido solo para <strong style="color:#6b7280;">${data.nombreInvitado}</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- ══ CTA BUTTON ══ -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${data.linkInvitacion}"
                       style="background-color:#F5C200;color:#000000;text-decoration:none;padding:16px 48px;border-radius:12px;font-size:15px;font-weight:900;display:inline-block;letter-spacing:2px;text-transform:uppercase;">
                      VER MI INVITACIÓN
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider interior -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,rgba(245,194,0,0.2),transparent);font-size:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Nota final -->
              <p style="color:#374151;font-size:12px;text-align:center;margin:0;line-height:1.6;">
                Si no solicitaste esta invitación, puedes ignorar este correo.<br>
                No compartas tu QR — es personal e intransferible.
              </p>

            </td>
          </tr>

          <!-- ══ FOOTER ══ -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <div style="color:#374151;font-size:12px;margin-bottom:6px;">Ubicacion segun evento</div>
              <div style="color:#1f2937;font-size:11px;letter-spacing:1px;">Powered by EntradasYa</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}
