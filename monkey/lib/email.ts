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
    from: 'Monkey Restobar <invitaciones@entradasya.cl>',
    to: invitacion.email,
    subject: `MONKEY RESTOBAR — Tu invitación: ${evento.nombre}`,
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
  <title>Tu Invitación — ${data.nombreEvento}</title>
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ══ HEADER — Logo Monkey ══ -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <!-- Círculo dorado con cara de mono -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                <tr>
                  <td align="center" style="width:64px;height:64px;background-color:#F5C200;border-radius:50%;line-height:64px;font-size:32px;">
                    🐒
                  </td>
                </tr>
              </table>
              <div style="font-size:32px;font-weight:900;color:#F5C200;letter-spacing:6px;text-transform:uppercase;line-height:1;">MONKEY</div>
              <div style="font-size:11px;color:#6b7280;letter-spacing:5px;text-transform:uppercase;margin-top:4px;">Restobar</div>
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
              <div style="font-size:13px;font-weight:900;color:#F5C200;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px;">MONKEY RESTOBAR</div>
              <div style="color:#374151;font-size:12px;margin-bottom:12px;">Av. Concha y Toro 1060, Local 3</div>
              <!-- Divider final -->
              <table width="200" cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,rgba(245,194,0,0.3),transparent);font-size:0;">&nbsp;</td>
                </tr>
              </table>
              <div style="color:#1f2937;font-size:11px;letter-spacing:1px;">
                Powered by EntradasYa
              </div>
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
