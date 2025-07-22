/** biome-ignore-all lint/style/noNonNullAssertion: test case */

import { dc } from './defineComponent'
import { useWatch } from './hook'
import { h } from './jsx'
import { ComponentNode } from './nodes/ComponentNode'
import { $, nextTick, ref } from './reactivity'
import { contextToJson, defineComponentName, mountTestApp } from './test'

describe('jsx', () => {
  it('component node', () => {
    const Comp = () => h('div', { class: 'test' })

    const node = h(Comp)

    expect(ComponentNode.is(node)).toBe(true)
  })

  it('should set props when create', () => {
    const Comp = () => h('div', { class: 'test' })

    const el = mountTestApp(Comp)

    expect(el.querySelector('.test')).instanceOf(HTMLDivElement)
  })

  it('should update ref props', async () => {
    const v = ref(0)

    const Comp = () => h('div', { 'data-x': v, class: 'test' })

    const el = mountTestApp(Comp)

    expect(el.querySelector('.test')?.getAttribute('data-x')).toBe('0')
    v.value++

    await nextTick()
    expect(el.querySelector('.test')?.getAttribute('data-x')).toBe('1')
  })

  it('should set event listener when create', () => {
    const fn = vi.fn()

    const Comp = () => h('div', { onClick: fn, class: 'test' })

    const el = mountTestApp(Comp).querySelector('.test')

    el?.dispatchEvent(new Event('click'))
    el?.dispatchEvent(new Event('click'))
    expect(fn).toBeCalledTimes(2)
  })

  describe('handle $ binding prop', () => {
    it('should handle $ prop on input[text] element', () => {
      const v = ref('123')

      const Comp = () => h('input', { $: v })

      const el = mountTestApp(Comp).querySelector('input')!

      expect(el.value).toBe('123')

      el.value = '12344'
      expect(v.value).toBe('123')

      el.dispatchEvent(new Event('input'))
      expect(v.value).toBe('12344')
    })

    it('should handle $ prop on input[checkbox] element', () => {
      const v = ref(true)

      const Comp = () => h('input', { type: 'checkbox', $: v })

      const el = mountTestApp(Comp).querySelector('input')!

      expect(el.checked).toBe(true)

      el.checked = false
      expect(v.value).toBe(true)

      el.dispatchEvent(new Event('change'))
      expect(v.value).toBe(false)
    })

    it('should handle $ prop on select element', () => {
      const v = ref('1')

      const Comp = () => (
        <select $={v}>
          <option value="1"></option>
          <option value="2"></option>
        </select>
      )

      const el = mountTestApp(Comp).querySelector('select')!

      el.value = '2'
      expect(v.value).toBe('1')

      el.dispatchEvent(new Event('change'))
      expect(v.value).toBe('2')
    })
  })

  it('should render as text node', async () => {
    const v = ref('hello')

    const Comp = () => h('div', {}, v)

    const el = mountTestApp(Comp)

    const text = el.firstChild!.childNodes.item(0)
    expect(text).instanceOf(Text)
    expect(text.textContent).toBe('hello')

    v.value = 'world'
    expect(text.textContent).toBe('hello')
    await nextTick()
    expect(text.textContent).toBe('world')
  })

  it('should not allowed to change props directly', async () => {
    type Props = {
      $v: string
    }

    const Comp = dc<Props>((props) => {
      // should not work
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

    const el = mountTestApp(() => h(Comp, props)).firstChild!

    expect(el.textContent).toBe('1')
    expect(props.v.value).toBe('1')

    el.dispatchEvent(new Event('click'))

    expect(props.v.value).toBe('123')
    expect(el.textContent).toBe('1')
    await nextTick()
    expect(el.textContent).toBe('123')
  })

  it('should remain reactive when passing a ref value', async () => {
    type Props = {
      v: number
    }

    const fn = vi.fn()

    const Comp = dc<Props>((props) => {
      useWatch(() => props.v, fn)

      return h('div')
    })

    const props = {
      v: ref(1),
      x: 1,
    }

    mountTestApp(() => h(Comp, props))

    await nextTick()
    expect(fn).toBeCalledTimes(0)

    props.v.value++
    await nextTick()
    expect(fn).toBeCalledTimes(1)
  })
})

describe('jsx context tree', () => {
  it('context tree', () => {
    const A = dc((_, children) => (
      <div class="A">
        <span>a</span>
        {children}
      </div>
    ))

    defineComponentName(A, 'A')

    const B = dc((_, children) => (
      <div class="B">
        <span>b</span>
        {children}
      </div>
    ))

    defineComponentName(B, 'B')

    const App = dc(() => (
      <A>
        <span>1</span>
        <B>
          <span>2</span>
          <A></A>
        </B>
        <A></A>
        <span>3</span>
      </A>
    ))

    defineComponentName(App, 'App')

    const root = mountTestApp(App)

    expect(root).toMatchSnapshot('html')

    const ctxTree = contextToJson(root._.context)

    expect(ctxTree).toMatchSnapshot('ctx tree')
  })

  it('instance Component inside Component', () => {
    const A = dc((_, children) => (
      <div class="A">
        <span>a</span>
        {children}
      </div>
    ))

    defineComponentName(A, 'A')

    const B = dc((_, children) => (
      <div class="B">
        <span>b</span>
        {children}
      </div>
    ))

    defineComponentName(B, 'B')

    const App = dc(() => {
      const InstanceA = (
        <div>
          <A></A>
        </div>
      )

      return (
        <A>
          <B>{InstanceA}</B>
          <A></A>
        </A>
      )
    })

    defineComponentName(App, 'App')

    const root = mountTestApp(App)

    expect(root).toMatchSnapshot('html')

    const ctxTree = contextToJson(root._.context)

    expect(ctxTree).toMatchSnapshot('ctx tree')
  })
})
