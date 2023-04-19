import { DElement } from '../src/core'
import { NativeElements } from './jsx'

declare global {
  namespace JSX {
    interface Element extends DElement {}

    interface ElementAttributesProperty {
      [key: string]: any
      props: {}
    }

    interface ElementChildrenAttribute {
      [key: string]: any
      children: {}
    }

    interface IntrinsicAttributes {}
    interface IntrinsicClassAttributes<TT> {}

    interface IntrinsicElements extends NativeElements {
      [name: string]: any
    }
  }
}
