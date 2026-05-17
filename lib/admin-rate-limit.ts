import "server-only"

const loginWindowMs = 15 * 60 * 1000
const maxLoginAttempts = 5

type LoginAttempt = {
  count: number
  resetAt: number
}

const attempts = new Map<string, LoginAttempt>()

export function isLoginRateLimited(identifier: string) {
  const attempt = attempts.get(identifier)

  if (!attempt) {
    return false
  }

  if (attempt.resetAt <= Date.now()) {
    attempts.delete(identifier)
    return false
  }

  return attempt.count >= maxLoginAttempts
}

export function recordFailedLogin(identifier: string) {
  const now = Date.now()
  const attempt = attempts.get(identifier)

  if (!attempt || attempt.resetAt <= now) {
    attempts.set(identifier, {
      count: 1,
      resetAt: now + loginWindowMs,
    })
    return
  }

  attempt.count += 1
}

export function clearFailedLogins(identifier: string) {
  attempts.delete(identifier)
}
