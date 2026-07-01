export type { MaybeRef } from './reactivity'

export type IsStartWith<T, U extends string> = T extends `${U}${infer _}` ? T : never

/**
 * Matches string-typed keys that begin with an uppercase ASCII letter (A–Z),
 * used to mark a prop as "non-reactive" (passed through verbatim rather than
 * wrapped in a MaybeRef).
 *
 * `Uppercase<H> extends H` selects chars that survive uppercasing (A-Z plus
 * digits/symbols), and excluding those that ALSO survive lowercasing
 * (digits/symbols) leaves only true uppercase letters — without maintaining
 * a hand-written A-Z list.
 */
export type IsStartWithCapitalizedLetter<T> = T extends `${infer H}${infer _}`
  ? H extends Uppercase<H>
    ? H extends Lowercase<H>
      ? never
      : T
    : never
  : never