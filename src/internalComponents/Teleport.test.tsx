import { onMounted } from '@/hook'
import { nextTick, ref } from '@/reactivity'
import { dc } from '../defineComponent'
import { mountTestApp } from '../test'
import { Teleport } from './Teleport'

describe('Teleport', () => {
  it('non-reactivity data', async () => {
    const A = () => (
      <div>
        <span>0</span>
        <div id="tp"></div>
      </div>
    )
    const App = dc(() => {
      return (
        <>
          <span>1</span>
          <A></A>
          <Teleport to="#tp">
            <span>2</span>
          </Teleport>
        </>
      )
    })

    const root = mountTestApp(App)

    expect(root.outerHTML).toMatchSnapshot()
  })

  it('reactivity data', async () => {
    const A = () => (
      <div>
        <span>0</span>
        <div id="tp"></div>
        <div id="tp2"></div>
      </div>
    )
    const App = dc(() => {
      const toValue = ref('#tp')

      onMounted(() => {
        toValue.value = '#tp2'
      })

      return (
        <>
          <span>1</span>
          <A></A>
          <Teleport to={toValue}>
            <span>2</span>
          </Teleport>
        </>
      )
    })

    const root = mountTestApp(App)
    await nextTick()

    expect(root.outerHTML).toMatchSnapshot()
  })

  it('container node is not exists', async () => {
    const A = () => (
      <div>
        <span>0</span>
        <div id="tp"></div>
        <div id="tp2"></div>
      </div>
    )
    const App = dc(() => {
      const toValue = ref('#tp')

      onMounted(() => {
        toValue.value = '#tp3'
      })

      return (
        <>
          <span>1</span>
          <A></A>
          <Teleport to={toValue}>
            <span>2</span>
          </Teleport>
        </>
      )
    })

    const root = mountTestApp(App)
    await nextTick()

    expect(root.outerHTML).toMatchSnapshot()
  })
})
