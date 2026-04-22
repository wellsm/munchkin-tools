export type Theme = 'light' | 'dark'

const THEME_KEY = 'munchkin-tools-theme'

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)

  if (stored === 'dark' || stored === 'light') {
    return stored
  }

  return 'dark'
}

export function applyTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
