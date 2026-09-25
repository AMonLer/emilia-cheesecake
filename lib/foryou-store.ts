import fs from 'fs'
import path from 'path'
import {
  saveForYouMessage as saveInNotion,
  getForYouMessage as getFromNotion,
  listForYouMessages as listFromNotion,
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

export async function getForYouMessage(code: string, strict = false): Promise<ForYouMessage | null> {
  if (useNotion) return getFromNotion(code, strict)
  if (process.env.NODE_ENV === 'production') return null
  return readLocal()[code] ?? null
}

export async function listForYouMessages(): Promise<ForYouMessage[]> {
  if (useNotion) return listFromNotion()
  if (process.env.NODE_ENV === 'production') return []
  return Object.values(readLocal())
}

/** Códigos de sticker ya entregados, para no repetir al asignar el siguiente. */
export async function listUsedForYouCodes(): Promise<Set<string>> {
  if (useNotion) return listUsedFromNotion()
  if (process.env.NODE_ENV === 'production') return new Set()
  return new Set(Object.keys(readLocal()))
}

// En local la reserva deja una fila en el JSON (vacía, o con lo creado en el
// checkout): el código consta como entregado.
export async function reserveForYouCode(
  code: string,
  paymentIntentId: string,
  content?: Pick<ForYouMessage, 'message' | 'videoUrl' | 'fileUrl'>,
): Promise<boolean> {
  if (useNotion) return reserveInNotion(code, paymentIntentId, content)
  if (process.env.NODE_ENV === 'production') return false
  try {
    const store = readLocal()
    if (store[code]) return false
    store[code] = { code, message: content?.message || '', videoUrl: content?.videoUrl || '', fileUrl: content?.fileUrl || '', paymentIntentId }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('Error reservando código For You en JSON local:', err)
    return false
  }
}
