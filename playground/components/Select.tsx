import {
  $,
  type DefineProps,
  defineComponent,
  type MapItemComponent,
  type MapItemProps,
  signal,
  toBindingRefs,
  VMap,
} from '../../src'
import type { MaybeRef } from '../../src'
import styles from './Select.module.css'
import { Tooltip, type TooltipInstance, TooltipTriggerType } from './Tooltip'
import type { CommonProps } from './utils'

const Option = defineComponent(OptionImpl)

type OptionValue = string | number | boolean | undefined | null

export interface OptionItem<T extends OptionValue> {
  value: T
  label: string
}

export type SelectOptionComponent<T extends OptionValue> = MapItemComponent<OptionItem<T>>

export interface SelectProps<Value extends OptionValue> extends CommonProps {
  $value?: MaybeRef<Value>
  options: OptionItem<Value>[]
  Option?: SelectOptionComponent<Value>
}

function SelectImpl<T extends OptionValue>(props: DefineProps<SelectProps<T>>) {
  const { options } = toBindingRefs(props)

  const tooltip = signal<TooltipInstance>()

  const Options = () => (
    <VMap
      list={options}
      render={(itemProps) => {
        const OptionComponent = (props.Option ?? OptionImpl) as typeof Option

        return (
          <div class={styles.optionWrapper} onClick={() => handleChange(itemProps.item)}>
            <OptionComponent {...toBindingRefs(itemProps)} />
          </div>
        )
      }}
    />
  )

  return (
    <Tooltip ref={tooltip} fitWidth={true} trigger={TooltipTriggerType.Click}>
      <div class={styles.select}>
        <div class={styles.placeholder}>{$(() => props.value)}</div>
      </div>
      <Tooltip.Content>
        <Options />
      </Tooltip.Content>
    </Tooltip>
  )

  function handleChange(item: OptionItem<T>) {
    props.onUpdateValue?.(item.value)

    tooltip()?.toggle()
  }
}

export const Select = defineComponent(SelectImpl)

interface OptionProps<T extends OptionValue> extends MapItemProps<OptionItem<T>> {}

function OptionImpl<T extends OptionValue>(props: OptionProps<T>) {
  return (
    <div class={styles.option} value={$(() => props.item.value)} role="option">
      {$(() => props.item.label)}
    </div>
  )
}
