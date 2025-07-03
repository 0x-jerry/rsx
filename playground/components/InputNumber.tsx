import { $, dc, ref, toBindingRefs, useWatch } from '@/index'
import styles from './Input.module.css'
import type { CommonProps } from './utils'

export interface InputNumberProps extends CommonProps {
  $value?: number
}

export const InputNumber = dc<InputNumberProps>((props) => {
  const { class: _class, value: _, ...rest } = toBindingRefs(props)

  const classes = $(() => [styles.input, _class?.value])

  const rawValue = ref(String(props.value ?? ''))

  let ignoreWatchHandle = false

  useWatch(
    () => props.value,
    () => {
      if (ignoreWatchHandle) {
        return
      }

      updateValue(props.value)
    },
  )

  return (
    <input
      {...rest}
      class={classes}
      value={rawValue}
      onInput={handleInput}
      onBlur={handleBlur}
    />
  )

  function handleBlur(_event: Event) {
    const numValue = parseFloat(rawValue.value)
    updateValue(numValue)
  }

  async function handleInput(event: Event) {
    const el = event.target as HTMLInputElement

    if (!isValidNumberStr(el.value)) {
      el.value = rawValue.value
      return
    }

    ignoreWatchHandle = true
    updateValue(el.value)
    ignoreWatchHandle = false
  }

  function updateValue(inputValue?: string | number) {
    // console.warn('update', inputValue)

    if (inputValue == null) {
      rawValue.value = ''
      props.onUpdateValue?.(undefined)
      return
    }

    if (typeof inputValue === 'number') {
      if (Number.isNaN(inputValue)) {
        rawValue.value = ''
        props.onUpdateValue?.(undefined)
        return
      }

      rawValue.value = inputValue.toString()
      props.onUpdateValue?.(inputValue)
      return
    }

    if (!isValidNumberStr(inputValue)) {
      inputValue = parseFloat(inputValue).toString()
    }

    rawValue.value = inputValue

    let num = inputValue.length === 0 ? undefined : parseFloat(inputValue)
    num = Number.isNaN(num) ? undefined : num

    props.onUpdateValue?.(num)
  }
})

const ValidNumberRE = /^[+-]?(\d+)?\.?\d*$/

function isValidNumberStr(str?: string) {
  if (str == null) {
    return true
  }

  return ValidNumberRE.test(str)
}
