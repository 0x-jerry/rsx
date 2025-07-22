import { onMounted, onUnmounted } from '@/hook'
import { $, defineComponent, ref, useExpose } from '@/index'
import { defineNamedSlot, useSlot } from '@/Slot'
import { useClickOutside } from '../hooks/useClickOutside'
import { useTimeout } from '../hooks/useTimeout'
import { FloatingUI, type FloatingUIOption } from './FloatingUI'
import styles from './Tooltip.module.css'

export enum TooltipTriggerType {
  Click = 'click',
  Hover = 'hover',
}

export interface TooltipInstance extends FloatingUI {}

export interface TooltipProps extends FloatingUIOption {
  /**
   * @default 'hover'
   */
  trigger?: `${TooltipTriggerType}`
  delay?: number
}

const TooltipImpl = defineComponent<TooltipProps>((props, children) => {
  const ContentChildren = useSlot(Tooltip.Content)

  const fui = new FloatingUI()
  const referenceEl = ref<HTMLElement>()
  const contentEl = ref<HTMLElement>()

  fui.onClasses = [styles.show]
  fui.option = {
    fitWidth: props.fitWidth,
  }

  const hideHandler = useTimeout(
    fui.hide,
    $(() => props.delay ?? 100),
  )

  useExpose(fui)

  onMounted(async () => {
    // biome-ignore lint/style/noNonNullAssertion: confirm it exists
    fui.init(referenceEl.value!, contentEl.value!)
  })

  onUnmounted(() => {
    fui.destroy()
  })

  const Reference = (
    <div
      ref={referenceEl}
      class={styles.reference}
      aria-describedby="tooltip"
      onClick={toggleTooltip}
      onMouseenter={showTooltip}
      onMouseleave={hideTooltip}
    >
      {children}
    </div>
  )

  const TooltipContent = (
    <div
      ref={contentEl}
      class={styles.tooltip}
      role="tooltip"
      onMouseenter={showTooltip}
      onMouseleave={hideTooltip}
    >
      <ContentChildren />
    </div>
  )

  useClickOutside([referenceEl, contentEl], () => {
    fui.hide()
  })

  return (
    <>
      {Reference}
      {TooltipContent}
    </>
  )

  function toggleTooltip() {
    if (props.trigger !== TooltipTriggerType.Click) {
      return
    }

    fui.toggle()
  }

  function showTooltip(event: Event) {
    if (event.target !== event.currentTarget) {
      return
    }

    if (props.trigger && props.trigger !== TooltipTriggerType.Hover) {
      return
    }

    hideHandler.stop()
    fui.show()
  }

  async function hideTooltip(event: Event) {
    if (event.target !== event.currentTarget) {
      return
    }

    if (props.trigger && props.trigger !== TooltipTriggerType.Hover) {
      return
    }

    hideHandler.restart()
  }
})

export const Tooltip = Object.assign(TooltipImpl, {
  Content: defineNamedSlot('Tooltip.Content'),
})
