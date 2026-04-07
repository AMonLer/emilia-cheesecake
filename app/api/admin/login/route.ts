import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 })
    }

    const role = checkCredentials(username, password)
    if (!role) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
    }

    const { token, maxAgeSeconds } = createSessionToken(role)
    const res = NextResponse.json({ ok: true, role })
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    })
    return res
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}
