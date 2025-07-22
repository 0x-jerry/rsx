import type { NodeElement, NodeType } from './shared'

export abstract class BaseNode {
  abstract readonly type: NodeType

  children?: NodeElement[]

  /**
   * This function will:
   *
   * 1. Binding properties
   * 2. Generate context
   * 3. Create DOM element
   *
   */
  abstract initialize(): void
}
