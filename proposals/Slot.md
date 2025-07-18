# Slot

由于 JSX 的数据流向是单向的，因此天然无法支持像 vue/svelte 的 slot 写法。
react 中的解决方案是把组件当作 prop 传递进去。

但本项目想探索一种写法形式类似 vue/svelte 的 slot 方式。

## Slot 写法形式剖析

在 Slot 的写法形式上传递数据本质上是一种标记。如：

`Counter.vue`:

```html
<template>
  <div>
    <slot :count="1" />
  </div>
</template>
```

`App.vue`

```html
<Counter>
  <template #default="{ count }"> {{ count }} </template>
</Counter>
```

上述中 `App.vue` 的 `count` 就可理解成一个标记，其代表的含义是 `Counter` 实例提供的一个数据。

那么，如果能一另外一种方式获取到 `Counter` 实例的数据，那么是否就可能实现类似的写法呢？

例如：

```tsx
const DefaultSlot = defineSlot(); // Pseudo Code

const Counter = () => {
  const Default = useSlot(DefaultSlot);

  return (
    <div>
      <Default count={1} />
    </div>
  );
};

const App = () => {
  return (
    <Counter>
      <DefaultSlot>{DefaultSlot.count}</DefaultSlot>
    </Counter>
  );
};
```

如果能实现通过某种方式，让 `DefaultSlot.count` 直接代理实例 `DefaultSlot` 的 `count` 值，
那么这种写法也就和 vue/svelte 的 slot 写法很类似了。

## 实现的阻碍

在实现的过程中，如果是单实例，挺好实现的。由于 `RSX` 的渲染方式，可以在渲染的过程中直接获取父级的
上下文，因此很容易就可以获取的对应实例的 Props，但是目前有一个限制，就是无法用多实例的 slot，例如：

```tsx
const DefaultSlot = defineSlot(); // Pseudo Code

const Counter = () => {
  const Default = useSlot(DefaultSlot);

  return (
    <div>
      <Default count={1} />
      <Default count={2} /> {/* 多实例 */}
    </div>
  );
};

const App = () => {
  return (
    <Counter>
      <DefaultSlot>{DefaultSlot.count}</DefaultSlot>
    </Counter>
  );
};
```

也是由于 `RSX` 的渲染机制，其 dom 节点只会在申明的时候创建一次，如果负责 dom 节点的话，
则会失去响应式。要解决这个问题，目前有两个方案：1、设计一种复制机制，2、延后初始化的过程。

### 复制节点

复制节点的难点：

由于渲染的实现方式，无法实现 1:1 的复制，仅能保证节点的 Props 和类型相同，无法确保节点
的 Children 一致，且无法处理动态节点（尚无方案）。

### 延后初始化的过程

这个方案需要重写渲染过程，具体实现还需要思考。
