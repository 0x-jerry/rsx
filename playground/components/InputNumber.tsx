import { $, dc, signal, toBindingRefs, toValue, useWatch } from '../../src'
import type { MaybeRef } from '../../src'
import styles from './Input.module.css'
import type { CommonProps } from './utils'

export interface InputNumberProps extends CommonProps {
  $value?: MaybeRef<number>
}

export const InputNumber = dc<InputNumberProps>((props) => {
  const { class: _class, value: _, ...rest } = toBindingRefs(props)

  const classes = $(() => [styles.input, _class?.()])

  const rawValue = signal(String(toValue(props.value) ?? ''))

  let ignoreWatchHandle = false

  useWatch(
    () => toValue(props.value),
    () => {
      if (ignoreWatchHandle) {
        return
      }

      updateValue(toValue(props.value))
    },
  )

  return (
    <input {...rest} class={classes} value={rawValue} onInput={handleInput} onBlur={handleBlur} />
  )

  function handleBlur(_event: Event) {
    const numValue = parseFloat(rawValue())
    updateValue(numValue)
  }

  async function handleInput(event: Event) {
    const el = event.target as HTMLInputElement

    if (!isValidNumberStr(el.value)) {
      el.value = rawValue()
      return
    }

    ignoreWatchHandle = true
    updateValue(el.value)
    ignoreWatchHandle = false
  }

  function updateValue(inputValue?: string | number) {
    // console.warn('update', inputValue)

    if (inputValue == null) {
      rawValue('')
      props.onUpdateValue?.(undefined)
      return
    }

    if (typeof inputValue === 'number') {
      if (Number.isNaN(inputValue)) {
        rawValue('')
        props.onUpdateValue?.(undefined)
        return
      }

      rawValue(inputValue.toString())
      props.onUpdateValue?.(inputValue)
      return
    }

    if (!isValidNumberStr(inputValue)) {
      inputValue = parseFloat(inputValue).toString()
    }

    rawValue(inputValue)

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
