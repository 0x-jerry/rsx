import { isFn } from '@0x-jerry/utils'
import { isRef, type ReactiveEffectRunner, stop } from '@vue/reactivity'
import clsx, { type ClassValue } from 'clsx'
import { moveTo, updateEl } from '@/nodeOp'
import { effect } from '@/reactivity'
import { warn } from '@/utils'
import { type AnyProps, normalizeProps } from '../props'
import { BaseNode } from './BaseNode'
import { type NodeRef, NodeType, normalizeNodes } from './shared'

export class NativeNode extends BaseNode {
  static is(o: unknown): o is NativeNode {
    return o instanceof NativeNode
  }

  readonly type = NodeType.Native

  tag: string

  ref?: NodeRef

  /**
   * raw props
   */
  props?: AnyProps

  effects?: ReactiveEffectRunner[]

  cleanup?: () => void

  el?: HTMLElement

  constructor(tag: string) {
    super()
    this.tag = tag.toLowerCase()
  }

  initialize(): void {
    this.el = document.createElement(this.tag)

    if (isFn(this.ref)) {
      this.ref(this.el)
    } else if (isRef(this.ref)) {
      this.ref.value = this.el
    }

    this.cleanup = bindingProperties(this)

    for (const child of this.children || []) {
      child.initialize()

      if (child.el) {
        moveTo(this.el, child.el)
      }
    }
  }
}

function bindingProperties(node: NativeNode) {
  const props = normalizeProps(node.tag, node.props)
  const el = node.el!

  const effects: ReactiveEffectRunner[] = []
  const previousProps = new Map()

  for (const key in props) {
    const runner = effect(() => {
      let value = props[key]
      value = convertAttrValue(key, value)

      const old = previousProps.get(key)

      if (value !== old) {
        updateEl(el, key, value, old)
        previousProps.set(key, value)
      }
    })

    // stop it when don't have active deps
    const hasDeps = 'deps' in runner.effect && runner.effect.deps
    if (hasDeps) {
      effects.push(runner)
    } else {
      stop(runner)
      previousProps.delete(key)
    }
  }

  if (effects.length) {
    return () => effects.forEach((item) => stop(item))
  }
}

function convertAttrValue(attr: string, value: unknown) {
  if (attr === 'class') {
    return clsx(value as ClassValue)
  }

  return value
}

export function createNativeNode(
  tag: string,
  props?: AnyProps,
  children?: unknown[],
) {
  const node = new NativeNode(tag)

  if (children?.length) {
    node.children = normalizeNodes(children)
  }

  const { ref, ...otherProps } = props || {}

  node.props = otherProps

  if (ref != null) {
    if (isRef(ref) || isFn(ref)) {
      node.ref = ref
    } else {
      warn(`ref prop is not reactive!`)
    }
  }

  return node
}
