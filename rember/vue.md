### v-show 和 v-if 的区别


### 为何在v-for中用key

### 描述vue组件生命周期
* 单组件生命周期图
* 父子组件生命周期关系

### vue组件如何通讯
* 父子组件props和this.$emit
* 自定义事件event.$no event.$off event.$emit
* vuex

### 双向数据绑定 v-model的实现原理
* input元素的 value = this.name
* 绑定input事件this.name = $event.target.value
* data更新触发re-render

### MVVM的理解
view  viewmodel(dom listener directives)  model

### computed 有何特点
* 缓存，data不变不会重新计算
* 提高性能

### 为何组件data必须是一个函数？

### ajax请求应该放在哪个生命周期
* mounted
* JS是单线程的，ajax异步获取数据
* 放在mounted之前没有用，只会让逻辑更加混乱

### 如何将组件所有props传递给子组件？
* $props
* <User v-bind="$props" />

### 如何自己实现v-model
```
<input type="text" :value="text" @input="$emit('change', $event.target.value)">
```

### 多个组件有相同的逻辑，如何抽离？
* mixin

### 何时要使用异步组件？

### 何时需要使用keep-alive?
* 缓存组件，不需要重复渲染
* 如多个静态tab页的切换
* 优化性能

### 何时需要使用beforeDestory
* 解绑自定义事件event.$off
* 清除定时器
* 解绑自定义的DOM事件，如window scroll等

### 什么是作用域插槽

### vuex中avtion和mutation有何区别
* action中处理异步，mutation不可以
* mutation做原子操作

### vue-router常用的路由模式
* hash
* h5 history
* 俩者比较

### 如何配置vue-router异步加载

### 请用vnode描述一个DOM
```
{
    tag: '',
    props: {
        className
    }
    },
    children: [

    ]
}
```
### 监听data变化的核心API是什么
* Object.defineProperty
* 以及深度监听、监听数组
* 有何缺点

### vue如何监听数组变化
* Object.defineProperty不能监听数组变化
* 重新定义原型，重写push pop等方法，实现监听
* proxy可以原生支持监听数组变化

### 请描述响应式原理
* 监听data变化
* 组件渲染和更新的流程

### diff算法的时间复杂度
* O(n)
* 在O(n^3)上做的优化

### 简述diff算法过程
* patch(elem, vnode)和patch(vnode, newVnode)
* patchVnode和addVnodes和removeVnodes
* updateChildren(key的重要性)

### vue为何是异步渲染，$nextTick何用？
* 异步渲染（以及合并data修改），以提高渲染性能
* $nextTick在DOM更新完之后，触发回调

### vue常见性能优化方式
* 合理使用v-show和v-if
* 合理使用computed
* v-for时加key,以及避免和v-if同时使用
* 自定义事件、DOM事件及时销毁
* 合理使用异步组件
* 合理使用keep-alive
* data层级不要太深
* 使用vue-loader在开发环境做模版编译（预编译）
* webpack层面的优化
* 前端通用的性能优化，如图片懒加载
* 使用SSR

### vue3
reflect作用
* 和proxy能力一一对应
* 规范化、标准化、函数式
* 替代掉Object上的工具函数