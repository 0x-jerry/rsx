import { DComponent } from '../src/core'
import { NativeElements } from './jsx'

declare global {
  namespace JSX {
    interface Element extends DComponent {}

    interface ElementAttributesProperty {
      [key: string]: any
      props: {}
    }

    interface ElementChildrenAttribute {
      [key: string]: any
    }

    interface IntrinsicAttributes {}
    interface IntrinsicClassAttributes<TT> {}

    interface IntrinsicElements extends NativeElements {
      [name: string]: any
    }
  }
}
