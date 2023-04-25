import { renderToString } from './op'
import { dc } from './defineComponent'
import { h } from './jsx'

describe('ssr', () => {
  it('should render as string', () => {
    const Comp = dc(() => {
      return h('div', { class: 'test' }, 'hello world!')
    })

    const str = renderToString(h(Comp))
    expect(str).toMatchFileSnapshot('test/renderToString.html')
  })
})
