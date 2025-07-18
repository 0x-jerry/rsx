import {
  isRef,
  type ReactiveEffectRunner,
  type Ref,
  stop,
} from '@vue/reactivity'
import clsx, { type ClassValue } from 'clsx'
import { updateEl } from '@/nodeOp'
import { effect } from '@/reactivity'
import { warn } from '@/utils'
import type { AnyProps } from '../props'
import { BaseNode, NodeType, normalizeNodes } from './shared'

export class NativeNode extends BaseNode {
  static is(o: unknown): o is NativeNode {
    return o instanceof NativeNode
  }

  readonly type = NodeType.Native

  tag: string

  ref?: Ref

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

    this.cleanup = bindingProperties(this)

    if (this.children) {
      for (const child of this.children) {
        child.initialize()
      }
    }
  }
}

function bindingProperties(node: NativeNode) {
  const props = node.props
  const el = node.el!

  const effects: ReactiveEffectRunner[] = []
  const previousProps = new Map()

  for (const key in props) {
    const runner = effect(() => {
      const value = convertAttrValue(key, props[key])

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
  type: string,
  props?: AnyProps,
  children?: unknown[],
) {
  const node = new NativeNode(type)

  if (children?.length) {
    node.children = normalizeNodes(children)
  }

  const { ref, ...otherProps } = props || {}

  node.props = otherProps

  if (ref != null) {
    if (isRef(ref)) {
      node.ref = ref
    } else {
      warn(`ref prop is not reactive!`)
    }
  }

  return node
}
