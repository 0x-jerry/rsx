import { remove } from '@0x-jerry/utils'
import { isComponentNode } from '@/ComponentNode'
import { onMounted, onUnmounted } from '@/hook'
import {
  $,
  createNamedFragment,
  defineComponent,
  type ExposedFunctionalComponent,
  type FunctionalComponent,
} from '@/index'
import { useTimeout } from '../hooks/useTimeout'
import { FloatingUI, type FloatingUIOption } from './FloatingUI'
import styles from './Tooltip.module.css'

export interface TooltipProps extends FloatingUIOption {
  trigger?: 'hover'
  delay?: number
}

const TooltipImpl = defineComponent<TooltipProps>((props, children) => {
  const ContentChildren = getTooltipContents(children ?? [])

  const fui = new FloatingUI()
  fui.onClasses = [styles.show]
  fui.option = {
    fitWidth: props.fitWidth,
  }

  const hideHandler = useTimeout(
    fui.hide,
    $(() => props.delay ?? 100),
  )

  const Reference = (
    <div
      class={styles.reference}
      aria-describedby="tooltip"
      onMouseenter={showTooltip}
      onMouseleave={hideTooltip}
    >
      {children}
    </div>
  )

  const Content = (
    <div
      class={styles.tooltip}
      role="tooltip"
      onMouseenter={showTooltip}
      onMouseleave={hideTooltip}
    >
      {ContentChildren}
    </div>
  )

  onMounted(async () => {
    fui.init(Reference, Content)
  })

  onUnmounted(() => {
    fui.destroy()
  })

  return (
    <>
      {Reference}
      {Content}
    </>
  )

  function showTooltip(event: Event) {
    if (event.target !== event.currentTarget) {
      return
    }

    hideHandler.stop()
    fui.show()
  }

  async function hideTooltip(event: Event) {
    if (event.target !== event.currentTarget) {
      return
    }

    hideHandler.restart()
  }
})

export const Tooltip =
  TooltipImpl as ExposedFunctionalComponent<TooltipProps> & {
    Content: FunctionalComponent
  }

Tooltip.Content = createNamedFragment('Tooltip.Content')

function getTooltipContents(children: unknown[]) {
  const Contents = remove(
    children,
    (child) => isComponentNode(child) && child.type === Tooltip.Content,
  )

  return Contents
}
