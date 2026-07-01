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

const opsCache = new WeakMap<ComponentNode['type'], InternalComponentOps>()

export function getOps(node: ComponentNode) {
  const cached = opsCache.get(node.type)
  if (cached) return cached

  const ops = INTERNAL_COMPONENT_OPS.find((n) => n.is(node.type))
  if (ops) {
    opsCache.set(node.type, ops)
  }

  return ops
}
