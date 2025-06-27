# 内置组件

内置一些特殊的组件。

> 注意，任何动态渲染（动态调整页面 Dom 结构）操作，都需要通过 FunctionalComponent 来实现，否则会
> 造成内存泄漏

## Case 组件

```ts
type CaseComponent = FunctionalComponent<{
  condition: JsonPrimitive;
  cases?: Record<string, FunctionalComponent>;
}>;
```

## Map 组件

```ts
type MapComponent<T> = FunctionalComponent<{
  list: T[];
  render: FunctionalComponent<{ item: T; index: number }>;
}>;
```

## Teleport 组件

```ts
type MapComponent<T> = FunctionalComponent<{
  to: string | HTMLElement;
}>;
```
