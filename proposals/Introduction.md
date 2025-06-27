# 简介

[JSX 是由 React 团队推出的一种语法][jsx]，可将其看作为一种语法糖。

其逻辑是将

```jsx
const Comp = () => <div />;

const el = (
  <div class="text-red">
    <Comp>child</Comp>
    <span> some text </span>
  </div>
);
```

这样一段 jsx 代码转换成这样一段 js 代码

```js
const el = h(
  "div",
  { class: "text-red" },
  h(Comp, null, "child"),
  h("span", null, "some text")
);
```

其中 `h` 函数的签名为

```ts
function h(
  type: string | Component,
  props?: Record<string, any>,
  ...children: any[]
): JSX.Element;
```

目前（2023.04.21），利用 jsx 语法的库/框架，都是生成一颗虚拟 dom，然后通过 diff 去操作真实的 dom。

因此，此项目用于尝试是否可以利用 jsx 直接生成真实 dom，然后直接操作真实 dom，从而去除虚拟 dom 这一层。

## 参考 Vue

Vue 整个框架都是构建在响应式之上的，其易用性也得益于此，还有其 SFC 语法，也非常便利。

Vue 的更新逻辑：得益于其自动依赖收集的算法，render 函数中引用的数据更新之后，会自动触发更新逻辑。
执行一次 render 函数，获取到虚拟 dom，diff 不同的部分，然后应用到对应的 dom 节点。

值得一提的是，Vue 的 SFC 在编译的过程中，会分析 template 中节点的类型，如果是静态节点，则不会重复生产对应的虚拟 dom。

## 参考 React

React 的 JSX， 更易于组合，对于高阶组件，更方便。不过，其 Hooks 却是很有违常规设计，心智负担较重。其不可变的数据模式，也不太方便快速开发。

react 的更新逻辑：在 setState 函数调用之后，执行一次 render 函数，获取虚拟 dom， diff，然后 patch。

## 参考 Svelte

Svelte 使用了自己的单文件 `.svelte` 写法，利用编译技术，在编译时，分析 `.svelte` 文件，直接生成 dom 相关代码（随着`.svelte` 文件变多，生成的代码则会越多），从而去掉虚拟 dom 这一层。

其更新过程，使用 dirty 检测，做到了只更新最小部分，且不需要 diff。列表渲染除外，

## 关于列表渲染

Vue/Rect/Svelte 都各自使用了 diff 算法来更新列表（仅限带有 key 的列表，无 key 的列表都是全量更新），分别位于

- [Vue](https://github.com/vuejs/core/blob/2d9f6f926453c46f542789927bcd30d15da9c24b/packages/runtime-core/src/renderer.ts#L1753)
- [React](https://github.com/facebook/react/blob/967d46c76cf9f7f35cf659a6a47c9ad456c685a8/packages/react-reconciler/src/ReactChildFiber.js#L835)
- [Svelte](https://github.com/sveltejs/svelte/blob/6ba2f722518b3fb6904d6d566c3c1a00d61fe70a/src/runtime/internal/keyed_each.ts#L25)

## 此项目的逻辑

在参考 vue/react 之后，此项目尝试，直接生成 dom 节点，之后所有的修改都直接基于真实 dom 做出对应操作。而不是重复生成虚拟 dom， 然后 diff， 再 patch 的过程。

更新的过程，则尝试利用 vue 响应式的依赖自动收集逻辑，去更新对应的 dom 节点。可能遇到的问题：

1. 依赖收集函数过多，导致性能问题

### 例子

以一个 `Counter` 组件为例：

```jsx
const Counter = () => {
  const count = ref(0);

  const el = (
    <button onClick={() => count.value++} data-count={count}>
      count: {count}
    </button>
  );

  return el;
};
```

其中

```jsx
const el = (
  <button onClick={() => count.value++} data-count={count}>
    count: {count}
  </button>
);

// el instanceof HTMLElement === true
```

这一段代码，会直接生成 dom 节点。

其中 `data-count={count}`，则会生成一个依赖函数，每当 `count` 变化，则会直接触发更新 dom 操作，大致逻辑如下：

```jsx
const $btn = document.createElement("button"); // create button element

// auto update attribute
effect(() => {
  $btn.setAttribute("data-count", unref(count));
});
```

以同样的方式处理 `count: {count}` 文本。

[jsx]: https://github.com/facebook/jsx

## 渲染逻辑

由于直接生成 DOM 节点，而非先生成虚拟 DOM 树，因此所有动态修改 DOM 的操作都必须通过内置组件完成。
主要包括两个内置组件（MapComponent、CaseComponent）。MapComponent 用于列表渲染，CaseComponent
用于条件渲染。

初次渲染过程：

1. 生成组件上下文
2. 生成组件对应的 DOM 树，绑定响应式数据
   1. 从上到下依次生成 DOM 节点
   2. 绑定响应式数据，**响应式清理函数挂载在最近的组件上**
3. 添加到宿主 DOM 节点中
4. 触发 mount 事件

更新过程：

响应式数据更新对出发对应绑定的更新函数，从而直接更新 DOM 节点

动态渲染过程：

动态渲染需要通过内置组件完成，详细设计参考对应的内置组件
