import { SignJWT, jwtVerify, JWTPayload } from 'jose'

export const ADMIN_ACCESS_COOKIE_NAME = 'admin_token_living'
export const ADMIN_REFRESH_COOKIE_NAME = 'admin_refresh_token_living'

export interface TokenPayload extends JWTPayload {
  user: string
  uaHash?: string
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!)
}

/** SHA-256 of the User-Agent string, truncated to 16 hex chars (8 bytes) */
export async function hashUserAgent(ua: string): Promise<string> {
  const data = new TextEncoder().encode((ua || '').slice(0, 512))
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}

export async function signAccessToken(user: string, uaHash: string): Promise<string> {
  return new SignJWT({ user, uaHash })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret())
}

export async function signRefreshToken(
  user: string,
  uaHash: string
): Promise<{ token: string; jti: string }> {
  const jti = crypto.randomUUID()
  const token = await new SignJWT({ user, uaHash })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setJti(jti)
    .sign(getSecret())
  return { token, jti }
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as TokenPayload
}

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 15,        // 15 minutes
  path: '/',
}

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
}
