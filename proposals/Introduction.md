# 简介

[JSX 是由 React 团队推出的一种语法][jsx]，可将其看作为一种语法糖。

其逻辑是将

```jsx
const Comp = () => <div />

const el = (
  <div class="text-red">
    <Comp>child</Comp>
    <span> some text </span>
  </div>
)
```

这样一段 jsx 代码转换成这样一段 js 代码

```js
const el = h(
  'div',
  { class: 'text-red' },
  h(Comp, null, 'child'),
  h('span', null, 'some text'),
)
```

其中 `h` 函数的签名为

```ts
function h(
  type: string | Component,
  props?: Record<string, any>,
  ...children: any[]
): JSX.Element
```

目前（2023.04.21），利用 jsx 语法的库/框架，都是生成一颗虚拟 dom，然后通过 diff 去操作真实的 dom。

因此，此项目用于尝试是否可以利用 jsx 直接生成真实 dom，然后直接操作真实 dom，从而去除虚拟 dom 这一层。

## 参考 Vue

Vue 整个框架都是构建在响应式之上的，其易用性也得益于此，还有其 SFC 语法，也非常便利。

Vue 的更新逻辑：得益于其自动依赖收集的算法，render 函数中引用的数据更新之后，会自动触发更新逻辑。
执行一次 render 函数，获取到虚拟 dom，diff 不同的部分，然后应用到对应的 dom 节点。

值得一题的是，vue 的 sfc 在编译的过程中，会分析 template 中节点的类型，如果是静态节点，则不会重复生产对应的虚拟 dom。

## 参考 React

React 的 JSX， 更易于组合，对于高阶组件，更方便。不过，其 Hooks 却是很有违常规设计，心智负担较重。其不可变的数据模式，也不太方便快速开发。

react 的更新逻辑：在 setState 函数调用之后，执行一次 render 函数，获取虚拟 dom， diff，然后 patch。

## 此项目的逻辑

在参考 vue/react 之后，此项目尝试，直接生成 dom 节点，之后所有的修改都直接基于真实 dom 做出对应操作。而不是重复生成虚拟 dom， 然后 diff， 再 patch 的过程。

更新的过程，则尝试利用 vue 响应式的依赖自动收集逻辑，去更新对应的 dom 节点。可能遇到的问题：

1. 依赖收集函数过多，导致性能问题

### 例子

以一个 `Counter` 组件为例：

```jsx
const Counter = () => {
  const count = ref(0)

  const el = (
    <button onClick={() => count.value++} data-count={count}>
      count: {count}
    </button>
  )

  return el
}
```

其中

```jsx
const el = (
  <button onClick={() => count.value++} data-count={count}>
    count: {count}
  </button>
)

// el instanceof HTMLElement === true
```

这一段代码，会直接生成 dom 节点。

其中 `data-count={count}`，则会生成一个依赖函数，每当 `count` 变化，则会直接触发更新 dom 操作，大致逻辑如下：

```jsx
const $btn = document.createElement('button') // create button element

// auto update attribute
effect(() => {
  $btn.setAttribute('data-count', unref(count))
})
```

以同样的方式处理 `count: {count}` 文本。

[jsx]: https://github.com/facebook/jsx
