import { sql } from 'drizzle-orm'

export function dbNow() {
  return sql`now()`
}
