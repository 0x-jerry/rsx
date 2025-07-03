export type { MaybeRef } from './reactivity'

export type IsStartWith<T, U extends string> = T extends `${U}${infer _}`
  ? T
  : never

export type IsStartWithCapitalizedLetter<T> = IsStartWith<
  T,
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
>
