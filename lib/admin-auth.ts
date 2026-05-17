import "server-only"

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const adminCookieName = "carigas_admin"
export const adminLoginPath = "/admin/login"
export const adminHomePath = "/admin"

const defaultSessionTtlSeconds = 60 * 60 * 8
const secureCookie = process.env.NODE_ENV === "production"

type AdminConfig = {
  password: string
  secret: string
  sessionTtlSeconds: number
  username: string
}

type AdminTokenPayload = {
  exp: number
  nonce: string
  username: string
}

export type AdminSession = {
  expiresAt: Date
  username: string
}

export function getAdminConfigIssue() {
  const username = process.env.ADMIN_USERNAME?.trim()
  const password = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET

  if (!username) {
    return "ADMIN_USERNAME is not set"
  }

  if (!password) {
    return "ADMIN_PASSWORD is not set"
  }

  if (!secret || secret.length < 32) {
    return "ADMIN_SESSION_SECRET must be at least 32 characters"
  }

  return null
}

export function isAdminAuthConfigured() {
  return getAdminConfigIssue() === null
}

function getAdminConfig(): AdminConfig {
  const issue = getAdminConfigIssue()

  if (issue) {
    throw new Error(`Admin auth is not configured: ${issue}`)
  }

  const ttlFromEnv = Number(process.env.ADMIN_SESSION_TTL_SECONDS)
  const sessionTtlSeconds =
    Number.isInteger(ttlFromEnv) && ttlFromEnv > 0
      ? ttlFromEnv
      : defaultSessionTtlSeconds

  return {
    password: process.env.ADMIN_PASSWORD as string,
    secret: process.env.ADMIN_SESSION_SECRET as string,
    sessionTtlSeconds,
    username: process.env.ADMIN_USERNAME?.trim() as string,
  }
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest()
  const rightHash = createHash("sha256").update(right).digest()

  return timingSafeEqual(leftHash, rightHash)
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

function createAdminToken(config: AdminConfig) {
  const expiresAt = Date.now() + config.sessionTtlSeconds * 1000
  const payload: AdminTokenPayload = {
    exp: expiresAt,
    nonce: randomBytes(16).toString("base64url"),
    username: config.username,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  )
  const signature = signPayload(encodedPayload, config.secret)

  return `${encodedPayload}.${signature}`
}

function verifyAdminToken(token: string | undefined): AdminSession | null {
  if (!token) {
    return null
  }

  let config: AdminConfig

  try {
    config = getAdminConfig()
  } catch {
    return null
  }

  const [encodedPayload, signature] = token.split(".")

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signPayload(encodedPayload, config.secret)

  if (!safeEqual(signature, expectedSignature)) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<AdminTokenPayload>

    if (
      payload.username !== config.username ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null
    }

    return {
      expiresAt: new Date(payload.exp),
      username: payload.username,
    }
  } catch {
    return null
  }
}

export function verifyAdminCredentials(username: string, password: string) {
  const config = getAdminConfig()

  return safeEqual(username.trim(), config.username) && safeEqual(password, config.password)
}

export async function createAdminSessionCookie() {
  const config = getAdminConfig()
  const cookieStore = await cookies()

  cookieStore.set(adminCookieName, createAdminToken(config), {
    httpOnly: true,
    maxAge: config.sessionTtlSeconds,
    path: "/",
    sameSite: "lax",
    secure: secureCookie,
  })
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.set(adminCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: secureCookie,
  })
}

export async function getAdminSession() {
  const cookieStore = await cookies()

  return verifyAdminToken(cookieStore.get(adminCookieName)?.value)
}

export async function requireAdminSession() {
  const session = await getAdminSession()

  if (!session) {
    redirect(adminLoginPath)
  }

  return session
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return undefined
  }

  for (const cookie of cookieHeader.split(";")) {
    const [cookieName, ...cookieValue] = cookie.trim().split("=")

    if (cookieName === name) {
      return cookieValue.join("=")
    }
  }

  return undefined
}

export function getAdminSessionFromRequest(request: Request) {
  return verifyAdminToken(
    getCookieValue(request.headers.get("cookie"), adminCookieName)
  )
}

export function requireAdminRequest(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}

export function requireSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin")

  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  return null
}
