import { ref } from '@vue/reactivity'
import { h } from './jsx'
import { nextTick } from './scheduler'
import { $ } from './reactivity'
import { dc } from './defineComponent'

describe('jsx', () => {
  it('should return dom element', () => {
    const el = h('div')

    expect(el).instanceof(HTMLElement)
  })

  it('should set props when create', () => {
    const Comp = () => h('div', { class: 'test' })

    const el = h(Comp) as HTMLDivElement

    expect(el.classList.contains('test')).toBe(true)
  })

  it('should update ref props', async () => {
    const v = ref(0)

    const Comp = () => h('div', { 'data-x': v })

    const el = h(Comp) as HTMLDivElement

    expect(el.getAttribute('data-x')).toBe('0')
    v.value++

    await nextTick()
    expect(el.getAttribute('data-x')).toBe('1')
  })

  it('should set event listener when create', () => {
    const fn = vi.fn()

    const Comp = () => h('div', { onClick: fn })

    const el = h(Comp) as HTMLDivElement

    el.click()
    el.click()
    expect(fn).toBeCalledTimes(2)
  })

  describe('handle $ binding prop', () => {
    it('should handle $ prop on input[text] element', () => {
      const v = ref('123')

      const Comp = () => h('input', { $: v })

      const el = h(Comp) as HTMLInputElement

      expect(el.value).toBe('123')

      el.value = '12344'
      expect(v.value).toBe('123')

      el.dispatchEvent(new Event('input'))
      expect(v.value).toBe('12344')
    })

    it('should handle $ prop on input[checkbox] element', () => {
      const v = ref(true)

      const Comp = () => h('input', { type: 'checkbox', $: v })

      const el = h(Comp) as HTMLInputElement

      expect(el.checked).toBe(true)

      el.checked = false
      expect(v.value).toBe(true)

      el.dispatchEvent(new Event('change'))
      expect(v.value).toBe(false)
    })

    it('should handle $ prop on select element', () => {
      const v = ref('123')

      const Comp = () => h('input', { $: v })

      const el = h(Comp) as HTMLInputElement

      el.value = '12344'
      expect(v.value).toBe('123')

      el.dispatchEvent(new Event('input'))
      expect(v.value).toBe('12344')
    })
  })

  it('should work without context when render non-reactive props', () => {
    const el = h('div', { class: 'test' }) as HTMLDivElement

    expect(el.classList.contains('test')).toBe(true)
  })

  it('should only work with context when render reactive props', () => {
    let hasError = vi.fn()

    try {
      const cls = ref('test')

      h('div', { class: cls })
    } catch (error) {
      // fixme, error check
      // this should only used inside a context
      hasError()
    }

    expect(hasError).toBeCalledTimes(1)
  })

  it('should render as text node', async () => {
    const v = ref('hello')

    const Comp = () => h('div', {}, v)

    const el = h(Comp) as HTMLDivElement

    const text = el.childNodes.item(0)
    expect(text).instanceOf(Text)
    expect(text.textContent).toBe('hello')

    v.value = 'world'
    expect(text.textContent).toBe('hello')
    await nextTick()
    expect(text.textContent).toBe('world')
  })

  it('should not allow change props directly', async () => {
    type Props = {
      $v: string
    }

    const Comp = dc<Props>((props) => {
      // should not working
      props.v = '123'

      return h(
        'div',
        {
          onClick() {
            props.onUpdateV?.('123')
          },
        },
        $(props, 'v'),
      )
    })

    const props = {
      v: ref('1'),
      onUpdateV(v: string) {
        props.v.value = v
      },
    }

    const el = h(Comp, props)

    expect(el.textContent).toBe('1')
    expect(props.v.value).toBe('1')

    el.dispatchEvent(new Event('click'))

    expect(props.v.value).toBe('123')
    await nextTick()
    expect(el.textContent).toBe('123')
  })
})
