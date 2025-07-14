import type { EmptyObject } from '@0x-jerry/utils'
import {
  autoPlacement,
  autoUpdate,
  computePosition,
  type Middleware,
  offset,
  shift,
} from '@floating-ui/dom'

export interface FloatingUIOption {
  fitWidth?: boolean
}

export class FloatingUI {
  _reference!: HTMLElement
  _content!: HTMLElement

  visible = false

  _autoUpdateCleanupHandle?: () => void

  onClasses: string[] = []

  middlewares: Middleware[] = []

  option?: FloatingUIOption

  async init(reference: HTMLElement, content: HTMLElement) {
    this._reference = reference
    this._content = content

    this.update()
  }

  show = () => {
    if (this.visible) {
      return
    }

    this.visible = true

    this._content.classList.add(...this.onClasses)

    this._autoUpdateCleanupHandle = autoUpdate(
      this._reference,
      this._content,
      this.update,
    )
  }

  hide = () => {
    if (!this.visible) {
      return
    }

    this.visible = false

    this._content.classList.remove(...this.onClasses)

    this._autoUpdateCleanupHandle?.()
    this._autoUpdateCleanupHandle = undefined
  }

  toggle = () => {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  update = async () => {
    if (!this.visible) {
      return
    }

    const posIns = await computePosition(this._reference, this._content, {
      strategy: 'fixed',
      middleware: [
        autoPlacement(),
        shift({ padding: 5 }),
        offset(5),
        updateStyle({ fitWidth: this.option?.fitWidth }),
      ],
    })

    Object.assign(this._content.style, {
      left: `${posIns.x}px`,
      top: `${posIns.y}px`,
    })
  }

  destroy() {
    this._autoUpdateCleanupHandle?.()
  }
}

const updateStyle = (opt?: { fitWidth?: boolean }) => {
  const middleware: Middleware = {
    name: 'updateStyle',
    options: opt,
    fn(state) {
      const { floating, reference } = state.elements
      const width = reference.getBoundingClientRect().width

      Object.assign(floating.style, {
        left: `${state.x}px`,
        top: `${state.y}px`,
      })

      if (opt?.fitWidth) {
        Object.assign(floating.style, {
          width: `${width}px`,
        })
      }

      return {}
    },
  }

  return middleware
}

declare module '@floating-ui/dom' {
  interface MiddlewareData {
    updateStyle?: EmptyObject
  }
}
