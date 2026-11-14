/**
 * @deprecated PostgreSQL handles connection pooling and commits automatically.
 * Kept only for graceful backward-compatibility during call-site refactoring.
 */
export function saveAndClose(_db?: unknown): void {
  // No-op in PostgreSQL data layer
}
