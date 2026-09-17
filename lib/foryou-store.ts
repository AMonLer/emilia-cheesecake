import fs from 'fs'
import path from 'path'
import {
  saveForYouMessage as saveInNotion,
  getForYouMessage as getFromNotion,
  listUsedForYouCodes as listUsedFromNotion,
  reserveForYouCode as reserveInNotion,
  type ForYouMessage,
} from './notion'

export type { ForYouMessage }

// Almacenamiento conmutable: con Notion configurado se usa Notion; sin él, un
// JSON local para poder probar el flujo entero en desarrollo. En Vercel el JSON
// es efímero, así que producción siempre debe tener NOTION_FORYOU_DB_ID.
const useNotion = Boolean(process.env.NOTION_TOKEN?.trim() && process.env.NOTION_FORYOU_DB_ID?.trim())
const STORE_PATH = path.join(process.cwd(), '.foryou-local.json')

function readLocal(): Record<string, ForYouMessage> {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

export async function saveForYouMessage(rec: ForYouMessage): Promise<boolean> {
  if (useNotion) return saveInNotion(rec)
  if (process.env.NODE_ENV === 'production') return false
  try {
    const store = readLocal()
    store[rec.code] = rec
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('Error guardando mensaje For You en JSON local:', err)
    return false
  }
}

export async function getForYouMessage(code: string): Promise<ForYouMessage | null> {
  if (useNotion) return getFromNotion(code)
  if (process.env.NODE_ENV === 'production') return null
  return readLocal()[code] ?? null
}

/** Códigos de sticker ya entregados, para no repetir al asignar el siguiente. */
export async function listUsedForYouCodes(): Promise<Set<string>> {
  if (useNotion) return listUsedFromNotion()
  if (process.env.NODE_ENV === 'production') return new Set()
  return new Set(Object.keys(readLocal()))
}

// En local la reserva deja una fila vacía en el JSON: el código consta como
// entregado y /foryou/[code] muestra "tu mensaje está en camino" hasta que se grabe.
export async function reserveForYouCode(code: string, paymentIntentId: string): Promise<boolean> {
  if (useNotion) return reserveInNotion(code, paymentIntentId)
  if (process.env.NODE_ENV === 'production') return false
  try {
    const store = readLocal()
    if (store[code]) return false
    store[code] = { code, message: '', paymentIntentId }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('Error reservando código For You en JSON local:', err)
    return false
  }
}
