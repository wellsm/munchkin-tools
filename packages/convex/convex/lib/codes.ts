// Character set for human-shareable codes (room code, access code).
// Excludes I/O/0/1 to avoid visual confusion when read aloud or over chat.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

export function generateCode(): string {
  let out = ''

  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }

  return out
}
