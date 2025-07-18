import { isRef, type ReactiveEffectRunner, stop, unref } from '@vue/reactivity'
import { effect } from '@/reactivity'
import { warn } from '@/utils'
import { BaseNode, NodeType } from './shared'

export class TextNode extends BaseNode {
  static is(o: unknown): o is TextNode {
    return o instanceof TextNode
  }

  readonly type = NodeType.Text

  content?: unknown

  el?: Text

  effects?: ReactiveEffectRunner

  _initialized = false

  initialize(): void {
    if (this._initialized) {
      warn(`This text node has initialized`)
      return
    }

    this._initialized = true

    if (this.content == null) {
      return
    }

    this.el = document.createTextNode(String(unref(this.content)))

    if (isRef(this.content)) {
      const runner = effect(() => {
        this.el!.textContent = String(unref(this.content))
      })

      this.effects = runner
    }
  }

  /**
   * todo, this must be called
   */
  cleanup() {
    if (this.effects) {
      stop(this.effects)
    }
  }
}

export function createTextNode(content?: unknown) {
  const node = new TextNode()
  node.content = content

  return node
}
