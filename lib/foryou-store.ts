import fs from 'fs'
import path from 'path'
import {
  saveForYouMessage as saveInNotion,
  getForYouMessage as getFromNotion,
  type ForYouMessage,
} from './notion'

export type { ForYouMessage }

// Almacenamiento conmutable: con Notion configurado se usa Notion; sin él, un
// JSON local para poder probar el flujo entero en desarrollo. En Vercel el JSON
// es efímero, así que producción siempre debe tener NOTION_FORYOU_DB_ID.
const useNotion = Boolean(process.env.NOTION_TOKEN && process.env.NOTION_FORYOU_DB_ID)
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
  return readLocal()[code] ?? null
}
