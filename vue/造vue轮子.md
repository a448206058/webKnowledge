## 轮子哥说过，检验学习的最好办法就是造轮子，定个计划，造起来
	本系列文章最主要的目的是为了巩固学习的vue源码知识，提高自身的开发水平，
	加强开发思路，熟悉造轮子的过程
	
## vue轮子系列一：双向绑定
## 开发的道是思想、思路，术是代码，所以造轮子之前，先想清楚思路

首先我们要了解什么是双向绑定？
	首先要了解什么MVVM?
	MVVM是指，Model、View、ViewModel
	双向绑定是指 Model的数据变化会重新渲染View
	而View的变更也会重新导致Model的修改
	ViewModel是Model和View之间的桥梁

ViewModel是怎么实现这一过程的呢？
	主要是通过Object.defineProperty 设置一个getter和一个setter
	分俩步：
		第一步是Model的变化重新渲染view,每次对数据进行修改的时候都会触发setter，从而导致页面重新渲染
		第二步是View的变化导致Model的修改，通过watcher观察，重新修改Model

分析完了，开始造轮子的步骤。
	如何实现步骤一呢？
		首先了解下Object.defineProperty，不了解的同学可以通过MDN进行了解
		通过Object.defineProperty劫持一个自定义的对象，设置自定义的setter和getter
		Setter做哪些事情呢？
			1.监听对象变化，变化的时候触发对应的修改函数
			2.定义修改函数，修改DOM
	如何实现步骤二呢？
		对初始对象的getter进行observe watch
	
	如何造轮子？
		我们最终目的是要发布到网上供自己或他人使用，所以需要使用node的npm包管理工具进行发布
		通过npm init 初始化
		定义目录结构
			src
				main.js
				index.html
		
		main.js中如何定义
			定义初始化对象
			通过export导出
			
## 造轮子系列： 响应式原理
### 什么是响应式？
	响应式原理的核心就是观测数据的变化，数据发生变化以后能通知到对应的观察者来执行相关的逻辑。
	核心就是Dep，它是连接数据和观察者的桥梁。
	
	data/props:	defineReactive
	
	computed: computed watcher 	
				(depend)->		
				(notify)->		Dep ➡️（depend) getter ➡（notify）setter️
								⬇️（update) ⬇️（addDep)
	watch: 						user watcher (run)-> user callback
								⬇️（update) ⬇️（addDep)
	mount: 						render watcher (run)-> updateComponent
	
    
    
### 怎么实现？
    数据劫持/数据代理
        主要是通过Object.defineProperty的get和set属性
            第一步：
                定义一个函数取名为dVue，主要功能是创建一个对象并返回
        	第二步：
        		定义一个函数取名为defineReactive，主要功能是循环对象内的值，并给每个值绑定上对应的set和get
        	第三步：
        		定义一个函数defineProperty，主要功能就是绑定set和get
        	第四步：
        		返回该对象
    依赖收集
        核心思想是事件发布订阅模式
            订阅者Dep和观察者Watcher
            收集依赖需要为依赖找一个存储依赖的地方，Dep,它用来收集依赖、删除依赖和向依赖发送消息等。
            实现一个订阅者Dep类，用于解耦属性的依赖收集和派发更新操作，它的主要作用是用来存放Watcher观察者对象。我们可以把Watcher
            理解成一个中介的角色，数据发生变化时通知它，然后它再通知其他地方。
			
    发布订阅模式
    
    vue->observer数据劫持->dep发布者
                            |
    compiler解析指令->watcher观察者
    
    
```JavaScript
	import Compiler from './Compiler'
	import Observer from './Observer'
	
	export default class dVue {
		constructor(options) {
			// 1、保存vue实例传递过来的数据
			this.$options = options // options是vue实例传递过来的对象
			this.$data = options.data // 传递过来的data数据
			// el 是字符串还是对象
			this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
			// 2、把this.$data中的成员转换成getter 和setter ，并且注入到vue实例中，使vue实例中有data里面的属性
			// 但是this.$data自身内部成员并没有实现在自身内部属性的gettter和setter，需要通过observer对象来实现
			this._proxyData(this.$data)
			
			// this._proxyData(this.$data)
			// 3、调用observer对象，监视data数据的变化
			new Observer(this.$data)
			// 4、调用compiler对象，解析指令和差值表达式
			// debugger
			new Compiler(this) // this是vue实例对象
		}
	
		_proxyData (data) {
			// 遍历传递过来的data对象的数据，key是data对象中的属性名
			Object.keys(data).forEach((key) => {
				Object.defineProperty(this, key, {
					configurable: true, // 可修改
					enumerable: true, // 可遍历
					// get 是 Object.defineProperty()内置的方法
					get () {
						return data[key]
					},
					// set 是 Object.defineProperty()内置的方法
					set (newValue) {
						if (newValue === data[key]) {
							return
						}
						data[key] = newValue
					}
				})
			})
		}
	}


// main.js 进行用例测试

import dVue from './index'

var dVues = new dVue({
	el: '#app',
	data: {
		text: 1,
		object: {cc: 'cc1', dd: '2'},
		array: [{c1: '1', d1: '2'}, {c2: '11', d2: '22'}],
	},
	methods: {
		changeText() {
			dVues.text = '2'
		},
		changeObject(){
			// dVues.object.cc = '3'
			dVues.object = 222
		},
		changeObjectValue(){
			dVues.object.cc = '3'
			console.log(dVues.object.cc)
			// dVues.object = 222
		},
		changeArray() {
			dVues.array[0].c1 = '333';
		}
	}
});
```

接下来用Observer类来拆分循环判断
```JavaScript
// 定义一个Observer.js
import Dep from './Dep'

/**
 * Observer类：作用是把data对象里面的所有属性转换成getter和setter
 * data 是创建vue实例的时候，传递过来的对象里面的data，data也是个对象
 */

export default class Observer {
    // constructor 是创建实例的时候，立刻自动执行的
    constructor(data) {
        this.walk(data);
    }

    // 遍历data对象的所有属性
    // data 是创建vue实例的时候，传递过来的对象里面的data，data也是个对象
    walk (data) {
        // 判断data是否是对象
        if (!data || typeof data !== 'object') {
            return
        }
        const keys = Object.keys(data)
        for (let i = 0; i < keys.length; i++) {
            this.defineReactive(data, keys[i], data[keys[i]])
        }

    }
    // 把data对象里面的所有属性转换成getter和setter
    defineReactive (obj, key, val) {
        // 解决this的指向问题
        let that = this

        // 为data中的每一个属性，创建dev对象，用来收集依赖和发送通知
        // 收集依赖:就是保存观察者
        let dep = new Dep()

        // 如果val也是对象，就把val内部的属性也转换成响应式数据，
        /// 也就是调用Object.defineProperty()的getter和setter
        console.log(key)
        // console.log(val)
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get () {
                // Dep.target就是观察者对象，调用dev对象的addSub方法，把观察者保存在dev对象内
                // target是Dep类的静态属性，但是却是在Watcher类中声明的
                if(Dep.target){
                    dep.addSub(Dep.target)
                }
                // Dep.target && dep.addSub(Dep.target)

                return val
            },
            set (newValue) {
                if (newValue === val) {
                    return
                }
                val = newValue
                // 对vue实例初始化后，传入的data数据的值进行修改，由字符串变成对象
                // 也要把新赋值的对象内部的属性，转成响应式
                that.walk(newValue)
                // debugger
                // data里面的数据发生了变化，调用dev对象的notify方法，通知观察者去更新视图
                dep.notify()
            }
        })
    }
}
```

定义一个Dep
Dep主要是干什么呢  主要用来进行依赖收集 也就是管理watch
需要哪些东西呢？
```JavaScript
// Dep 的核心是 notify
// 通过自定义数组subs进行控制
// 主要实现 addSub removeSub 循环遍历subs 去通知watch 更新

export default class Dep {

    constructor () {
        this.subs = [];
    }

	addSub (sub) {
    	console.log(sub)
    	if(sub && sub.update) {
			this.subs.push(sub);
		}
	}

	removeSub(sub) {
		remove(this.subs, sub)
	}

	// 这个方法等同于 this.subs.push(Watcher);
	depend() {
    	if (Dep.target) {
    		Dep.target.addDep(this);
		}
	}

	// 这个方法就是发布通知 告诉你 有改变了
	notify() {
		const subs = this.subs.slice()
		subs.sort((a, b) => a.id - b.id);
		for (let i = 0, l = subs.length; i < l;i++){
			subs[i].update()
		}
	}
}

Dep.target = null;

```

然后再用一个Watcher类去进行依赖收集,用Dep进行管理
```JavaScript
import Dep from './Dep'
/**
 * 当data数据发生变化，dep对象中的notify方法内通知所有的watcher对象，去更新视图
 * Watcher类自身实例化的时候，向dep对象中addSub方法中添加自己（1、2）
 */

export default class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm // vue的实例对象
        this.key = key // data中的属性名称
        this.cb = cb // 回调函数，负责更新视图

        // 1、把watcher对象记录到Dev这个类中的target属性中
        Dep.target = this // this 就是通过Watcher类实例化后的对象，也就是watcher对象
        // 2、触发observer对象中的get方法，在get方法内会调用dep对象中的addSub方法
        this.oldValue = vm[key] //更新之前的页面数据
        // console.log(Dep.target)
        Dep.target = null

    }
    // 当data中的数据发生变化的时候，去更新视图
    update () {
        // console.log(this.key)
        const newValue = this.vm[this.key]
        if (newValue === this.oldValue) {
            return
        }
        this.cb(newValue)
    }
}

```

好了，简单的实现了响应式，但是如何把响应的数据动态的绑定到页面上去呢？
通过Compiler.js
```JavaScript
import Watcher from './Watch'
/**
 * 主要就是用来操作dom
 * 负责编译模板，解析指令/插值表达式
 * 负责页面的首次渲染
 * 当数据变化后重新渲染视图
 */

export default class Compiler {
    constructor(vm) {
        this.el = vm.$el // vue实例下的模板
        this.vm = vm // vm就是vue实例
        this.compile(this.el) // compiler实例对象创建后，会立即调用这个方法
    }

    // 编译模板，处理文本节点和元素节点
    compile (el) {
        let childNodes = el.childNodes // 是个伪数组
        Array.from(childNodes).forEach((node) => {
            if (this.isTextNode(node)) {
                // 编译文本节点，处理差值表达式{{}}
                this.compileText(node)
            } else if (this.isElementNode(node)) {
                // 编译元素节点，处理指令
                this.compileElement(node)
            }

            // 递归调用compile，把所有的子节点都处理掉，也就是嵌套的节点都处理掉
            if (node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })

    }
    // 编译元素节点，处理指令，这里只处理v-text和v-model
    compileElement (node) {
        // console.dir(node.attributes)
        Array.from(node.attributes).forEach((attr) => {
            // console.log(attr.name)
            let attrName = attr.name // 指令属性名 v-modelv-texttypev-count
            // 判断是否是vue指令
            if (this.isDirective(attrName)) {
                // v-text ==> text
                attrName = attrName.substr(2) // textmodelon:clickhtml
                let key = attr.value // 指令属性值 // msgcounttextclickBtn()

                // 处理v-on指令
                if (attrName.startsWith('on')) {
                    const event = attrName.replace('on:', ''); // 获取事件名
                    // 事件更新
                    this.onUpdater(node, key, event);
                } else {
                    this.update(node, key, attrName);
                }
            }

        })
    }

    update (node, key, attrName) {
        let updateFn = this[attrName + 'Updater'] // textUpdater(){} 或者 modelUpdater(){}
        // this 是compiler对象
        updateFn && updateFn.call(this, node, this.vm[key], key) // updateFn的名字存在才会执行后面的函数

    }

    // 处理v-text指令
    textUpdater (node, value, key) {
        // console.log(node)
        node.textContent = value

        // 创建watcher对象，当数据改变去更新视图
        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }

    // 处理v-html指令
    htmlUpdater (node, value, key) {
        // console.log(node)
        node.innerHTML = value

        // 创建watcher对象，当数据改变去更新视图
        // this.vm: vue的实例对象 key:data中的属性名称 ()=>{}: 回调函数，负责更新视图
        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }

    // 处理v-model指令
    modelUpdater (node, value, key) {
        // console.log(node, value)
        node.value = value
        // console.log(node.value)
        // 创建watcher对象，当数据改变去更新视图
        new Watcher(this.vm, key, (newValue) => {
            node.value = newValue
        })

        // 双向数据绑定
        node.addEventListener('input', () => {
            this.vm[key] = node.value
        })
    }


    // 处理v-on指令
    onUpdater (node, key, event) {
        // console.log(node ,key, event)
        node.addEventListener(event, () => {
            // 判断函数名称是否有()
            if (key.indexOf('(') > 0 && key.indexOf(')') > 0) {
                this.vm.$options.methods[key.slice(0,-2)]()
            } else {
                this.vm.$options.methods[key]()
            }
        })
    }


    // 编译文本节点，处理差值表达式{{  msg }}
    compileText (node) {
        // console.dir(node)
        let reg = /{{(.+?)}}/
        let value = node.textContent // 获取文本节点内容：{{ msg }}

        if (reg.test(value)) {
            let key = RegExp.$1.trim() // 把差值表达式{{  msg }}中的msg提取出来
            // 把{{  msg }}替换成 msg对应的值，this.vm[key] 是vue实例对象内的msg
            node.textContent = value.replace(reg, this.vm[key])

            // 创建watcher对象，当数据改变去更新视图
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = newValue
            })
        }
    }

    // 判断元素属性是否是vue指令
    isDirective (attrName) {
        return attrName.startsWith('v-')
    }

    // 判断节点是否是文本节点(元素节点1属性节点2文本节点3)
    isTextNode (node) {
        return node.nodeType === 3
    }

    // 判断节点是否是元素节点(元素节点1属性节点2文本节点3)
    isElementNode (node) {
        return node.nodeType === 1
    }
}
```

##造轮子系列：虚拟dom
[](https://juejin.cn/post/6844903895467032589)

什么是虚拟dom?
虚拟dom就是virtual DOM 是用一个原生JS对象去描述一个DOM节点
Vnode的核心属性是标签名、数据、子节点、键值

Vnode映射到真实节点需要经历Vnode的create、diff、patch等过程

首先创建一个vnode.js，进行vnode节点的定义

```JavaScript
export default class VNode{
    constructor(tag, data, children, text, elm, context){
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.context = context;
    }
}
```

接着创建一个create-element.js，实现vnode的create过程


##造轮子系列：compile

## 造轮子系列： 数据渲染
思路：通过虚拟节点VNode对节点进行构建，构建DOM Tree
在通过遍历DOM Tree 通过createElement创建元素

https://github.com/answershuto/learnVue
    
		
