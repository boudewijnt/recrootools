import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

// Lazy singleton — neon() validates the connection string immediately,
// so we defer creation until the first actual query (runtime, not build-time).
let _db: NeonQueryFunction<false, false> | null = null

function getDb(): NeonQueryFunction<false, false> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _db = neon(process.env.DATABASE_URL)
  }
  return _db
}

// Export a tagged-template wrapper so callers can use `db\`...\`` unchanged.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function db(strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, any>[]> {
  return getDb()(strings, ...values) as Promise<Record<string, any>[]>
}

export function toISOStr(val: unknown): string {
  if (val instanceof Date) return val.toISOString()
  return String(val)
}
