export type Theme = 'light' | 'dark'

const THEME_KEY = 'game-tools-theme'

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)

  if (stored === 'dark' || stored === 'light') {
    return stored
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  return prefersDark ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
