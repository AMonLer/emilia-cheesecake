import crypto from 'crypto'

// Unambiguous alphabet (no 0/O, 1/I/L) so codes are easy to read off a sticker.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Generates a short, unguessable code for a personal "For You" message,
 * e.g. "EM-7K9Q2X". Tied to a paid order so only customers can create one.
 */
export function generateForYouCode(): string {
  const bytes = crypto.randomBytes(6)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return `EM-${code}`
}
