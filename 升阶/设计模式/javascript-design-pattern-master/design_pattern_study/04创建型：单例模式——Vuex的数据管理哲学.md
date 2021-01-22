#### 单例模式——Vuex的数据管理哲学

保证一个类仅有一个实例，并提供一个访问它的全局访问点，这样的模式就叫做单例模式。



##### ~单例模式的实现思路

如何才能保证一个类仅有一个实例？

一般情况下，当我们创建了一个类（本质是构造函数）后，可以通过new关键字调用构造函数进而生成任意多的实例对象。

单例模式想要做到的是，**不管去创建多少次，都只返回第一次所创建的那唯一的一个实例**。

要做到这一点，需要构造函数**具备判断自己是否已经创建过一个实例**的能力。下面的例子把这段判断逻辑写成一个静态方法（也可以直接写入构造函数的函数体里）：`SingleDog的例子`

getInstance的逻辑还可以用闭包来实现：

```javascript
SingleDog.getInstance = (function () {
  // 定义自由变量instance，模拟私有变量
  let instance = null;
  return function() {
    // 判断自由变量是否为null
    if(!instance) {
      // 如果为null，则new出唯一实例
      instance = new SingleDog();
    }
    return instance;
  }
})();
```

在getInstance方法的判断和拦截下，不管调用多少次，SingleDog都只会返回一个实例。



##### ~生产实践：Vuex中的单例模式

基于Flux架构的状态管理工具，无论是Redux或Vuex，都实现了一个全局的Store用于存储应用的所有状态。这个Store的实现，正是单例模式的典型应用。



**理解Vuex中的Store**

> Vuex使用单一状态树，用一个对象就包含了全部的应用层级状态。至此它便作为一个”唯一数据源（SSOT）“而存在。这也意味着，每个应用将仅仅包含一个store实例。单一状态树让我们能够直接地定位任一特定的状态片段。

Vue中组件间通信最常用的办法是props（父子组件），稍微复杂一点（如兄弟组件）通过实现简单的事件监听函数也能解决。

当组件非常多、组件间关系复杂、嵌套层级很深的时候，这种原始的通信方式会难以维护。=》最好的做法是将共享的数据抽出来、放在全局，供组件们按照一定的规则去存取数据，保证状态以一种可预测的方式发生变化。=》存放共享数据的唯一数据源，Store。



**Vuex如何确保Store的唯一性**

在项目中引入Vuex：

```javascript
// 安装Vuex插件
Vue.use(Vuex);

// 将store注入到Vue实例中
new Vue({
  el: '#app',
  store
})
```

Vuex插件是一个对象，它在内部实现了一个install方法，这个方法在插件安装时被调用，从而把Store注入到Vue实例里去。也就是，每install一次，都会尝试给Vue实例注入一个Store。

在install方法里，有一段逻辑和`getInstance`非常相似：

```javascript
let Vue // 这个Vue的作用和前面例子中的instance作用一样
// ...

export function install (_Vue) {
  // 判断传入的Vue实例对象是否已经被install过Vuex插件（是否有了唯一的state）
  if(Vue && _Vue === Vue) {
    if(process.env.NODE_ENV !== 'production') {
      console.log('[vuex] already installed. Vue.use(Vuex) shoul be called only once.');
    }
    return;
  }
  // 若没有，则为这个Vue实例对象install一个唯一的Vuex
  Vue = _Vue;
  // 将Vuex的初始化逻辑写进Vue的钩子函数里
  applyMixin(Vue)
}
```

通过这种方式，可以保证一个Vue实例（即一个Vue应用）只会被install一次Vuex插件，所以每个Vue实例只会拥有一个全局的Store。



##### ~小结

思考一下：如果没有在install里实现单例模式，会带来什么麻烦？

假如install里没有单例模式的逻辑，如果在一个应用里不小心多次安装了插件

```javascript
Vue.use(Vuex);

// ...中间添加/修改了一些store的数据

/// 不小心又安装了一次
Vue.use(Vuex);
```

此时，会为当前Vue实例重新注入一个新的Store，也就是中间的那些数据操作全都没了。因此，单例模式在此处非常必要。