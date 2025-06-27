import type { FunctionalComponent } from '../defineComponent'
import { createDynamicNode } from '../dynamicNode'
import { onBeforeMount, onBeforeUnmount } from '../hook'
import { moveChildren } from '../nodeOp'

export const Fragment: FunctionalComponent = (_, children) => {
  const el = createDynamicNode('fragment')

  onBeforeMount(() => {
    moveChildren(el.parentElement!, children, el)
  })

  el.addEventListener('moved', () => {
    moveChildren(el.parentElement!, children, el)
  })

  onBeforeUnmount(() => {
    children?.forEach((child) => child.remove())
  })

  return el
}
