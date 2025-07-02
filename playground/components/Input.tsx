import { $, dc, toBindingRefs } from '@/index'
import type { CommonProps } from './utils'

export interface InputProps extends CommonProps {
  $value?: string | number
}

export const Input = dc<InputProps>((props) => {
  const { class: _class, value, ...rest } = toBindingRefs(props)

  const classes = $(() => ['input', _class?.value])

  return (
    <input
      {...rest}
      class={classes}
      value={value}
      onInput={handleChangeEvent}
    />
  )

  function handleChangeEvent(event: Event) {
    const el = event.target as HTMLInputElement

    props.onUpdateValue?.(el.value)
  }
})
