import { VElement, VNode } from 'million'

export type DefineComponent = (props: any, children: any[]) => () => VElement

export type JSXFC = (props: { parent?: any } | null | undefined, ...children: any[]) => JSX.Element
