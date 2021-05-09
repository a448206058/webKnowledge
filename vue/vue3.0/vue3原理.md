参考资料：https://vue3js.cn/es6/dataStructure.html#%E6%80%BB%E7%BB%93

## vue3.0

### 响应式

### patch 算法的优化

使用 block 做标记 /\*\*/
进行标记 不需要比较的直接省略

### 为什么要用 Proxy 重构

Vue3.0 之前的双向绑定是由 defineProperty 实现，在 3.0 重构为 Proxy

Object.defineProperty()方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象
对对象上的属性做操作，而非对象本身，就是在 Observer data 时，新增属性并不存在，自然就不会有 getter，setter，
也就解释了为什么新增视图不更新。

- Proxy 作为新标准将受到浏览器厂商重点持续的性能优化
- Proxy 能观察的类型比 defineProperty 更丰富
- Proxy 不兼容 IE,也没有 polyfill,defineProperty 能支持到 IE9
- Object.definePropert 是劫持对象的属性，新增元素需要再次 defineProperty。而 Proxy 劫持的是整个读喜庆，不需要做特殊处理
- 使用 defineProperty，我们修改原来的 obj 对象就可以触发拦截，而使用 proxy，就必须修改代理对象，即 Proxy 的实例才可以触发拦截

### Set、Map、WeakSet、WeakMap

Set 是一种叫做集合的数据结构，Map 是一种叫做字典的数据结构

- 集合：是由一堆无序的、相关联的，且不重复的内存结构组成的组合
- 字典：是一些元素的集合。每个元素有一个称作 key 的域，不同元素的 key 各不相同

共同点：集合、字典都可以存储不重复的值
不同点：集合是以【值，值】的形式存储元素，字典是以【键，值】的形式存储

在 es6 之前，我们通常使用内置的 Object 模拟 Map
但是这样模拟出来的 map 会有一些缺陷

1. Object 的属性键是 String 或 Symbol，这限制了它们作为不同数据类型的键/值对集合的能力
2. Object 不是设计来作为一种数据集合，因此没有直接有效的方法来确定对象具有多少属性

### Set

定义：Set 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用，Set 对象是值的集合，你可以按照插入的顺序迭代它的元素。Set 中的元素只会出现一次，即 Set 中的元素是唯一的
Set 本身是一个构造函数，用来生成 Set 数据结构

### WeakSet

WeakSet 对象是一些对象值的集合，并且其中的每个对象值都只能出现一次。在 WeakSet 的集合中是唯一的

WeakSet 的出现主要解决弱引用对象存储的场景，其结构与 Set 类似

弱引用是指不能确保其引用的对象不会被垃圾回收器回收的引用，换句话说就是可能在任意时间被回收

- 与 Set 相比，WeakSet 只能是对象的集合，而不能是任何类型的任意值
- WeakSet 集合中对象的引用为弱引用。如果没有其他的对 WeakSet 中对象的引用，那么这些对象会被当成垃圾回收掉。这也意味着 WeakSet 中没有存储当前对象的列表。

### Map

Map 对象保存键值对，并且能够记住键的原始插入顺序。任何值（对象或者原始值）都可以作为一个键或一个值。一个 Map 对象在迭代时会根据对象中元素的插入顺序来进行-一个 for...of 循环在每次迭代后会返回一个形式为[key, value]的数组

### WeakMap

WeakMap 对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的

与 Map 的区别

- Map 的键可以是任意类型，WeakMap 的键只能是对象类型
- WeakMap 键名所指向的对象，不计入垃圾回收机制

- Set、Map、WeakSet、WeakMap 都是一种集合的数据结构
- Set、WeakSet 是【值，值】的集合，且具有唯一性
- Map 和 WeakMap 是一种【键，值】的集合，Map 的键可以是任意类型，WeakMap 的只能是对象类型
- Set 和 Map 有遍历方法，WeakSet 和 WeakMap 属于弱引用不可遍历

## vue3 目录结构

- .circleci // CI 配置目录
- .ls-lint.yml // 文件命名规范
- .prettierrc // 代码格式化 prettier 的配置文件
- CHANGELOG.md // 更新日志
- LICENSE
- README.md
- api-extractor.json // TypeScript 的 API 提取和分析工具
- jest.config.js // 测试框架 jest 的配置文件
- node_modules
- package-lock.json
- package.json
- packages // Vue 源代码目录
- rollup.config.js // 模块打包器 rollup 的配置文件
- scripts
- test-dts // TypeScript 配置文件
- tsconfig.json // TypeScript 配置文件
- yarn.lock

### package

- compiler-core // 抽象语法树和渲染桥接实现
- compiler-dom // Dom 实现
- compiler-sfs // Vue 单文件组件（.vue）的实现
- compiler-ssr
- global.d.ts
- reactivity
- runtime-core
- runtime-dom
- runtime-test
- server-renderer // 服务端渲染实现
- shared // package 之间共享的工具库
- size-check
- template-explorer
- vue

compiler time 可以理解为程序编译时，我们将.vue 文件编译成浏览器能识别的.html 文件的一些工作

run time 可以理解为程序运行时，即是程序被编译了之后，打开程序并运行它直到程序关闭的这段时间的系列处理

## CreateApp

### 例子

```JavaScript
const HelloVueApp = {
    data() {
        return {
            message: 'Hello Vue!'
        }
    }
}

Vue.createApp(HelloVueApp).mount('#hello-vue')
```

- createApp

```JavaScript
export const createApp = ((...args) => {
    const app = ensureRenderer().createApp(..args)

    if (__DEV__) {
        injectNativeTagCheck(app)
    }

    const { mount } = app
    app.mount = (containerOrSelector: Element | string): any => {
        const container = normalizeContainer(containerOrSelector)
        if (!container) return
        const component = app._component
        if (!isFunction(component) && !component.render && !component.template) {
            component.template = container.innerHTML
        }
        // clear content before mounting
        container.innerHTML = ''
        const proxy = mount(container)
        container.removeAttribute('v-cloak')
        return proxy
    }

    return app
}) as CreateAppFunction<Element>


// ensure Render
const rendererOptions = {
    patchProps, // 处理 props 属性
    ...nodeOps // 处理DOM节点操作
}

// lazy create the renderer - this makes core renderer logic tree-shakable
// in case the user only imports reactivity utilities from Vue.
let renderer: Renderer | HydrationRenderer

let enabledHydration = false

function ensureRenderer() {
    return renderer || (renderer = createRenderer(rendererOptions))
}

// creatRenderer
export function createRenderer<
    HostNode = RendererNode,
    HostElement = RendererElement
>(options: RendererOptions<HostNode, HostElement>) {
    return baseCreateRenderer<HostNode, HostElement>(options)
}
```

- baseCreateRenderer
  vnode diff patch 均在这个方法中实现

```JavaScript
function baseCreateRenderer(
    options: RendererOptions,
    createHydrationFns?: typeof createHydrationFunctions
): any {
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        createComment: hostCreateComment,
        setText: hostSetText,
        setElementText: hostSetElementText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        setScopeId: hostSetScopeId = NOOP,
        cloneNode: hostCloneNode,
        insertStaticContent: hostInsertStaticContent
    } = options

    return {
        render,
        hydrate,
        createApp: createAppAPI(render, hydrate)
    }
}
```

- createAppAPI

```JavaScript
export function createAppAPI<HostElement>(
    render: RootRenderFunction,
    hydrate?: RootHydrateFunction
): CreateAppFunction<HostElement> {
    return function createApp(rootComponent, rootProps = null) {
        if (rootProps != null && !isObject(rootProps)) {
            __DEV__ && warn(`root props passed to app.mount() must be an object.`)
            rootProps = null
        }

        // 创建默认APP配置
        const context = createAppContext()
        const installedPlugins = new Set()

        let isMounted = false

        const app: APP = {
            _component: rootComponent as Component,
            _props: rootProps,
            _container: null,
            _context: context,

            get config() {
                return context.config
            },

            set config(v) {
                if (__DEV__) {
                    warn(
                        `app.config cannot be replaced. Modify individual options instead.`
                    )
                }
            },

            user() {},
            mixin() {},
            component() {},
            directive() {},

            mount() {},
            unmount() {},
        }

        return app
    }
}

// createAppContext
export function createAppContext(): AppContext {
    return {
        config: {
            isNativeTag: NO,
            devtools: true,
            performance: false,
            globalProperties: {},
            optionMergeStrategies: {},
            isCustomElement: NO,
            errorHandler: undefined,
            warnHandler: undefined
        },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null)
    }
}
```

### h()

代表的是 hyperscript。它是 HTML 的一部分，表示的是超文本标记语言，当我们正在处理一个脚本的时候，在虚拟 DOM 节点中去使用它进行替换已成为一种惯例。

- Hyperscript 它本身表示的是生成描述 HTML 结构的脚本
  返回一个虚拟节点，通常缩写为 VNode：一个普通对象，其中包含向 Vue 描述它应该在页面上呈现哪种节点的信息，包括对任何子节点的描述。用于手动编写 render

```JavaScript
const App = {
    render() {
        // type 元素的类型
        // propsOrChildren 数据对象，这里主要表示（props，attrs,dom props,class 和 style）
        // children 子节点
        return Vue.h('h1', {}, 'Hello Vue3js.cn')
    }
}
Vue.createApp(App).mount('#app')

// h()
export function h(type: any, propsOrChildren?: any, children?: any): VNode {
    if (arguments.length === 2) {
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            // single vnode without props
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren])
            }
            // props without children
            return createVNode(type, propsOrChildren)
        } else {
            // omit props
            return createVNode(type, null, propsOrChildren)
        }
    } else {
        if (isVNode(children)) {
            children = [children]
        }
        return createVNode(type, propsOrChildren, children)
    }
}

// _createVNode
function _createVNode(
    type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,
    props: (Data & VNodeProps) | null = null,
    chilren: unknown = null,
    // 更新标志
    patchFlag: number = 0,
    // 自定义属性
    dynamicProps: string[] | null = null,
    // 是否是动态节点，（v-if v-for）
    isBlockNode = false
): VNode {
    // type 必传参数
    if (!type || type === NULL_DYNAMIC_COMPONENT) {
        if (__DEV && type) {
            warn(`Invalid vnode type when creating vnode: ${type}.`)
        }
        type = Comment
    }

    // Class 类型的type标准化
    // class component normalization.
    if (isFunction(type) && '__vccOpts' in type) {
        type = type.__vccOpts
    }

    // class & style normalization.
    if (props) {
        // props 如果是响应式，clone一个副本
        if (isProxy(props) || InternalObjectKey in props) {
            props = extend({}, props)
        }
        let { class klass, style } = props

        // 标准化class，支持 string, array, object 三种形式
        if (klass && !isString(klass)) {
            props.class = normalizeClass(klass)
        }

        // 标准化style,支持array, object 俩种形式
        if (isObject(style)) {
            // reactive state objects need to be cloned since they are likely to be
            // mutated
            if (isProxy(style) && !isArray(style)) {
                style = extend({}, style)
            }
            props.style = normalizeStyle(style)
        }
    }

    // encode the vnode type information into a bitmap
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : __FEATURE_SUSPENSE__ && isSuspense(type)
      ? ShapeFlags.SUSPENSE
      : isTeleport(type)
        ? ShapeFlags.TELEPORT
        : isObject(type)
          ? ShapeFlags.STATEFUL_COMPONENT
          : isFunction(type)
            ? ShapeFlags.FUNCTIONAL_COMPONENT
            : 0

  if (__DEV__ && shapeFlag & ShapeFlags.STATEFUL_COMPONENT && isProxy(type)) {
    type = toRaw(type)
    warn(
      `Vue received a Component which was made a reactive object. This can ` +
        `lead to unnecessary performance overhead, and should be avoided by ` +
        `marking the component with \`markRaw\` or using \`shallowRef\` ` +
        `instead of \`ref\`.`,
      `\nComponent that was made reactive: `,
      type
    )
  }

  // 构造 VNode 模型
  const vnode: VNode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    children: null,
    component: null,
    suspense: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
  }

  normalizeChildren(vnode, children)

  // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.

  // patchFlag 标志存在表示节点需要更新，组件节点一直存在 patchFlag，因为即使不需要更新，它需要将实例持久化到下一个 vnode，以便以后可以正确卸载它
  if (
    shouldTrack > 0 &&
    !isBlockNode &&
    currentBlock &&
    // the EVENTS flag is only for hydration and if it is the only flag, the
    // vnode should not be considered dynamic due to handler caching.
    patchFlag !== PatchFlags.HYDRATE_EVENTS &&
    (patchFlag > 0 ||
      shapeFlag & ShapeFlags.SUSPENSE ||
      shapeFlag & ShapeFlags.TELEPORT ||
      shapeFlag & ShapeFlags.STATEFUL_COMPONENT ||
      shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT)
  ) {
    // 压入 VNode 栈
    currentBlock.push(vnode)
  }

  return vnode
}
```

\_creatVNode

1. 标准化 props class
2. 给 VNode 打上编码标记
3. 创建 VNode
4. 标准化子节点

## nextTick

在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM

```JavaScript
import { createApp, nextTick } from 'vue'
const app = createApp({
    setup() {
        const message = ref('Hello!')
        const changeMessage = async newMessage => {
            message.value = newMessage
            // 这里获取DOM的value是旧值
            await nextTick()
            // nextTick后获取DOM的value是更新后的值
            console.log('Now DOM is updated')
        }
    }
})
```

### JS 执行机制

JS 是单线程语言，即指某一时间内只能干一件事

- 同步 在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务
- 异步 不进入主线程、而进入“任务队列”（task queue）的任务，只有“任务队列”通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行

### 运行机制

- 1）所有同步任务都在主线程上执行，形成一个执行栈（execution context stack）。
- 2）主线程之外，还存在一个“任务队列”（task queue）。只要异步任务有了运行结果，就在“任务队列”之中放置一个时间。
- 3）一旦“执行栈”中的所有同步任务执行完毕，系统就会读取“任务队列”，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。
- 4）主线程不断重复上面的第三步

### nextTick

完全是基于语言执行机制实现，直接创建一个异步任务，那么 nextTick 自然就达到在同步任务后执行的目的

```JavaScript
const p = Promise.resolve()
export function nextTick(fn?: () => void): Promise<void> {
    return fn ? p.then(fn) : p
}
```

### queueJob and queuePostFlushCb

queueJob 维护 job 队列，有去重逻辑，保证任务的唯一性，每次调用去执行 queueFlush queuePostFlushCb 维护 cb 队列，被调用的时候去重，每次调用去执行 queueFlush

```Javascript
const queue: (Job | null)[] = []
export function queueJob(job: Job) {
    // 去重
    if (!queue.includes(job)) {
        queue.push(job)
        queueFlush()
    }
}

export function queuePostFlushCb(cb: Function | Function[]) {
    if (!isArray(cb)) {
        postFlushCbs.push(cb)
    } else {
        postFlushCbs.push(...cb)
    }
    queueFlush()
}

// queueFlush
// 开启异步任务(nextTick)处理flushJobs
function queueFlush() {
    // 避免重复调用flushJobs
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true
        nextTick(flushJobs)
    }
}
```

- flushJobs
  处理队列，先对队列进行排序，执行 queue 中的 job,处理完后再处理 postFlushCbs，如果队列没有被清空会递归调用 flushJobs 清空队列

```JavaScript
function flushJobs(seen?: CountMap) {
    isFlushPending = false
    isFlushing = true
    let jon
    if (__DEV__) {
        seen = seen || new Map()
    }

    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child.(because parent is a created before the child so its render effect will have smaller priority number)
    // 2. If a component is unmounted during a parent component's update,
  //    its update can be skipped.
  // Jobs can never be null before flush starts, since they are only invalidated
  // during execution of another flushed job.
    queue.sort((a, b) => getId(a!) - getId(b!))

    while ((job = queue.shift()) !== undefined) {
        if (job === null) {
            continue
        }
        if (__DEV__) {
            checkRecursiveUpdates(seen!, job)
        }
        callWithErrorHanding(jon, null, ErrorCodes.SCHEDULER)
    }
    flushPostFlushCbs(seen)
    isFlushing = false
    // some postFlushCb queue jobs!
    // keep flushing until it drans
    if (queue.length || postFlushCbs.length) {
        flushJobs(seen)
    }
}
```

queueJob 及 queuePostFlushCb

```JavaScript
// renderer.ts
function createDevEffectOptions(
    instance: ComponentInternalInstance
): ReactiveEffectOptions {
    return {
        scheduler: queueJob,
        onTrack: instance.rtc ? e => invokeArrayFns(instance.rtc!, e): void 0,
        onTrigger: instance.rtg ? e => invokeArrayFns(instance.rtg!, e): void 0
    }
}

// effect.ts
const run = (effect: )
```

nextTick 是 vue 中的更新策略，也是性能优化手段，基于 JS 执行机制实现

vue 中我们改变数据时不会立即触发视图，如果需要实时获取到最新的 DOM，这个时候可以手动调用 nextTick

## reactive

｜-- LICENSE
|-- README.MD
|-- **tests** // 单元测试魔窟
| |-- collections
| | |-- Map.spec.ts
| | |-- Set.spec.ts
| | |-- WeakMap.spec.ts
| | |** WeakSet.spec.ts
| |-- computed.spec.ts
| |-- effect.spec.ts
| |-- reactive.spec.ts
| |-- reavtiveArray.spec.ts
| |-- readonly.spec.ts
| |** ref.spec.ts
|-- api-extractor.json
|-- index.js
|-- package.json
|** src
|-- baseHandlers.ts // 基本类型的处理器
|-- collectionHandlers.ts // Set Map WeakSet WeakMap 的处理器
|-- computed.ts // 计算属性，同 Vue2
|-- effect.ts // reactive 核心，处理依赖收集，依赖更新
|-- index.ts
|-- operations.ts // 定义依赖收集，依赖更新的类型
|-- reactive.ts //reactive 入口，内部主要以 Proxy 实现
|** ref.ts // reactive 的变种方法，Proxy 处理不了值类型的响应，Ref 来处理

### reactive

定义：接收一个普通对象然后返回该普通对象的响应式代理。等同于 2.x 的 Vue.observable()

```JavaScript
const obj = reactive({ count: 0 })
```

响应式转换是深层的：会影响对象内部所有嵌套的属性。基于 ES2015 的 Proxy 实现，返回的代理对象不等于原始对象。建议仅使用代理对象而避免依赖原始对象

Vue3 中响应数据核心是 reactive，reactive 中的实现是由 proxy 和 effect 组合

```JavaScript
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
    // if trying to observe a readonly proxy, return the readonly version.
    // 如果目标对象是一个只读的响应数据，则直接返回目标对象
    if (target && (target as Target).__v_isReadonly) {
        return target
    }

    // 否则调用 createReactiveObject 创建 observe
    return createReactiveObject(
        target,
        false,
        mutableHandler,
        mutableCollectionHandlers
    )
}
```

createReactiveObject

```JavaScript
// Target 目标对象
// isReaonly 是否只读
// baseHandlers 基本类型的handlers
// collectionHandlers 主要针对(set、map、weakSet、weakMap)的handlers
function createtReactiveObject(
    target: Target,
    isReadonly: boolean,
    baseHandlers: ProxyHandler<any>,
    collectionHandlers: ProxyHandler<any>
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
    if (target.__v_raw && !(isReadonly && target.__v_isReactive)) {
        return target
    }
    // target already has corresponding Proxy
    if (
        hasOwn(target, isReadonly ? ReactiveFlags.readonly : ReactiveFlags.reactive)
    ) {
        return isReadonly ? target.__v_readonly : target.__v_reactive
    }
    // only a whitelist of value types can be observed.

    // 检查目标对象是否能被观察，不能直接返回
    if (!canObserve(target)) {
        return target
    }

    // 使用Proxy 创建observe
    const observed = new Proxy(
        target,
        collectionTypes.has(target.constructor) ? collectionHandlers : baseHandlers
    )

    // 打上相应标记
    def(
        target,
        isReadonly ? ReactiveFlags.readonly : ReactiveFlags.reactive,
        observed
    )
    return observed

    // 同时满足3条即为可以观察的目标对象
    // 1. 没有打上__v_skip标记
    // 2. 是可以观察的值类型
    // 3. 没有被frozen
    const canObserve = (value: Target): boolean => {
        return (
            !value.__v_skip &&
            isObservableType(toRawType(value)) &&
            !Object.isFrozen(value)
        )
    }

    // 可以被观察的值类型
    const isObservableType = /*#__PURE__*/ makeMap(
        'Object, Array, Map, Set, WeakMap, WeakSet'
    )
}
```

### 总结

reactive 是作为整个响应式的入口，负责处理目标对象是否可以观察以及是否已被观察的逻辑，最后使用 proxy 进行目标对象的代理

### effect.spec

1. 定义一个对象 original,reactive 后返回 observed，得到结果俩个对象的引用不能相同，observed 是可响应的，original 不可响应，observed 的值根 original 相同

2. 原型

3. 定义一个嵌套对象，reactive 后嵌套的属性也可以响应

4. 观察的读喜庆的变更会同步到原始对象

5. 给 observed 设置一个未被观察的值可以响应

6. 观察一个已经被 observed 的 observe 应该直接返回该 observe

7. 重复观察相同的原始对象直接返回相同的 proxy 读喜庆

8. 不会污染原始对象

9. 通过 toRaw api 可以返回被观察对象的原始读喜庆
   toRaw(observed)

10. markRaw 可以给将要被观察的数据打上标记，标记原始数据不可被观察

11. 被 freeze 的数据不可观察

### shallowReactive

只为某个对象的私有（第一层）属性创建浅层的响应式代理，不会对“属性的属性”做深层次、递归地响应式代理

1. 属性的属性不会被观察
2. shallowReactive 后的 proxy 的属性再次被 reactive 可以被观察
3. iterating 不能被观察
4. get 到的某个属性不能被观察
5. forEach 不能被观察

## ref

接受一个参数值并返回一个响应式且可改变的 ref 对象。ref 对象拥有一个指向内部值的单一属性.value

```JavaScript
const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

ref 跟 reactive 都是响应系统的核心方法，作为整个系统的入口

可以将 ref 看成 reactive 的一个变形版本，这是由于 reactive 内部采用 Proxy 来实现，而 Proxy 只接受对象作为入参。这才有了 ref 来解决值类型的数据响应，如果传入 ref 的是一个对象，内部也会调用 reactive 方法进行深层响应转换

### Ref 是如何创建的

ref 接收一个可选的 unknown 作为入参，接着直接调用 createRef

createRef 先判断 value 是否已经是一个 ref,如果是则直接返回，如果不是接着判断是不是浅观察，如果是浅观察直接构造一个 ref 返回，不是则将 rawValue 转换成 reactive 再构造一个 ref 返回

```JavaScript
export function ref(value?: unknown) {
    return createRef(value)
}

/**
 * @description:
 * @param {rawValue} 原始值
 * @param {shallow} 是否是浅观察
 */
functiopn createRef(rawValue: unknown, shallow = false) {
    // 如果已经是ref直接返回
    if (isRef(rawValue)) {
        return rawValue
    }

    // 如果是浅观察直接观察，不是则将rawValue转换成reactive
    // reactive 的定义在下方
    let value = shallow ? rawValue : convert(rawValue)

    // ref的结构
    const r = {
        // ref标识
        __v_isRef: true,
        get value() {
            // 依赖收集
            track(r, TrackOpTypes.GET, 'value')
            return value
        },
        set value(newVal) {
            if (hasChanged(toRaw(newVal), rawValue)) {
                rawValue = newVal
                value = shallow ? newVal : convert(newVal)
                // 触发依赖
                trigger(
                    r,
                    TriggerOpTypes.SET,
                    'value',
                    __DEV__ ? {newValue: newVal} : void 0
                )
            }
        }
    }
    return r
}

// 如果是对象则直接调用reactive,否则直接返回
const convert = <T extends unknown>(val: T): T =>
    isObject(val) ? reactive(val) : val
```

## ref.spec

接受一个参数值并返回一个响应式且可改变的 ref 对象。ref 对象拥有一个指向内部值的单一属性.value

```JavaScript
const count = ref(0)
console.log(count.value)  // 0

count.value++
console.log(count.value) // 1
```

如果传入 ref 的是一个对象，将调用 reactive 方法进行深层响应转换

1. 返回值是一个带有 value 对象，并且是可以响应的
2. 嵌套的属性可以响应
3. 传递空值也可以响应
4. ref 在 reactive 中会被转换成原始值，而非 ref
5. ref 嵌套时会自动 unwrap，访问 b.value 相当于 b.value.value
6. 会检测传递 ref 的值类型，如果是引用类型就 reactive，不是直接返回结果
7. unref 可以将 ref 还原成原始值
8. shallowRef 不会发生响应，替换掉整个对象会触发响应
9. shallowRef 可以强制触发更新
10. isRef 可以检测各种类型是否是 ref
11. 支持自定义 ref,自由控制 track,trigger 时间

## BaseHandlers

包含四种 handler

- mutsbleHandlers 可变处理
- readonlyHandlers 只读处理
- shallowReactiveHandlers 浅观察处理
- shallowReadonlyHandlers 浅观察 && 只读处理
  mutableHandlers 为基础

```JavaScript
export const mutableHandlers: ProxyHandler<object> = {
    get, // 用于拦截对象的读取属性操作
    set, // 用于拦截对象的设置属性操作
    deleteProperty, // 用于拦截对象的删除属性操作
    has, // 检查一个对象是否拥有某个属性
    ownKeys // 针对 getOwnPropertyNames, getOwnPropertySymbols, keys 的代理方法
}
```

```JavaScript
function deleteProxy(target: object, key: string | symbol): boolean {
    // hasOwn 检查一个对象是否包含当前key
    const hadKey = hasOwn(target, key)
    const oldValue = (target as any)[key]
    // Reflect作用在于完成目标对象的默认，这里即指删除
    const result = Reflect.deleteProperty(target, key)

    // 如果该值被成功删除则调用trigger
    // trigger为effect里的方法，effect为reactive的核心
    if (result && hadKey) {
        trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
    }

    return result
}

function has(target: object, key: string | symbol):boolean {
    const result = Reflect.has(target, key)
    // track 也为effect里的方法，effect为reative的核心
    track(target, TrackOpTypes.HAS, key)
    return result
}

// 返回一个由目标对象自身的属性键组成的数组
function ownKeys(target: object): (string | number | symbol)[] {
    track(target, TrackOpTypes.ITERATE, ITERATE_KEY)
    return Reflect.ownKeys(target)
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
    val: object,
    key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)
```

- set

```JavaScript
const set = /*#__PURE__*/ createSetter()

/**
 * @description: 拦截对象的设置属性操作
 * @param {shallow} 是否是浅观察
 */
function createSetter(shallow = false) {
     /**
   * @description:
   * @param {target} 目标对象
   * @param {key} 设置的属性的名称
   * @param {value} 要改变的属性值
   * @param {receiver} 如果遇到 setter，receiver则为setter调用时的this值
   */
  return function set(
      target: object,
      key: string | symbol,
      value: unknown,
      receiver: object
  ): boolean {
      const oldValue = (target as any)[key]

      // 如果模式不是浅观察
      if (!shallow) {
          value = toRaw(value)
          // 并且目标对象不是数组，旧值是ref，新值不是ref，则直接赋值
          if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
              oldValue.value = value
              return true
          }
      } else {

      }

      const hadKey = hasOwn(target, key)

      const result = Reflect.set(target, key, value, receiver)
      if (target === toRaw(receiver)) {
          if (!hadKey) {
              trigger(target, TriggeOpTypes.ADD, key, value)
          } else if (hasChanged(value, oldValue)) {
              trigger(target, TriggerOpTypes.SET, key, value, oldValue)
          }
      }
      return result
  }
}
```

- get

```JavaScript
const get = /*#__PURE__*/ createGetter()
/**
 * @description: 用于拦截对象的读取属性操作
 * @param {isReadonly} 是否只读
 * @param {shallow} 是否浅观察
 */
function createGetter(isReadonly = false, shallow = false) {
    /**
   * @description:
   * @param {target} 目标对象
   * @param {key} 需要获取的值的键值
   * @param {receiver} 如果遇到 setter，receiver则为setter调用时的this值
   */
  return function get(target: object, key: string | symbol, receiver: object) {
        //  ReactiveFlags 是在reactive中声明的枚举值，如果key是枚举值则直接返回对应的布尔值
        if (key === ReactiveFlags.isReactive) {
            return !isReadonly
        } else if (key === ReactiveFlags.isReadonly) {
            return isReadonly
        } else if (key === ReactiveFlags.raw) { // 如果key是raw 则直接返回目标对象
            return target
        }

        const targetIsArray = isArray(target)
        // 如果目标对象是数组并且 key 属于三个方法之一 ['includes', 'indexOf', 'lastIndexOf']，即触发了这三个操作之一
        if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
            return Reflect.get(arrayInstrumentations, key, receiver)
        }
        const res = Reflect.get(target, key, receiver)

        // 如果 key 是 symbol 内置方法，或者访问的是原型对象，直接返回结果，不收集依赖
        if(isSymbol(key) && builtInSymbols.has(key) || key === '__proto__') {
            return res
        }

         // 如果是浅观察并且不为只读则调用 track Get, 并返回结果
         if (shallow) {
             !isReadonly && track(target, TrackOpTypes.GET, key)
             return res
         }

         // 如果get的结果是ref
         if (isRef(res)) {
              // 目标对象为数组并且不为只读调用 track Get, 并返回结果
              if (targetIsArray) {
                  !isReadonly && track(target, TrackOpTypes.GET, key)
                  return res
              } else {
                  // ref unwrapping, only for Objects, not for Arrays.
                  return res.value
              }
         }
          // 目标对象不为只读则调用 track Get
          !isReadonly && track(target, TrackOpTypes.GET, key)

        // 由于 proxy 只能代理一层，所以 target[key] 的值如果是对象，就继续对其进行代理
        return isObject(re)
            ? isReadonly
                ? // need to lazy access readonly and reactive here to avoid
                  // circular dependency
                  readonly(res)
                : reactive(res)
            : res

  }
}

const arrayInstrumentations: Record<string, Function> = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
  arrayInstrumentations[key] = function(...args: any[]): any {
    const arr = toRaw(this) as any
    for (let i = 0, l = (this as any).length; i < l; i++) {
      track(arr, TrackOpTypes.GET, i + '')
    }
    // we run the method using the original  args first (which may be reactive)
    const res = arr[key](...args)
    if (res === -1 || res === false) {
      // if that didn't work, run it again using raw values.
      return arr[key](...args.map(toRaw))
    } else {
      return res
    }
  }
})
```

## effect

effect 作为 reactive 的核心，主要负责收集依赖，更新依赖
effect 接收俩个参数

- fn 回调函数
- options 参数

```JavaScript
export interface ReactiveEffectOptions {
    lazy?: boolean // 是否延迟触发 effect
    computed?: boolean // 是否为计算属性
    scheduler?: (job: ReactiveEffect) => void // 调度函数
    onTrack?: (event: DebuggerEvent) => void // 追踪时触发
    onTrigger?: (event: DebuggerEvent) => void // 触发回调时触发
    onStop?: () => void // 停止监听时触发
}

export function effect<T = any>(
    fn: () => T,
    options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEFfect<T> {
    // 如果已经是`effect` 先重置为原始对象
    if (isEffect(fn)) {
        fn = fn.raw
    }

    // 创建`effect`
    const effect = createReactiveEffect(fn, options)

    // 如果没有传入 lazy 则直接执行一次`effect`
    if (!options.lazy) {
        effect()
    }
    return effect
}
```

### createReactiveEffect

```JavaScript
function createReactiveEffect<T = any>(
    fn: (...args: any[]) => T,
    options: ReactiveEffectOptions
): ReactiveEffect<T> {
    const effect = function reactiveEffect(...args: unknown[]): unknown {
        // 没有激活，说明调用了effect stop函数
        if (!effect.active) {
            // 如果没有调度者，直接返回，否则直接执行fn
            return options.scheduler ? undefined : fn(...args)
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
                return fn(...args)
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
    effect.id = uid++ // 自增id，effect唯一标识
    effect._isEffect = true // 是否是effect
    effect.active = true // 是否激活
    effect.raw = fn  // 挂载原始对象
    effect.deps = [] // 当前effect的dep数组
    effect.options = options // 传入的options，在effect有解释的那个字段
    return effect
}

const effectStack: ReactiveEffect[] = []

// 每次effect运行都会重新收集依赖,deps是effect的依赖数组，需要全部清空
function cleanup(effect: ReactiveEffect) {
    const { deps } = effect
    if (deps.length) {
        for (let i = 0; i < deps.length; i++>) {
            deps[i].delete(effect)
        }
        deps.length = 0
    }
}
```

### track

收集依赖

```JavaScript
/**
 * @description:
 * @param {target} 目标对象
 * @param {type} 收集的类型,  函数的定义在下方
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
        // 没有则新建一个
        targetMap.set(target, (depsMap = new Map()))
    }

    // deps来收集依赖函数，当监听的key值发生变化时，触发dep中的依赖函数
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }
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
```

### trigger

触发依赖（触发更新后执行监听函数之前触发）

```JavaScript
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
    // effects 代表普通依赖
    // computedRunners 为计算属性依赖
    // 都是 Set结构，避免重复收集
    const effects = new Set<ReactiveEffect>()
    const computedRunners = new Set<ReactiveEffect>()
    const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
        if (effectsToAdd) {
            effectsToAdd.forEach(effect => {
                // 避免重复收集
                if (effect !== activeEffect || !shouldTrack) {
                    // 计算属性依赖
                    if (effect.options.computed) {
                        computedRunners.add(effect)
                    } else {
                        // 普通属性依赖
                        effects.add(effect)
                    }
                } else {
                    // the effect mutated its own dependency during its execution.
          // this can be caused by operations like foo.value++
          // do not trigger or we end in an infinite loop
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
        const isAddOrDelete =
            type === TriggerOpTypes.ADD ||
            (type === TriggerOpTypes.DELETE && !isArray(target))
        if (
            isAddOrDelete ||
            (type === TriggerOpTypes.SET && target instanceof Map)
        ) {
            add(depsMap.get(isArray(target) ? 'length' : ITERATE_KEY))
        }
        if (isAddOrDelete && target instanceof Map) {
            add(depsMap.get(MAP_KEY_ITERATE_KEY))
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
    computedRunners.forEach(run)
    effects.forEach(run)
 }
```
