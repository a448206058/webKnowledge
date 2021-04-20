## 函数式组件与类组件有何不同？

> 函数式组件捕获了渲染所用的值。（Function components capture the rendered values.）

通常来说我们会避免使用闭包，因为它会让我们难以想象一个可能会随着时间推移而变化的变量。但是在React中,props和state是不可变的。这就消除了闭包的一个主要缺陷。

