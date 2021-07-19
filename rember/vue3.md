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
        

* 最佳使用方式
* 进阶，深入理解  

### Vue3升级类哪些重要的功能？

### Composition API如何实现代码逻辑复用？

### Vue3如何实现响应式？

### watch和watchEffect的区别是什么？

### setup中如何获取组件实例？

### Vue3为何比Vue2快？

### Vite是什么？

### Composition API和 React Hooks的对比
