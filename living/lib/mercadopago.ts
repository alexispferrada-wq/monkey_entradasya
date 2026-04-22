import MercadoPagoConfig, { Payment, Preference } from 'mercadopago'

let _client: MercadoPagoConfig | null = null

function getClient(): MercadoPagoConfig {
  if (!_client) {
    const token = process.env.MP_ACCESS_TOKEN
    if (!token) throw new Error('MP_ACCESS_TOKEN no configurado')
    _client = new MercadoPagoConfig({ accessToken: token })
  }
  return _client
}

export function getPreferenceClient() {
  return new Preference(getClient())
}

export function getPaymentClient() {
  return new Payment(getClient())
}

export const MP_PUBLIC_KEY = process.env.MP_PUBLIC_KEY ?? ''
