import { $, dc, toBindingRefs } from '@/index'
import styles from './Button.module.css'
import type { CommonProps } from './utils'

export interface ButtonProps extends CommonProps {
  type?: 'link'
  onClick?: (event: MouseEvent) => void
}

export const Button = dc<ButtonProps>((props, children) => {
  const { class: _class, type, ...rest } = toBindingRefs(props)

  const classes = $(() => [
    styles.btn,
    _class?.value,
    type?.value === 'link' && styles.btnLink,
  ])

  return (
    <button {...rest} class={classes}>
      {children}
    </button>
  )
})
