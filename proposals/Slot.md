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

**另一个坑**：在用虚拟 DOM 重写之后，基础的多实例用法可以支持，但是仅支持传递给组件，无法支持如下写法：

```tsx
<A>
  <A.Default>
    <B counter={$(A.Default.data, "count")} />
  </A.Default>
</A>
```

上述例子中的 `A.Default.data` 无法通过运行时进行检测到，因此无法复制。之前的写法：

```tsx
<A>
  <A.Default>
    <B counter={A.Default.count} />
  </A.Default>
</A>
```

因为是挂在组件上的 Prop， 因此可以由框架检测并修改复制。

看来复制 Slot 还需要再多多考虑一下。

**另一种方案**：现在尝试修改 jsx 编译器，尝试把 Function Component 下的 children 编译成函数，示例如下：

```tsx
<A>
  <A.Default>
    <div>
      <button onClick={() => console.log($A_Default.cont)} />
    </div>
  </A.Default>
</A>
```

编译成；

```ts
h(A, null, () => [
  h(A.Default, null, ($A_Default) =>
    h(
      "div",
      null,
      h(button, {
        onClick: () => console.log($A_Default.count),
      })
    )
  ),
]);
```

只要是大写开头的 JSX name 就认为是 Functional Component。

不过这样会引发一个 Typescript 类型的问题，`$A_Default` 会提示未定义，但实际在运行时的时候，会定义
成参数。这样的话，还需要写一个 TypeScript 插件，注入运行时的参数定义，TypeScript 这一步可以后面再
处理，先验证编译 jsx 是否可行。

**又一种方案**，在实现上述方案的过程中，我准备参考 vue-jsx 的实现，发现其实现 slot 是通过运行时来的，
写法如下：

```tsx
// default
const A = () => <MyComponent>{() => "hello"}</MyComponent>;

// named
const B = () => (
  <MyComponent>
    {{
      default: () => "default slot",
      foo: () => <div>foo</div>,
      bar: () => [<span>one</span>, <span>two</span>],
    }}
  </MyComponent>
);
```

因此，我准备也通过运行时支持，但是修改其写法，优化的写法提案如下：

```tsx
// default
const A = () => <MyComponent>{MyComponent.default(() => "hello")}</MyComponent>;

// named
const B = () => (
  <MyComponent>
    {MyComponent.default(() => "default slot")}
    {MyComponent.foo(() => (
      <div>foo</div>
    ))}
    {MyComponent.bar(() => [<span>one</span>, <span>two</span>])}
  </MyComponent>
);
```

这种写法的好处是直接提供了 Slot 的类型，但是需要额外的组件定义申明。

## 最终实现方案

目前，RSX 支持两种 Slot 写法，分别为静态 Slot 和 动态 Slot。

### 静态(Static) Slot

这种写法不支持参数，因此写法和普通 JSX 差不多，示例：

```tsx
<A>
  <A.Default>slot content</A.Default>
</A>
```

### 动态(Dynamic) Slot

此种写法是为了支持 Slot 参数，示例：

```tsx
<A>
  {A.Default((props) => (
    <>content {$(() => props.count)}</>
  ))}
</A>
```

如果同时存在静态 Slot 和动态 Slot，会优先用动态 Slot，忽略静态 Slot。
静态 Slot 支持多次声明，会自动按照顺序合并。动态 Slot 仅支持第一次声明。

## 再次思考虚拟 DOM

通过最终方案来看，其实现方案从逻辑上来讲，不需要虚拟 DOM，后续可尝试在去虚拟 DOM 的框架上再实现一遍。
