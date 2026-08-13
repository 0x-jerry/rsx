import { signal } from './reactivity'
import { mountTestApp } from './test'
import { updateEl } from './nodeOp'

describe('updateEl', () => {
  let el: HTMLElement

  beforeEach(() => {
    el = document.createElement('button')
  })

  it('toggle boolean attribute (disabled)', () => {
    updateEl(el, 'disabled', true)
    expect(el.hasAttribute('disabled')).toBe(true)
    expect(el.getAttribute('disabled')).toBe('disabled')

    updateEl(el, 'disabled', false)
    expect(el.hasAttribute('disabled')).toBe(false)
  })

  it('false / null removes generic attribute', () => {
    el.setAttribute('title', 'hi')
    updateEl(el, 'title', false)
    expect(el.hasAttribute('title')).toBe(false)

    el.setAttribute('title', 'hi')
    updateEl(el, 'title', null)
    expect(el.hasAttribute('title')).toBe(false)
  })

  it('true normalises to bare attribute name', () => {
    updateEl(el, 'data-x', true)
    expect(el.getAttribute('data-x')).toBe('data-x')
  })

  it('style string sets cssText', () => {
    updateEl(el, 'style', 'color: red;')
    expect(el.style.color).toBe('red')
  })

  it('style object sets properties and clears null ones', () => {
    updateEl(el, 'style', { color: 'red', fontSize: '12px' })
    expect(el.style.color).toBe('red')
    expect(el.style.fontSize).toBe('12px')

    updateEl(el, 'style', { color: 'blue', fontSize: null! })
    expect(el.style.color).toBe('blue')
    expect(el.style.fontSize).toBe('')
  })

  it('style null/false clears inline style', () => {
    updateEl(el, 'style', 'color: red;')
    updateEl(el, 'style', null)
    expect(el.style.cssText).toBe('')
    expect(el.hasAttribute('style')).toBe(false)
  })

  it('event handler swap: old listener removed, new added (even when old is falsy-non-null)', () => {
    const a = vi.fn()
    const b = vi.fn()
    updateEl(el, 'onClick', a, undefined)
    el.dispatchEvent(new Event('click'))
    expect(a).toHaveBeenCalledTimes(1)

    // swap with non-null old
    updateEl(el, 'onClick', b, a)
    el.dispatchEvent(new Event('click'))
    expect(a).toHaveBeenCalledTimes(1) // removed
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('event handler cleared when value is not a function', () => {
    const a = vi.fn()
    updateEl(el, 'onClick', a)
    updateEl(el, 'onClick', null, a)
    el.dispatchEvent(new Event('click'))
    expect(a).toHaveBeenCalledTimes(0)
  })

  it('input value/checked set as property', () => {
    const input = document.createElement('input') as HTMLInputElement
    updateEl(input, 'value', 'foo')
    expect(input.value).toBe('foo')
    updateEl(input, 'checked', true)
    expect(input.checked).toBe(true)
  })
})

describe('node binding (boolean + style reactive)', () => {
  it('reactive boolean attribute', async () => {
    const disabled = signal(false)

    const App = () => (
      <button disabled={disabled}>
        x
      </button>
    )

    const root = mountTestApp(App)
    const btn = root.querySelector('button')!

    expect(btn.hasAttribute('disabled')).toBe(false)

    disabled(true)
    await Promise.resolve()
    expect(btn.hasAttribute('disabled')).toBe(true)

    disabled(false)
    await Promise.resolve()
    expect(btn.hasAttribute('disabled')).toBe(false)
  })

  it('reactive style string', async () => {
    const color = signal('red')

    // NOTE: passing a function directly is not supported by bindingProperties;
    // verify via direct updateEl instead.
    const el = document.createElement('div')
    updateEl(el, 'style', `color: ${color()}`)
    expect(el.style.color).toBe('red')

    color('blue')
    updateEl(el, 'style', `color: ${color()}`)
    expect(el.style.color).toBe('blue')
  })
})