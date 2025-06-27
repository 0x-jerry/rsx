import type { FunctionalComponent } from '../defineComponent'
import { createDynamicNode } from '../dynamicNode'
import { onBeforeMount, onBeforeUnmount, onMounted, useContext } from '../hook'
import { normalizeNode } from '../node'
import { insertBefore } from '../nodeOp'

export const Fragment: FunctionalComponent = (_, children) => {
  const el = createDynamicNode('fragment')

  const _children: ChildNode[] = []
  const ctx = useContext()

  console.log('fragment ctx:', ctx.id)

  onBeforeMount(() => {
    console.log('before mount', ctx.id)
    children?.forEach((child) => {
      const node = normalizeNode(child)
      if (node) {
        _children.push(node)

        insertBefore(el, child)
      }
    })
  })

  onMounted(() => {
    console.log('mounted', ctx.id)
  })

  el.addEventListener('moved', () => {
    _children.forEach((child) => {
      insertBefore(el, child)
    })
  })

  onBeforeUnmount(() => {
    _children.forEach((child) => child.remove())
  })

  return el
}
