# JSX Element

此章节解释一下 `jsx` 函数的返回值，也就是如 `<div />` 这个一个 jsx 片段 返回的值是什么样的。

jsx 元素有三种：ComponentNode、NativeNode、TextNode、AnchorNode，分别对应组件节点，原生元素节点、文本节点以及锚点节点。

其中锚点节点比较特殊，仅用于处理动态的节点，如列表渲染，条件判断渲染。

## 一些历史因素

在今天之前，原本只有 ComponentNode 节点 和 Native 节点两种，其中 Native 节点即是直接生成的 DOM 元素。也就是如 `<div />` 这样的代码片段会生成返回一个 `HTMLDivElement` 的 DOM 元素。

原本这样的处理方式，能够减少很多麻烦，不需要管理 DOM 节点的变动，只需要特别处理 AnchorNode（此时的 AnchorNode 就是一个 Comment DOM 元素） 即可。这样也可以节省很多不必要的虚拟中间类型。

不过在探索 Slot 的开发体验的时候，直接生成 DOM 节点的方式，导致丢失了虚拟节点父子关系的相关信息，从而导致无法实现 [Slot] 中预想的开发体验。因此决定回归原本的虚拟节点的方式，虽然保留虚拟节点，但目的仅仅是为了延后 mount 的时机，以方便实现 [Slot] 文档中提到的开发体验。

[Slot]: ./Slot.md
