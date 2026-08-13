import { signal } from '.'
import { $, toBindingRefs } from './bindingRef'

describe('binding ref', () => {
  it('writeable binding', () => {
    const data = {
      a: 1,
    }
    const a = $(data, 'a')

    expect(a()).toBe(1)
    a(2)
    expect(data.a).toBe(2)
  })

  it('readonly binding', () => {
    const data = {
      a: 1,
    }
    const a = $(() => data.a)

    expect(a()).toBe(1)
    a(2)
    expect(data.a).toBe(1)
  })

  it('binding ref data', () => {
    const data = signal({
      a: 1,
    })
    const a = $(data, 'a')

    expect(a()).toBe(1)
    a(2)
    expect(data().a).toBe(2)
  })

  it('binding signal write-through', () => {
    const data = signal('1')
    const a = $(data)

    expect(a()).toBe('1')
    a('2')
    expect(data()).toBe('2')
  })

  it('toBindingRefs', () => {
    const data = {
      a: 1,
      b: '1',
      c: false,
    }

    const { a, b, c } = toBindingRefs(data)

    expect(a()).toBe(1)
    expect(b()).toBe('1')
    expect(c()).toBe(false)

    a(2)
    b('2')
    c(true)

    expect(a()).toBe(2)
    expect(b()).toBe('2')
    expect(c()).toBe(true)
  })
})
