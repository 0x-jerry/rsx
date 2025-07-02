import { $, dc, toBindingRefs } from '@/index'
import type { CommonProps } from './utils'
import './Button.scss'

export interface ButtonProps extends CommonProps {
  type?: 'link'
  onClick?: (event: MouseEvent) => void
}

export const Button = dc<ButtonProps>((props, children) => {
  const { class: _class, type, ...rest } = toBindingRefs(props)

  const classes = $(() => [
    'btn',
    _class?.value,
    type?.value === 'link' && 'btn-link',
  ])

  return (
    <button {...rest} class={classes}>
      {children}
    </button>
  )
})
