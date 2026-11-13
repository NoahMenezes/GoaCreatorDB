declare module 'bun:test' {
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void | Promise<void>): void
  export function expect(actual: any): {
    not: {
      toBe(expected: any): void
      toBeDefined(): void
      toBeUndefined(): void
      toBeNull(): void
      toBeTruthy(): void
      toBeFalsy(): void
      toBeGreaterThan(n: number): void
      toContain(substring: string): void
      toMatch(regexp: RegExp): void
      toHaveLength(n: number): void
    }
    toBe(expected: any): void
    toBeDefined(): void
    toBeUndefined(): void
    toBeNull(): void
    toBeTruthy(): void
    toBeFalsy(): void
    toBeGreaterThan(n: number): void
    toContain(substring: string): void
    toMatch(regexp: RegExp): void
    toHaveLength(n: number): void
    toResolve(): void
    toReject(): void
    rejects: {
      toThrow(message?: string | RegExp): void
    }
  }
  export function beforeAll(fn: () => void): void
  export function afterAll(fn: () => void): void
  export function beforeEach(fn: () => void): void
  export function afterEach(fn: () => void): void
}