import fs from 'fs'
import path from 'path'

export function saveDbFile() {
  try {
    const dbPath = process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/^sqlite:/, '')
      : path.join(process.cwd(), '.data', 'goa-creator.db')
    const dbDir = path.dirname(dbPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    // The db instance export is handled by the caller passing the buffer
    return dbPath
  } catch {
    return null
  }
}

export function writeDbFile(dbPath: string, data: Uint8Array) {
  try {
    fs.writeFileSync(dbPath, Buffer.from(data))
  } catch {
    // Ignore write failures
  }
}
