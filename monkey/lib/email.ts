import { Resend } from 'resend'
import type { Evento, Invitacion } from './db/schema'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function enviarInvitacion(
  invitacion: Invitacion,
  evento: Evento
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://monkey.entradasya.cl'
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
    from: 'EntradasYa <invitaciones@entradasya.cl>',
    to: invitacion.email,
    subject: `Tu invitación para ${evento.nombre} 🎉`,
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
  <title>Tu Invitación - ${data.nombreEvento}</title>
</head>
<body style="margin:0;padding:0;background-color:#020617;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#020617;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="background:linear-gradient(135deg,#6366f1,#f43f5e);-webkit-background-clip:text;background-clip:text;display:inline-block;">
                <span style="font-size:28px;font-weight:900;color:#6366f1;letter-spacing:-1px;">EntradasYa</span>
              </div>
            </td>
          </tr>

          <!-- Card principal -->
          <tr>
            <td style="background:rgba(30,41,59,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;backdrop-filter:blur(20px);">

              <!-- Saludo -->
              <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;">Hola, ${data.nombreInvitado} 👋</p>
              <h1 style="color:#f8fafc;font-size:28px;font-weight:800;margin:0 0 8px;line-height:1.2;">
                ¡Tienes una invitación!
              </h1>
              <p style="color:#64748b;font-size:16px;margin:0 0 32px;">
                Estás invitado/a a un evento especial. Guarda tu QR para el ingreso.
              </p>

              <!-- Info evento -->
              <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:16px;padding:24px;margin-bottom:32px;">
                <h2 style="color:#a5b4fc;font-size:22px;font-weight:700;margin:0 0 16px;">
                  ${data.nombreEvento}
                </h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:8px;">
                      <span style="color:#64748b;font-size:13px;">📅 Fecha</span><br>
                      <span style="color:#e2e8f0;font-size:15px;font-weight:500;">${data.fecha}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style="color:#64748b;font-size:13px;">📍 Lugar</span><br>
                      <span style="color:#e2e8f0;font-size:15px;font-weight:500;">${data.lugar}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- QR Code -->
              <div style="text-align:center;margin-bottom:32px;">
                <p style="color:#94a3b8;font-size:14px;margin:0 0 16px;">Tu código QR de acceso</p>
                <div style="background:#ffffff;border-radius:16px;padding:20px;display:inline-block;">
                  <img src="${data.qrImageUrl}" alt="QR Code" width="200" height="200" style="display:block;">
                </div>
                <p style="color:#475569;font-size:12px;margin:12px 0 0;">
                  Muestra este QR al anfitrión al ingresar
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${data.linkInvitacion}"
                   style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;display:inline-block;">
                  Ver mi invitación
                </a>
              </div>

              <!-- Footer del card -->
              <p style="color:#475569;font-size:12px;text-align:center;margin:0;">
                Si no solicitaste esta invitación, puedes ignorar este correo.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="color:#334155;font-size:12px;margin:0;">
                © 2024 EntradasYa — La plataforma de eventos que se adapta a ti
              </p>
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
