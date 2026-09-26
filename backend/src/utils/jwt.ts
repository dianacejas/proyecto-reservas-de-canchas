import { createHmac, timingSafeEqual } from 'node:crypto'

export interface JwtClaims {
  sub: string
  role: string
  iat: number
  exp: number
}

function base64Url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url')
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

export function signToken(
  payload: { sub: string; role: string },
  secret: string,
  expiresInDays: number
): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const nowInSeconds = Math.floor(Date.now() / 1000)
  const body = base64Url(
    JSON.stringify({
      ...payload,
      iat: nowInSeconds,
      exp: nowInSeconds + expiresInDays * 24 * 60 * 60,
    })
  )
  const unsigned = `${header}.${body}`
  return `${unsigned}.${sign(unsigned, secret)}`
}

export function verifyToken(token: string, secret: string): JwtClaims | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, signature] = parts
  if (!header || !body || !signature) return null

  const unsigned = `${header}.${body}`
  const expected = Buffer.from(sign(unsigned, secret))
  const received = Buffer.from(signature)
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) return null

  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Partial<JwtClaims>
    if (
      typeof claims.sub !== 'string' ||
      typeof claims.role !== 'string' ||
      typeof claims.exp !== 'number' ||
      claims.exp < Math.floor(Date.now() / 1000)
    ) {
      return null
    }
    return claims as JwtClaims
  } catch {
    return null
  }
}