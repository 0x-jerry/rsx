import {
  $,
  type DefineProps,
  defineComponent,
  type MapItemComponent,
  type MapItemProps,
  toBindingRefs,
  VMap,
} from '@/index'
import styles from './Select.module.css'
import { Tooltip } from './Tooltip'
import type { CommonProps } from './utils'

const Option = defineComponent(OptionImpl)

type OptionValue = string | number | boolean | undefined | null

export interface OptionItem<T extends OptionValue> {
  value: T
  label: string
}

export type SelectOptionComponent<T extends OptionValue> = MapItemComponent<
  OptionItem<T>
>

export interface SelectProps<Value extends OptionValue> extends CommonProps {
  $value?: Value
  options: OptionItem<Value>[]
  Option?: SelectOptionComponent<Value>
}

function SelectImpl<T extends OptionValue>(props: DefineProps<SelectProps<T>>) {
  const { options } = toBindingRefs(props)

  const Options = (
    <Tooltip.Content>
      <VMap
        list={options}
        render={(itemProps) => {
          const OptionComponent = (props.Option ?? OptionImpl) as typeof Option

          return (
            <div
              class={styles.optionWrapper}
              onClick={() => handleChange(itemProps.item)}
            >
              <OptionComponent {...toBindingRefs(itemProps)} />
            </div>
          )
        }}
      />
    </Tooltip.Content>
  )

  return (
    <Tooltip fitWidth={true}>
      <div class={styles.select}>
        <div class={styles.placeholder}>{$(() => props.value)}</div>
      </div>
      {Options}
    </Tooltip>
  )

  function handleChange(item: OptionItem<T>) {
    props.onUpdateValue?.(item.value)
  }
}

export const Select = defineComponent(SelectImpl)

interface OptionProps<T extends OptionValue>
  extends MapItemProps<OptionItem<T>> {}

function OptionImpl<T extends OptionValue>(props: OptionProps<T>) {
  return (
    <div class={styles.option} value={$(() => props.item.value)} role="option">
      {$(() => props.item.label)}
    </div>
  )
}
