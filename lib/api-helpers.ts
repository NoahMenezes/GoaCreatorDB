import { closeDb, type SqlDatabase } from '@/lib/db'
import { writeDbFile, saveDbFile } from '@/lib/db-file'

export function saveAndClose(db: SqlDatabase) {
  try {
    const data = db.export()
    const dbPath = saveDbFile()
    if (dbPath) {
      writeDbFile(dbPath, data)
    }
  } catch {
    // Ignore write failures
  }
  closeDb()
}
