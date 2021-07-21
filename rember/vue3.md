### vue3比vue2有什么优势？
* 性能更好
* 体积更小
* 更好的ts支持
* 更好的代码组织
* 更好的逻辑抽离
* 更多新功能

### 描述 vue3生命周期
* Options API生命周期
    * beforeDestroy 改为 beforeUnmount
    * destroyed改为unmounted
    * 其他沿用vue2生命周期

* Composition API生命周期

### 如何看待 Composition API 和 Options API?
* Composition API带来了什么？
    * 更好的代码组织
    * 更好的逻辑复用
    * 更好的类型推导

* Composition API和OptionAPI如何选择？
    * 不要复用
    * 简单的用option api
    * 复杂的用composition api

* 不要误解compostion api
    * Composition API属于高阶技巧，不是基础必会
    * Composition API是为解决复杂业务逻辑而设计
    * Composition API就像Hooks在React中的地位

### 如何理解 ref toRef和toRefs?
* 是什么
    ref
        * 生成值类型的响应式数据
        * 可用于模版和reactive
        * 通过.value修改值

    toRef
        * 针对一个响应式对象（reactive封装)的prop
        * 创建一个ref，具有响应式
        * 俩者保持引用关系

    toRefs
        * 将响应式对象（reactive封装）转换为普通对象
        * 对象的每个prop都是对应ref
        * 俩者保持引用关系

* 最佳使用方式
    * 用reactive做对象的响应式，用ref做值类型响应式
    * setup中返回toRefs(state)，或者toRef(state, 'xxx')
    * ref的变量命名都用xxxRef
    * 合成函数返回响应式对象时，使用toRefs

* 进阶，深入理解  
* 为何需要ref?
    * 返回值类型，会丢失响应式
    * 如在setup、computed、合成函数，都有可能返回值类型
    * Vue如不定义ref，用户将自造ref,反而混乱

* 为何需要.value?
    * ref是一个对象（不丢失响应式），value存储值
    * 通过.value属性的get和set实现响应式
    * 用于模版、reactive时，不需要.value，其他情况都需要

* 为何需要toRef toRefs?
    * 初衷：不丢失响应式的情况下，把对象数据 分解/扩散
    * 前提：针对的是响应式对象（reactive封装的）非普通对象
    * 注意：不创造响应式，而是延续响应式

### Vue3升级类哪些重要的功能？
    * createApp
    * emits属性
    * 生命周期
    * 多事件
    * Fragment
    * 移除.sync
    * 异步组件的写法
    * 移除filter
    * Teleport
    * Suspense
    * Composition API
### Composition API如何实现代码逻辑复用？
* 抽离逻辑代码到一个函数
* 函数命名约定为useXxxx格式（React Hooks也是）
* 在setup中引用usexxx函数


### Vue3如何实现响应式？
* 基本使用
* Reflect
    和proxy能力一一对应
    规范化、标准化、函数式
    代替object工具函数
* 实现响应式
### watch和watchEffect的区别是什么？
* 俩者都可监听data属性变化
* watch需要明确监听哪个属性
* watchEffect会根据其中的属性，自动监听其变化

### setup中如何获取组件实例？
* 在setup 和其他CompositionAPI中没有this
* 可通过getCurrentInstance获取当前实例
* 若使用Options API可照常使用this

### Vue3为何比Vue2快？

### Vite是什么？

### Composition API和 React Hooks的对比
