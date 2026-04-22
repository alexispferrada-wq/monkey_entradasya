export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { ADMIN_ACCESS_COOKIE_NAME, ADMIN_REFRESH_COOKIE_NAME } from '@/lib/auth-tokens'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(ADMIN_ACCESS_COOKIE_NAME)
  res.cookies.delete(ADMIN_REFRESH_COOKIE_NAME)
  return res
}
