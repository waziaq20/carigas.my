const STORAGE_KEY = "carigas:favorites"

export function getFavorites(): string[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function toggleFavorite(id: string): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const favorites = getFavorites()
    const next = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event("carigas:favorites-changed"))
  } catch {
    // localStorage not available (incognito, quota, etc.)
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id)
}
