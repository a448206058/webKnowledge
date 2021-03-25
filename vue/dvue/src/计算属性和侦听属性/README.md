## 计算属性和监听属性

### 计算属性和监听属性是指的什么
计算属性指的是computed，本质上是computed watch 
监听属性指的是watch，本质上是use watch

### 计算属性和监听属性的相同点和不同点是什么，适用于哪些地方
相同点：本质相同，都是依靠watch实现

不同点：

适用场景：

    计算属性适合用在模板渲染中，某个值是依赖了其它的响应式对象甚至是计算属性计算而来
    
    监听属性适用于观测某个值的变化去完成一段复杂的逻辑业务，允许我们执行异步操作，限制我们
	执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。
    
之所以这么设计是vue想确保不仅仅是计算属性依赖的值发生变化，
而是当计算属性最终计算的值发生变化才会触发渲染watcher重新渲染

2.缓存不同
计算属性是基于对象的响应式依赖进行缓存的。只在相关响应式依赖发生改变时他们才会重新求值

侦听属性不会进行缓存

3.使用方法不同
```JavaScript
computed: {
	fullName: {
		get: function(){
			
		},
		set: function(){
			
		}
	}
}

watch: {
	question: function (newQuestion, oldQuestion) {
	}
}
```

### 计算属性computed的实现
计算属性的初始化的过程是发生在实例的初始化阶段的initState函数中

实现过程：initState -> initComputed -> defineComputed -> createComputedGetter

具体流程分析：

initState是做什么的？
	
initState主要是对props、methods、data、computed和watcher等属性做了初始化操作。
	
```JavaScript
export function initState (vm: Component) {
	vm._watchers = []
	const opts = vm.$options
	if (opts.props) = initProps(vm, opts.methods)
	if (opts.method) = initMethod(vm, opts.methods)
	if (opts.data) {
		initData(vm)
	} else {
		observe(vm._data = {}, true /* asRootData */)
	}
	if (opts.computed) initComputed(vm, opts.computed)
	if (opts.watch && opts.watch !== nativeWith) {
		initWatch(vm, opts.watch)
	}
}
```

### initComputed 初始化computed
首先创建vm._computedWatchers为一个空对象

然后遍历computed对象，拿到计算属性的每一个userDef，然后尝试获取这个userDef对应的getter

接下来为每一个getter创建一个watcher,不是渲染watcher 而是一个computed watcher

如果key不是vm的属性，则调用defineComputed(vm, key, userDef) 

```JavaScript
const computedWatchOptions = { computed: true }

function initComputed (vm: Component, computed: Object) {
    //首先创建vm._computedWatchers为一个空对象
    const watchers = vm._computedWatchers = Object.create(null)

    // computed properties are just getters during SSR
    const isSSO = isServerRendering();
    
    //对computed对象做遍历，拿到计算属性的每一个userDef，然后尝试获取这个userDef对应的getter函数
    for (const key in computed) {
        const userDef = computed[key];
        const getter = typeof userDef === 'function' ? userDef : userDef.get
        if(process.env.NODE_ENV !== 'production' && getter !== null) {
            warn(
                `Getter is missing for computed property "${key}".`,
                vm
            )
        }

        //接下来为每一个getter创建一个watcher,不是渲染watcher 而是一个computed watcher
        if(!isSSO) {
            // create internal watcher for the computed property.
            watchers[key] = new Watcher(
                vm,
                getter || noop,
                noop,
                computedWatchOptions
            )
        }

        //如果key不是vm的属性，则调用defineComputed(vm, key, userDef) 
        if(!(key in vm)){
            defineComputed(vm, key, userDef)
        } else if (process.env.NODE_ENV !== 'production'){
            if (key in vm.$data){
                warn(`The computed property "${key}" is already defined in data.`, vm)
            }else if(vm.$options.props && key in vm.$options.data) {
                warn(`The computed property "${key}" is already defined as a prop.`, vm)
            }
        } 
    }
}
```

继续往下走
### defineComputed 的实现
利用Object.defineProperty给计算属性对应的key添加getter和setter，setter通常是计算属性的一个对象，
并且拥有set方法的时候才有，否则是一个空函数
```JavaScript
export function defineComputed (
    target: any,
    key: string,
    userDef: Object | Function
) {
    const shouldCache = !isServerRending()
    if (typeof userDef === 'function') {
        sharedPropertyDefinition.get = shouldCache
            ? createComputedGetter(key)
            : userDef
        sharedPropertyDefinition.set = noop
    } else {
        sharedPropertyDefinition.get = userDef.get
            ? shouldCache && userDef.cache !== false
                ? createComputedGetter(key)
                : userDef.get
            : noop
        sharedPropertyDefinition.set = userDef.set
            ? userDef.set
            : noop
    }
    if (process.env.NODE_ENV !== 'production' &&
        sharedPropertyDefinition.set === noop) {
            sharedPropertyDefinition.set = function(){
                warn(
                    `Computed property "${key}" was assigned to but it has no setter.`,
                    this
                )       
            }
        }
        Object.defineProperty(target, key, sharedPropertyDefinition)   
}
```

然后是createComputedGetter
createComputedGetter返回一个函数computedGetter，它就是计算属性对应的getter。
```JavaScript
function createComputedGetter (key) {
    return function computedGetter() {
        const watcher = this._computedWatchers && 
        this._computedWatchers[key]
        if (watcher) {
            watcher.depend()
            return watcher.evaluate()
        }
    }
}
```

### 侦听属性watch 的实现
侦听属性的初始化也是发生在实例的初始化阶段的initState函数中，在computed初始化之后执行

实现过程：initWatch -> createWatcher -> vm.$watch

```JavaScript
if (opts.watch && opts.watch !== nativeWith) {
	initWatch(vm, opts.watch)
}
```

### initWatch 的实现
对watch遍历 拿到对应的handler 因为handler可能是一个数组，
遍历handler 创建对应的watch
```JavaScript
function initWatch (vm: Component, watch: Object) {
	for (const key in watch) {
		const handler = watch[key]
		if (Array.isArray(handler)){
			createWatcher(vm, key, handler[i])
		} else {
			createWatcher(vm, key, handler)
		}
	}
}
```

### createWatcher 实现

```JavaScript
function createWatcher(
	vm: Component,
	expOrFn: string | Function,
	handler: any,
	options?: Object
) {
	// 首先对handler的类型做判断，拿到它最终的回调函数
	if (isPlainObject(handler)) {
		options = handler
		handler = handler
	}
	if (typeof handler === 'string') {
		handler = vm[handler]
	}
	// 最后调用vm.$watch(keyOrFn, handler, options)函数
	// $watch是Vue原型上的方法，它是执行stateMicin的时候定义的
	return vm.$watch(expOrFn, handler, options)
}
```

### $watch 实现
侦听属性watch最终会调用$watch方法，这个方法首先判断cb如果是一个对象，则调用createWatcher方法，
这是因为$watch可以直接调用，既可以传入对象， 也可传入函数


```JavaScript
Vue.prototype.$watch = function (
	expOrFn: string | Function,
	cb: any,
	options?: Object
): Function {
	const vm: Component = this
	if (isPlainObject(cb)) {
		return creteWatcher(vm, expOrFn, cb, options)
	}
	// 直接执行回调函数
	if (options.immediate) {
		cb.call(vm, watcher.value)
	}
	// 调用teardown()移除watcher
	return function unwatchFn() {
		watcher.teardown()
	}
}

```

### 计算属性 computed 例子
```JavaScript
var vm = new Vue({
	data: {
		firstName: 'Foo',
		lastName: 'Bar'
	},
	computed: {
		fullName: function () {
			return this.firstName + ' ' + this.lastName
		}
	}
});

// 实例化过程
constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean 
) {
    if (this.computed) {
        this.value = undefined
        this.dep = new Dep()
    } else {
        this.value = this.get()
    }
}

/**
*   Depend on this watcher. Only for computed property watchers.
*/
depend () {
    // Dep.target是渲染watcher
    if (this.dep && Dep.target) {
        // this.dep.depend()相当于渲染watcher订阅了computed watcher
        this.dep.depend()
    }
}

// 执行 watcher.evaluate() 求值
evaluate () {
    if (this.dirty) {
        this.value = this.get();
        this.dirty = false
    }
    return this.value
}

if (this.computed) {
    if (this.dep.subs.length === 0) {
        this.dirty = true
    } else {
        this.getAndInvoke(() => {
            this.dep.notify();
        })
    } else if (this.sync) {
        this.run()
    } else {
        queueWatcher(this)
    }
}

getAndInvoke (cb: Function) {
    const value = this.get();
    if (
        value !== this.value ||
        isObject(value) ||
        this.deep
    ) {
        const oldValue = value
        this.value = value
        this.dirty = false
        if (this.user) {
            try {
                cb.call(this.vm, value, oldValue)
            } catch(e) {
                handleError(e, this.vm, `callback for watcher "${this.expression}"`)
            }
        } else {
            cb.call(this.vm, value, oldValue)
        }
    }
}
```

### 侦听属性watch 例子
```JavaScript
// watcher options
if (options) {
    this.deep = !!options.deep
    this.user = !!options.user
    this.computed = !!options.computed
    this.sync = !!options.sync
} else {
    this.deep = this.user = this.computed = this.sync = false
}

// deep watcher
watch : {
    a: {
        deep: true,
        handler (newVal) {
            console.log(newVal)
        }
    }
}

// watcher执行get()求值
get () {
    this.value = this.getter.call(vm, vm);
    if (this.deep) {
        traverse(value)
    }
}

// traverse
// src/core/observer/traverse.js
import {_Set as Set, isObject} from '../util/index'
import type { SimpleSet } from '../util/index'
import VNode from '../vdom/vnode'

const seenObjects = new Set();

export function traverse (val: any) {
    _traverse(val, seenObjects)
    seenObjects.clear()
}

function _traverse (val: any, seen: SimpleSet) {
    let i, keys
    const isA = Array.isArray(val)
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
        return
    }
    if (val.__ob__) {
        const depId = val.__ob__.dep.id
        if (seen.has(depId)) {
            return
        }
        seen.add(depId)
    }
    if (isA) {
        i = val.length
        while(i--) _traverse(val[i], seen)
    } else {
        keys = Object.keys(val)
        i = keys.length
        while (i--) _traverse(val[keys[i]], seen)
    }
}

function _traverse(val: any, seen: SimpleSet) {
    let i, keys
    const isA = Array.isArray(val)
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
        return
    }
}


// 在user求值以及执行回调函数的时候，处理一下错误
get() {
    if(this.user){
        handleError(e, vm, `getter for watcher "${this.expression}"`)
    } else {
        throw e
    }
},
getAndInvoke() {
    if(this.user){
        try {
            this.cb.call(this.vm, value, oldValue)
        }catch(e){
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
        }
    } else {
        this.cb.call(this.vm, value, oldValue)
    }
}

update() {
    if (this.computed) {
    
    } else if (this.sync) {
        this.run()
    } else{
        queueWatcher(this)
    }
}



```


