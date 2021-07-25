### react组件如何通讯

### JSX本质是什么

### context是什么，有何用途？

### shouldCompontentUpdate的用途

### 描述redux单项数据流

### setState是同步还是异步？

### event
1. event 是 syntheticEvent, 模拟出来DOM事件所有能力
2. event.nativeEvent是原生事件对象
3. 所有的事件，都被挂载到document上
4. 和DOM事件不一样，和vue事件也不一样


### setState
* 不可变值
* 可能是异步更新
* 可能会被合并

### 组件生命周期
* 单个组件的生命周期
挂载时：
    constructor
    render
    component-didMount

更新时：
    render
    should
    componentDidUpdate

卸载时
    componetWillUnmount

* 父子组件生命周期，和vue的一样

### react高级特性
* 函数组件
* 非受控组件
* Portals
* context
* 异步组件
* 性能优化
* 高阶组件HOC
* Render Props

### 函数组件
* 纯函数，输入props，输出JSX
* 没有实例，没有生命周期，没有state
* 不能扩展其他方法

### 非受控组件
* ref
* defaultValue defaultChecked
* 手动操作dom元素

使用场景
* 必须手动dom元素，setState实现不来
* 文件上传<input type=file>
* 某些富文本编辑器，需要传入DOM元素

### 受控组件VS非受控组件
* 优先使用受控组件，符合React设计元素
* 必须操作dom时，再使用非受控组件

### Portals
传送门
* 组件默认会按照既定层次嵌套渲染
* 如何让组件渲染到父组件以外？

this.props.children slot

使用场景
* overflow: hidden
* 父组件z-index值太小
* fixed需要放在body第一层级

### context

### 异步组件
* import()
* React.lazy
* React.Suspense

### 性能优化
* shouldComponentUpdate(SCU)
* PureComponent和React.memo
* 不可变值 immutable.js

### SCU使用总结
* SCU默认返回true,即React默认重新渲染所有子组件
* 必须配合“不可变值”一起使用
* 可先不用SCU，有性能问题时再考虑使用

### PureComponent和React.memo
* PureComponent(纯组件），SCU中实现来浅比较
* memo,函数组件中的PureComponent
* 浅比较已使用大部分情况（尽量不要做深度比较）

### immutable.js
* 彻底拥抱“不可变值”
* 基于共享数据（不是深拷贝），速度好
* 有一定学习和迁移成本，按需使用
```JavaScript
const map1 = Immutable.Map({ a: 1, b: 2, c: 3})
const map2 = map1.set('b', 50)
map1.get('b')
map2.get('b')
```

### 关于组件公共逻辑的抽离
* mixin，已被React弃用
* 高阶组件 HOC
* Render Props

```JavaScript
// 高阶组件不是一种功能，而是一种模式
const HOCFactory = (Component) => {
    class HOC extends React.Component {
        // 在此定义多个组件的公共逻辑
        render() {
            return <Component {...this.props} /> // 返回拼装的结果
        }
    }
    return HOC
}
const EnhancedComponent1 = HOCFactory(WrappedComponent1)
const EnhancedComponent2 = HOCFactory(WrappedComponent2)

```

redux connect 是高阶组件
```JavaScript
import {connect} from 'react-redux'

// connect 是高阶组件
const Vi

```

### Render Props
```JavaScript
// Render Props的核心思想
// 通过一个函数将class组件的state作为props传递给纯函数组件
class Factory extends React.Component {
    constructor() {
        this.state = {

        }
    }
    render() {
        return <div>{this.props.render(this.state)}</div>
    }
}
```

### HOC VS Render Props
* HOC: 模式简单，但会增加组件层级
* Render Props: 代码简洁，学习成本较高

### redux使用
* 基本概念
* 单项数据流
    dispatch(action)
    reducer -> newState
    subscribe 触发通知
* react-redux
    <Provider> connect
    connect
    mapStateToProps mapDispatchToProps
* 异步action
* 中间件

### React-router 使用
* 路由模式（hash、H5 history),同vue-router
* 路由配置（动态路由、懒加载），同vue-router
```JavaScript
lazy(() => import)

<Suspense>
</Suspense>
```

### react原理
* 函数式编程
* vdom 和 diff
* JSX本质
* 合成事件
* setState batchUpdate
* 组件渲染过程

### 函数式编程
* 一种编程范式，概念比较多
* 纯函数
* 不可变值

### 回顾vdom和diff
* h函数
* vnode数据结构
* patch函数

* 只比较同一层级，不跨级比较
* tag不相同，则直接删掉重建，不再深度比较
* tag和key，俩者都相同，则认为是相同节点，不再深度比较

* vue2.x vur3.0 React三者实现vdom细节都不同
* 核心概念和实现思路，都一样
* 面试主要考察后者，不用全部掌握细节

### JSX本质
* JSX等同于vue模版
* vue模版不是html
* JSX也不是JS

* jsx即createElement函数
* 执行生成vnode
* patch(elem, vnode) 和 patch(vnode, newVnode)


### 合成事件
* 所有事件挂载到document上
* event不是原生的，是SyntheticEvent合成事件对象
* 和Vue事件不同，和DOM事件也不同

### 为何要合成事件机制？
* 更好的兼容性和跨平台
* 挂载到document,减少内存消耗，避免频繁解绑
* 方便事件的统一管理（如事务机制）

react17事件绑定到root组件上
有利于多个react版本并存，例如微前端

### setState 和 batchUpdate
* 有时异步（普通使用），有时同步（setTimeout、DOM事件）
* 有时合并（对象形式），有时不合并（函数形式）
* 后者比较好理解（像Object.assign），主要讲解前者

* setState主流程
* batchUpdate机制
* transaction(事务)机制

### setState异步还是同步？
* setState无所谓异步还是同步
* 看是否能命中batchUpdate机制
* 判断isBatchingUpdates

### 哪些能命中batchUpdate机制
* 生命周期（和它调用的函数）
* React中注册的事件（和它调用的函数）
* React可以“管理”的入口

### 哪些不能命中batchUpdate机制
* setTimeout setInterval等（和它调用的函数）
* 自定义的DOM事件（和它调用的函数）
* React"管不到“的入口

### transaction 事务机制

### 组件渲染和更新过程
* props state
* render() 生成 vnode
* patch(elem, vnode)

### 组件更新过程
* setState(newState) --> dirtyComponents(可能有子组件)
* render()生成newVnode
* patch(vnode, newVnode)分为俩个阶段
* 第一阶段reconciliation 阶段 - 执行 diff算法，纯JS计算
* commit阶段 - 将diff结果渲染dom

### 可能会有性能问题
* js是单线程，且和dom渲染共用一个线程
* 当组件足够复杂，组件更新时计算和渲染都压力大
* 同时再有DOM操作需求（动画，鼠标拖拽等），将卡顿

### 解决方案 fiber
* 将reconciliation阶段进行任务拆分（commit无法拆分）
* dom需要渲染时暂停，空闲时恢复
* window.requestIdleCallback
