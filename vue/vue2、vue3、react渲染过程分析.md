## vue2、vue3、react渲染过程Render

### 前言

本文是对vue2、vue3、react的渲染过程进行一个理解和对比，希望能帮助自己和大家更深入的了解框架背后的实现。

知识点：虚拟节点

### 概念解析

* 虚拟节点
  
虚拟节点即Virtual DOM,就是用一个原生的JS对象去描述一个DOM节点

VNode是对真实DOM的一种抽象描述，它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等，其它属性都是用来扩展VNode
的灵活性以及实现一些特殊feature的。由于VNode只是用来映射到真实DOM的渲染，不需要包含操作DOM的方法，因此它是非常轻量和简单的。

### vue2.x render
![avatar](https://ibb.co/GVpWVfk)
总体过程就是：渲染过程就是通过render函数生成虚拟节点,然后通过$mount函数通过patch算法生成真实节点

初始化
```JavaScript
// src/core/instance/init.js
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++
    // ...
    initRender(vm)

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
    // ...
  }
```

给vm实例绑定_c、和$createElement方法，_c表示手写render函数调用，$createElement为template编译成的render函数调用
```JavaScript
// src/core/instance/render.js
  export function initRender (vm: Component) {
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}
```

### 总结
1. 异步操作：vue3在vue2的基础上做了简化、用promise.then取代了其它可能的异步操作，例如setTimeout，react则使用setImmediate或者postMessage实现。
   
2. 任务队列：vue2、vue3都采用单个queue数组存储队列，react根据时间对任务进行了区分，分为taskQueue就绪任务和timerQueue未就绪任务;vue2对queue数组进行sort排序，vue3在这个基础上进行优化，使用重复数据消除搜索，避免重复执行，react Scheduler使用小顶堆实现了优先级队列。
   
3. nextTick:vue2、vue3中nextTick函数对应react中unstable_scheduleCallback函数，vue中按顺序执行，react中按优先级

### 参考资料
