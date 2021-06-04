## 详解 vue2、vue3、react 响应式原理及其对比

### 前言

    本文是对vue2、vue3、react的响应式原理进行一个理解和对比，希望能帮助自己和大家更深入的了解框架背后的实现。
    知识点：响应式、构造函数、原型、原型链、继承、ES5:Object.defineProperty、call、ES6:Proxy、Class、Reflect

### 概念解析

- 响应式：

  什么是响应式，在 vue 的官方文档中是这么介绍的：响应式原理的核心就是观测数据的变化，数据发生变化以后能通知到对应的观察者来执行相关的逻辑。

* 构造函数

    在<JavaScript高级程序设计第四版>中是这么定义的：任何函数只要使用new操作符调用就是构造函数，而不使用new操作符调用的函数就是普通函数。

- 原型：

  什么是原型，在<JavaScript高级程序设计第四版>中是这么介绍的：每个函数都会创建一个**prototype**属性，这个属性是一个对象，包含应该由特定引用类型的实例共享的属性和方法。实际上，这个对象就是通过调用**构造函数**创建的对象的原型。使用原型对象的好处是，在它上面定义的属性和方法可以被对象实例共享。无论何时，只要创建一个函数，就会按照特定的规则为这个函数创建一个prototype属性（指向原型对象）。所有原型对象自动获得一个名为constructor的属性，指回与之关联的构造函数。Person.prototype.constructor指向Person。__proto__属性可以访问对象的原型
  ```JavaScript
    console.log(Person.prototype.constructor === Person); // true

    console.log(Person.prototype.__proto__ === Object.prototype); // true
    console.log(Person.prototype.__proto__.constructor === Object); // true
  ```

* 原型链：

    <JavaScript高级程序设计第四版>：每个构造函数都有一个原型对象，原型有一个属性指向构造函数，而实例有一个内部指针指向原型。如果原型是另一个类型的实例，就意味着这个原型本身有一个内部指针指向另一个原型，相应地另一个原型也有一个指针指向另一个构造函数。这样就在实例和原型之间构造了一条原型链。

* 继承：

    实现继承是ECMAScript唯一支持的继承方式，而这主要是通过原型链实现的。

* Object.defineProperty

    MDN定义：静态方法Object.defineProperty()直接在对象上定义一个新的属性，或者修改一个对象上已有的属性，并返回该对象。

* call
    
    MDN定义:call()方法使用给定的this值和单独提供的参数调用函数
    call()提供了一个新的值为函数/方法。使用call(),你可以编写一个方法，然后再另一个对象中继承它，而不必为新对象重写方法。
    Parameters： 

```JavaScript
/**
 *  @param obj: 在其上定义属性的对象  
 *  @param prop: Symbol要定义或修改的属性的名称
 *  @param descriptor: 正在定义或修改的属性的描述符
 *  return： 传递给函数的对象
 */
// descriptor: 中着重注意get 和 set函数
Object.defineProperty(obj, prop, descriptor)
```

* Proxy

    MDN定义：Proxy对象使您能够为另一个对象创建代理，该代理可以拦截和重新定义该对象的基本操作。

### vue2.x 中响应式的实现
从定义出发可以拆分为俩步：
1. 观测数据的变化
    
    vue中实例都是通过 new Vue()构造函数生成的
```JavaScript
// src/core/instance/index.js
function Vue(options) {
    if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

通过原型上挂载_init函数进行方法绑定
```JavaScript
// src/core/instance/init.js
export function initMixin(Vue: Class<component>) {
    Vue.protototype._init = function (options?: Object){
        const vm: Component = this
        // ...
        initState(vm)
    }
}
```
通过initState函数进行数据劫持与代理
```JavaScript
// src/core/instance/state.js
export function initState(vm: Component) {
    // vm._watchers = []
    // const opts = vm.$options
    // if (opts.props) initProps(vm, opts.props)
    // if (opts.methods) initMethods(vm, opts.methods)
    //...
    if (opts.data) {
        initData(vm)
    } else {
        observe(vm._data = {}, true /* asRootData */)
    }
    // ...
    // if (opts.computed) initComputed(vm, opts.computed)
    // if (opts.watch && opts.watch !== nativeWatch){
    //     initWatch(vm, opts.watch);
    // }
}

function initData(vm: Component) {
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function'
        ? getData(data, vm)
        : data || {}
    // ...
    // proxy data on instance
    const keys = Object.keys(data)
    let i = keys.length
    while(i--){
        const key = keys[i]
        // 看值的第一个字符串是否为_或$
        if (!isReserved(key)){
            proxy(vm, `_data`, key)
        }
    }
    // observe data
    observe(data, true, /* asRootData */)
}

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

// 代理
export function proxy (target: Object, sourceKey: string, key: string){
    sharedPropertyDefinition.get = function proxyGetter () {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter (val) {
        return this[souceKey][key] = val
    }
}
```

判断是否是数组进行递归定义defineProperty
```JavaScript
// src/core/observe/index.js
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 * 尝试为值创建观察者实例，
 * 如果观察成功返回新的观察者，
 * 或者现有的观察器（如果值已经有一个观察器）。
 */

export function observe (value: any, asRootData: ?boolean): Observer | void {
    // 如果不是对象或者值为虚拟节点则直接返回
    if (!isObject(value) || value instanceof VNode){
        return
    }
    let ob: Observer | void
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else if (
        shouldObserve &&
        !isServerRendering() &&
        (Array.isArray(value) || isPlainObject(value)) &&
        Object.isExtensible(value) &&
        !value._isVue
    ) {
        ob = new Observer(value)
    }
    return ob
}
/* 
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 * 每个观察到的观察者类
 * 对象。连接后，观察者将转换目标
 * 对象的属性键插入getter/setters
 * 收集依赖项并发送更新。
 */
export class Observer {
    value: any;
    dep: Dep;
    vmCount: number; // number of vms that have this object as root $data
    //将此对象作为根$data的虚拟数
    
    constructor(value: any){
        this.value = value
        this.dep = new Dep()
        this.vmCount = 0
        def(value, '__ob__', this)
        if (Array.isArray(value)){
            if (hasProto){
                protoAugument(value, arrayMethods)
            } else {
                copyAugment(value, arrayMethods, arrayKeys)
            }
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }

    /**
     * Walk through all properties and convert them into 
     * getter/setters.This method should only be called when
     * value type is Object.
     * 浏览所有属性并将其转换为
     * getter/setters。只有在
     * 值类型为Object。
     */
    walk (obj: Object) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++){
            defineReactive(obj, keys[i])
        }
    }

    /**
     * Observe a list of Array items.
     * 观察数组项列表。
     */
    observeArray (items: Array<any>) {
        for (let i = 0, l = items.length; i < l; i++){
            observe(items[i])
        }
    }
}

/**
 * Define a reactive property on an Object.
 * 在对象上定义被动属性。
 */
 export function defineReactive (
     obj: Object,
     key: string,
     val: any,
     customSetter?: ?Function,
     shallow?: boolean 
 ) {
    const dep = new Dep()

    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) {
        return
    }

    // cater for pre-defined getter/setters
    满足预定义的getter/setter
    const getter = property && property.get
    const setter = property && property.set
    if((!getter | setter) && arguments.length === 2){
        val = obj[key]
    } 

    let childOb = !shallow && observe(val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            const value = getter ? getter.call(obj) : val
            if (Dep.target) {
                dep.depend()
                if (childObj) {
                    childObj.dep.depend()
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set: function reactiveSetter (newVal) {
            const value = getter ? getter.call(obj) : val
            /* eslint-disable no-self-compare */
            /* eslint禁用无自比较 */
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            /* eslint-enable no-self-compare */
            /* eslint启用无自比较 */
            if (process.env.NODE_ENV !== 'production' && customSetter) {
                customSetter()
            }
            // #7981: for accessor properties without setter
            // 对于没有setter的访问器属性
            if (getter && setter) return
            if (setter) {
                setter.call(obj, newVal)
            } else {
                val = newVal
            }
            childOb = !shallow && observe(newVal)
            dep.notify()
        }
    })
 }
```

2. 数据发生变化以后能通知到对应的观察者来执行相关的逻辑
   
当对值进行修改时，会触发setter方法，从而调用dep.notify()

定义一个Dep进行依赖收集

Dep 的核心是 notify
通过自定义数组subs进行控制
主要实现 addSub removeSub 循环遍历subs 去通知watch 更新
```JavaScript
// src/core/observe/dep.js
let uid;
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * dep是一个可观察的对象，可以有多个指令订阅它。
 */
export function class Dep {
    static target: ?Watcher;
    id: number;
    subs: Array<Watcher>;

    constructor () {
        this.id = uid++
        this.subs = []
    }

    addSub (sub: Watcher) {
        this.subs.push(sub)
    }

    removeSub (sub: Watcher){
        remove(this.subs, sub)
    }

    depend () {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }

    notify () {
        // stabilize the subscriber list first
        // 局部浅拷贝这个数组
        const subs = this.subs.slice()
        if (process.env.NODE_ENV !== 'production' && !config.async) {
            // subs aren't sorted in scheduler if not running async
            // we need to sort them now to make sure they fire in correct
            // order
            // 如果未运行异步，则不会在调度程序中对sub进行排序
            // 我们现在需要对它们进行分类，以确保它们正确按顺序运行
            subs.sort((a, b) => a.id - b.id)
        }
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }
}
```

看看watch的定义
```JavaScript
// src/core/observe/watcher.js
let uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 * 观察者解析表达式，收集依赖项，
 * 并在表达式值更改时激发回调。
 * 这用于$watch（）api和指令。
 */
export default class Watcher {
    vm: Component;
    expression: string;
    cb: Function;
    id: number;
    deep: boolean;
    user: boolean;
    lazy: boolean;
    sync: boolean;
    dirty: boolean;
    active: boolean;
    deps: Array<Dep>;
    newDeps: Array<Dep>;
    depIds: SimpleSet;
    newDepIds: SimpleSet;
    before: ?Function;
    getter: Function;
    value: any;

    constructor(
        vm: Component,
        expOrFn: string | Function,
        cb: Function,
        options?: ?Object,
        isRenderWatcher?: boolean
    ) {
        this.vm = vm
        if (isRenderWatcher) {
            vm._watcher = this
        }
        vm._watcher.push(this)
        // options
        if (options) {
            this.deep = !!options.deep
            this.user = !!options.user
            this.lazy = !!options.lazy
            this.sync = !!options.sync
            this.before = options.before
        } else {
            this.deep = this.user = this.lazy = this.sync = false
        }
        this.cb = cb
        this.id = ++uid // uid for batching
        this.active = true
        this.dirty = this.lazy // for lazy watchers
        this.deps = []
        // ...
        this.value = this.lazy
            ? undefined
            : this.get()

    }

    update () {
        if (this.lazy) {
            this.dirty = true
        } else if (this.sync) {
            this.run()
        } else {
            queueWatcher(this)
        }
    }

    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     * 调度任务接口。
     * 将会被调度程序调用
     */
    run () {
        if (this.active) {
            const value = this.get()
            if(
            value !== this.value ||
            // Deep watchers and watchers on Object/Arrays 
            //深度观察者和对象/数组上的观察者
            isObject(value) ||
            this.deep
            ) {
                // set new value
                //设置新值
                const oldValue = this.value
                this.value = value
                if (this.user) {
                    try {
                        // 调用回调函数，传新值和旧值
                        this.cb.call(this.vm, value, oldValue)
                    } catch(e) {
                        handleError(e, this.vm, `callback for watcher "${this.expression}"`)
                    }
                } else {
                     // 调用回调函数，传新值和旧值
                    this.cb.call(this.vm, value, oldValue)
                }
            }
        } 
    }

    /**
     * Evaluate the getter, and re-collect dependencies.
     * 评估getter，并重新收集依赖项。
     */
    get() {
        pushTarget(this)
        let value
        const vm = this.vm
        try {
            value = this.getter.call(vm, vm)
        } catch (e) {
            if (this.user) {
                handleError(e, vm, `getter for watcher "${this.expression}"`)
            } else {
                throw e
        } finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            // “触摸”每一处财产，以便它们都能被跟踪
            // 深度观察的依赖性
            // 对dep数组进行删除操作
            if (this.deep) {
                traverse(value)
            }
            popTarget()
            this.cleanupDeps()
        }
        return value
    }
}

```

### vue3
vue3响应式主要是应用了ES6的Proxy代替了ES5的Object.defineProperty来实现
```JavaScript
// packages/reactivity/src/reactive.ts
export function reactive(target: object) {
    // if trying to observe a readonly proxy, return the readonly version.
    if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
        return target
    }
    return createReactiveObject(
        target,
        false,
        mutableHandlers,
        mutableCollectionHandlers,
        reactiveMap
    )
}

function createReactiveObject(
    target: Target,
    isReadonly: boolean,
    baseHandlers: ProxyHandler<any>,
    collectionHandlers: ProxyHandler<any>,
    proxyMap: WeakMap<Target, any>
) {
    if (!isObject(target)) {
        if (__DEV__) {
            console.warn(`value cannot be made reactive: ${String(target)}`)
        }
        return target
    }
    // target is already a Proxy, return it.
    // exception: calling readonly() on a reactive object
    if (
        target[ReactiveFlags.RAN] &&
        !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
    ) {
        return target
    }
    // target already has corresponding Proxy
    const existingProxy = proxyMap.get(target)
    if (existingProxy) {
        return existingProxy
    }
    // only a whitelist of value types can be observed
    const target = getTargetType(target)
    if (targetType === TargetType.INVALID) {
        return target
    } 
    const proxy = new Proxy(
        target,
        targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
    )
    proxyMap.set(target, proxy)
    return proxy
}

export function toRaw<T>(observed: T): T {
  return (
    (observed && toRaw((observed as Target)[ReactiveFlags.RAW])) || observed
  )
}
```

mutableHandlers
```JavaScript
// packages/reactivity/src/baseHandlers.ts
export const mutableHandlers: ProxyHandler<object> = {
    get,
    set,
    deleteProperty,
    has,
    ownKeys
}

const get = /*#__PURE__*/ createGetter();

function createGetter(isReadonly = false, shallow = false) {
    return function get(target: Target, key: string | symbol, receiver: Object) {
        if (key === ReactiveFlags.IS_READONLY) {
            return !Readonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        } else if (
            key === ReactiveFlags.RAW &&
            receiver ===
                (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                        ? shallowReactiveMap
                        : reactiveMap
                ).get(target)
            
        ) {
            return target
        }

        const targetIsArray = isArray(target)

        if (!Readonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
            return Reflect.get(arrayInstrumentations, key, receiver)
        }

        const res = Reflect.get(target, key, receiver)

        if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
            return res
        }

        if (!isReadonly) {
            track(target, TrackOpTypes.GET, key)
        }

        if (shallow) {
            return res
        }

        if (isRef(res)) {
            // ref unwrapping - does not apply for Array + integer key.
            const shouldUnwrap = !targetIsArray || !isIntegerKey(key)
            return shouldUnwrap ? res.value : res
        }

        if (isObject(res)) {
            // Convert returned value into a proxy as well. we do the isObject check
            // here to avoid invalid value warning. Also need to lazy access readonly
            // and reactive here to avoid circular dependency.
            return isReadonly ? readonly(res) : reactive(res)
        }

        return res
    }
}
```

mutableCollectionHandlers
```JavaScript
// packages/reactivity/src/collectionHandlers.ts
export const mutableCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: createInstrumentationGetter(false, false)
}

function createInstrumentationGetter(isReadonly: boolean, shallow: boolean) {
  const instrumentations = shallow
    ? isReadonly
      ? shallowReadonlyInstrumentations
      : shallowInstrumentations
    : isReadonly
      ? readonlyInstrumentations
      : mutableInstrumentations

  return (
    target: CollectionTypes,
    key: string | symbol,
    receiver: CollectionTypes
  ) => {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.RAW) {
      return target
    }

    return Reflect.get(
      hasOwn(instrumentations, key) && key in target
        ? instrumentations
        : target,
      key,
      receiver
    )
  }
}

const mutableInstrumentations: Record<string, Function> = {
  get(this: MapTypes, key: unknown) {
    return get(this, key)
  },
  get size() {
    return size((this as unknown) as IterableCollections)
  },
  has,
  add,
  set,
  delete: deleteEntry,
  clear,
  forEach: createForEach(false, false)
}


function deleteEntry(this: CollectionTypes, key: unknown) {
  const target = toRaw(this)
  const { has, get } = getProto(target)
  let hadKey = has.call(target, key)
  if (!hadKey) {
    key = toRaw(key)
    hadKey = has.call(target, key)
  } else if (__DEV__) {
    checkIdentityKeys(target, has, key)
  }

  const oldValue = get ? get.call(target, key) : undefined
  // forward the operation before queueing reactions
  const result = target.delete(key)
  if (hadKey) {
    trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
  }
  return result
}

function createForEach(isReadonly: boolean, isShallow: boolean) {
  return function forEach(
    this: IterableCollections,
    callback: Function,
    thisArg?: unknown
  ) {
    const observed = this as any
    const target = observed[ReactiveFlags.RAW]
    const rawTarget = toRaw(target)
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive
    !isReadonly && track(rawTarget, TrackOpTypes.ITERATE, ITERATE_KEY)
    return target.forEach((value: unknown, key: unknown) => {
      // important: make sure the callback is
      // 1. invoked with the reactive map as `this` and 3rd arg
      // 2. the value received should be a corresponding reactive/readonly.
      return callback.call(thisArg, wrap(value), wrap(key), observed)
    })
  }
}
```



## 造轮子系列： 响应式原理

### 什么是响应式？

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

接下来用 Observer 类来拆分循环判断

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

定义一个 Dep
Dep 主要是干什么呢 主要用来进行依赖收集 也就是管理 watch
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

然后再用一个 Watcher 类去进行依赖收集,用 Dep 进行管理

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
通过 Compiler.js

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
        计算属性和侦听属性
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

##造轮子系列：虚拟 dom

render 就是通过 createVNode 节点，再通过\_mount,\_update 的过程，
通过 patch,diff 的过程创建真实节点

##造轮子系列：template
template 编译
在$mount 的过程中，如果是使用独立构建，则会在此过程中将 template 编译成 render function。

template 是编译成 render function 的过程

```JavaScript
function baseCompile (
	template: string,
	options: CompilerOptions
): CompiledResult {
	/*parse解析得到ast树*/
	const ast = parse(template.trim(), options)
	/**
	 * 将AST树进行优化
	 * 优化的目标：生成模版AST树，检测不需要进行DOM改变的静态子树。
	 * 一旦检测到这些静态树，我们就能做以下事情：
	 * 1.把它们变成常数，这样我们就再也不需要每次重新渲染时创建新的节点了。
	 * 2.在patch的过程中直接跳过。
	 */
	optimize(ast, options) {
		/*根据ast树生成所需的code(内部包含render与staticRenderFns)*/
		const code = generate(ast, options)
		return {
			ast,
			render: code.render,
			staticRenderFns: code.staticRenderFns
		}
	}
}
```

### parse

parse 会用正则等方式解析 template 模版中的指令、class、style 等数据，形成 AST 语法树

### optimize

optimize 的主要作用是标记 static 静态节点，这是 Vue 在编译过程中的一处优化，后面当 update
更新界面时，会有一个 patch 的过程，diff 算法会直接跳过静态节点，从而减少了比较的过程，
优化了 patch 的性能。

### generate

generate 是将 AST 语法树转化成 render function 字符串的过程，得到结果是 render 的字符串
以及 staticRenderFns 字符串。

[](https://juejin.cn/post/6844903895467032589)

##造轮子系列：compile

## vue 轮子系列一：双向绑定

## 开发的道是思想、思路，术是代码，所以造轮子之前，先想清楚思路

首先我们要了解什么是双向绑定？
首先要了解什么 MVVM?
MVVM 是指，Model、View、ViewModel
而 View 的变更也会重新导致 Model 的修改
ViewModel 是 Model 和 View 之间的桥梁

ViewModel 是怎么实现这一过程的呢？
主要是通过 Object.defineProperty 设置一个 getter 和一个 setter
分俩步：
第一步是 Model 的变化重新渲染 view,每次对数据进行修改的时候都会触发 setter，从而导致页面重新渲染
第二步是 View 的变化导致 Model 的修改，通过 watcher 观察，重新修改 Model

分析完了，开始造轮子的步骤。
如何实现步骤一呢？
首先了解下 Object.defineProperty，不了解的同学可以通过 MDN 进行了解
通过 Object.defineProperty 劫持一个自定义的对象，设置自定义的 setter 和 getter
Setter 做哪些事情呢？ 1.监听对象变化，变化的时候触发对应的修改函数 2.定义修改函数，修改 DOM
如何实现步骤二呢？
对初始对象的 getter 进行 observe watch
如何造轮子？
我们最终目的是要发布到网上供自己或他人使用，所以需要使用 node 的 npm 包管理工具进行发布
通过 npm init 初始化
定义目录结构
src
main.js
index.html
main.js 中如何定义
定义初始化对象
通过 export 导出

## 造轮子系列： 数据渲染

思路：通过虚拟节点 VNode 对节点进行构建，构建 DOM Tree
在通过遍历 DOM Tree 通过 createElement 创建元素

https://github.com/answershuto/learnVue

Vue.js 响应式原理

Vue.js 依赖收集

从 Vue.js 源码角度再看数据绑定

Vue.js 事件机制

VNode 节点(Vue.js 实现)

Virtual DOM 与 diff(Vue.js 实现)

聊聊 Vue.js 的 template 编译

Vue.js 异步更新 DOM 策略及 nextTick

从 template 到 DOM（Vue.js 源码角度看内部运行机制）

Vuex 源码解析

聊聊 keep-alive 组件的使用及其实现原理
