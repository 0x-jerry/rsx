namespace JSX {
  interface Element {}

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

  interface IntrinsicElements {
    [name: string]: any
  }
}
