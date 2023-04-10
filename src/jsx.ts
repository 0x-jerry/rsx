import { isString } from '@0x-jerry/utils'
import {
  DComponent,
  DNode,
  createFragment,
  createNativeElement,
  isDComponent,
} from './node'

type FunctionalComponent = (props?: any, children?: DNode[]) => DComponent

export function h(
  type: string | FunctionalComponent | DComponent,
  props?: Record<string, any>,
  ...children: DComponent[]
): DComponent {
  if (isDComponent(type)) {
    return type
  }

  if (!isString(type)) {
    return type(props, children)
  }

  return createNativeElement(type, props, children)
}

export const Fragment: FunctionalComponent = (_, children) => {
  return createFragment(children || [])
}

// export function vFor<T>(
//   list: MaybeRef<T[]>,
//   key: keyof T,
//   /**
//    * should return jsx
//    */
//   render: (item: T, idx: number) => any,
// ) {
//   const el = createTextEl('')

//   const u = createUpdater()

//   type ChildElement = VInternalElements & {
//     /**
//      * if should reuse
//      */
//     _r?: boolean
//   }

//   const key2el = new Map<string, ChildElement>()
//   const el2key = new Map<ChildElement, string>()

//   let renderedChildren: ChildElement[] = []

//   if (isRef(list)) {
//     u.updaters.push(() => {
//       const newList = unref(list).map((n, idx) => {
//         const keyValue = String(n[key])

//         if (key2el.has(keyValue)) {
//           const reuseEl = key2el.get(keyValue)!
//           reuseEl._r = true

//           return reuseEl
//         }

//         const el = render(n, idx) as VInternalElements & { _r?: boolean }

//         key2el.set(keyValue, el)
//         el2key.set(el, keyValue)

//         return el
//       })

//       for (const child of renderedChildren) {
//         child.remove()

//         if (child._r) {
//           // reset reuse flag
//           child._r = false
//           continue
//         }

//         // should delete
//         unmount(child)

//         const keyValue = el2key.get(child)!

//         el2key.delete(child)
//         key2el.delete(keyValue)
//       }

//       renderedChildren = newList

//       // re-render all items
//       newList.forEach((item) => {
//         el.parentElement?.insertBefore(item, el)
//       })
//     })
//   }

//   // should waiting `el` to append to it's parent
//   Promise.resolve().then(() => u.run())

//   el.addEventListener('unmount', u.stop)

//   return el
// }
