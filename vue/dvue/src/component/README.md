## 组件化的概念
Vue.js另一个核心思想是组件化。所谓组件化，就是把页面拆分成多个组件(component)，每个组件依赖的CSS、JavaScript、模版、图片等
资源放在一起开发和维护。组件是资源独立的，组件在系统内部可复用，组件和组件之间可以嵌套。

## 组件化能起到什么作用？
能更加灵活的进行组装

流程 
new Vue() => $mount() => vm._render() => _createElement() => createComponent()

https://blog.csdn.net/weixin_48109878/article/details/109555053