import { isObject } from '@0x-jerry/utils'
import { AnyProps } from '../props'

export const AnyNodeSymbol = Symbol('AnyNode')
export type AnyNodeSymbol = typeof AnyNodeSymbol

export enum AnyNodeType {
  Native = 1,
  Component = 2,
}

export interface AnyNode {
  [AnyNodeSymbol]: AnyNodeType
  props?: AnyProps
  children?: AnyNode[]
}

export function isAnyNode(node: unknown): node is AnyNode {
  return isObject(node) && AnyNodeSymbol in node
}
