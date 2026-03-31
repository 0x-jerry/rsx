import {
  CaseOps,
  type ComponentNode,
  ComponentOps,
  FragmentOps,
  MapOps,
  TeleportOps,
} from '../internalComponents'
import type { InternalComponentOps } from './node'

const INTERNAL_COMPONENT_OPS: InternalComponentOps[] = [
  CaseOps,
  FragmentOps,
  MapOps,
  TeleportOps,
  // must be the last one
  ComponentOps,
]

export function getOps(node: ComponentNode) {
  return INTERNAL_COMPONENT_OPS.find((n) => n.is(node.type))
}
