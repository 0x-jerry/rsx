# 组件

本文介绍 RSX 组件的设计。RSX 组件包含三类：

1. 普通组件，跟节点为一个 DOM 节点
2. Fragment 组件，特殊组件
3. Headless 组件，无跟节点，主要用于维护上下文以及生命周期，但不渲染 DOM 节点

## 组件上下文

组件上下文，用于处理组件的生命周期，以及追踪其父/子组件

## 生命周期

mount -> mounted(hook) -> \[update\] -> unmount -> unmounted(hook)
