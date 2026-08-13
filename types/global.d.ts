import type { Signal } from '../src/reactivity'
import type { NativeElements } from './jsx'

declare global {
  namespace JSX {
    type Element = any

    interface ElementAttributesProperty {
      [key: string]: any
      props: {}
    }

    interface ElementChildrenAttribute {
      [key: string]: any
    }

    interface IntrinsicAttributes {
      ref?: Signal<any>
    }

    interface IntrinsicElements extends NativeElements {
      [name: string]: any
    }
  }
}
