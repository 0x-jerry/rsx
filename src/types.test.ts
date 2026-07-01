import type { IsStartWithCapitalizedLetter } from './types'
import { describe, expectTypeOf, it } from 'vitest'

// `IsStartWithCapitalizedLetter<T>` evaluates to `T` when T starts with A-Z,
// and `never` otherwise. Tests assert via `Equal`-style checks.

type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

describe('IsStartWithCapitalizedLetter', () => {
  it('accepts A-Z prefixes (incl. U-Z that the old hand-list missed)', () => {
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'Apple'>, 'Apple'>>().toEqualTypeOf<true>()
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'Url'>, 'Url'>>().toEqualTypeOf<true>()
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'Version'>, 'Version'>>().toEqualTypeOf<true>()
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'Window'>, 'Window'>>().toEqualTypeOf<true>()
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'Zoo'>, 'Zoo'>>().toEqualTypeOf<true>()
  })

  it('rejects lowercase prefixes', () => {
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'apple'>, 'apple'>>().toEqualTypeOf<false>()
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'url'>, 'url'>>().toEqualTypeOf<false>()
  })

  it('rejects digits and symbols (regression: a naive Uppercase<H> check would accept these)', () => {
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'1foo'>, '1foo'>>().toEqualTypeOf<false>()
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'_bar'>, '_bar'>>().toEqualTypeOf<false>()
    expectTypeOf<Equal<IsStartWithCapitalizedLetter<'$baz'>, '$baz'>>().toEqualTypeOf<false>()
  })
})