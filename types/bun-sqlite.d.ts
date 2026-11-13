declare module 'bun:sqlite' {
  export class Database {
    constructor(path: string)
    query(sql: string): {
      run(...params: any[]): any
      get(...params: any[]): any | null
      all(...params: any[]): any[]
    }
    exec(sql: string): void
    close(): void
  }
}