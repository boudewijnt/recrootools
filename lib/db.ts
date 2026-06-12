import { neon } from '@neondatabase/serverless'

export const db = neon(process.env.DATABASE_URL!)

export function toISOStr(val: unknown): string {
  if (val instanceof Date) return val.toISOString()
  return String(val)
}
