import { $, toBindingRefs } from './bindingRef'

describe('binding ref', () => {
  it('writeable binding', () => {
    const data = {
      a: 1,
    }
    const a = $(data, 'a')

    expect(a.value).toBe(1)
    a.value = 2
    expect(data.a).toBe(2)
  })

  it('readonly binding', () => {
    const data = {
      a: 1,
    }
    const a = $(() => data.a)

    expect(a.value).toBe(1)
    a.value = 2
    expect(data.a).toBe(1)
  })

  it('toBindingRefs', () => {
    const data = {
      a: 1,
      b: '1',
      c: false,
    }

    const { a, b, c } = toBindingRefs(data)

    expect(a.value).toBe(1)
    expect(b.value).toBe('1')
    expect(c.value).toBe(false)

    a.value = 2
    b.value = '2'
    c.value = true

    expect(a.value).toBe(2)
    expect(b.value).toBe('2')
    expect(c.value).toBe(true)
  })
})
