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

## 实现
