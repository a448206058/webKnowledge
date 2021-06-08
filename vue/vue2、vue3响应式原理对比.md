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

* reflect
  ES6 中将 Object 的一些明显属于语言内部的方法移植到了 Reflect 对象上（当前某些方法会同时存在于 Object 和 Reflect 对象上），未来的新方法会只部署在 Reflect 对象上。 

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

    w3c定义：一个 Proxy 对象由两个部分组成： target 、 handler 。在通过 Proxy 构造函数生成实例对象时，需要提供这两个参数。 target 即目标对象， handler 是一个对象，声明了代理 target 的指定行为。

* Class

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
vue3响应式 reactive中的实现是由proxy和effect组合
主要是应用了ES6的Proxy代替了ES5的Object.defineProperty来实现

```JavaScript
// packages/reactivity/src/reactive.ts
export function reactive(target: object) {
    // if trying to observe a readonly proxy, return the readonly version.
    // 如果目标对象是一个只读的响应数据，则直接返回目标对象
    if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
        return target
    }
    // 否则调用 createReactiveObject 创建 observe
    return createReactiveObject(
        target,
        false,
        mutableHandlers,
        mutableCollectionHandlers,
        reactiveMap
    )
}

// Target 目标对象
// isReaonly 是否只读
// baseHandlers 基本类型的handlers
// collectionHandlers 主要针对(set、map、weakSet、weakMap)的handlers
// proxyMap弱引用map
function createReactiveObject(
    target: Target,
    isReadonly: boolean,
    baseHandlers: ProxyHandler<any>,
    collectionHandlers: ProxyHandler<any>,
    proxyMap: WeakMap<Target, any>
) {
    // 如果不是对象
    if (!isObject(target)) {
        // 在开发模式抛出警告，生产环境直接返回目标对象
        if (__DEV__) {
            console.warn(`value cannot be made reactive: ${String(target)}`)
        }
        return target
    }
    // target is already a Proxy, return it.
    // exception: calling readonly() on a reactive object
    // 如果目标对象已经是个proxy直接返回
    // 异常：对反应对象调用readonly（）
    if (
        target[ReactiveFlags.RAN] &&
        !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
    ) {
        return target
    }
    // target already has corresponding Proxy
    // 目标已具有相应的代理
 
    const existingProxy = proxyMap.get(target)
    if (existingProxy) {
        return existingProxy
    }
    // only a whitelist of value types can be observed
     // 检查目标对象是否能被观察，不能直接返回
    const target = getTargetType(target)
    if (targetType === TargetType.INVALID) {
        return target
    } 
    // 使用Proxy 创建observe
    const proxy = new Proxy(
        target,
        targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
    )
    // 存储当前目标对象的proxy 可以防止反复创建
    proxyMap.set(target, proxy)
    return proxy
}
```

BaseHandlers
```JavaScript
// packages/reactivity/src/baseHandlers.ts
// 可变处理
export const mutableHandlers: ProxyHandler<object> = {
  // 用于拦截对象的读取属性操作
  get,
  // 用于拦截对象的设置属性操作
  set,
   // 用于拦截对象的删除属性操作
  deleteProperty,
  // 检查一个对象是否拥有某个属性
  has,
  // 针对 getOwnPropertyNames, getOwnPropertySymbols, keys 的代理方法
  ownKeys
}

const get = /*#__PURE__*/ createGetter()

const set = /*#__PURE__*/ createSetter()

function deleteProperty(target: object, key: string | symbol): boolean {
  const hadKey = hasOwn(target, key)
  const oldValue = (target as any)[key]
  const result = Reflect.deleteProperty(target, key)
  if (result && hadKey) {
    trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
  }
  return result
}

function has(target: object, key: string | symbol): boolean {
  const result = Reflect.has(target, key)
  if (!isSymbol(key) || !builtInSymbols.has(key)) {
    track(target, TrackOpTypes.HAS, key)
  }
  return result
}

function ownKeys(target: object): (string | symbol)[] {
  track(target, TrackOpTypes.ITERATE, isArray(target) ? 'length' : ITERATE_KEY)
  return Reflect.ownKeys(target)
}

/**
  * @description:
  * @param {target} 目标对象
  * @param {key} 需要获取的值的键值
  * @param {receiver} 如果遇到 setter，receiver则为setter调用时的this值
  */
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    //  ReactiveFlags 是在reactive中声明的枚举值，如果key是枚举值则直接返回对应的布尔值
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (
      // 如果key是raw 则直接返回目标对象
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

    // 如果目标对象是数组并且 key 属于三个方法之一 ['includes', 'indexOf', 'lastIndexOf']，即触发了这三个操作之一
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }

    const res = Reflect.get(target, key, receiver)

    // 如果 key 是 symbol 内置方法，或者访问的是原型对象，直接返回结果，不收集依赖
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res
    }

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }

    // 如果是浅观察并且不为只读则调用 track Get, 并返回结果
    if (shallow) {
      return res
    }

    // 如果get的结果是ref
    if (isRef(res)) {
      // ref unwrapping - does not apply for Array + integer key.
      // 目标对象为数组并且不为只读调用 track Get, 并返回结果
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key)
      return shouldUnwrap ? res.value : res
    }

    // 由于 proxy 只能代理一层，所以 target[key] 的值如果是对象，就继续对其进行代理
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

ref
接收参数并返回一个响应式且可改变的ref对象。ref对象拥有一个指向内部值的单一属性.value
由于reacive内部采用Proxy实现，proxy只接受对象作为入参。这才有了ref来解决值类型的数据响应，如果传入ref是一个对象，内部也会调用reactive方法进行深层响应转换

```JavaScript
// packages/reactivity/src/reactive.ts
export function reactive(T extends object)(taget: T): UnwrapNestedRefs<T>
```

```JavaScript
// packages/reactivity/src/ref.ts
export function ref(value?: unknown) {
    return createRef(value)
}

function createRef(rawValue: unknown, shallow = false) {
    if (isRef(rawValue)) {
        return rawValue
    }
    return RefImpl(rawValue, shallow)
}

class RefImpl<T> {
    private _value: T

    public readonly __v_isRef = true

    constructor(private _rawValue: T, public readonly _shallow = false) {
        // 如果是浅观察直接观察，不是则将rawValue转换成reactive
        this._value = _shallow ? _rawValue : convert(_rawValue)
    }

    get value() {
        // 依赖收集
        track(toRaw(this), TrackOpTypes.GET, 'value')
        return this._value
    }

    set value(newVal) {
        if(hasChanged(toRaw(newVal), this._rawValue)) {
            this._rawValue = newValue
            this._value = this.shallow ? newVal : convert(newVal)
            // 触发依赖
            trigger(toRaw(this), TriggerOpTypes.SET, 'value', newVal)
        }
    }
}

// 如果是对象 则调用reactive进行observe 否则返回当前val
const convert = <T extends unknown>(val: T): T =>
  isObject(val) ? reactive(val) : val
```

effect 作为 reactive 的核心，主要负责收集依赖，更新依赖
effect 接收俩个参数
- fn 回调函数
- options 参数
```JavaScript
// packages/reactivity/src/effect.ts
export interface ReactiveEffectOptions {
  // 是否延迟触发 effect
  lazy?: boolean
  // 调度函数
  scheduler?: (job: ReactiveEffect) => void
  // 追踪时触发
  onTrack?: (event: DebuggerEvent) => void
  // 触发回调时触发
  onTrigger?: (event: DebuggerEvent) => void
  // 停止监听时触发
  onStop?: () => void
  /**
   * Indicates whether the job is allowed to recursively trigger itself when
   * managed by the scheduler.
   *
   * By default, a job cannot trigger itself because some built-in method calls,
   * e.g. Array.prototype.push actually performs reads as well (#1740) which
   * can lead to confusing infinite loops.
   * The allowed cases are component update functions and watch callbacks.
   * Component update functions may update child component props, which in turn
   * trigger flush: "pre" watch callbacks that mutates state that the parent
   * relies on (#1801). Watch callbacks doesn't track its dependencies so if it
   * triggers itself again, it's likely intentional and it is the user's
   * responsibility to perform recursive state mutation that eventually
   * stabilizes (#1727).
   */
  allowRecurse?: boolean
}

export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  // 如果已经是`effect` 先重置为原始对象
  if (isEffect(fn)) {
    fn = fn.raw
  }

  // 创建effect
  const effect = createReactiveEffect(fn, options)

  // 如果没有传入 lazy 则直接执行一次effect
  if (!options.lazy) {
    effect()
  }
  return effect
}

function createReactiveEffect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  const effect = function reactiveEffect(): unknown {
    // 没有激活，说明调用了effect stop函数
    if (!effect.active) {
      return fn()
    }
    // 判断effectStack中有没有effect，如果在则不处理
    if (!effectStack.includes(effect)) {
      // 清除effect依赖
      cleanup(effect)
      try {
        // 开始重新收集依赖
        enableTracking()
        // 压入Stack
        effectStack.push(effect)
        // 将activeEffect当前effect
        activeEffect = effect
        return fn()
      } finally {
        // 完成后将effect弹出
        effectStack.pop()
        // 重置依赖
        resetTracking()
        // 重置activeEffect
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect
  // 自增id，effect唯一标识
  effect.id = uid++
  effect.allowRecurse = !!options.allowRecurse
  // 是否是effect
  effect._isEffect = true
  // 是否激活
  effect.active = true
  // 挂载原始对象
  effect.raw = fn
  // 当前effect的dep数组
  effect.deps = []
  // 传入的options，在effect有解释的那个字段
  effect.options = options
  return effect
}

// 每次effect运行都会重新收集依赖,deps是effect的依赖数组，需要全部清空
function cleanup(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}

/**
 * @description:
 * @param {target} 目标对象
 * @param {type} 收集的类型
 * @param {key} 触发 track 的 object 的 key
 */
export function track(target: object, type: TrackOpTypes, key: unknown) {
  // activeEffect为空代表没有依赖，直接return
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  // targetMap 依赖管理中心，用于收集依赖和触发依赖
  // 检查targetMap中有没有当前target
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    // 没有则新建一个
    depsMap.set(key, (dep = new Set()))
  }
  // deps来收集依赖函数，当监听的key值发生变化时，触发dep中的依赖函数
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
    // 开发环境会触发onTrack，仅用于调试
    if (__DEV__ && activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      })
    }
  }
}

// get、has、iterate 三种类型的读取对象会触发track
export const enum TrackOpTypes {
    GET = 'get',
    HAS = 'has',
    ITERATE = 'iterate'
}

//触发依赖（触发更新后执行监听函数之前触发）
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target)
  // 依赖管理中没有，代表没有收集过依赖，直接返回
  if (!depsMap) {
    // never been tracked
    return
  }

  // 对依赖进行分类
  // effects 代表依赖
  // Set结构，避免重复收集
  const effects = new Set<ReactiveEffect>()
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        // 避免重复收集
        if (effect !== activeEffect || effect.allowRecurse) {
          // 属性依赖
          effects.add(effect)
        }
      })
    }
  }

  if (type === TriggerOpTypes.CLEAR) {
    // collection being cleared
    // trigger all effects for target
    depsMap.forEach(add)
  } else if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        add(dep)
      }
    })
  } else {
    // schedule runs for SET | ADD | DELETE
    if (key !== void 0) {
      add(depsMap.get(key))
    }

    // also run for iteration key on ADD | DELETE | Map.SET
    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target)) {
          add(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            add(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        } else if (isIntegerKey(key)) {
          // new index added to array -> length changes
          add(depsMap.get('length'))
        }
        break
      case TriggerOpTypes.DELETE:
        if (!isArray(target)) {
          add(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            add(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        }
        break
      case TriggerOpTypes.SET:
        if (isMap(target)) {
          add(depsMap.get(ITERATE_KEY))
        }
        break
    }
  }

  const run = (effect: ReactiveEffect) => {
    if (__DEV__ && effect.options.onTrigger) {
      effect.options.onTrigger({
        effect,
        target,
        key,
        type,
        newValue,
        oldValue,
        oldTarget
      })
    }
    // 如果 scheduler 存在则调用 scheduler，计算属性拥有 scheduler
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  }

  // 触发依赖函数
  effects.forEach(run)
}
```

### 总结
vue2.x和vue3的响应式对比主要是
1. vue3采用了proxy代替了vue2.x: Object.defineProperty的写法，因为proxy是针对对象的代理，所以增加了ref对值的代理
2. 在依赖收集上vue3采用了effect，vue2.x使用了dep写法
3. 在通知上面vue2.x使用this.cb.call(this.vm, value, oldValue)直接调用传递函数，vue3循环调用effect执行回调函数
