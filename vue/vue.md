## 本文主要学习自黄轶老师的vue源码教程 大家可以去慕课网学习，非常感谢。

### vue核心思想
### 核心思想有哪些？
数据驱动

### 数据驱动概念是什么？
是指视图是由数据驱动生成的，我们对视图的修改，不会直接操作DOM，而是通过修改数据。
数据更新驱动视图变化

###  数据驱动思想有什么好处？
它相比我们传统的前端开发，大大简化来代码量，特别是当交互复杂的时候，只关心数据的修改会让代码的逻辑变的非常清晰。
因为DOM变成来数据的映射，我们所有的逻辑都是对数据的修改，而不用碰触DOM，这样的代码非常利于维护。

### 数据驱动思想主要是来干什么？
为了构建逻辑结构更清晰的代码，降低复杂度

### vue中是如何用到数据驱动的概念的？
通过采用简洁的模版语法来声明式的将数据渲染为DOM
```JavaScript
import {resolveConstructorOptions} from "./vue/vue-dev/src/core/instance/init";
import {initInjections} from "./vue/vue-dev/src/core/instance/inject";
import {formatComponentName} from "./vue/vue-dev/src/core/util";
import {mountComponent} from "./vue/vue-dev/src/core/instance/lifecycle";
import {measure} from "./vue/vue-dev/src/core/util/perf";
```

### new Vue
### new Vue是干什么的？
new Vue是创建了一个vue的实例，通过这个实例去调用vue的方法和属性

### new 关键字是干什么的？
new关键字在JavaScript语言中代表实例化一个对象

### Vue是什么？
Vue实际上是一个类，类在Javascript中是用Function来实现
```JavaScript
//src/core/instance/index.js

//解析：Vue只能通过new关键字初始化，然后会调用this._init方法
function Vue (options) {
    if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
        warn('Vue is a constructror and should be called with the `new` keyword')
    }
    this._init(options)
}
```

### init
_init:私有方法

### _init是干什么的？
初始化一个Vue实例

### _init做了什么？
vue初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，
初始化data、props、computed、watcher等等

### 为什么需要_init?
一次性初始化方便调用内部方法和属性
```JavaScript
//在src/core/instance/init.js中定义
Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if(process.env.NODE_ENV !== 'production' && config.performance && mark) {
        startTag =  `vue-perf-start:${vm._uid}`
        endTag = `vue-perf-end:${vm._uid}`
        mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options)
    } else {
        vm.$options = mergeOptions(
            resolveConstructorOptions(vm.constructor),
            options || {},
            vm
        )
    }
    /* instanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
        initProxy(vm)
    } else {
        vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        vm._name = formatComponentName(vm, false)
        mark(endTag)
        measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
        vm.$mount(vm.$options.el)
    }
}
```

### $mount
Vue实例挂载

### $mount是干什么的？
Vue中我们是通过$mount实例方法去挂载vm的

### $mount做了哪些事情？
就是在没有render函数的时候把template转换成render

```JavaScript
 //      这段代码首先缓存了原型上的$mount方法，再重新定义该方法
 //      首先，它对el做了限制，Vue不能挂载在body、html这样的根节点上。
 //      接下来，如果没有定义render方法，则会把el或者template字符串转换成render方法。
 //      在Vue2.0版本中，所有Vue的组件的渲染最终都需要render方法，它是调用compileToFunctions方法实现的，
 //      编译过程我们之后会介绍。最后，调用原型上的$mount方法挂载

const mount = Vue.prototype.$mount;
 Vue.prototype.$mount = funciton (
     el?: string | Element,
     hydrating?: boolean
 ):Component {
     el?: string | Element,
     hydrating?: boolean
}: Component {
     el = el && query(el)

    /* istanbul ignore if */
    if (el === document.body || el === document.documentElement) {
        process.env.NODE_ENV !== 'production' && warn(
            `Do not mount Vue to <html> or <body> - mount to normal element instead.`
        )
        return this
    }

    const options = this.$options
    component
    if (!options.render) {
        let template = options.template
        if (template) {
            if (typeof template === 'string') {
                if (template.charAt(0) === '#') {
                    template = idToTemplate(template)
                    /* istanbul ignore if */
                    if (process.env.NODE_ENV !== 'production' && !template) {
                        warn(
                            `Template element not found or is empty: ${options.template}`,
                            this
                        )
                    }
                }
            } else if (template.nodeType) {
                template = template.innerHTML
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    warn('invalid template options:' + template, this)
                }
                return this
            }
        } else if (el) {
            template = getOuterHTML(el)
        }
        if (template) {
            /* istanbul ignore if */
            if (procedss.env.NODE_ENV !== 'produciton' && config.performance && mark){
                mark('compile')
            }

            const { render, staticRenderFns } = compileToFunction(template, {
                shouldDecodeNewlines,
                shouldDecodeNewlinesForHref,
                delimiters: options.delimiters,
                comments: options.comments
            }, this)
            options.render = render
            options.staticRenderFns = staticRenderFns

            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
                mark('compile end')
                measure(`vue ${this._name} compile`, 'compile', 'compile end')
            }
        }
    }
    return mount.call(this, el, hydrating)
}

/**
 * $mount 源码
 * src/platform/web/runtime/index.js
 *
 * $mount方法支持传入2个参数，第一个是el，它表示挂载的元素，可以是字符串，也可以是DOM对象，如果是字符串在浏览器环境下
 * 会调用query方法转换成DOM对象的。
 * 第二个参数是和服务端渲染相关，在浏览器环境下我们不需要传第二个参数。
 *
 * mountComponent核心就是先调用vm._render方法先生成虚拟Node,再实例化一个渲染Watcher，在它的
 * 回调函数中调用updateComponent方法，最终调用vm._update更新DOM。
 *
 * watcher在这里起到俩个作用，一个是初始化的时候会执行回调函数，另一个是当vm实例中的监测的数据发生变化的时候执行
 * 回调函数。
 *
 * 函数最后判断为根节点的时候设置vm._isMounted为true,表示这个实例已经挂载了，同时执行mounted钩子函数。
 * vm.$vnode表示Vue实例的父虚拟Node,所以它为Null则标售当前是根Vue的实例。
 *
 * compile
 */
 // public mount method
Vue.prototype.$mount = function (
    el?: string | Element,
    hydrating?: boolean
): Component {
    el = el && inBrowser ? query(el) : undefined
    return mountComponent(this, el, hydrating)
}

/**
 * mountComponent
 * 源码：
 * src/core/instance/lifecycle.js文件中：
 */
 export function mountComponent (
     vm: Component,
     el: ?Element,
     hydrating?: boolean
 ): Component {
     vm.$el = el
    if (!vm.$options.render) {
         if (process.env.NODE_ENV !== 'production') {
             /* istanbul ignore if */
             if ((vm.$options.template && vm.$options.template.charAt(0) !== '#')
                 || vm.$options.el || el) {
                 warn(
                     'You are using the runtime-only build of Vue where the template '
                     + 'compiler is not available. Either pre-compile the template into '
                     + component,
                     vm
                 )
             } else {
                 warn(
                     component,
                     vm
                 )
             }
         }
    }
    callHook(vm, 'beforeMount')

    let updateComponent
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        updateComponent = () => {
            const name = vm._name
            const id = vm._uid
            const startTag = `vue-perf-start:${id}`
            const endTag = `vue-perf-end:${id}`

            mark(startTag)
            const vnode = vm._render()
            mark(endTag)
            measure(`vue ${name} render`, startTag, endTag)

            mark(startTag)
            vm._update(vnode, hydrating)
            mark(endTag)
            measure(`vue ${name} patch`, startTag, endTag)
        }
    } else {
        updateComponent = () => {
            vm._update(vm._render(), hydrating)
        }
    }

    // since the watcher's initial patch may call $forceUpdate(e.g. inside child
    // component's mounted hook), which relies on vm._watcher being already defined
    new Watcher(vm, updateComponent, noop, {
        before () {
            if (vm._isMounted) {
                callHook(vm, 'beforeUpdate')
            }
        }
    }, true)
    hydrating = false

    // manually mounted instance, call mounted on self
    component
    if (vm.$vnode == null) {
        vm._isMounted = true
        callHook(vm, 'mounted')
    }
    return vm
 }
```

### $mount为什么要这样做？
结构清晰

### _render方法是干什么的？
是实例的一个私有方法，它用来把实例渲染成一个虚拟Node。

#_render方法是怎么实现的？

```JavaScript
 //src/code/instance/render.js
Vue.prototype._render = function ():VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    // reset _rendered flag on slots for duplicate slot check
    if (process.env.NODE_ENV !== 'production') {
        for (const key in vm.$slots) {
            // $flow-disable-line
            vm.$slots[key]._rendered = false
        }
    }

    if (_parentVnode) {
        vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject
    }

    // set parent vnode. this allows render functions to have access
    // to the date on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
        vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
        handleError(e, vm, `render`)
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production') {
            if (vm.$options.renderError) {
                try {
                    vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
                } catch (e) {
                    handleError(e, vm, `renderError`)
                    vnode = vm._vnode
                }
            } else {
                vnode = vm._vnode
            }
        } else {
            vnode = vm._vnode
        }
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
        if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
            warn(
                'Multiple root nodes returned from render function. Render function '
                + 'should return a single root node.',
                vm
            )
        }
        vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
}

/**
 *  _render函数中的render方法的调用：
 *      vnode = render.call(vm._renderProxy, vm.$createElement)
 *      可以看到，render函数中的createElemen方法就是vm.$createElment方法：
 *
 *      实际上，vm.$createElement方法定义是在执行initRender方法的时候，可以看到除了vm.$createElement方法，
 *      还有一个vm._c方法，它是被模版编译成的render函数使用，而vm.$createElement是用户手写render方法使用的，
 *      这俩个方法支持的参数相同，并且内部都调用了createElement方法
 *
 *      vm._render最终是通过执行createElement方法并返回的是vnode，它是一个虚拟Node。Vue2.0相比Vue1.0最大的升级就是利用了
 *      VirtualDOM。
 *
 *      render
 */

export function initRender (vm: Component) {
    // ...
    // bind the createElement fn to this instance
    // so that we get proper render context inside it.
    // args order: tag, data, children, normalizationType, alwaysNormalize
    // internal version is used by render functions compiled from templates
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
    // normalization is always applied for the public version, used in
    // user-written render functions.
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}
```

### Virtual DOM是什么？
Virtual DOM就是用一个原生的JS对象去描述一个DOM节点

VNode是对真实DOM的一种抽象描述，它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等，其它属性都是用来扩展VNode
的灵活性以及实现一些特殊feature的。由于VNode只是用来映射到真实DOM的渲染，不需要包含操作DOM的方法，因此它是非常轻量和简单的。

Virtual DOM除了它的数据结构的定义，映射到真实DOM实际上要经历VNode的create、diff、patch等过程

### Virtual DOM是干什么的？
浏览器中的DOM元素是非常庞大的。当我们频繁的去做dom更新，会产生一定的性能问题。
它比创建一个DOM的代价要小很多。

### Virtual DOM是怎么实现的？
```JavaScript
//src/core/vdom/vnode.js
 export default class VNode {
     tag: string | void;
     data: VNodeData | void;
     children: ?Array<VNode>;
     text: string | void;
     elm: Node | void;
     ns: string | void;
     context: Component | void; // rendered in this component's scope
     key: string | number | void;
     componentOptions: VNodeComponentOptions | void;
     parent: VNode | void; // component placeholder node

    // strictly internal
    raw: boolean; // contains raw HTML? (server only)
    isStatic: boolean; // hoisted static node
    isRootInsert: boolean; // necessary for enter transition check
    isComment: boolean; // empty comment placeholder?
    isCloned: boolean; // is a cloned node?
    isOnce: boolean; // is a v-once node?
    asyncFactory: Function | void; // async component factory function
    asyncMeta: Object | void;
    isAsyncPlaceholder: boolean;
    ssrContext: Object | void;
    fnContext: Component | void; // real context vm for functional nodes
    fnOptions: ?ComponentOptions; // for SSR caching
    fnScopeId: ?string; // functional scope id support

    constructor(
        tag?: string,
        data?: VNodeData,
        children?: ?Array<VNode>,
        text?: string,
        elm?: Node,
        context?: Component,
        componentOptions?: VNodeComponentOptions,
        asyncFactory?: Function
    ) {
        this.tag = tag
        this.data = data
        this.children = children
        this.text = text
        this.elm = elm
        this.ns = undefined
        this.context = context
        this.fnContext = undefined
        this.fnOptions = undefined
        this.fnScopeId = undefined
        this.key = data && data.key
        this.componentOptions = componentOptions
        this.componentInstance = undefined
        this.parent = undefined
        this.raw = false
        this.isStatic = false
        this.isRootInsert = true
        this.isComment = false
        this.isCloned = false
        this.isOnce = false
        this.asyncFactory = asyncFactory
        this.asyncMeta = undefined
        this.isAsyncPlaceholder = false
    }

    // DEPRECATED: alias for componentInstance for backwards compat.
    /* istanbul ignore next */
    get child (): Component | void {
        return this.compomnentInstance
    }
}
```

### createElement是做什么的？
是Vue.js用来创建VNode

### createElement怎么实现的？
createElement方法实际上是对_createElement方法的封装，它允许传入的参数更加灵活，在处理这些参数后，调用真正创建VNode的函数

```JavaScript
//src/core/vdom/create-element.js

 // wrapper function for providing a more flexible interface
 // without getting yelled at by flow
 export function createElement (
     context: Component,
     tag: any,
     data: any,
     children: any,
     normalizationType: any,
     alwaysNormalize: boolean
 ): VNode | Array<VNode> {
     if (Array.isArray(data) || isPrimitive(data)) {
         normalizationType = children
         children = data
         data = undefined
     }
     if (isTrue(alwaysNormalize)) {
         normalizationType = ALWAYS_NORMALIZE
     }
     return _createElement(context, tag, data, children, normalizationType)
 }

/**
 * _createElement方法有5个参数
 *      context表示VNode的上下文环境，它是Component类型；
 *      tag表示标签，它可以是一个字符串，也可以是一个Component类型；
 *      data表示VNode的数据，它是一个VNodeData类型，可以在flow/vnode.js中找到它的定义
 *      children表示当前VNode的子节点，它是任意类型的，它接下来需要被规范为标准的VNode数组；
 *      normalizationType表示子节点规范的类型，类型不同规范的方法也就不一样，它主要是参考render函数是编译生成的还是用户手写的。
 */
 export function _createElement (
     context: Component,
     tag?: string | Class<Component> | Function | object,
     data?: VNodeData,
     children?: any,
     normalizationType?: number
 ): VNode | Array<VNode> {
    if (isDef(data) && isDef((data: any).__ob__)) {
        process.env.NODE_ENV !== 'production' && warn(
            `Avoid using observed data object as vnode data: $
            {JSON.stringify(data)}\n` +
            'Always create fresh vnode data objects in each render!',
            context
        )
        return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
        tag = data.is
    }
    if (!tag) {
         // in case of component :is set to falsy value
        return createEmptyVNode()
    }
    // warn against non-primitive key
    if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
        if (!__WEEX__ || !('@binding' in data.key)) {
            warn(
                'Avoid using non-primitive value as key, ' +
                'use string/number value instead.',
                context
            )
        }
    }
    // suport single function children as default scoped slot
    if (Array.isArray(children) && typeof children[0] === 'function') {
        data = data || {}
        data.scopedSlots = {default: children[0]}
        children.length = 0
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
        children = normalizeChildren(children)
    } else if (normalizationType === SIMPLE_NORMALIZE) {
        children = simpleNormalizeChildren(children)
    }
    let vnode, ns
    if (typeof tag === 'string') {
        let Ctor
        ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
        if (config.isReservedTag(tag)) {
            // platform built-int elements
            vnode = new VNode(
                config.parsePlatformTagName(tag), data, children, undefined, undefined, context
            )
        } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
            // component
            vnode = createComponent(Ctor, data, context, children, tag)
        } else {
            // unknow or unlisted namespaced elements
            // check at runtime because it may get assigned a namespace when its
            // parent normalizes children
            vnode = new VNode(
                tag, data, children,
                undefined, undefined, context
            )
        }
    } else {
        // direct component options / constructor
        vnode = createComponent(tag, data, context, children)
    }
    if (Array.isArray(vnode)) {
        return vnode
    } else if (isDef(vnode)) {
        if (isDef(ns)) applyNS(vnode, ns)
        if (isDef(data)) registerDeepBindings(data)
        return vnode
    } else {
        return createEmptyVNode()
    }
 }

/**
 *  children的规范化
 *      由于Virtual DOM实际上是一个树状结构，每一个VNode可能会有若干个子节点，这些子节点应该也是VNode的类型。
 *      _createElement接收的第4个参数children是任意类型，因此我们需要把它们规范成VNode类型。
 *      根据normalizationType的不同，调用了normalizeChildren(children)和simpleNormalizeChildren(children)方法
 *      它们的定义都在src/core/vdom/helpers/normalzie-children.js
 */
// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:
// 1.When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because funcitonal components already normalize their own children.

/**
 * simpleNormalizeChildren方法调用场景是render函数当函数是编译生成的。
 * 理论上编译生成的children都已经是VNode类型的，但这里有一个例外，就是functional component函数式
 * 组件返回的是一个数组而不是一个根节点，所以会通过Array.prototype.concat方法把整个children数组打平，
 * 让它的深度只有一层。
 */

 export function simpleNormalizeChildren (children: any) {
    for (let i = 0; i < children.length; i++) {
        if (Array.isArray(children[i])) {
            return Array.prototype.concat.apply([], children)
        }
    }
    return children
 }

 // 2.When the children contains constructs that always generated nested Arrays,
 // e.g. <template>, <slot>, v-for, or when the children is provided by user
 // with hand-written render functions / JSX. In such cases a full normalizeation
 // is needed to cater to all possible types of children values.
/**
 * normalizaChildren方法的调用场景有2种，一个场景是render函数是用户手写的，当children只有一个节点的时候，Vue.js
 * 从接口层面允许用户把children写成基础类型用来创建单个简单的文本节点，这种情况会调用createTextVNode创建一个文本节点
 * 的VNode；另一个场景是当编译slot、v-for的时候会产生嵌套数组的情况，会调用normalizeArrayChildren方法
 */
 export function normalizaChildren (children: any): ?Array<VNode> {
     return isPrimitive(childre)
        ? [createTextVNode(children)]
         : Array.isArray(children)
            ? normalizeArrayChildren(children)
             : undefined
 }

/**
 * normalizeArrayChildren接收2个参数，
 *      children表示要规范的子节点
 *      nestedIndex表示嵌套的索引
 *      因为单个child可能是一个数组类型
 * normalizeArrayChildren主要逻辑就是遍历children,获得单个节点c,然后对c的类型判断，
 * 如果是一个数组类型，则递归调用normalizeArrayChildren；如果是基础类型，则通过createTextVNode方法转换成
 * VNode类型；否则就已经是VNode类型了，如果children是一个列表并且列表还存在嵌套的情况，则根据nestedIndex去更新
 * 它的key。这里需要注意一点，在遍历的过程中，对这三种情况都做了如下处理：如果存在俩个连续的text节点，会把它们合并成一个text节点
 * 经过对children的规范化，children变成了一个类型为VNode的Array
 */
function normalizeArrayChildren (children: any, nestedIndex?: string): Array<VNode> {
    const res = []
    let i, c, lastIndex, last
    for (i = 0; i < children.length; i++){
        c = children[i]
        if (isUndef(c) || typeof c === 'boolean') continue
        lastIndex = res.length - 1
        last = res[lastIndex]
        // nested
        if (Array.isArray(c)) {
            if (c.length > 0) {
                c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)
                // merge adjacent text nodes
                if (isTextNode(c[0]) && isTextNode(last)) {
                    res[lastIndex] = createTextVNode(last.text + (c[0]: any).text)
                    c.shift()
                }
                res.push.apply(res, c)
            }
        } else if (isPrimitive(c)) {
            if (isTextNode(last)) {
                // merge adjacent text nodes
                // this is necessary for SSR hydration because text nodes are
                // essentially merged when rendered to HTML strings
                res[lastIndex] = createTextVNode(last.text + c)
            } else if (c !== '') {
                // convert primitive to vnode
                res.push(createTextVNode(c))
            }
        } else {
            if (isTextNode(c) && isTextNode(last)) {
                // merge adjacent text nodes
                res[lastIndex] = createTextVNode(last.text + c.text)
            } else {
                // default key for nested array children (likely generated by v-for)
                if (isTrue(children._isVList) &&
                    isDef(c.tag) &&
                    isUndef(c.key) &&
                    isDef(nestedIndex)) {
                        c.key = `__vlist${nestedIndex}_${i}__`
                    }
                res.push(c)
            }
        }
    }
    return res
 }

/**
 * VNode的创建
 *
 * 这里先对tag做判断，如果是string类型，则接着判断如果是内置的一些节点，则直接创建一个普通VNode，如果是为已注册的组件名，
 * 则通过createComponent创建一个组件类型的VNode，否则创建一个未知的标签的VNode。如果是tag一个Component类型，则直接调用
 * createComponent创建一个组件类型的VNode节点。
 *
 * 总结：createElement创建VNode的过程，每个VNode有children，children每个元素也是一个VNode，这样就形成了一个VNode Tree，
 * 它很好的描述了我们的DOM Tree
 */

let vnode, ns
if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
        // platform built-in elements
        vnode = new VNode(
            config.parsePlatformTagName(tag), data, children, undefined, undefined, context
        )
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
        // component
        vnode = createComponent(Ctor, data, context, children, tag)
    } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        vnode = new VNode(
            tag, data, children,
            undefined, undefined, context
        )
    }
} else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
}
```

/**
 * update
 * Vue的_update是实例的一个私有方法，它被调用的时机有2个，
 * 一个是首次渲染，一个是数据更新的时候；
 * 源码：
 * src/core/instance/lifecycle.js
 *
 * _update的核心就是调用vm.__patch方法，这个方法在不同的平台，比如web和weex上的定义是不一样的
 */
 Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const prevActiveInstance = activeInstance
    activeInstance = vm
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
        // initial render
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /*
        removeOnly */)
    } else {
        // updates
        vm.$el = vm.__patch__(prevVnode, vnode)
    }
    activeInstance = prevActiveInstance
    // update __vue__ reference
    if (prevEl) {
        prevEl.__vue__ = null
    }
    if (vm.$el) {
        vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent.__vnode) {
        vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
 }

/**
 * patch
 *
 * 源码：
 * src/platforms/web/runtime/patch.js
 *
 * 该方法的定义是调用createPatch方法的返回值，这里传入了一个对象，包含nodeOps参数和modules参数。
 * 其中，nodeOps封装了一系列DOM操作的方法，modules定义了一些模块的钩子函数的实现
 */
 import * as nodeOps from 'web/runtime/node-ops'
 import { createPatchFunction } from "/core/vddom/patch";
 import baseModules from 'core/vdom/modules/index'
 import platformModules from 'web/runtime/modules/index'
import {SSR_ATTR} from "./vue/vue-dev/src/shared/constants";
import {registerRef} from "./vue/vue-dev/src/core/vdom/modules/ref";

 // the directive module should be applied last, after all
 // built-in modules have been applied.
 const modules = platformModules.concat(baseModules)

 export const patch: Function = createPatchFunction({nodeOps, modules})

/**
 * createPatchFunction
 * 源码：
 * src/core/vdom/patch.js
 *
 * createPatchFunction内部定义了一系列的辅助方法，最终返回了一个patch方法，这个方法就赋值给了vm._update函数里调用的
 * vm.__patch__
 *
 * 它接收4个参数，
 *      oldVnode表示旧的VNode节点，它也可以不存在或者是一个DOM对象；
 *      vnode 表示执行_render后返回的VNode的节点
 *      hydrating表示是否是服务端渲染；
 *      removeOnly是给transition-group用的
 *
 * createElm的作用是通过虚拟节点创建真实的DOM并插入到它的父节点中。
 */

 const hoooks = ['create', 'activate', 'update', 'remove', 'destroy']

 export function createPatchFunction (backend) {
     let i, j
     const cbs = {}

     const { modules, nodeOps } = backend

     for (i = 0; i < hooks.length; ++i) {
         cbs[hooks[i]] = []
         for (j = 0; j < modules.length; ++j) {
             if (isDef(modules[j][hooks[i]])) {
                 cbs[hooks[i]].push(modules[j][hooks[i]])
             }
         }
     }

     // ...

     return function patch (oldVnode, vnode, hydrating, removeOnly) {
         if (isUndef(vnode)) {
             if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
             return
         }

         let isInitialPatch = false
         const insertedVnodeQueue = []

         if (isUndef(oldVnode)) {
             // empty mount (likely as component),create new root element
             isInitialPatch = true
             createElm(vnode, insertedVnodeQueue)
         } else {
             const isRealElement = isDef(oldVnode.nodeType)
             if (!isRealElement && sameVnode(oldVnode, vnode)) {
                 // patch existing root node
                 patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
             } else {
                 if (isRealElement) {
                     // mounting to a real element
                     // check if this is server-rendered content and if we can perform
                     // a successful hydration.
                     if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                         oldVnode.removeAttribute(SSR_ATTR)
                         hydrating = true
                     }
                     if (isTrue(hydrating)) {
                         if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                             invokeInsertHook(vnode, insertedVnodeQueue, true)
                             return oldVnode
                         } else if (provess.env.NODE_ENV !== 'production') {
                             warn(
                                 'The client-side rendered virtual DOM tree is not matching ' +
                                 'server-rendered content. This is likely caused by incorrect' +
                                 'HTML markup, for example nesting block-level elements inside ' +
                                 '<p>, or missing <tbody>. Bailing hydration and performing ' +
                                 'full client-side render.'
                             )
                         }
                     }
                     // either not server-rendered, or hydration failed.
                     // create an empty node and replace it
                     oldVnode = emptyNodeAt(oldVnode)
                 }

                 // replacing existing element
                 const oldElm = oldVnode.elm
                 const parentElm = nodeOps.parentNode(oldElm)

                 // create new node
                 createElm(
                     vnode,
                     insertedVnodeQueue,
                     // extremely rare edge case: do not insert if old element is in a
                     // leaving transition. Only happens when combining transition +
                     // keep-alive + HOCs. (4590)
                     oldElm._leaveCb ? null : parentElm,
                     nodeOps.nextsibling(oldElm)
                 )

                 // update parent placeholder node element, recursively
                 if (isDef(vnode.parent)) {
                     let ancestor = vnode.parent
                     const patchable = isPatchable(vnode)
                     while (ancestor) {
                         for (let i = 0; i < cbs.destroy.length; ++i) {
                             cbs.destroy[i](ancestor)
                         }
                         ancestor.elm = vnode.elm
                         if (patchable) {
                             for (let i = 0; i < cbs.create.length; ++i) {
                                 cbs.create[i](emptyNode, ancestor)
                             }
                             // #6513
                             // invoke insert hooks that may have been merged by create hooks.
                             // e.g. for directives that uses the "inserted"

                             const insert = ancestor.data.hook.insert
                             if (insert.merged) {
                                 // start at index 1 to avoid re-onvoking component mounted hook
                                 for (let i = 1; i < insert.fns.length; i++) {
                                     insert.fns[i]()
                                 }
                             }
                         }
                     } else {
                         registerRef(ancestor)
                     }
                     ancestor = ancestor.parent
                 }
             }

             // destroy old node
             if (isDef(parentElm)) {
                 removeVnodes(parentElm, [oldVnode], 0, 0)
             } else if (isDef(oldVnode.tag)) {
                 invokeDestroyHook(oldVnode)
             }
         }
     }

     invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
     return vnode.elm
 }

/**
 * createElm的作用是通过虚拟节点创建真实的DOM并插入到它的父节点中。
 * createComponent方法目的是尝试创建子组件
 */
 vnode.elm = vnode.ns
    ? nodeOps.createElementNS(vnode.ns, tag)
     : nodeOps.createElement(tag, vnode)

/**
 * 接下来调用createChildren方法去创建子元素：
 *
 * createChildren的逻辑很简单，实际上是遍历子虚拟节点，递归调用createElm，这是一种常用的深度优先的遍历算法，
 * 这里要注意的一点是在遍历过程中会把vnode.elm作为父容器的DOM节点占位符传入
 */
 createChildren(vnode, children, insertedVnodeQueue)

 function createChildren(vnode, children, insertedVnodeQueue) {
     if (Array.isArray(children)) {
         if (process.env.NODE_ENV !== 'production') {
             checkDuplicateKeys(children)
         }
         for (let i = 0; i < children.length; ++i) {
             createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
         }
     } else if (isPrimitive(vnode.text)) {
         nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
     }
 }

/**
 * 调用invokeCreateHooks方法执行所有的create的钩子并把vnode push 到 insertedVnodeQueue中
 */
 if (isDef(data)) {
     invokeCreateHooks(vnode, insertedVnodeQueue)
 }

 function invokeCreateHooks (vnode, insertedVnodeQueue) {
     for (let i = 0; i < cbs.create.length; ++i) {
         cbs.create[i](emptyNode, vnode)
     }
     i = vnode.data.hook // Reuse variable
     if (isDef(i)) {
         if (isDef(i.create)) i.create(emptyNode, vnode)
         if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
     }
 }

/**
 * 最后调用insert方法把DOM插入到父节点中，因为是递归调用，子元素会优先调用insert,
 * 所以整个vnode树节点的插入顺序是先子后父。
 *      src/core/vdom.patch.js
 */
 function insert (parent, elm, ref) {
    if (isDef(parent)) {
        if (isDef(ref)) {
            if (ref.parentNode === parent) {
                nodeOps.insertBefore(parent, elm, ref)
            }
        } else {
            nodeOps.appendChild(parent, elm)
        }
    }
 }

/**
 * insert逻辑很简单，调用一些nodeOps把子节点插入到父节点中
 *      src/platforms/web/runtime/node-ops.js
 */
 export function insertBefore (parentNode: Node, newNode: Node, referenceNode: Node) {
     parentNode.insertBefore(newNode, referenceNode)
 }

 export function appendChild (node: Node, child: Node) {
     node.appendChild(child)
 }

/**
 * 然后我们在vm._update的方法里是这么调用patch方法的：
 *
 */
 // initial render
 vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)

/**
 * DOM
 */


/**
 * 组件化
 * 		组件化是一个什么概念？
 * 			Vue.js另一个核心思想是组件化。所谓组件化，就是把页面拆分成多个组件(component)，每个组件依赖的CSS、JavaScript、模版、图片等
 * 			资源放在一起开发和维护。组件是资源独立的，组件在系统内部可复用，组件和组件之间可以嵌套。
 * 
 * 		组件化的概念能帮助我们什么？
 * 			能更加灵活的进行组装
 */

/**
 * createComponent
 * 		createComponent是干什么的？
 * 			用来创建一个组件VNode
 * 
 * 		createComponent怎么实现的？
 * 			源码
 * 			src/core/vdom/create-component
 * 			组件渲染主要就3个关键步骤：
 * 				构造子类构造函数，安装组件钩子函数和实例化vnode
 * 
 */
 export function createComponent(
	Ctor: Class<Component> | Function | Object | void,
	data: ?VNodeData,
	context: Component,
	children: ?Array<VNode>,
	tag?: string
 ): VNode | Array<VNode> | void {
	 if (isUndef(Ctor)) {
		 return
	 }
	 
	 /**
	  * 构造子类构造函数
	  */
	 const baseCtor = context.$options._base
	 
	 //plain options object: turn it into a constructor
	 if (isObject(Ctro)) {
		 
		 /**
		  * baseCtor实际上就是Vue，这个的定义上在最开始初始化Vue的阶段
		  * 	在src/core/global-api/index.js
		  * 	initGlobalAPI
		  * 	//this is used to identify the "base" constructor to extend all plain-object
		  * 	// components with in Weex's multi-instance scenarios.
		  * 	Vue.options._base = Vue
		  * 
		  * Vue.options和 context.$options
		  * 	在src/core/instance/init.js里Vue原型上的_init函数
		  * 	vm.$options = mergeOptions(
		  * 		resolveConstructorOptions(vm.constructor),
		  * 		options || {},
		  * 		vm
		  * 	)
		  * 	这样就把Vue上的一些option扩展到了vm.$option上，所以我们也就能通过vm.$options._base
		  * 	拿到Vue这个构造函数了。mergeOptions的功能是把Vue构造函数的options和用户传入的options
		  * 	做一层合并，到vm.$options上。
		  * 
		  */
		 Ctor = baseCtor.extend(Ctor)
	 }
	 
	 // if at this stage it's not a constructor or an async component factory,
	 // reject.
	 if (typeof Ctor !== 'function'){
		 if(process.env.NODE_ENV !== 'production') {
			 warn(`Invalid Component definition: ${String(Ctor)}`, context)
		 }
		 return
	 }
	 
	 // async component
	 let asyncFactory
	 if(isUndef(Ctor.cid)){
		 asyncFactory = Ctor
		 Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
		 if(Ctor === undefined){
			 // return a placeholder node for async component, which is rendered
			 // as a comment node but preserves all the raw information for the node.
			 // the information will be used for async server-rendering and hydration.
			 return createAsyncPlaceholder(
				asyncFactory,
				data,
				context,
				children,
				tag
			 )
		 }
	 }
	 
	 data = data || {}
	 
	 // resolve constructor options in case global mixins are applied after
	 // component constructor creation
	 resolveConstructorOptions(Ctor)
	 
	 // transform component v-model data into props & events
	 if(isDef(data.model)) {
		 transformModel(Ctor.optiopns, data)
	 }
	 
	 // extract props
	 const propsData = extractPropsFromVNodeData(data, Ctor, tag)
	 
	 // functional component
	 if (isTrue(Ctor.options.functional)) {
		 return createFunctionalComponent(Ctor, propsData, data, context, children)
	 }
	 
	 // extract listeners，since these need to be treated as
	 // child component listeners instead of DOM listeners
	 const listeners = data.on
	 // replace with listeners with .native modifier
	 // so it gets processed during parent component patch.
	 data.on = data.nativeOn
	 
	 if(isTrue(Ctor.options.abstract)) {
		 // abstract components do not keep anything
		 // other than props & listeners & slot
		 
		 // work around flow
		 const slot = data.slot
		 data = {}
		 if (slot) {
			 data.slot = slot
		 }
	 }
	 
	 // install component management hooks onto the placeholder node
	 installComponentHooks(data)
	 
	 // return a placeholder vnode
	 const name = Ctor.options.name || tag
	 const vnode = new VNode(
		`vue-component-${Ctor,cid}${name ? `-${name}` : ''}`,
		data, undefined, undefined, undefined, context,
		{Ctor, propsData, listeners, tag, children},
		asyncFactory
	 )
	 
	 // Weex specific: invoke recycle-list optimized @render function for
	 // extracting cell-slot template.
	
	/* instanbul ignore if */
	if (__WEEX__  && isRecycleableComponent(vnode)) {
		return renderRecyclableComponentTemplate(vnode)
	}
	
	return vnode
 }
 
 /**
  * Vue.extend函数的定义
  * 	src/core/global-api/extend.js
  * 	Class inheritance
  * 
  * 	Vue.extend的作用是什么？
  * 		构造一个Vue的子类
  * 
  * 	Vue.extend怎么实现的？
  * 		使用一种非常经典的原型继承的方式把一个纯对象转换一个继承于Vue的构造器Sub并返回，然后对Sub这个对象
  * 		本身扩展了一些属性，如扩展options、添加全局API等；并且对配置中的props和computed做了初始化工作；
  * 		最后对于这个Sub构造函数做了缓存，避免多次执行Vue.extend的时候对同一个子组件重复构造。
  * 		这样当我们去实例化Sub的时候，就会执行this._init逻辑再次走到了Vue实例化的初始化逻辑
  * 
  * 	
  * 
  */
  Vue.extend = function (extendOptions: Object): Function {
	  extendOptions = extendOptions || {}
	  const Super = this
	  const SupperId = Super.cid
	  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
	  if (cachedCtors[SuperId]) {
		  return cachedCtors[SuperId]
	  }
	  
	  const name = extendOptions.name || Super.options.name
	  if(process.env.NODE_ENV !== 'production' && name) {
		  validateComponentName(name)
	  }
	  
	  const Sub = function VueComponent (options) {
		  this._init(options)
	  }
	  Sub.prototype = Object.create(Super.prototype)
	  Sub.prototype.constructor = Sub
	  Sub.cid = cid++
	  Sub.options = mergeOptions(
		Super.options,
		extendOptions
	  )
	  Sub['super'] = Super
	  
	  // For props and computed properties, we define the proxy getters on 
	  // the Vue instances at extension time, on the extended prototype. This
	  // avoids Object.defineProperty calls for each instance created.
	  if (Sub.options.props) {
		  initProps(Sub)
	  }
	  if (Sub.options.computed) {
		  initComputed(Sub);
	  }
	  
	  // allow further extension/mixin/plugin usage
	  Sub.extend = Super.extend
	  Sub.mixin = Super.mixin
	  Sub.use = Super.use
	  
	  // create asset registers, so extended classes
	  // can have their private assets too.
	  ASSET_TYPES.forEach(function (type)) {
		  Sub[type] = Super[type]
	  })
	  // enable recursive self-lookup
	  if (name) {
		  Sub.options.components[name] = Sub
	  }
	  
	  // keep a reference to the super options at extension time.
	  // later at instantiation we can check if Super's options have
	  // been updated.
	  Sub.superOptions = Super.options
	  Sub.extendOptions = extendOptions
	  Sub.sealedOptions = extend({}, Sub.options)
	  
	  // cache constructor
	  cachedCtors[SuperId] = Sub
	  return Sub
  }
  
  /**
   * 安装组件钩子函数
   * 	在VNode的patch流程中对外暴露了各种时机的钩子函数
   * 	在初始化一个Component类型的VNode的过程中实现了几个钩子函数
   * 
   * 	整个installComponentHooks的过程就是把componentVNodeHooks的钩子函数合并到data.hook中，
   * 	在VNode执行patch的过程中执行相关的钩子函数，在合并过程中，如果某个时机的钩子已经存在data.hook中，那么
   * 	通过执行mergeHook函数做合并，这个逻辑很简单，就是在最终执行的时候，依次执行这俩个钩子函数即可。
   */
   // install component management hooks onto the placeholder node
   installComponentHooks(data)
   
   const componentVNodeHooks = {
	   init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
		   if (
			vnode.componentInstance && 
			!vnode.componentInstance._isDestroyed &&
			vnode.data.keepAlive
		   ) {
			   // kept-alive components, treat as a patch
			   const mountedNode: any = vnode ,// work around flow
			   componentVNodeHooks.prepatch(mountedNode, mountedNode)
		   } else {
			   const child = vnode.componentInstance = createComponentInstanceForVnode(
				vnode,
				activeInstance
			   )
			   child.$mount(hydrating ? vnode.elm : undefined, hydrating)
		   }
	   },
	   prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
		   const options = vnode.componentOptions
		   const child = vnode.componentInstance = oldVnode.componentInstance
		   updateChildComponent(
			child,
			options.propsData, // updated props
			options.listeners, // updated listeners
			vnode, // new parent vnode
			options.children // new children
		   )
	   },
	   
	   insert (vnode: MountedComponentVNode) {
		   const { context, componentInstance } = vnode
		   if (!componentInstance._isMounted) {
			   componentInstance._isMounted = true
			   callHook(componentInstance, 'mounted')
		   }
		   if (vnode.data.keepAlice) {
			   if (context._isMounted) {
				   // vue-router#1212
				   // During updates, a kept-alive component's child components may
				   // change, so directly walking the tree here may call activated hooks
				   // on incorrect children. Instead we push them into a queue which will
				   // be processed after the whole patch process ended.
				   queueActivatedComponent(componentInstance)
			   } else {
				   activateChildComponent(componentInstance, true /* direct */)
			   }
		   }
	   },
	   
	   destroy (vnode: MountedComponentVNode) {
		   const { componentInstance } = vnode
		   if (!componentInstance._isDestroyed) {
			   if (!vnode.data.keepAlive) {
				   componentInstance.$destroy()
			   } else {
				   deactivateChildComponent(componentInstance, true /* direct */)
			   }
		   }
	   }
   }
   
   const hooksToMerge = Object.keys(componentVNodeHooks)
   
   
   function installComponentHooks (data: VNodeData) {
	   const hooks = data.hook || (data.hook = {})
	   for (let i = 0; i < hooksToMerge.length; i++) {
		   const key = hooksToMerge[i];
		   const existing = hooks[key]
		   const toMerge = componentVNodeHooks[key]
		   if (existing !== toMerge && !(existing && existing._merged)) {
			   hooks[key] == existing ? mergeHook(toMerge, existing) : toMerge
		   }
	   }
   }
   
   function mergeHook(f1: any, f2: any): Function {
	   const merged = (a, b) => {
		   // flow complains about extra args which is why we use any
		   f1(a, b);
		   f2(a, b)
	   }
	   merged._merged = true
	   return merged
   }
   
   
   /**
	* 实例化VNode
	* 	最后一步非常简单，通过new VNode实例化一个vnode并返回。需要注意的是和普通元素节点的vnode不同，组件
	* 	的vnode是没有children的
	* 
	* createComponent在渲染一个组件的时候的3个关键逻辑：构造子类构造函数，安装组件钩子函数和实例化vnode
	* createComponent后返回的是组件vnode,它也一样走到vm._update方法，进而执行了patch函数
	*/
	const name = Ctor.options.name || tag
	const vnode = new VNode(
		`vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
		data, undefined, undefined, undefined, context,
		{Ctor, propsData, listeners, tag, children},
		asyncFactory
	)
	return vnode
	
	/**
	 * patch
	 * 		当我们通过createComponent创建了组件VNode,接下来会走到vm._update，执行vm.__patch__去把
	 * 		VNode转换成真正的DOM节点。
	 * 		patch的过程会调用createElm创建元素节点
	 * 		源码：
	 * 		src/core/vdom/patch.js
	 */
	function createElm(
		vnode,
		insertedVnodeQueue,
		parentElm,
		refElm,
		nested,
		ownerArray,
		index
	) {
		// ...
		if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)){
			return
		}
		//..
	}
	
	/**
	 * createComponent函数中，首先对vnode.data做了一些判断
	 * 		如果vnode是一个组件VNode，那么条件会满足，并且得到i就是init钩子函数
	 */
	function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
		let i = vnode.data
		if (isDef(i)) {
			const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
			if (isDef(i = i.hook) && isDef(i = i.init)) {
				i(vnode, false /* hydrating */)
			}
			// after calling the init hook, if the vnode is a child component
			// it should've created a child instance and mounted it.the child
			// component also has set the placeholder vnode's elm.
			// in that case we can just return the element and be done.
			
			/**
			 * 在完成组件的整个patch过程中，最后执行insert(parentElm, vnode.elm, refElm)
			 * 完成组件的DOM插入，如果组件patch过程中又创建了子组件，那么DOM的插入顺序是先子后父。
			 */
			if (isDef(vnode.componentInstance)) {
				initComponent(vnode, insertedVnodeQueue)
				insert(parentElm, vnode.elm, refElm)
				if (isTrue(isReactivated)) {
					reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
				}
				return true
			}
		}
	}
	
	/**
	 * 钩子函数
	 * 	src/core/vdom/create-component.js
	 * 		init钩子函数执行是通过createComponentInstanceForVnode创建一个Vue的实例，
	 * 		然后调用$mount方法挂载子组件
	 */
	init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
		if (
			vnode.componentInstance &&
			!vnode.componentInstance._isDestroyed &&
			vnode.data.keepAlive
		) {
			// kept-alive components, treat as a patch
			const mountedNode: any = vnode ,// work around flow
			componentVNodeHooks.prepatch(mountedNode, mountedNode)
		} else {
			const child = vnode.componentInstance = createComponentInstanceForVnode(
				vnode,
				activeInstance
			)
			// 在完成实例化的_init后
			// hydrating为true一般是服务端渲染的情况
			// 最终会调用mountComponent 进而执行vm._render()
			child.$mount(hydrating ? vnode.elm : undefined, hydrating)
		}
	}
	
	/**
	 * createComponentInstanceForVnode
	 * 		构造的一个内部组件的参数，然后执行new vnode.componentOptions.Ctor(options)
	 */
	
	export function createComponentInstanceForVnode(
		vnode: any, // we konw it's MountedComponentVNode but flow doesn't
		parent: any, // activeInstance in lifecycle state
	): Component {
		const options: InternalComponentOptions = {
			//表示它是一个组件
			_isComponent: true,
			_parentVnode: vnode,
			//表示当前激活的组件实例
			parent
		}
		// check inline-template render functions
		const inlineTemplate = vnode.data.inlineTemplate
		if (isDef(inlineTemplate)) {
			options.render = inlineTemplate.render
			options.staticRenderFns = inlineTemplate.staticRenderFns
		}
		// 对应子组件的构造函数
		// 实际上是继承于Vue的构造器Sub,相当于new Sub(options)
		// 子组件的实例化实际上就是在这个时机执行的，并且它会执行实例的_init方法
		return new vnode.componentOptions.Ctor(options)
	}
	
	/**
	 * _init
	 * 		src/core/instance/init.js
	 */
	Vue.prototype._init = function (options?: Object) {
		const vm: Component = this,
		// merge options
		if (options && options._isComponent) {
			// optimize internal component instantiation
			// since dynamic options merging is pretty slow, and none of the
			// internal component options needs special treatment.
			initInternalComponent(vm, options)
		} else {
			vm.$options = mergeOptions(
				resolveConstructorOptions(vm.constructor),
				options || {},
				vm
			)
		}
		// ...
		// 由于组件初始化的时候不传el，因此组件是自己接管了$mount的过程
		if (vm.$options.el) {
			vm.$mount(vm.$options.el)
		}
	}
	
	export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
		
		//vm.construction就是子组件的构造函数Sub，相当于vm.$options = Sub.optionsa
		
		//接着又把实例化子组件传入的子组件父VNode实例parentVnode、子组件的父Vue实例parent保存
		//到vm.$options中，另外还保留了parentVnode配置中的如propsData等其它的属性
		const opts = vm.$options = Object.create(vm.constructor.options)
		
		// doing this because it's faster than dynamic enumeration.
		const parentVnode = options._parentVnode
		
		//把之前我们通过createComponentInstanceForVnode函数传入的几个参数合并到内部的选项$options
		opts.parent = options.parent
		opts._parentVnode = parentVnode
		
		const VNodeComponentOptions = parentVnode.componentOptions
		opts.propsData = VNodeComponentOptions.propsData
		opts._parentListeners = VNodeComponentOptions.listeners
		opts._renderChildren = vnodeComponentOptions.children
		opts._componentTag = vnodeComponentOptions.tag
		
		if (options.render) {
			opts.render = options.render
			opts.staticRenderFns = options.staticRenderFns
		}
	}
	
	Vue.prototype._render = function(): VNode{
		const vm: Component = this,
		const { render, _parentVnode } = vm.$options
		
		// set parent vnode. this allows render functions to have access
		// to the data on the placeholder node.
		vm.$vnode = _parentVnode
		// render self
		let vnode
		try {
			vnode = render.call(vm._renderProxy, vm.$createElement)
		} catch (e) {
			// ...
		}
		// set parent
		// 当前组件的父VNode
		vnode.parent = _parentVnode
		
		// 当前组件的渲染vnode
		// vnode的parent指向了_parentVnode,也就是vm.$vnode
		return vnode
	}
	
	/**
	 * vm._render生成VNode
	 * vm._update渲染VNode
	 * 		src/core/instance/lifecycle.js
	 */
	export let activeInstance: any = null
	Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
		const vm: Component = this,
		const prevEl = vm.$el
		const prevVnode = vm._vnode
		const prevActiveInstance = activeInstance
		// 保持当前上下文的Vue实例
		// 它是在lifecycle模块的全局变量
		// export let activeInstance: any = null
		// 在之前调用createComponentInstanceForVnode方法的时候从lifecycle模块获取，并且作为参数传入
		// 实际上JavaScript是一个单线程，Vue整个初始化是一个深度遍历的过程，在实例化子组件的过程中，它需要知道
		// 当前上下文的Vue实例是什么，并把它作为子组件的父Vue实例
		activeInstance = vm
		// vnode是通过vm._render()返回的组件渲染VNode
		vm._vnode = vnode
		// Vue.prototype.__patch__ is injected in entry points
		// based on the rendering backend used.
		if (!prevVnode) {
			// initial render
			vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
		} else {
			// updates
			vm.$el = vm.__patch__(prevVnode, vnode)
		}
		activeInstance = prevActiveInstance
		// update __vue__ reference
		if (prevEl) {
			prevEl.__vue__ = null
		}
		if (vm.$el) {
			vm.$el.__vue__ = vm
		}
		// vm._vnode 和 vm.$vnode 的关系就是一种父子关系
		// vm._vnode.parent === vm.$vnode
		
		// if parent is an HOC, update its $el as well
		if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
			vm.$parent.$el = vm.$el
		}
		// updated hook is called by the scheduler to ensure that children are
		// updated in a parent's updated hook.
	}
	
	/**
	 * 子组件的实例化过程会先调用initInternalComponent(vm, options)合并options,把parent存储在vm.$options中
	 * 在$mount之前会调用initLifecycle(vm)方法：
	 * 
	 * vm.$parent就是用来保留当前vm的父实例，并且通过parent.$children.push(vm)来把当前的vm存储到父实例的
	 * $children中
	 * 
	 * 在vm._update的过程中，把当前的vm赋值给activeInstance，同时通过const prevActiveInstance = activeInstance
	 * 用preActiveInstance保留上一次的activeInstance。实际上,prevActiveInstance和当前的vm是一个父子关系，
	 * 当一个vm实例完成它的所有子树的patch或者update过程后,activeInstance会回到它的父实例，这样就完美地保证来
	 * createComponentInstanceForVnode整个深度遍历过程中，我们在实例化子组件的时候能传入当前子组件的父Vue实例，并
	 * 在_init的过程中，通过vm.$parent把这个父子关系保留。
	 */
	export function initLifecycle (vm: Component) {
		const options = vm.$options
		
		// locate first non-abstract parent
		let parent = options.parent
		if (parent && !options.abstract) {
			while (parent.$options.abstract && parent.$parent) {
				parent = parent.$parent
			}
			parent.$children.push(vm)
		}
		
		vm.$parent = parent
		// ...
	}
	
	/**
	 * __patch__渲染VNode
	 * 
	 */
	vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
	
	function patch(oldVnode, vnode, hydrating, removeOnly) {
		// ...
		let isInitialPatch = false
		const insertedVnodeQueue = [];
		
		if (isUndef(oldVnode)) {
			// empty mount (likely as component), create new root element
			isInitialPatch = true
			createElm(vnode, insertedVnodeQueue)
		} else {
			// ...
		}
		// ...
	}
	
	/**
	 * 对应的parentElm是undefined
	 * 		这里传入的vnode是组件渲染的vnode,也就是我们之前说的vm._vnode，如果组件的根节点是个普通元素，
	 * 		那么vm._vnode也是普通的vnode
	 * 		先创建一个父节点占位符，然后再遍历所有子VNode递归调用createElm,在遍历的过程中，如果遇到子VNode是一个组件的
	 * 		VNode，则重复开始的过程，这样通过一个递归的方式就可以完整地构建来整个组件树。
	 */
	
	function createElm(
		vnode,
		insertedVnodeQueue,
		parentElm,
		refElm,
		nested,
		ownerArray,
		index
	) {
		//...
		if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
			return
		}
		
		const data = vnode.data
		const children = vnode.children
		const tag = vnode.tag
		if (isDef(tag)) {
			// ...
			vnode.elm = vnode.ns
				? nodeOps.createElementNS(vnode.ns, tag)
				: nodeOps.createElement(tag, vnode)
			setScope(vnode)
			
			/* istanbul ignore if */
			if (__WEEX__) {
				// ...
			} else {
				createChildren(vnode, children, insertedVnodeQueue)
				if (isDef(data)) {
					invokeCreateHooks(vnode, insertedVnodeQueue)
				}
				insert(parentElm, vnode.elm, refElm)
			}
			
			// ...
		} else if (isTrue(vnode.isComment)) {
			vnode.elm = nodeOps.createComment(vnode.text)
			insert(parentElm, vnode.elm, refElm)
		} else {
			vnode.elm = nodeOps.createTextNode(vnode.text)
			insert(parentElm, vnode.elm, refElm)
		}
	}
	
	/**
	 * 合并配置
	 * 		new Vue的过程通常有2种场景，一种是外部我们的代码主动调用new Vue(options)的方式实例化一个Vue对象；另一种是内部通过
	 * 		new Vue(options)实例化子组件
	 * 		无论哪种场景，都会执行实例的_init(options)方法，它首先会执行一个merge options的逻辑，
	 * 		源码：src/core/instance/init.js
	 */
	Vue.prorotype._init = function (options?: Object) {
		// merge options
		if (options && options._isComponent) {
			// optimize internal component instantiation
			// since dynamic options merging is pretty slow, and none of the
			// internal component options needs special treatment.
			initInternalComponent(vm, options)
		} else {
			//实际上就是把resolveConstructorOptions(vm.constructor)的返回值和options做合并
			// resolveConstructorOptions(vm.constructor)简单返回vm.constructor.options 相当于Vue.options
			vm.$options = mergeOptions(
				resolveConstructorOptions(vm.constructor),
				options || {},
				vm
			)
		}
		// ...
	}
	
	// initGlobalAPI(Vue)
	/**
	 * 首先通过Vue.options = Object.create(null)创建一个空对象，然后遍历ASSET_TYPES
	 */
	export function initGlobalAPI (Vue: GlobalAPI) {
		// ...
		Vue.options = Object.create(null)
		/**
		 * 相当于
		 * Vue.options.components = {}
		 * Vue.options.directives = {}
		 * Vue.options.filters = {}
		 */
		ASSET_TYPES.forEach(type => {
			Vue.options[type + 's'] = Object.create(null)
		})
		
		// this is used to identify the "base" constructor to extend all plain-object
		/// components with in Weex's multi-instance scenarios
		Vue.options._base = Vue
		
		/**
		 * 把一些内置组件扩展到Vue.options.components
		 * Vue的内置组件目前有<keep-alive>、<transition>和<transition-group>,这也就是为什么我们
		 * 在其它组件中使用<keep-alive>组件不需要注册的原因
		 */
		extend(Vue.options.components, builtInComponents)
	}
	
	/**
	 * ASSET_TYPES
	 * 	src/shared/constants.js
	 */
	export const ASSET_TYPES = [
		'component',
		'directive',
		'filter'
	]
	
	/**
	 * mergeOptiopns
	 * 	src/core/util/options.js
	 *  mergeOptions主要功能就是把parent和child这俩个对象根据一些合并策略，合并成一个新对象并返回。
	 * 	先递归把extends和mixins合并到parent上，然后遍历parent，调用mergeField，然后再遍历child，如果
	 * 	key不在parent的自身属性上，则调用mergeField
	 */
	
	/**
	 * Merge two option objects into a new one.
	 * Core utility used in both instantiation and inheritance.
	 */
	export function mergeOptions (
		parent: Object,
		child: Object,
		vm?: Component
	): Object {
		if (process.env.NODE_ENV !== 'production') {
			checkComponents(child)
		}
		
		if (typeof child === 'function') {
			child = child.options
		}
		
		normalizeProps(child, vm)
		normalizeInject(child, vm)
		normalizeDirectives(child)
		const extendsFrom = child.extends
		if (extendsFrom) {
			parent = mergeOptions(parent, extendsFrom, vm)
		}
		if (child.mixins) {
			for(let i = 0, l = child.mixins.length; i < l; i++){
				parent = mergeOptions(parent, child,mixins[i], vm)
			}
		}
		const options = {}
		let key
		for (key in parent) {
			mergeField(key)
		}
		for (key in child) {
			if (!hasOwn(parent, key)) {
				mergeField(key)
			}
		}
		function mergeField(key) {
			const strat = strats[key] || defaultStrat
			options[key] = strat(parent[key], child[key], vm, key)
		}
		return options
	}
	
	/**
	 * mergeFiled对于不同的key有着不同的合并策略
	 */
	function mergeHook (
		parentVal: ?Array<Function>,
		childVal: ?Function | ?Array<Function>
	): ?Array<Function> {
		/**
		 * 如果不存在childVal,就返回parentVal;否则再判断是否存在parentVal,如果存在就把childVal
		 * 添加到parentVal后返回新数组；否则返回childVal的数组。mergeOptions函数，一旦parent和child
		 * 都定义了相同的钩子函数，那么它们会把2个钩子函数合并成一个数组。
		 */
		return childVal
			? parentVal
				? parentVal.concat(childVal)
				: Array.isArray(childVal)
					? childVal
					: [childVal],
			: parentVal
	}
	
	LIFECYCLE_HOOKS.forEach(hook => {
		strats[hook] = mergeHook
	})
	
	/**
	 * LIFECYCLE_HOOKS
	 * 	src/shared/constants.js
	 */
	export const LIFECYCLE_HOOKS = [
		'beforeCreate',
		'created',
		'beforeMount',
		'mounted',
		'beforeUpdate',
		'updated',
		'beforeDestroy',
		'destroyed',
		'activated',
		'deactivated',
		'errorCaptured'
	]
	
	/**
	 * options的合并有2中方式，子组件初始化过程通过initInternalComponent方式要比外部初始化Vue通过
	 * mergeOptions的过程要快，合并完的结果保留在vm.$options
	 * 
	 * 自身定义了一些默认配置，同时又可以在初始化阶段传入一些定义配置，然后去merge默认配置，来达到定制化
	 * 不同需求的目的。只不过在Vue的场景下，会对merge的过程做一些精细化控制。
	 */
	
	/**
	 * 生命周期
	 * 		每个Vue实例在被创建之前都要经过一系列的初始化过程。
	 * 		源码中最终执行生命周期的函数都是调用callHook方法，它的定义在src/core/instance/lifecycle中：
	 * 
	 * 		根据传入的字符串hook，拿到vm.$options[hook]对应的回调函数数组，然后遍历执行，执行的时候把vm作为函数执行的上下文
	 * 
	 * 		vue.js合并options的过程，各个阶段的生命周期的函数也被合并到vm.$options里，并且是一个数组。
	 * 		因此callhook函数的功能就是调用某个生命周期钩子注册的所有回调函数。
	 */
	export function callHook(vm: Component, hook: string) {
		// #7573 disable dep collection when invoking lifecycle hooks
		pushTarget()
		const handlers = vm.$options[hook]
		if (handlers) {
			for (let i = 0, j = handlers.length;i < j;i++){
				try {
					handlers[i].call(vm)
				} catch (e) {
					handleError(e, vm, `${hook} hook`)
				}
			}
		}
		if (vm._hasHookEvent) {
			vm.$emit('hook:' + hook)
		}
		popTarget()
	}
	
	/**
	 * beforeCreate & created
	 * beforeCreate和created函数都是在实例化Vue的阶段，在_init方法中执行的
	 * 		源码：src/core/instance/init.js
	 * 
	 * 		beforeCreate和created的钩子调用是在initState的前后,initState的作用是初始化props、
	 * 		data、methods、watch、computed等属性。
	 * 		beforeCreate的钩子函数中就不能获取到props、data中定义的值，也不能调用methods中定义的函数
	 * 
	 * 		在这俩个钩子函数执行的时候，并没有渲染DOM，所以我们也不能够访问DOM，一般来说，如果需要访问props、data
	 * 		等数据的化，需要使用created钩子函数。
	 */
	Vue.prototype._init = function (options?: Object) {
		// ...
		initLifecycle(vm)
		initEvents(vm)
		initRender(vm)
		callHook(vm, 'beforeCreate')
		initInjections(vm) // resolve injections before data/props
		initState(vm)
		initProvide(vm) // resolve provide after data/props
		callHook(vm, 'created')
		// ...
	}
	
	/**
	 * beforeMount & mounted
	 * 		beforeMount钩子函数发生在mount，也就是DOM挂载之前，它的调用时机是在mountComponent函数中，
	 * 		src/core/instance/lifecycle
	 * 
	 * 		在执行vm._render()函数渲染VNode之前，执行了beforeMount钩子函数，在执行完vm._update()把
	 * 		VNode patch到真实DOM后，执行mounted钩子。
	 */
	export function mountComponent (
		vm: Component,
		el: ?Element,
		hydrating?: boolean
	): Component {
		vm.$el = el
		// ...
		callHook(vm, 'beforeMount')
		
		let updateComponent
		/* istanbul ignore if */
		if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
			updateComponent = () => {
				const name = vm._name
				const id = vm._uid
				const startTag = `vue-perf-start:${id}`
				const endTag = `vue-perf-end:${id}`
				
				mark(startTag)
				const vnode = vm._render()
				mark(endTag)
				measure(`vue ${name} render`, startTag, endTag)
				
				mark(startTag)
				vm._update(vnode, hydrating)
				mark(endTag)
				measure(`vue ${name} patch`, startTag, endTag)
			}
		} else {
			updateComponent = () => {
				vm._update(vm._render(), hydrating)
			}
		}
		
		// we set this to vm._watcher inside the watcher's constructor
		// since the watcher's initial patch may call $forceUpdate (e.g. inside child)
		// component's mounted hook), which relies on vm._watcher being already defined
		new Watcher(vm, updateComponent, noop, {
			before() {
				if (vm._isMounted) {
					callHook(vm, 'beforeUpdate')
				}
			}
		}, true /* isRenderWatcher */)
		hydrating = false
		
		// manually mounetd instance, call mounted on self
		// mounted is called for render-created child components in its inserted hook
		if(vm.$vnode == null) {
			vm._isMounted = true
			callHook(vm, 'mounted')
		}
		return vm
	}
	
	/**
	 * 组件的mounted时机
	 * 		组件的VNode patch到DOM后，会执行invokeInsertHook,把insertedVnodeQueue里保存的钩子函数依次执行一遍
	 * 		src/core/vdom/patch.js
	 */
	 function invokeInsertHook (vnode, queue, initial) {
		 // delay insert hooks for component root nodes, invoke them after the
		 // element is really inserted
		 if (isTrue(initial) && isDef(vnode.parent)) {
			 vnode.parent.data.pendingInsert = queue
		 } else {
			 for (let i = 0; i < queue.length; ++i) {
				 queue[i].data.hook.insert(queue[i])
			 }
		 }
	 }
	 
	 /**
	  * 	insert
	  * 	src/core/vdom/create-component.js
	  * 
	  * 	insertedVnodeQueue的添加顺序是先子后父，所以对于同步渲染的子组件而言
	  * 	mounted钩子函数的执行顺序也是先子后父
	  */
	 const componentVNodeHooks = {
		 // ...
		 insert (vnode: MountedComponentVNode) {
			 const { context, componentInstance } = vnode
			 if (!componentInstance._isMounted) {
				 componentInstance._isMounted = true
				 callHook(componentInstance, 'mounted')
			 }
		 }
	 }
	 
	 /**
	  * beforeUpdate & updated
	  * 	beforeUpdate和updated的钩子函数执行时机都应该是在数据更新的时候
	  * 	beforeUpdate的执行时机是在渲染Watcher的before函数中
	  */
	 export function mountComponent (
		vm: Component,
		el: ?Element, 
		hydrating?: boolean
	 ): Component {
		 // ...
		 
		 // we set this to vm._watcher inside the watcher's constructor
		 // since the watcher's initial patch may call $forceUpdate (e.g. inside child)
		 // component's mounted hook), which relies on vm._watcher being already defined
		 new Watcher(vm, updateComponent, noop, {
			 before () {
				 if (vm._isMounted) {
					 callHook(vm, 'beforeUpdate')
				 }
			 }
		 }, true /* isRenderWatcher */)
		 // ...
	 }
	 
	 /**
	  * update 的执行时机是在flushSchedulerQueue函数调用的时候
	  * 		src/core/observer/scheduler.js
	  * 
	  * 		updatedQueue是更新了的watcher数组，那么在callUpdatedHooks函数中，它对这些数组做遍历，
	  * 		只有满足当前watcher为vm._watcher以及组件已经mounted这俩个条件，才会执行updated钩子函数。
	  */
	 function flushSchdulerQueue() {
		 // ...
		 // 获取到updatedQueue
		 callUpdatedHooks(updatedQueue)
	 }
	 
	 function callUpdatedHooks (queue) {
		 let i = queue.length
		 
		 while (i--) {
			 const watcher = queue[i]
			 const vm = watcher.vm
			 if (vm._watcher === watcher && vm._isMounted) {
				 callHook(vm, 'updated')
			 }
		 }
	 }
	 
	 /**
	  * 实例化Watcher的过程中，在它的构造函数里会判断isRenderWatcher，接着把当前watcher的实例赋值给vm._watcher
	  * 	src/core/observer/watcher.js
	  * 
	  * 	同时还把当前watcher实例push到vm._watcher中，vm._watcher是专门用来监听vm上数据变化然后重新渲染的，
	  * 	所以它是一个渲染相关的watcher，因此在callUpdatedHooks函数中，只有vm._watcher的回调执行完毕后，才会执行
	  * 	updated钩子函数
	  */
	 export default class Watcher {
		 // ...
		 constructor (
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
			 vm._watchers.push(this)
			 // ...
		 }
	 }
	 
	 /**
	  * beforeDestroy & destroyed
	  * 	beforeDestroy和destroyed钩子函数的执行时机在组件销毁阶段，最终会调用$destroy方法
	  * 	src/core/instance/lifecycle.js
	  * 
	  * 	从parent的$children中删掉自身，删除watcher，当前渲染的VNode执行销毁钩子函数等，执行完毕后
	  * 	再调用destroy钩子函数
	  * 
	  * 	在$destroy的执行过程中，它又会执行vm.__patch__(vm._vnode, null)触发它子组件的销毁钩子函数，
	  * 	这样一层层的递归调用，所以destroy钩子函数执行顺序是先子后父，和mounted过程一样。
	  */
	 Vue.prototypr.$destroy = function () {
		 const vm: Component = this,
		 if (vm._isBeingDestroyed) {
			 return
		 }
		 callHook(vm, 'beforeDestroy')
		 vm._isBeingDestroyed = true
		 // remove self from parent
		 const parent = vm.$parent
		 if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
			 remove(parent.$children, vm)
		 }
		 // treardown watchers
		 if (vm._watcher) {
			 vm._watcher.teardown()
		 }
		 let i = vm._watchers.length
		 while (i--) {
			 vm._watchers[i].teardown()
		 }
		 // remove reference from data ob
		 // forzen object may not have observer.
		 if (vm._data.__ob__) {
			 vm.__data.__ob__.vmCount--
		 }
		 // call the last hook...
		 vm._isDestroyed = true
		 // invoke destroye hooks on current rendered tree
		 vm.__patch__(vm._vnode, null)
		 // fire destroyed hook
		 callHook(vm, 'destroyed')
		 // turn off all instance listeners.
		 vm.$off()
		 // remove __vue__ reference
		 if (vm.$el) {
			 vm.$el.__vue__ = null
		 }
		 // release circular reference (#6759)
		 if (vm.$vnode) {
			 vm.$vnode.parent = null
		 }
	 }
	 
	 /**
	  * activated & deactivated
	  * 	是专门为keep-alive组件定制的钩子
	  *
	  * 总结：
	  * 	介绍了Vue生命周期中各个钩子函数的执行时机以及顺序，通过分析，知道了在created钩子
	  * 	函数中可以访问到数据，在mounted钩子函数中可以访问到DOM，在destroy钩子函数中可以做一些
	  * 	定时器销毁工作。
	  */
	 
	 /**
	  * 组件注册
	  * 	全局注册
	  * 		使用Vue.component(tagName, options)
	  */
	 Vue.component('my-component', {
		 // 选项
	 })
	 /**
	  * Vue.component
	  * 	src/core/global-api/assets.js
	  * 
	  * 	函数首先遍历ASSET_TYPES，得到type后挂载到Vue上。
	  */
	import { ASSET_TYPES } from 'shared/constants'
	import { isPlainObject, validateComponentName } from '../util/index'
	
	export function initAssetRegisters (Vue: GlobalAPI) {
		/**
		 * Create asset registration methods.
		 */
		ASSET_TYPES.forEach(type => {
			Vue[type] = function (
				id: string,
				definition: Function | Object
			): Function | Object | void {
				if (!definition) {
					return this.options[type + 's'][id]
				} else {
					/* istanbul ignore if */
					if (process.env.NODE_ENV !== 'production' && type === 'component') {
						validateComponentName(id)
					}
					if (type === 'component' && isPlainObject(definition)) {
						definition.name = definition.name || id
						definition = this.options._base.extend(definition)
					}
					if (type === 'directive' && typeof definition === 'function') {
						definition = { bind: definition, update: definition }
					}
					this.options[type + 's'][id] = definition
					return definition
				}
			}
		})
	}
	
	/**
	 * src/shared/constants.js
	 * 		如果type是component且definition是一个对象的话
	 * 		通过this.options._base.extend 相当于Vue.extend把这个对象转换成一个继承于Vue的构造函数
	 * 		最后通过this.options[type + 's'][id] = definition把它挂载到Vue.options.components上
	 */
	 export const ASSET_TYPES = [
		 'component',
		 'directive',
		 'filter'
	 ]
	 
	 /**
	  * 也就是说它会把Vue.options合并到Sub.options，也就是组件的options上，然后在组件的实例化阶段，会执行merge options逻辑，
	  * 把Sub.options.components合并到vm.$options.components上
	  * 
	  * 然后在创建vnode的过程中，会执行_createElement方法
	  */
	 Sub.options = mergeOptions(
		Super.options,
		extendOptions
	 )
	 
	 /**
	  * _createElement
	  * 	src/core/vdom/create-element.js
	  */
	 export function _createElement (
		context: Component,
		tag?: string | Class<Component> | Function | Object,
		data?: VNodeData,
		children?: any,
		normalizationType?: number
	 ): VNode | Array<VNode> {
		 // ...
		 let vnode, ns
		 if (typeof tag === 'string') {
			 let Ctor
			 ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
			 if (config.isReservedTag(tag)) {
				 // platform built-in elements
				 vnode = new VNode(
					config.parsePlatformTagName(tag), data, children,
					undefined, undefined, context
				 )
			 } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
				 // component
				 vnode = createComponent(Ctor, data, context, children, tag)
			 } else {
				 // unknown or unlisted namespaced elements
				 // check at runtime because it may get assigned a namespace when its
				 // parent normalizes children
				 vnode = new VNode(
					tag, data, children,
					undefined, undefined, context
				 )
			 }
		 } else {
			 // direct component options / constructor
			 vnode = createComponent(tag, data, context, children)
		 }
		 // ...
	 }
	 
	 /**
	  * resolveAssets
	  * 	src/core/utils/options.js
	  */
	 
	 /**
	  * Resolve an asset.
	  * This function is used because child instances need access
	  * to assets defined in its ancestor chain.
	  * 
	  * 	先通过const assets = options[type] 拿到assets，然后再尝试拿到assets[id]，
	  * 	这里有个顺序，先直接使用id，如果不存在，则把id变成驼峰的形式再拿，如果仍然不存在则在驼峰的基础
	  * 	上把首字母变成大写的形式再拿，如果仍然拿不到则报错。
	  */
	 export function resolveAsset (
		options: Object,
		type: string,
		id: string,
		warnMissing?: boolean
	 ): any {
		 /* istanbul ignore if */
		 if (typeof id !== 'string') {
			 return
		 }
		 const assets = options[type]
		 // check local registration variations first
		 if (hasOwn(assets, id)) return assets[id]
		 const camelizedId = camelize(id)
		 if (hasOwn(assets, camelizedId)) return assets[camelizedId]
		 const PascalCaseId = capitalize(camelizedId)
		 if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
		 // fallback to prototype chain
		 const res = asset[id] || assets[camelizedId] || assets[PascalCaseId]
		 if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
			 warn(
				'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
				options
			 )
		 }
		 return res
	 }
	 
	 /**
	  * 局部注册
	  * 	在组件的Vue的实例化阶段有一个合并option的逻辑，之前我们也分析过，就把components合并到vm.$options.components上，
	  * 	这样我们就可以在resolveAsset的时候拿到这个组件的构造函数，并作为createComponent的钩子的参数。
	  * 
	  * 	局部注册和全局注册不同的是，只有该类型的组件才可以访问到局部注册的子组件，而全局注册是扩展到Vue.options下，所以在所有组件
	  * 	创建的过程中，都会从全局的Vue.options.components扩展到当前组件的vm.$options.components下，这就是全局注册的组件能被任意
	  * 	使用的原因。
	  */
	 
	 /**
	  * 异步组件
	  * 	为了减少首屏代码体积，往往会把一些非首屏的组件设计成异步组件，按需加载。
	  */
	 Vue.component('async-example', function (resolve, reject) {
		 // 这个特殊的require语法告诉webpack
		 // 自动将编译后的代码分割成不同的块，
		 // 这些块将通过Ajax请求自动下载。
		 require(['./my-async-component'], resolve)
	 })
	 
	 /**
	  * 组件的定义并不是一个普通对象，所以不会执行Vue.extend的逻辑把它变成一个组件的构造函数，但是它仍然可以执行到createComponent
	  * 函数
	  * 	src/core/vdom/create-component.js
	  * 	执行了 Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
	  * 	src/core/vdom/helpers/resolve-async-component.js
	  * 
	  */
	 export function resolveAsyncComponent (
		factory: Function,
		baseCtor: Class<Component>,
		context: Component
	 ): Class<Component> | void {
		 if (isTrue(factory.error) && isDef(factory.errorComp)) {
			 return factory.errorComp
		 }
		 
		 if (isDef(factory.resolved)) {
			 return factory.resolved
		 }
		 
		 if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
			 return factory.loadingComp
		 }
		 
		 if (isDef(factory.contexts)) {
			 // already pending
			 factory.contexts.push(context)
		 } else {
			 const contexts = factory.contexts = [context]
			 let sync = true
			 
			 const forceRender = () => {
				 for (let i = 0, l = contexts.length; i < l; i++){
					 contexts[i].$forceUpdate()
				 }
			 }
			 
			 const resolve = once((res: Object | Class<Component>) => {
				 // cache resolved
				 factory.resolved = ensureCtor(res, baseCtor)
				 // invoke callbacks only if this is not a synchronous resolve
				 // (async resolves are shimmed as synchronous during SSR)
				 if (!sync) {
					 forceRender()
				 }
			 })
			 
			 const reject = once(reason => {
				 process.env.NODE_ENV !== 'production' && warn(
					`Failed to resolve async component: ${String(factory)}` + 
					(reaon ? `\nReason: ${reason}` : '')
				 )
				 if (isDef(factory.errorComp)) {
					 factory.error = true
					 forceRender()
				 }
			 })
			 
			 /**
			  * 	执行组件的工厂函数 同时把resolve和reject函数作为参数传入
			  * 		组件的工厂函数通常会先发送请求去加载我们的异步组件的JS文件，拿到组件定义的对象res后，
			  * 		执行resolve(res)逻辑，它会先执行factory.resolved = ensureCtor(res, baseCtor)
			  */
			 
			 const res = factory(resolce, reject)
			 
			 if (isObject(res)) {
				 if (typeof res.then === 'function') {
					 // () => Promise
					 if (isUndef(factory.resolved)) {
						 res.then(resolve, reject)
					 }
				 } else if (isDef(res.component) && typeof res.component.then === 'function') {
					 res.component.then(resolve, reject)
					 
					 // 先判断res.error是否定义了error组件，如果有的话则赋值给factory.errorComp
					 if (isDef(res.error)) {
						 factory.errorComp = ensureCtor(res.error, baseCtor)
					 }
					 // 接着判断res.loading 是否定义了loading组件，如果有的话则赋值给factory.loadingComp
					 if (isDef(res.loading)) {
						 factory.loadingComp = ensureCtor(res.loading, baseCtor)
						 // 如果设置了res.delay且为0，则设置factory.loading = true
						 if (res.delay === 0) {
							 factory.loading = true
						 } else {
							 // 否则延时delay的时间执行：
							 setTimeout(() => {
								 if (isUndef(factory.resolved) && isUndef(factory.error)){
									 factory.loading = true
									 forceRender()
								 }
							 }, res.delay || 200)
						 }
					 }
					 //最后判断res.timeout，如果配置了该项，则在res.timeout时间后，如果组件没有成功加载，执行reject
					 if (isDef(res.timeout)) {
						 setTimeout(() => {
							 if (isUndef(factory.resolved) &&
							 isUndef(factory.error)) {
								 factory.loading = true
								 forceRender()
							 }
						 }, res.delay || 200)
					 }
				 }
				 
				 if (isDef(res.timeout)) {
					 setTimeout(() => {
						 if (isUndef(factory.resolved)) {
							 reject(
								process.env.NODE_ENV !== 'production'
									? `timeout (${res.timeout}ms)`
									: null
							 )
						 }
					 }, res.timeout)
				 }
			 }
		 }
		 
		 // 如果delay配置为0，则这次直接渲染loading组件，否则则延时delay执行forceRender，那么又会再一次执行到resolveAsyncComponent
		 sync = false
		 // return in case resolved synchronously
		 return factory.loading
			? factory.loadingComp
			: factory.resolved
	 }
	 
	 /**
	  *		实际上处理了3种异步组件的创建方式
	  * 		组件注册方式
	  * 		Promise创建组件的方式
	  */
		Vue.component(
	  		'async-webpack-example',
	  		// 该 `import` 函数返回一个 	`Promise`对象
	  		() => import('./my-async-component')
	  	)
	/**
	 * 高级异步组件
	 */
	const AsyncComp = () => ({
		// 需要加载的组件。应当是一个Promise
		component: import('./MyComp.vue'),
		// 加载种应当渲染的组件
		loading: LoadingComp,
		// 出错时渲染的组件
		error: ErrorComp,
		// 渲染加载种组件前的等待时间。默认：200ms。
		delay: 200,
		// 最长等待时间。超出此时间则渲染错误组件。默认：Infinity
		timeout: 3000
	})
	Vue.component('async-example', AsyncComp)
	
	/**
	 * 普通函数异步组件
	 * 		针对普通函数的情况，前面几个if判断可以忽略，它们是为高级组件所用，对于factory.contexts的判断，是考虑到多个地方
	 * 		同时初始化一个余部组件，那么它实际加载应该只有一次。接着进入实际加载逻辑，定义了forceRender、resolve和reject函数，
	 * 		注意resolve和reject函数用once函数做了一层包装，它的定义在src/shared/util.js
	 */
	
	/**
	 * Ensure a function is called only once.
	 * 	传入一个函数，并返回一个新函数，它非常巧妙的利用闭包和一个标志位保证了它包装的函数只会执行一次，
	 * 	也就是确保resolve和reject函数只执行一次。
	 */
	export function once (fn: Function): Function {
		let called = false
		return function () {
			if (!called) {
				called = true
				fn.apply(this, arguments)
			}
		}
	}
	
	/**
	 * 这个函数目的是为了保证能找到异步组件JS定义的组件对象，并且如果它是一个普通对象，则调用Vue.extend
	 * 把它转换成一个组件的构造函数。
	 */
	function ensureCtor (comp: any, base) {
		if (
			comp.__esModule ||
			(hasSymbol && comp[Symbol.toStringTag] === 'Module') {
				comp = comp.default
			}
			return isObject(comp)
				? base.extend(comp)
				: comp
		)
	}
	
	/**
	 * resolve逻辑最后判断了sync，显然我们这个场景下sync为false,那么就会执行forceRender函数，它会遍历factory.contexts,拿到每一个调用
	 * 异步组件的实例vm,执行vm.$forceUpdate()方法
	 * 		src/core/instance/lifecycle.js
	 * 
	 * 		调用渲染的watcher的update方法，让渲染watcher对应的回调函数执行，也就是触发了组件的重新渲染。之所以这么做是因为Vue通常是数据驱动视图
	 * 		重新渲染，但是在整个异步组件加载过程中是没有数据发生变化的，所以通过执行$forceUpdate可以强制组件重新渲染一次。
	 */
	Vue.prototype.$forceUpdate = function () {
		const vm: Component = this,
		if (vm._watcher) {
			vm._watcher.update()
		}
	}
	
	/**
	 * Promise 异步组件
	 * 	webpack 2+ 支持了异步加载的语法糖： () => import('./my-async-component'),
	 * 当执行完 res = factory(resolve, reject)，返回的值就是import('./my-async-component')的返回值
	 * 它是一个Promise对象。接着进入if条件，又判断了typeof res.then === 'function'),条件满足，执行：
	 */
	Vue.component(
		'async-webpack-example'
		// 该 `import`函数返回一个`Promise`对象。
		() => import('./my-async-component')
	)
	
	/**
	 * 当组件异步加载成功后，执行resolve,加载失败则执行reject，这样就非常巧妙地实现了配合webpack 2+
	 * 的异步加载组件的方式(Promise)加载异步组件。
	 */
	if (isUndef(factory.resolved)) {
		res.then(resolve, reject)
	}
	
	/**
	 * 高级异步组件
	 * 		由于异步加载组件需要动态加载JS，有一定网络延时，而且有加载失败的情况，所以通常我们在开发异步组件相关逻辑
	 * 		的时候需要设计loading组件和error组件，并在适当的时机渲染它们。Vue.js 2.3+支持了一种高级异步组件的方式，它
	 * 		通过一个简单的对象配置，帮你搞定loading组件和error组件的渲染时机。你完全不用关心细节，非常方便。
	 * 
	 * 		高级异步组件的初始化逻辑和普通异步组件一样，也是执行resolveAsyncComponent，当执行完res = factory(resolve, reject)，
	 * 		返回值就是定义的组件对象，显然满足else if (isDef(res.component) && typeof res.component.then === 'function')的
	 * 		逻辑，接着执行res.component.then(resolve, reject)，当异步组件加载成功后，执行resolve,失败执行reject。
	 * 
	 * 		因为异步组件加载是一个异步过程，它接着又同步执行了如下逻辑：
	 */
	
	const AsyncComp = () => ({
		// 需要加载的组件。应当是一个Promise
		component: import('./MyComp.vue'),
		// 加载中应当渲染的组件
		loading: LoadingComp,
		// 出错时渲染的组件
		error: ErrorComp,
		// 渲染加载中组件前的等待时间。默认：200ms。
		delay: 200,
		// 最长等待时间。超出此时间则渲染错误组件。默认：Infinity
		timeout: 3000
	})
	Vue.component('async-example', AsyncComp)
	
	/**
	 * 异步组件加载失败
	 * 		这个时候会把factory.error设置为true，同时执行forceRender()再次执行到resolveAsyncComponent
	 */
	const reject = once(reason => {
		process.env.NODE_ENV !== 'production' && warn(
			`Failed to resolve async component: ${String(factory)}` +
			(reaon ? `\nReason: ${reason}`: '')
		)
		if (isDef(factory.errorComp)) {
			factory.error = true
			forceRender()
		}
	})
	
	// 返回factory.errorComp 直接渲染error组件  异步组件加载成功
	if(isTrue(factory.error) && isDef(factory.errorComp)) {
		return factory.errorComp
	}
	
	/**
	 * 异步组件加载成功，会执行resolve函数
	 * 		首先把加载结果缓存到factory.resolved中，这个时候因为sync已经成为false，
	 * 		则执行forceRender()再次执行到resolveAsyncComponent:
	 */
	const resolve = once((res: Object | Class<Component>) => {
		factory.resolved = ensureCtor(res, baseCtor)
		if (!sync) {
			forceRender()
		}
	})
	
	/**
	 * 直接返回factory.resolved，渲染成功加载的组件
	 */
	if (isDef(factory.resolved)) {
		return factory.resolved
	}
	
	/**
	 * 异步组件加载中
	 * 	如果异步组件加载中并未返回，这时候会走到这个逻辑：
	 * 	那么则会返回factory.loadingComp，渲染loading组件
	 */
	if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
		return factory.loadingComp
	}
	
	/**
	 * 异步组件加载超时
	 * 	如果超时，则走到了reject逻辑，之后逻辑和加载失败一样,渲染error组件
	 */
	
	/**
	 * 异步组件patch
	 * 		如果是第一次执行resolveAsyncComponent,除非使用高级异步组件 0 delay去创建了一个loading
	 * 		组件，否则返回是undefined，接着通过createAsyncPlaceholder创建一个注释节点作为占位符。
	 */
	Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context) {
		if (Ctor === undefined) {
			return createAsyncPlaceholder(
				asyncFactory,
				data,
				context,
				children,
				tag
			)
		}
	}
	
	/**
	 * createAsyncPlaceholder
	 * 	src/core/vdom/helpers/resolve-async-components.js
	 * 
	 * 		实际上就是创建了一个占位的注释VNode，同时把asyncFactory和asyncMeta赋值给当前vnode
	 * 
	 * 		当执行forceRender的时候，会触发组件的重新渲染，那么会再一次执行resolveAsyncComponent,这时候就会根据
	 * 		不同的情况，可能返回loading、error或成功加载的异步组件，返回值不为undefined，因此就走正常的组件render、
	 * 		patch过程，与组件第一次渲染流程不一样，这个时候是存在新旧vnode的
	 */
	export function createAsyncPlaceholder (
		factory: Function,
		data: ?VNodeData,
		context: Component,
		children: ?Array<VNode>,
		tag: ?string
	): VNode {
		const node = createEmptyVNode()
		node.asyncFactory = factory
		node.asyncMeta = { data, context, children, tag}
		return node 
	}
	
	/**
	 *	总结：
	 * 		vue的三种异步组件的实现方式，高级异步组件的实现是非常巧妙的，它实现了loading、resolve、reject、timeout
	 * 		4种状态。异步组件实现的本质是2次渲染，除了0 delay的高级异步组件第一次直接渲染成loading组件外，其它都是第一次
	 * 		渲染生成一个注释节点，当异步获取组件成功后，再通过forceRender强制重新渲染，这样就能正确渲染出我们异步加载的组件了。
	 */
	
	/**
	 * 深入响应式原理：
	 * 	Vue的数据驱动除了数据渲染DOM之外，还有一个很重要的体现就是数据的变更会触发DOM的变化。
	 *  
	 * 	响应式对象
	 * 		Vue.js实现响应式的核心式利用了ES5的Object.defineProperty
	 * 		这也是为什么Vue.js不能兼容IE8及以下浏览器的原因。
	 */
	
	/**
	 * Object.defineProperty方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回这个对象。
	 * 		obj是要在其上定义属性的对象；
	 * 		prop是要定义或修改的属性的名称；
	 * 		descriptor是将被定义或修改的属性描述符；
	 * 
	 * 		比较核心的是descriptor
	 * 		get和set,get是一个给属性提供的getter方法，当我们访问了该属性的时候会触发getter；
	 * 		set是一个给属性提供的setter方法，我们对该属性做修改的时候会触发setter方法
	 * 		一旦对象拥有了getter和setter，我们可以简单地把这个对象称为响应式对象。
	 */
	Object.defineProperty(obj, prop, descriptor);
	
	/**
	 * initState
	 * 在Vue的初始化阶段，_init方法执行的时候，会执行initState(vm)方法
	 * 		src/core/instance/state.js
	 * 
	 * 		initState方法主要是对props、methods、data、computed和watcher等属性做了初始化操作。
	 */
	export function initState(vm: Component) {
		vm._watchers = [];
		const opts = vm.$options
		if (opts.props) initProps(vm, opts.props)
		if (opts.methods) initMethods(vm, opts.methods)
		if (opts.data) {
			initData(vm)
		} else {
			observe(vm._data = {}, true /* asRootData */)
		}
		if (opts.computed) initComputed(vm, opts.computed)
		if (opts.watch && opts.watch !== nativeWatch) {
			initWatch(vm, opts.watch)
		}
	}
	
	/**
	 * initProps
	 * 		props的初始化主要过程，就是遍历定义的props配置。遍历的过程主要做俩件事情：一个是调用defineReactive方法把每个props对应的值
	 * 		变成响应式，可以通过vm._props.xxx访问到定义props中对应的属性，对于defineReactive方法；
	 * 		另一个是通过proxy把vm._props.xxx的访问代理到vm.xxx上
	 */
	function initProps(vm: Component, propsOptions: Object) {
		const propsData = vm.$options.propsData || {}
		const props = vm._props = {}
		// cache prop keys so that future props updates can iterate using Array
		// instead of dynamic object key enumeration.
		const keys = vm.$options._propKeys = []
		const isRoot = !vm.$parent
		// root instance props should be converted
		if (!isRoot) {
			toggleObserving(false)
		}
		for (const key in propsOptions) {
			keys.push(key)
			const value = validateProp(key, propsOptions, propsData, vm)
			/* istanbul ignore else */
			if (process.env.NODE_ENV !== 'production') {
				const hyphenatedKey = hyphenate(key)
				if (isReservedAttribute(hyphenatedKey) ||
					config.isReservedAttr(hyphenatedKey)) {
					warn(
						`"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
						vm
					)	
				}
				defineReactive(props, key, value, () => {
					if (vm.$parent && !isUpdatingChildComponent) {
						warn(
							 `Avoid mutating a prop directly since the value will be ` +
							            `overwritten whenever the parent component re-renders. ` +
							            `Instead, use a data or computed property based on the prop's ` +
							            `value. Prop being mutated: "${key}"`,
							            vm
						)
					} else {
						defineReactive(props, key, value)
					}
					// static props are already proxied on the component's prototype
					// during Vue.extend(). We only need to proxy props defined at
					// instantiation here.
					if (!(key in vm)) {
						proxy(vm, `_props`, key)
					}
				}
				
				)
			}
		}
		toggleObserving(true)
	}
	
	/**
	 * initData
	 * 		data的初始化主要过程也是做俩件事，一个是对定义data函数返回对象的遍历，
	 * 		通过observe方法观测整个data的变化，把data也变成响应式，可以通过vm._data.xxx
	 * 		访问到定义data返回函数中对应的属性
	 */
	function initData (vm: Component) {
		let data = vm.$options.data
		data = vm._data = typeof data === 'funciton'
			? getData(data, vm)
			: data || {}
		if (!isPlainObject(data)) {
			data = {}
			process.env.NODE_ENV !== 'production' && warn(
			'data functions should return an object:\n' +
			      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
			      vm
			)
		}
		// proxy data on instance
		const keys = Object.keys(data)
		const props = vm.$options.props
		const methods = vm.$options.methods
		let i = keys.length
		while(i--) {
			const key = keys[i]
			if (process.env.NODE_ENV !== 'production') {
				if (methods && hasOwn(methods, key)) {
					warn(
					          `Method "${key}" has already been defined as a data property.`,
					          vm
					        )
				}
			}
			if (props && hasOwn(props, key)) {
				 process.env.NODE_ENV !== 'production' && warn(
				        `The data property "${key}" is already declared as a prop. ` +
				        `Use prop default value instead.`,
				        vm
				      )
			} else if (!isReserved(key)) {
				proxy(vm, `_data`, key)
			}
		}
		// observe data
		observe(data, true /* asRootData */)
	}
	
	/**
	 * proxy 代理
	 * 		代理的作用是把props和data上的属性代理到vm实例上，这也就是为什么比如我们定义了如下props，却可以通过vm实例
	 * 		访问到它。
	 * 
	 * 		proxy的实现，通过Object.defineProperty把target[sourceKey][key]的读写变成了对target[key]的读写。
	 * 		所以对于props而言，对vm._props.xxx的读写变成了vm.xxx的读写，而对于vm._props.xxx我们可以访问到定义在
	 * 		props中的属性，所以我们就可以通过vm.xxx访问到定义在props中的xxx属性了。同理，对于data而言，对vm._data.xxxx
	 * 		的读写变成了对vm.xxxx的读写，而对于vm._data.xxxx我们可以访问到定义在data函数返回对象中的属性，所以我们就可以
	 * 		通过vm.xxxx访问到定义在data函数返回对象中的xxxx属性
	 */
	let comP = {
		props: {
			msg: 'hello'
		},
		methods: {
			say() {
				console.log(this.msg)
			}
		}
	}
	
	 const sharedPropertyDefinition = {
		 enumerable: true,
		 configurable: true,
		 get: noop,
		 set: noop
	 }
	 
	 export function proxy(target: Object, sourceKey: string, key: string) {
		 sharedPropertyDefinition.get = function proxyGetter() {
			 return this[sourceKey][key]
		 }
		 sharedPropertyDefinition.set = function proxySetter (val) {
			 this[sourceKey][key] = val
		 }
		 Object.defineProperty(target, key, sharedPropertyDefinition)
	 }
	 
	 /**
	  * observe
	  * 	observe的功能就是用来监测数据的变化
	  * 	src/core/observer/index.js
	  */
	 
	 /**
	  * Attempt to create an observer instance for a value,
	  * returns the new observer if successfully observed,
	  * or the existing observer if the value already has one.
	  * 
	  * observe方法的作用就是给非VNode的对象类型数据添加一个Observer,如果已经添加过则直接返回，
	  * 否则在满足一定条件下去实例化一个Observer对象实例
	  */
	 export function observe (value: any, asRootData: ?boolean): Observer | void {
		 if (!isObject(value) || value instanceof VNode) {
			 return
		 }
		 let ob: Observer | void
		 if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
			 ob = value.__ob__
		 } else if (
			shouldObserve &&
			!isServerRendering() &&
			(Array.isArray(value) || isPlainObject(value) &&
			Object.isExtensible(value) &&
			!value._isVue
			) {
				ob = new Observer(value)
			}
			if (asRootData && ob) {
				ob.vmCount++
			}
		 return ob
	 }
	 
	 /**
	  * Observer
	  * Observer是一个类，它的作用是将给对象的属性添加getter和setter，用于依赖收集和派发更新：
	  * 
	  * Observer class that is attached to each observed
	  * object. Once attached, the observer converts the target
	  * object's property keys into getter/setters that
	  * collect dependencies and dispatch updates.
	  * 
	  * Observer的构造函数，首先实例化Dep对象，接着通过执行def函数把自身实例添加到数据对象value的__ob__属性上
	  * 	src/core/util/lang.js
	  */
	 
	 export class Observer {
		 value: any;
		 dep: Dep;
		 vmCount: number; // number of vms that has this object as root $data
		 
		 constructor (value: any){
			 this.value = value
			 this.dep = new Dep()
			 this.vmCount = 0
			 def(value, '__ob__', this)
			 // 对于数组会调用observeArray方法
			 if (Array.isArray(value)) {
				 const augment = hasProto
				 ? protoAugment
				 : copyAugment,
				 augment(value, arrayMethods, arrayKeys)
				 this.observeArray(value)
			 } else {
				 this.walk(value)
			 }
		 }
		 
		 /**
		  * Walk through each property and convert them into
		  * getter/setters. This method should only be called when
		  * value type is Object.
		  */
		 walk(obj: Object){
			 const keys = Object.keys(obj)
			 for (let i = 0; i < keys.length; i++){
				 defineReactive(obj, keys[i])
			 }
		 }
		 
		 /**
		  * Observe a list Array items.
		  */
		 observeArray (items: Array<any>) {
			 for (let i = 0, l = items.length; i < l; i++) {
				 observe(items[i])
			 }
		 }
	 }
	 
	 /**
	  * def
	  * Define a property
	  * def函数是一个非常简单的Object.defineProperty的封装
	  */
	 export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
		 Object.defineProperty(obj, key, {
			 value: val,
			 enumerable: !!enumerable,
			 writable: true,
			 configurable: true
		 })
	 }
	 
	 /**
	  * defineReactive
	  * defineReactive的功能就是定义一个响应式对象，给对象动态添加getter和setter
	  * 	src/core/observer/index.js
	  * 
	  * defineReactive函数最开始初始化Dep对象的实例，接着拿到obj的属性描述符，然后对子对象递归
	  * 调用observe方法，这样就保证了无论obj的结构多复杂，它的所有子属性也能变成响应式的对象，这样
	  * 我们访问或修改obj中一个嵌套较深的属性，也能触发getter和setter。最后利用Object.defineProperty
	  * 去给obj的属性key添加getter和setter。
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
		 const getter = property && property.get
		 const setter = property && property.set
		 if ((!getter || setter) && arguments.length === 2) {
			 val = obj[key]
		 }
		 
		 let childOb = !shallow && observe(val)
		 Object.defineProperty(obj, key, {
			 enumerable: true,
			 configurable: true,
			 get: function reactiveGetter() {
				 const value = getter ? getter.call(obj) : val,
				 if (Dep.target) {
					 dep.depend()
					 if (childOb) {
						 childOb.dep.depend()
						 if (Array.isArray(value)) {
							 dependArray(value)
						 }
					 }
				 }
				 return value
			 },
			 set: function reactiveSetter (newVal) {
				 const value = getter ? getter.call(obj) : val,
				 /* eslint-disable no-self-compare */
				 if (newVal === value || (newVal !== newVal && value !== value)) {
					 return
				 }
				 /* eslint-enable no-self-compare */
				 if (process.env.NODE_ENV !== 'production' && customSetter) {
					 customSetter()
				 }
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
	 
	 /**
	  * 总结：
	  * 响应式对象核心就是利用Object.defineProperty给数据添加了getter和setter，目的就是为了在我们访问数据以及写数据的时候
	  * 能自动执行一些逻辑：getter做的事情是依赖收集，setter做的事情是派发更新。
	  */
	 
	 /**
	  * 依赖收集
	  * 	Vue会把普通对象变成响应式对象，响应式对象getter相关的逻辑就是做依赖收集
	  */
	 export function defineReactive(
		obj: Object,
		key: string,
		val: any,
		customSetter?: ?Function,
		shallow?: boolean
	 ) {
		 // 实例化一个Dep的实例
		 const dep = new Dep()
		 
		 const property = Object.getOwnPropertyDescriptor(obj, key)
		 if (property && property.configurable === false) {
			 return
		 }
		 
		 // cater for pre-defined getter/setters
		 const getter = property && property.get
		 const setter = property && property.set
		 if((!getter || setter) && arguments.length === 2) {
			 val = obj[key]
		 }
		 
		 let childOb = !shallow && observe(val)
		 Object.defineProperty(obj, key, {
			 enumerable: true,
			 configurable: true,
			 get: function reactiveGetter() {
				 const value = getter ? getter.call(obj) : val,
				 if (Dep.target) {
					 //dep做依赖收集
					 dep.depend()
					 if (childOb) {
						 childOb.dep.depend()
						 if (Array.isArray(value)) {
							 dependArray(value)
						 }
					 }
				 }
				 return value
			 },
			 // ...
		 })
	 }
###     Dep是整个getter依赖收集的核心
源码：src/core/observe/dep.js
```JavaScript
	 import type Watcher from './watcher'
	 import { remove } from '../util/index'
	 
	 let uid = 0
	 
	 /**
	  * A dep is an observable that can have multiple
	  * directives subscribing to it.
	  * 
	  * Dep是一个Class，它定义了一些属性和方法，它有一个静态属性target,这是一个全局唯一Watcher,
	  * 因为同一时间只能有一个全局的Watcher被计算，另外它的自身属性subs也是Watcher的数组。
	  */
	 export default class Dep {
		 static target: ?Watcher;
		 id: number;
		 subs: Array<Watcher>;
		 
		 constructor() {
			 this.id = uid++
			 this.subs = []
		 }
		 
		 addSub (sub: Watcher) {
			 this.subs.push(sub)
		 }
		 
		 removeSub(sub: Watcher) {
			 remove(this.subs, sub)
		 }
		 
		 depend () {
			 if (Dep.target) {
				 Dep.target.addDep(this)
			 }
		 }
		 
		 notify () {
			 // stabilize the subscriber list first
			 const subs = this.subs.slice()
			 for (let i = 0, l = subs.length; i < l; i++){
				 subs[i].update()
			 }
		 }
	 }
	 
	 // the current target watcher being evaluated.
	 // this is globally unique because there could be only one
	 // watcher being evaluated at any time.
	 Dep.target = null
	 const targetStack = []
	 
	 export function pushTarget (_target: ?Watcher) {
		 if (Dep.target) targetStack.push(Dep.target)
		 Dep.target = target
	 }
	 
	 export function popTarget () {
		 Dep.target = targetStack.pop()
	 }
```
###     Dep实际上就是对Watcher的一种管理，Dep脱离Watcher单独存在是没有意义的
源码：src/core/observer/watcher.js
```JavaScript
	 let uid = 0
	 
	 /**
	  * A watcher parses an expression, collects dependencies,
	  * and fires callback when the expression value changes.
	  * This is used for both the $watch() api and directives.
	  * 
	  * Watcher是一个Class,在它的构造函数中，定义了一些和Dep相关的属性
	  */
	 export default class Watcher {
		 vm: Component;
		 expression: string;
		 cb: Function;
		 id: number;
		 deep: boolean;
		 user: boolean;
		 computed: boolean;
		 sync: boolean;
		 dirty: boolean;
		 active: boolean;
		 dep: Dep;
		 deps: Array<Dep>;
		 newDeps: Array<Dep>;
		 depIds: SimpleSet;
		 newDepIds: SimpleSet;
		 before: ?Function;
		 getter: Function;
		 value: any;
		 
		 constructor (
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
			 vm._watchers.push(this)
			 // options
			 if (options) {
				 this.deep = !!options.deep
				 this.user = !!options.user
				 this.computed = !!options.computed
				 this.sync = !!options.sync
				 this.before = options.before
			 } else {
				 this.deep = this.user = this.computed = this.sync = this
			 }
			 this.cb = cb
			 this.id = ++uid // uid for batching 
			 this.active = true
			 this.dirty = this.computed // for computed watcher
			 //表示Watcher实例持有的Dep实例的数组
			 this.deps = []
			 this.newDeps = []
			 //this.deps的id
			 this.depIds = new Set()
			 // this.newDeps的id
			 this.newDepIds = new Set()
			 this.expression = process.env.NODE_ENV !== 'production'
				? expOrFn.toString()
				: '',
			// parse expression for getter
			if (typeof expOrFn === 'function') {
				this.getter = expOrFn
			} else {
				this.getter = parsePatch(expOrFn)
				if (!this.getter) {
					this.getter =  function () {}
					process.env.NODE_ENV !== 'production' && warn(
						`Failed watching path: "${expOrFn}" ` +
						'Watcher only accpets simple dot-delimited paths. ' +
						'For full control, use a function instead.',
						vm
					)
				}__
			}
			if (this.computed) {
				this.value = undefined
				this.dep = new Dep()
			} else {
				this.value = this.get()
			}
		 }
		 
		 /**
		  * Evaluate the getter, and re-collect dependencies.
		  */
		 get () {
			 pushTarget(this)
			 let value
			 const vm = this.vm
			 try {
				 // getter对应就是updateComponent函数
				 // 实际上就是在执行vm._update(vm._render(), hydrating)
				 // 它会先执行vm._render()方法，
				 // 每个对象值的getter都持有一个dep,在触发getter的时候会调用dep.depend()方法
				 // 也就会执行Dep.target.addDep(this)
				 value = this.getter.call(vm, vm)
			 } catch (e) {
				 if (this.user) {
					 handlerError(e, vm, `getter for watcher "$
					 {this.expression}"`)
				 } else {
					 throw e
				 }
			 } finally {
				 // "touch" every property so they are all tracked as
				 // dependencies for deep watching
				 //vm._render()过程中，会触发所有数据的getter，这样实际上已经完成来一个依赖
				 //收集的过程。
				 //递归访问value,触发它所有子项的getter
				 if (this.deep) {
					 traverse(value)
				 }
				 popTarget()
				 // src/core/observer/dep.js
				 //Dep.target = targetStack.pop();
				 this.cleanupDeps()
			 }
			 return value
		 }
		 
		 /**
		  * Add a dependency to this directive.
		  * 
		  * 执行this.subs.push(sub) 也就是说把当前的watcher订阅到这个数据持有的dep的subs中，
		  * 这个目的是为后续数据变化时候能通知到哪些subs做准备
		  */
		 addDep (dep: Dep) {
			 const id = dep.id
			 if (!this.newDepIds.has(id)) {
				 this.newDepIds.add(id)
				 this.newDeps.push(dep)
				 if (!this.depIds.has(id)) {
					 dep.addSub(this)
				 }
			 }
		 }
		 
		 /**
		  * Clean up for dependency collection.
		  * 
		  * Vue是数据驱动的，所以每次数据变化都会重新render，那么vm._render()方法又会再次执行，并再次触发数据
		  * 的getters，所以Watcher在构造函数中会初始化2个Dep实例数组，newDeps表示新添加的Dep实例数组，而deps
		  * 表示上一次添加的Dep实例数组。
		  */
		 cleanupDeps () {
			 let i = this.deps.length
			 while (i--) {
				 const dep = this.deps[i]
				 if (!this.newDepIds.has(dep.id)) {
					 dep.removeSub(this)
				 }
			 }
			 let tmp = this.depIds
			 this.depIds = this.newDepIds
			 this.newDepIds = tmp
			 this.newDepIds.clear()
			 tmp = this.deps
			 this.deps = this.newDeps
			 this.newDeps = tmp
			 this.newDeps.length = 0
		 }
		 // ...
	 }
```
	 /**
	  * 过程分析
	  * 	当我们去实例化一个渲染watcher的时候，首先进入watcher的构造函数逻辑，然后会执行它的this.get()方法，
	  * 	进入get函数，首先会执行
	  * 	pushTarget(this)
	  * 		src/core/observer/dep.js
	  * 
	  * 	把Dep.target赋值为当前的渲染watcher并压栈
	  */
	 export function pushTarget (_target: Watcher) {
		 if (Dep.target) targetStack.push(Dep.target)
		 Dep.target = _target
	 }
	 
	 /**
	  * 收集依赖的目的是为来当这些响应式数据发生变化，触发它们的setter的时候，能知道应该通知哪些订阅者去做相应的逻辑处理，
	  * 我们把这个过程叫派发更新，其实Watcher和Dep就是一个非常经典的观察者设计模式实现
	  */
	 
	 
	 /**
	  * 派发更新
	  * 	响应式数据依赖收集的目的就是为了当我们修改数据的时候，可以对相关的依赖派发更新
	  * 
	  * 	当我们在组件中对响应的数据做了修改，就会触发setter的逻辑，最后调用dep.notify()方法
	  * 	src/core/observer/dep.js
	  */
	 class Dep {
		 // ...
		 notify () {
			 // stabilize the subscriber list first
			 const subs = this.subs.slice()
			 for (let i = 0, l = subs.length; i < l; i++) {
				 subs[i].update();
			 }
		 }
	 }
	 
	 /**
	  * update
	  * 	src/core/observer/watcher.js
	  */
	 class Watcher {
		 // ...
		 update () {
			 /* istanbul ignore else */
			 if (this.computed) {
				 // A computed property watcher has two modes: lazy and activated.
				 // It initializes as lazy by default, and only becomes activated when
				 // it is depended on by at least one subscriber, which is typically
				 // another computed property or a component's render function.
				 if (this.dep.subs.length === 0) {
					 // In lazy mode, we don't want to perform computations until necessary,
					 // so we simply mark the watcher as dirty. The actual computation is
					 // performed just-in-time in this.evaluate() when the computed property
					 // is accessed.
					 this.dirty = true
				 } else {
					 // In activated mode, we want to proactively perform the computation
					 // but only notify our subscribers when the value has indeed changed.
					 this.getAndInvoke(() => {
						 this.dep.notify()
					 })
				 }
			 } else if (this.sync) {
				 this.run()
			 } else {
				 queueWatcher(this)
			 }
		 }
	 }
	 
	 /**
	  * queueWatcher
	  * 	src/core/observer/scheduler.js
	  */
	 const queue: Array<Watcher> = []
	 let has: { [key: number]: ?true } = {}
	 let waiting = false
	 let flushing = false
	 /**
	  * Push a watcher into the watcher queue.
	  * Jobs with duplicate IDs will be skipped unless it's
	  * pushed when the queue is being flushed.
	  * 
	  * 引入了队列的概念，它不会每次数据改变都触发watcher的回调，而是把这些watcher先添加到一个队列里，
	  * 然后在nextTick后执行flushSchedulerQueue
	  */
	 export function queueWatcher (watcher: Watcher) {
		 const id = watcher.id
		 if (has[id] == null) {
			 has[id] = true
			 if (!flushing) {
				 queue.push(watcher)
			 } else {
				 // if already flushing, splice the watcher based on its id
				 // if already past its id, it will be run next immediately.
				 let i = queue.length - 1
				 while (i > index && queue[i].id > watcher.id) {
					 i--
				 }
				 queue.splice(i + 1, 0, watcher)
			 }
			 // queue the flush
			 if (!waiting) {
				 waiting = true
				 //异步的执行flushSchedulerQueue
				 nextTick(flushSchedulerQueue)
			 }
		 }
	 }
	 
	 /**
	  * flushSchedulerQueue
	  * 	src/core/observer/scheduler.js
	  */
	 let flushing = false
	 let index = 0
	 /**
	  * Flush both queues and run the watchers.
	  */
	 function flushSchedulerQueue() {
		 flushing = true
		 let watcher, id
		 
		 // Sort queue before flush.
		 // This ensures that:
		 // 1.Components are updated from parent to child.(because parent is always)
		 // created before the child
		 // 2. A component's user watchers are run before its render watcher(
		 // because user watchers are created before the render watcher)
		 // 3. If a component is destroyed during a parent component's watcher run,
		 // its watchers can be skipped.
		 // 1.组件的更新由父到子；因为父组件的创建过程是先于子的，所以watcher的创建也是先父后子，
		 // 执行顺序也应该保持先父后子。
		 // 2.用户的自定义watcher要优先于渲染watcher执行；因为用户自定义watcher是在渲染watcher之前创建的。
		 // 3.如果一个组件在父组件的watcher执行期间被销毁，那么它对应的watcher执行都可以被跳过，所以父组件的
		 // watcher应该先执行
		 queue.sort((a, b) => a.id - b.id)
		 
		 // do not cache length because more watchers might be pushed
		 // as we run existing watchers
		 for (index = 0; index < queue.length; index++) {
			 watcher = queue[index]
			 if (watcher.before) {
				 watcher.before()
			 }
			 id = watcher.id
			 has[id] = null
			 watcher.run()
			 // in dev build, check and stop circular updates.
			 if (process.env.NODE_ENV !== 'production' && has[id] != null) {
				 circular[id] = (circular[id] || 0) + 1
				 if (circular[id] > MAX_UPDATE_COUNT) {
					 warn(
						'You may have an infinite update loop ' + (
							watcher.user
							? `in watcher with expression "$
							{watcher.expression}"`
							: `in a component render function.`
						),
						watcher.vm
					 )
					 break
				 }
			 }
		 }
		 
		 // keep copies of post queues before resetting state
		 const activatedQueue = activatedChildren.slice()
		 const updatedQueue = queue.slice()
		 
		 resetSchedulerState()
		 
		 // call component updated and activated hooks
		 callActivatedHooks(activatedQueue)
		 callUpdatedHooks(updatedQueue)
		 
		 // devtool hook
		 /* instanbul ignore if */
		 if (devtools && config.devtools) {
			 devtools.emit('flush')
		 }
	 }
	 
	 /**
	  * resetSchedulerState
	  * 	src/core/observer/scheduler.js
	  * 	状态恢复
	  * 	就是把这些控制流程状态的一些变量恢复到初始值，把watcher队列清空
	  */
	 const queue: Array<Watcher> = []
	 let has: { [key: number]: ?true} = {}
	 let circular: { [key: number]: number } = {}
	 let waiting = false
	 let flushing = false
	 let index = 0
	 /**
	  * Reset the scheduler's state.
	  */
	 function resetSchedulerState () {
		 index = queue.length = activatedChildren.length = 0
		 has = {}
		 if (process.env.NODE_ENV !== 'production') {
			 circular = {}
		 }
		 waiting = flushing = false
	 }
	 
	 /**
	  * watcher.run()
	  * 	src/core/observer/watcher.js
	  * 
	  * 	run函数实际上就是执行this.getAndInvoke方法，并传入watcher的回调函数。
	  * 
	  */
	 class Watcher {
		 /**
		  * Scheduler job interface.
		  * Will be called by the scheduler.
		  */
		 run () {
			 if (this.active) {
				 this.getAndInvoke(this.cb)
			 }
		 }
		 
		 getAndInvoke (cb: Function) {
			 // 得到它当前的值
			 // 对于渲染watcher而言，它在执行this.get()方法求值的时候，会执行getter方法
			 // updateComponent = () => {
			 // 	vm._update(vm._render(), hydrating)	 
			 // }
			 const value = this.get()
			 // 满足新旧值不等，新值是对象类型、deep模式任何一个条件，则执行watcher的回调
			 if (
				value !== this.value ||
				// Deep watchers and watchers on Object/Arrays should fire even
				// when the value is the same, because the value may
				// have mutated.
				isObject(value) ||
				this.deep
			 ) {
				 // set new value
				 const oldValue = this.value
				 this.value = value
				 this.dirty = false
				 if (this.user) {
					 try {
						 cb.call(this.vm, value, oldValue)
					 } catch (e) {
						 handleError(e, this.vm, `callback for watcher "${this.expression}"`)
					 }
				 } else {
					 cb.call(this.vm, value, oldValue)
				 }
			 }
		 }
	 }
	 
	 /**
	  * 实际上当数据发生变化的时候，触发setter逻辑，把在依赖过程中订阅的所有观察者，也就是watcher，都触发它们的
	  * update过程，这个过程又利用了队列做了进一步优化，在nextTick后执行所有watcher的run，最后执行它们的回调函数。
	  */
	
	/**
	 * nextTick
	 * 		 nextTick是Vue的一个核心实现
	 * 
	 * JS运行机制
	 * 		JS执行是单线程的，它是基于事件循环的。
	 * 
	 * 事件循环
	 * 		1）所有同步任务都在主线程上执行，形成一个执行栈
	 * 		2）主线程之外，还存在一个“任务队列”。只要异步任务有了运行结果，就在“任务队列”之中放置一个事件。
	 * 		3）一旦“执行栈”中的所有同步任务执行完毕，系统就会读取“任务队列”，看看里面有哪些事件。那些对应的异步任务，
	 * 		于是结束等待状态，进入执行栈，开始执行。
	 * 		4）主线程不断重复上面的第三步。
	 */
	
	/**
	 * nextTick
	 * 		src/core/util/next-tick.js
	 */
	import { noop } from 'shared/util'
	import { handleError } from './error'
	import { isIOS, isNative } from './env'
	
	const callbacks = []
	let pending = false
	
	function flushCallbacks () {
		pending = false
		const copies = callbacks.slice(0)
		callbacks.length = 0
		for (let i = 0; i < copies.length; i++) {
			copies[i]()
		}
	}
	
	// Herea we have async deferring wrappers using both microtasks and (macro) tasks
	// In < 2.4 we used microtasks everywhere, but there are some scenarios where
	// microtasks have too hight a priority and fire in between supposedly
	// sequential events (e.g. #4521, #6690) or even between bubbling of the same
	// event (#6566). However, using (macro) tasks everywhere also has subtle problems
	// when state is changed right before repaint (e.g. #6813, out-in transitions).
	// Here we use microtask by default,but expose a way to force (macro) task when
	// needed (e.g. in evnet handlers attached by v-on).
	// 分别对应的micro task的函数和macro task 的函数
	let microTimerFunc
	let macroTimerFunc
	let useMacroTask = false
	
	// Determine (macro) task defer implementation.
	// Technically setImmediate should be the ideal choice, but it's only available
	// in IE. The only polyfill that consistently queues the callback after all DOM
	// events triggered in the same loop is by using MessageChannel.
	/* istanbul ignore if */
	/**
	 * 先监测是否支持原生setImmediate
	 * 再检查是否支持原生MessageChannel
	 * 否则setTimeout
	 */
	if (typeof setImmediate !== 'undefined' && 
	isNative(setImmediate)) {
		macroTimerFunc = () => {
			setImmediate(flushCallbacks)
		}
	} else if (typeof MessageChannel !== 'undefined' && (
		isNative(MessageChannel) ||
		// PhantomJS
		MessageChannel.toString() === '[object MessageChannelConstructor]'
	)) {
		const channel = new MessageChannel()
		const port = channel.port2
		channel.port1.onmessage = flushCallbacks
		macroTimerFunc = () => {
			port.postMessage(1)
		}
	} else {
		/* istanbul ignore next */
		macroTimerFunc = () => {
			setTimeout(flushCallbacks, 0)
		}
	}
	
	// Determine microtask defer implementation.
	/* istanbul ignore next, $flow-disable-line */
	if (typeof Promise !== 'undefined' && isNative(Promise)) {
		const p = Promise.resolve()
		microTimerFunc = () => {
			p.then(flushCallbacks)
			// in problematic UIWebViews, Promise.then doesn't completely break, but
			// it can get stuck in a weird state where callbacks are pushed into the
			// microtask queue but the queue isn't being flushed,until the browser
			// needs to do some other work, e.g. handle a timer. Therefore we can
			// "force" the microtask queue to be flushed by adding an empty timer.
			if (isIOS) setTimeout(noop)
		}
	} else {
		// fallback to macro
		microTimerFunc = macroTimerFunc
	}
	
	/**
	 * Wrap a function so that if any code inside triggers state change,
	 * the changes are queued using a (macro) task instead of a microtask.
	 * 
	 * 它是对函数做一层包装，确保函数执行过程中对数据任意的修改，触发变化执行nextTick的时候强制走
	 * macroTimerFunc。比如对于一些DOM交互事件，如v-on绑定的事件回调函数的处理，会强制走macro task。
	 */
	export function withMacroTask (fn: Function): Function{
		return fn._withTask || (fn._withTask = function () {
			useMacroTask = true
			const res = fn.apply(null, arguments)
			useMacroTask = false 
			return res
		})
	}
	
	/*
	*	把传入的回调函数cb俨如callbacks数组，再根据条件执行宏任务或者微任务
	* 在下一个tick执行flushCallbacks
	*/
	export function nextTick (cb?: Function, ctx?: Object) {
		let _resolve
		callbacks.push(() => {
			if (cb) {
				try {
					cb.call(ctx)
				} catch (e) {
					handleError(e, ctx, 'nextTick')
				}
			} else if (_resolve) {
				_resolve(ctx)
			}
		})
		if (!pending) {
			pending = true
			if (useMacroTask) {
				macroTimerFunc()
			} else {
				microTimerFunc()
			}
		}
		/**
		 * 当nextTick不传cb参数的时候，提供一个Promise化的调用
		 */
		// $flow-disable-line 
		if (!cb && typeof Promise !== 'undefined') {
			return new Promise(resolve => {
				_resolve = resolve
			})
		}
	}
	
	/**
	 * tick执行flushCallbacks
	 * 		这里使用callbacks而不是直接在nextTick中执行回调函数的原因是保证在同一个tick内多次执行
	 * nextTick，不会开启多个异步任务，而把这些异步任务都压成一个同步任务，在下一个tick执行完毕。
	 */
	
	/**
	 * 如果我们的某些方法依赖类数据修改后的DOM变化，我们就必须在nextTick后执行
	 * 
	 * Vue.js 提供类2种调用nextTick的方式。
	 * 一种是全局API Vue.nextTick 一种是实例上的方法vm.$nextTick
	 */
	getData(res).then(() => {
		this.xxx = res.data
		this.$nextTick(() => {
			
		})
	})
	
## 检测变化的注意事项
###	对象添加属性
对于使用Object.defineProperty实现响应式的对象，当我们去给这个对象添加一个新的属性的时候，是不能够
触发它的setter的
Vue为了解决这个问题，定义了一个全局的Vue.set方法，
  src/core/global-api.index.js
  Vue.set = set
  
  src/core/observer/index.js

```JavaScript
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
// set方法接收3个参数，target可能是数组或者普通对象，key代表数组的下标或者对象的键值，val代表添加的值
export function set (target: Array<any> | Object, key: any, val: any): any {
	if (process.env.NODE_ENV !== 'production' &&
	(isUndef(target) || isPrimitive(target))) {
		warn(`Cannot set reactive property on undefined, null, or primitive value: ${{target: any}}`)
	}
	// 首先判断如果target是数组且key是一个合法的下标，则通过splice去添加数组然后返回
	if (Array.isArray(target) && isValidArraryIndex(key)) {
		target.length = Math.max(target.length, key)
		target.splice(key, 1, val)
		return val
	}
	// 判断key已经存在于target中，则直接复制返回
	if (key in target && !(key in Object.prototype)) {
		target[key] = val
		return val
	}
	// 获取target.__ob__并赋值给ob.
	const ob = (target: any).__ob__
	if (target._isVue || (ob && ob.vmCount)) {
		process.env.NODE_ENV !== 'production' && warn(
			'Avoid adding reactive properties to a Vue instance or its root $data'+
			'at runtime - declare it upfront in the data option.'
		)
		return val
	}
	// 如果它不存在，则说明target不是一个响应式的对象，则直接赋值并返回。
	if (!ob) {
		target[key] = val
		return val
	}
	// 最后通过defineReactive(ob.value, key, val)把新添加的属性变成响应式对象，
	defineReactive(ob.value, key, val)
	// 然后再通过ob.dep.notify()手动的触发依赖通知
	ob.dep.notify()
	return val
}
```

## 数组
Vue也是不能检测到以下变动的数组：
1.当你利用索引直接设置一个项时，例如：vm.items[indexOfItem] = newValue
2.当你修改数组的长度时，例如：vm.items.length = newLength

Observer
src/core/observer/index.js
```JavaScript
export class Observer {
	constructor (value: any) {
		this.value = value
		this.dep = new Dep()
		this.vmCount = 0
		def(value, '__ob__', this)
		if (Array.isArray(value)) {
			// hasProto实际上就是判断对象中是否存在__proto__
			// 如果存在augment指向protoAugment
			// 否则指向copyAugment
			const augment = hasProto
			? protoAugment
			: copyAugment
			augment(value, arrayMethods, arrayKeys)
			this.observeArray(value)
		} else {
			// ...
		}
	}
}

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 * protoAugment 方法是直接把target.__proto__原型直接修改为src
 */
function protoAugment (target, src: Object, keys: any) {
	/* eslint-disable no-proto */
	target.__proto__ = src
	/* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 * copyAugment 方法是遍历keys，通过def,也就是Object.defineProperty去定义它自身的属性值。
 * 它实际上就把value的原型指向了arrayMethods
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
	for (let i = 0, l = keys.length; i < l; i++) {
		const key = keys[i]
		def(target, key, src[key])
	}
}
```
arrayMethods
	src/core/observer/array.js
```JavaScript
import { def } from '../util/index'
const arrayProto = Array.prototype
// 首先继承了array
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
	'push',
	'pop',
	'shift',
	'unshift',
	'splice',
	'sort',
	'reverse'
]

/**
 * Intercept mutating methods and emit events
 * push、pop重写
 */
methodsToPatch.forEach(function (method)) {
	// cache original method
	const original = arrayProto[method]
	def(arrayMethods, method, function mutator (...args) {
		const result = original.apply(this, args)
		const ob = this.__ob__
		let inserted
		switch (method) {
			case 'push':
			case 'unshift':
				inserted = args
				break
			case 'splice':
				inserted = args.slice(2)
				break
		}
		// 把新添加的值变成了一个响应式对象。
		if (inserted) ob.observeArray(inserted)
		// notify change
		// 手动触发依赖通知
		ob.dep.notify()
		return result
	})
}
```

### 计算属性 VS 侦听属性
Vue的组件对象支持了计算属性computed和侦听属性watch
computed
计算属性的初始化是发生在实例初始化阶段的initState函数中
执行if(opts.computed) initComputed(vm, opts.computed)
	src/core/instance/state.js
```JavaScript
const computedWatcherOptions = { computed: true }
function initComputed (vm: Component, computed: Object) {
	// $flow-disable-line
	//首先创建vm._computedWatchers为一个空对象
	const watchers = vm._computedWatchers = Object.create(null)
	// computed properties are just getters during SSR
	const isSSO = isServerRendering()
	//对computed对象做遍历，拿到计算属性的每一个userDef，然后尝试获取这个userDef对应的getter函数
	for (const key in computed) {
		const userDef = computed[key]
		const getter = typeof userDef === 'function' ? userDef : userDef.get
		if (process.env.NODE_ENV !== 'production' && getter == null) {
			warn(
				`Getter is missing for computed property "${key}".`,
				vm
			)
		}
		//接下来为每一个getter创建一个watcher，这个watcher和渲染watcher有一点很大的不同，
		// 它是一个computed watcher
		if (!isSSR) {
			// create internal watcher for the computed property.
			watchers[key] = new Watcher(
				vm,
				getter || noop,
				noop,
				computedWatcherOptions
			)
		}
		
		// component-defined computed properties are already defined on the
		// component prototype.We only need to define computed properties defined
		// at instantiation here.
		// 如果key不是vm的属性，则调用defineComputed(vm, key, userDef)
		if (!(key in vm)) {
			defineComputed(vm, key, userDef)
		} else if (process.env.NODE_ENV !== 'production') {
			if (key in vm.$data) {
				warn(`The computed property "${key}" is already defined in data.`, vm)
			} else if (vm.$options.props && key in vm.$options.props) {
				warn(`The computed property "${key}" is already defined as a prop.`, vm)
			}
		}
	}
}

// 利用Object.defineProperty给计算属性对应的key值添加getter和setter，setter通常是计算属性是一个对象，并且拥有
// set方法的时候才有，否则是一个空函数
export function defineComputed (
	target: any,
	key: string,
	userDef: Object | Function
){
	const shouldCache = !isServerRendering()
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
			sharedPropertyDefinition.set = function () {
				warn(
					`Computed property "${key}" was assigned to but it has no setter.`,
					this
				)
			}
		}
		Object.defineProperty(target, key, sharedPropertyDefinition)
}

//createComputedGetter返回一个函数computedGetter，它就是计算属性对应的getter。
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
```JavaScript
//通过一个例子来分析 computed watcher的实现
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

//当初始化computed watcher实例的时候，构造函数部分逻辑稍有不同：
//可以发现computed watcher会并不会立刻求值，同时持有一个dep实例。
//当render函数执行访问到this.fullName的时候，就触发来计算属性的getter，
constructor(
	vm: Component,
	expOrFn: string | Function,
	cb: Function,
	options?: ?Object,
	isRenderWatcher?: boolean
) {
	// ...
	if (this.computed) {
		this.value = undefined
		this.dep = new Dep()
	} else {
		this.value = this.get()
	}
}

//watcher.depend()
/**
 * Depend on this watcher. Only for computed property watchers.
 */
depend () {
	// Dep.target是渲染watcher
	if (this.dep && Dep.target) {
		//this.dep.depend()相当于渲染watcher订阅了computed watcher
		this.dep.depend()
	}
}

//执行watcher.evaluate()求值
/**
 * Evalutate and return the value of the watcher.
 * This only gets called for computed property watchers.
 */
evaluate() {
	// 如果为true则通过this.get()求值，然后把this.dirty设置为false。
	// 在求值过程中，会执行value = this.getter.call(vm, vm)，这实际上就是执行了计算属性定义的getter函数
	if (this.dirty) {
		this.value = this.get()
		this.dirty = false
	}
	return this.value
}

//一旦我们对计算属性依赖的数据做修改，则会触发setter过程，通知所有订阅它变化的watcher更新，执行watcher.update()方法
/* istanbul ignore else */

if (this.computed) {
	// A computed property watcher has two modes: lazy and activated.
	// It initializes as lazy by default, and only becomes activated when
	// it is depended on by at least one subscriber, which is typically
	// another computed property or a component's render function.
	// 对于计算属性这样的computed watcher，它实际上是有2中模式，lazy和active。
	// 如果this.dep.subs.length === 0 成立，则说明没有人去订阅这个computed watcher的变化，仅仅把
	// this.dirty = true，只有当下次再访问这个计算属性的时候才会重新求值。
	if (this.dep.subs.length === 0) {
		// In lazy mode, we don't want to perform computations untill necessary
		// so we simply mark the watcher as dirty.The actual computation is
		// performed just-in-time in this.evaluate() when the computed property
		// is accessed.
		this.dirty = true
	} else {
		// In activated mode, we want to proactively perform the computation
		// but only notify our subscibers when the value has indeed changed.
		// 在我们的场景下，渲染watcher订阅了这个computed watcher的变化
		this.getAndInvoke(() => {
			this.dep.notify()
		})
	} else if (this.sync) {
		this.run()
	} else {
		queueWatcher(this)
	}
}

//getAndInvoke函数会重新计算，然后对比新旧值，如果变化了则执行回调函数，那么这里这个回调函数是this.dep.notify()
//在我们这个场景下就是触发了渲染watcher重新渲染
getAndInvoke (cb: Function) {
	const value = this.get()
	if (
		value !== this.value ||
		// Deep watchers and watchers on Object/Arrays should fire even
		// when the value is the same, because the value may
		// have mutated.
		isObject(value) ||
		this.deep
	) {
		// set new value
		const oldValue = this.value
		this.value = value
		this.dirty = false
		if (this.user) {
			try {
				cb.call(this.vm, value, oldValue)
			} catch (e) {
				handleError(e, this.vm, `callback for watcher "${this.expression}"`)
			}
		} else {
			cb.call(this.vm, value, oldValue)
		}
	}
}
```

我们知道计算属性本质上就是一个computed watcher，之所以这么设计是因为Vue想确保不仅仅是计算属性依赖的值发生变化，
而是当计算属性最终计算的值发生变化才会触发渲染watcher重新渲染。

watch
侦听属性的初始化也是发生在Vue的实例初始化阶段的initState函数中，在computed初始化之后，执行了：
```JavaScript
if (opts.watch && opts.watch !== nativeWatch) {
	initWatch(vm, opts.watch)
}

//initWatch
// src/core/instance/state.js
// 这里就是对watch对象做遍历，拿到每一个handler，因为Vue是支持watch的同一个key对应多个handler,
// 如果handler是一个数组，则遍历这个数组，调用createWatcher方法
function initWatch (vm: Component, watch: Object) {
	for (const key in watch) {
		const handler = watch[key]
		if (Array.isArray(handler)) {
			for (let i = 0; i < handler.length; i++) {
				createWatcher(vm, key, handler[i])
			}
		} else {
			createWatcher(vm, key, handler)
		}
	}
}

function createWatcher (
	vm: Component,
	expOrFn: string | Function,
	handler: any,
	options?: Object,
) {
	// 首先对hanlder的类型做判断，拿到它最终的回调函数
	if (isPlainObject(handler)) {
		options = handler
		handler = handler.handler
	}
	if (typeof handler === 'string') {
		handler = vm[handler]
	}
	// 最后调用vm.$watch(keyOrFn, handler, options)函数
	// $watch是Vue原型上的方法，它是在执行stateMicin的时候定义的。
	return vm.$watch(expOrFn, handler, options)
}

// 侦听属性watch最终会调用$watch方法，这个方法首先判断cb如果是一个对象，则调用createWatcher方法
// 这是因为$watch方法是用户可以直接调用的，它可以传递一个对象，也可以传递函数。
Vue.prototype.$watch = function (
	expOrFn: string | Function,
	cb: any,
	options?: Object
): Function {
	const vm: Component = this
	if (isPlainObject(cb)) {
		return createWatcher(vm, expOrFn, cb, options)
	}
	options = options || {}
	options.user = true
	const watcher = new Watcher(vm, expOrFn, cb, options)
	if (options.immediate) {
		cb.call(vm, watcher.value)
	}
	return function unwatchFn() {
		watcher.teardown()
	}
}

//接着执行const watcher = new Watcher(vm, expOrFn, cb, options)实例化了一个watcher
// 这是一个 user watcher 因为options.user = true。通过实例化watcher的方式，一旦我们watch的数据发生变化，它最终
// 会执行watcher的run方法，执行回调函数cb，并且如果我们设置了immediate为true，则直接会执行回调函数cb。最后返回了一个unwatchFn方法，
// 它会调用teardown方法去移除这个watcher。
// 所以本质上侦听属性也是基于Watcher实现的，它是一个user watcher。
``` 

### Watcher options
watcher的构造函数对options做了处理
```JavaScirpt
if (options) {
	this.deep = !!options.deep
	this.user = !!options.user
	this.computed = !!options.computed
	this.sync = !!options.sync
	// ...
} else {
	this.deep = this.user = this.computed = this.sync = false
}

// deep watcher
// 通常，如果我们想对以下对象做深度观测的时候，需要设置这个属性为true
watch : {
	a : {
		deep: true,
		handler(newVal) {
			console.log(newVal)
		}
	}
}

//在watcher执行get求值的过程中有一段逻辑：
get() {
	let value = this.getter.call(vm, vm)
	// ...
	if (this.deep) {
		traverse(value)
	}
}

// 在对watch的表达式或者函数求值后，会调用traverse函数
// src/core/observer/traverse.js
import { _Set as Set, isObject } from '../util/index'
import type { SimpleSet } from '../util/index'
import VNode from '../vdom/vnode'

const seenObjects = new Set()

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 * 实际上就是对一个对象做深层递归遍历，因为遍历过程中就是对一个子对象的访问，会触发它们的getter过程，这样就可以收集到依赖
 * 也就是订阅它们变化的watcher，这个函数实现还有一个小的优化，遍历过程中会把子响应式对象通过它们的dep id记录到seenObjects
 * 避免以后重复访问。
 * 在执行了traverse后，我们再对watch的对象内部任何一个值做修改，也会调用watcher的回调函数了
 */
export function traverse(val: any) {
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
		while (i--) _traverse(val[i], seen)
	} else {
		keys = Object.keys(val)
		i = keys.length
		while (i--) _traverse(val[keys[i]], seen)
	}
}

function _traverse (val: any, seen: SimpleSet) {
	let i, keys
	const isA = Array.isArray(val)
	if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
		return
	}
	
}

// user watcher
// 在对watcher求值以及在执行回调函数的时候，处理一下错误
get() {
	if (this.user) {
		handleError(e, vm, `getter for watcher "${this.expression}"`)
	} else {
		throw e
	}
},
getAndInvoke() {
	// ...
	if (this.user) {
		try {
			this.cb.call(this.vm, value, oldValue)
		} catch (e) {
			handleError(e, this.vm, `callback for watcher "${this.expression}"`)
		}
	} else {
		this.cb.call(this.vm, value, oldValue)
	}
}
// handleError 在Vue中是一个错误捕获并且暴露给用户的一个利器

// computed watcher

// sync watcher
// 对setter的分析过程知道，当响应式数据发生变化后，触发了watcher.update()，只是把这个watcher推送到一个队列中，
// 在nextTick后才会真正执行watcher的回调函数。而一旦我们设置了sync，就可以在当前Tick中同步执行watcher的回调函数。

// 只有当我们需要watch的值的变化到执行watcher的回调函数是一个同步过程的时候才会去设置该属性为true。
update () {
	if (this.computed) {
		// ...
	} else if (this.sync) {
		this.run()
	} else {
		queueWatcher(this)
	}
}
```

计算属性本质上是computed watcher，而侦听属性本质上是user watcher。就应用场景而言，计算属性适合用在模版渲染中，某个值是
依赖了其它的响应式对象甚至是计算属性计算而来；而侦听属性适用于观测某个值的变化去完成一段复杂的业务逻辑。

## 组件更新
```JavaScript
updateComponent = () => {
	vm._update(vm._render(), hydrating)
}

new Watcher(vm, updateComponent, noop, {
	before () {
		if (vm._isMounted) {
			callHook(vm, 'beforeUpdate')
		}
	}
}, true)

// src/core/instance/lifecycle.js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
	const vm: Component = this
	// ...
	const prevVnode = vm._vnode
	if (!prevVnode) {
		// initial render
		vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false)
	} else {
		// updates
		vm.$el = vm.__patch__(prevVnode, vnode)
	}
	// ...
}

// src/core/vdom/patch.js
return function patch(oldVnode, vnode, hydrating, removeOnly) {
	if (isUndef(vnode)) {
		if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
		return
	}
	
	let isInitialPatch = false
	const insertedVnodeQueue = []
	
	if (isUndef(oldVnode)) {
		// empty mount (likely as component), create new root element
		isInitialPatch = true
		createElm(vnode, insertedVnodeQueue)
	} else {
		const isRealElememnt = isDef(oldVnode.nodeType)
		if (!isRealElement && sameVnode(oldVnode, vnode)) {
			// patch existing root node
			patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
		} else {
			if (isRealElement) {
				// ...
			}
			
			// 以当前旧节点为参考节点，创建新的节点，并插入到DOM中
			// replacing existing element
			const oldElm = oldVnode.elm
			const parentElm = nodeOps.parentNode(oldElm)
			
			// create new node
			createElm(
				vnode,
				insertedVnodeQueue,
				// extremely rare edge case: do not insert if old element is in a
				// leaving transition. Only happens when combining transition +
				// keep-alive + HOCs. (#4590)
				oldElm._leaveCb ? null : parentElm,
				nodeOps.nextSibling(oldElm)
			)
			
			// update parent placeholder node element, recursively
			if (isDef(vnode.parent)) {
				let ancestor = vnode.parent
				const patchable = isPatchable(vnode)
				while (ancestor) {
					for (let i = 0; i < cbs.destroy.length; ++i) {
						cbs.destroy[i](ancestor)
					}
					ancestor.elm = vnode.elm
					if (patchable) {
						for (let i = 0; i < cbs.create.length; ++i) {
							cbs.create[i](emptyNode, ancestor)
						}
						// #6513
						// invoke insert hooks that may have been merged by create hooks.
						// e.g. for directives that uses the "inserted" hook.
						const insert = ancestor.data.hook.insert
						if (insert.merged) {
							// start at index 1 to avoid re-invoking component mounted hook
							for (let i = 1; i < insert.fns.length; i++) {
								insert.fns[i]()
							}
						}
					} else {
						registerRef(ancestor)
					}
					ancestor = ancestor.parent
				}
			}
			
			// destroy old node
			if (isDef(parentElm)) {
				removeVnodes(parentElm, [oldVnode], 0, 0)
			} else if (isDef(oldVnode.tag)) {
				invokeDestroyHook(oldVnode);
			}
		}
	}
	
	invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
	return vnode.elm;
}

//sameVnode

function sameVnode(a, b) {
	return (
		a.key === b.key && (
			(
				a.tag === b.tag &&
				a.isComment === b.isComment &&
				isDef(a.data) === isDef(b.data) &&
				sameInputType(a, b)
			) || (
				isTrue(a.isAsyncPlaceholder) &&
				a.asyncFactory === b.asyncFactory &&
				isUndef(b.asyncFactory.error)
			)
		)
	)
}

// removeVnodes
// 遍历待删除的vnodes做删除
function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
	for (; startIdx <= endIdx; ++startIdx) {
		const ch = vnodes[startIdx]
		if (isDef(ch)) {
			if (isDef(ch.tag)) {
				removeAndInvokeRemoveHook(ch)
				invokeDestroyHook(ch)
			} else {
				removeNode(ch.elm)
			}
		}
	}
}

// 从DOM中移除节点并执行module的remove钩子函数，并对它的子节点递归调用removeAndInvokeRemoveHook函数；
// invokeDestroyHook是执行module的destory钩子函数以及vnode的destory钩子函数，并对它的子vnode递归调用
// invokeDestroyHook函数；removeNode就是调用平台的DOM API去把真正的DOM节点移除
function removeAndInvokeRemoveHook (vnode, rm) {
	if (isDef(rm) || isDef(vnode.data)) {
		let i
		const listeners = cbs.remove.length + 1
		if (isDef(rm)) {
			// we have a recursively passed down rm callback
			// increase the listeners count
			rm.listeners += listeners
		} else {
			// directly removing
			rm = createRmcb(vnode.elm, listeners)
		}
		// recursively invoke hooks on child component root node
		if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
			removeAndInvokeRemoveHook(i, rm)
		}
		for (i = 0; i < cbs.remove.length; ++i) {
			cbs.remove[i](vnode, rm)
		}
		if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
			i(vnode, rm)
		} else {
			rm()
		}
	} else {
		removeNode(vnode.elm)
	}
}

function invokeDestroyHook (vnode) {
	let i, j
	const data = vnode.data
	if (isDef(data)) {
		if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode)
		for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
	}
	if (isDef(i = vnode.children)) {
		for (j = 0; j < vnode.children.length; ++j) {
			invokeDestroyHook(vnode.children[j])
		}
	}
}

// destory
// src/core/vdom/create-component.js
const componentVNodeHooks = {
	destroy (vnode: MountedComponentVNode) {
		const { componentInstance } = vnode
		if (!componentInstance._isDestroyed) {
			if (!vnode.data.keepAlive) {
				componentInstance.$destroy()
			} else {
				deactivateChildComponent(componentInstance, true)
			}
		}
	}
}

//新旧节点相同
// 调用 patchVNode
// src/core/vdom.patch.js
// patchVnode的作用就是把新的vnode patch到旧的vnode上
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
	if (oldVnode === vnode) {
		return
	}
	
	const elm = vnode.elm = oldVnode.elm
	
	if (isTrue(oldVnode.isAsyncPlaceholder)) {
		if (isDef(vnode.asyncFactory.resolved)) {
			hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
		} else {
			vnode.isAsyncPlaceholder = true
		}
		return
	}
	
	// reuse element for static trees.
	// note we only do this if the vnode is cloned -
	// if the new node is not cloned it means the render functions have been
	// reset by the hot-reload-api and we need to do a proper re-render.
	if (isTrue(vnode.isStatic) && 
	isTrue(oldVnode.isStatic) &&
	vnode.key === oldVnode.key && 
	(isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
	) {
		vnode.componentInstance = oldVnode.componentInstance
		return
	}
	
	// 执行prepatch钩子函数
	let i
	const data = vnode.data
	if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
		i(oldVnode, vnode)
	}
	
	// 完成patch过程
	// 如果vnode是个文本节点且新旧文本不相同，则直接替换文本内容。
	// 如果不是文本节点，则判断它们的子节点
	const oldCh = oldVnode.children
	const ch = vnode.children
	if (isDef(data) && isPatchable(vnode)) {
		for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
			if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
	}
	// 1.oldCh 与 ch都存在且不相等时，使用updateChildren 函数来更新节点
	// 2. 如果只有ch存在，表示旧节点不需要了。如果旧的节点是文本节点则先将节点的文本清除，
	if (isUndef(vnode.text)) {
		if (isDef(oldCh) && isDef(ch)) {
			if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
		} else if (isDef(ch)) {
			if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
			addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
		} else if (isDef(oldCh)) {
			removeVnodes(elm, oldCh, 0, oldCh.length - 1)
		} else if (isDef(oldCh)) {
			removeVnodes(elm, oldCh, 0, oldCh.length - 1)
		} else if (isDef(oldVnode.text)) {
			nodeOps.setTextContent(elm, '')
		}
	} else if (oldVnode.text !== vnode.text) {
		nodeOps.setTextContent(elm, vnode.text)
	}
	if (isDef(data)) {
		if (isDef(i = data.hook) && isDef(i = i.postpatch))
		i(oldVnode, vnode)
	}
}

// prepatch 的方法
// src/core/vdom/create-component.js
// 拿到新的vnode的组件配置以及组件实例，去执行updateChildComponent方法
const componentVNodeHooks = {
	prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
		const options = vnode.componentOptions
		const child = vnode.componentInstance = oldVnode.componentInstance
		updateChildComponent(
			child,
			options.propsData, // updated props
			options.listeners, // updated listeners
			vnode, // new parent vnode
			options.children // new children
		)
	}
}

// updateChildComponent
// src/core/instance/lifecycle.js
export function updateChildComponent (
	vm: Component,
	propsData: ?Object,
	listeners: ?Object,
	parentVnode: MountedComponentVNode,
	renderChildren: ?Array<VNode>
) {
	if (process.env.NODE_ENV !== 'production') {
		isUpdatingChildComponent = true
	}
	
	// determine whether component has slot children
	// we need to do this before overwriting $options._renderChildren
	const hasChildren = !!(
		renderChildren || 	//	has new static slots
		vm.$options._renderChildren || 		//	has old static slots
		parentVnode.data.scopedSlots || 	// has new scoped slots
		vm.$scopedSlots !== emptyObject 	// has old scoped slots
	)
	
	vm.$options._parentVnode = parentVnode
	vm.$vnode = parentVnode // update vm's placeholder node without re-render
	
	if (vm._vnode) {	// update child tree's parent
		vm._vnode.parent = parentVnode
	}
	vm.$options._renderChildren = renderChildren
	
	// update $attrs and $listeners hash
	// these are also reactive so they may trigger child update if the child
	// used them during render
	vm.$attrs = parentVnode.data.attrs || emptyObject
	vm.$listeners = listeners || emptyObject
	
	// update props
	if (propsData && vm.$options.props) {
		toggleObserving(false)
		const props = vm._props
		const propKeys = vm.$options._propKeys || []
		for (let i = 0; i < propKeys.length; i++) {
			const key = propKeys[i]
			const propOptions: any = vm.$options.props // wtf flow?
			props[key] = validateProp(key, propOptions, propsData, vm)
		}
		toggleObserving(true)
		// keep a copy of raw propsData
		vm.$options.propsData = propsData
	}
	
	// update listeners
	listeners = listeners || emptyObject
	const oldListeners = vm.$options._parentListeners
	vm.$options._parentListeners = listeners
	updateComponentListeners(vm, listeners, oldListeners)
	
	// resolve slots + force update if has children
	if (hasChildren) {
		vm.$slots = resolveSlots(renderChildren, parentVnode.context);
		vm.$forceUpdate()
	}
	
	if (process.env.NODE_ENV !== 'production') {
		isUpdatingChildComponent = false
	}
}

// update钩子函数
if (isDef(data) && isPatchable(vnode)) {
	for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
	if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
}

//updateChildren
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
	let oldStartIdx = 0
	let newStartIdx = 0
	let oldEndIdx = oldCh.length - 1
	let oldStartVnode = oldCh[0]
	let oldEndVnode = oldCh[oldEndIdx]
	let newEndIdx = newCh.length - 1
	let newStartVnode = newCh[0]
	let newEndVnode = newCh[0]
	let newEndVnode = newCh[newEndIdx]
	let oldKeyToIdx, idxInOld, vnodeToMove, refElm
	
	// removeOnly is a special flag used only by <transition-group>
	// to ensure removed elements stay in correct relative
	// during leaving transitions
	const canMove = !removeOnly
	
	if (process.env.NODE_ENV !== 'production') {
		checkDuplicateKeys(newCh)
	}
	
	while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
		if (isUndef(oldStartVnode)) {
			oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
		} else if (isUndef(oldEndVnode)) {
			oldEndVnode = oldCh[--oldEndIdx]
		} else if (sameVnode(oldStartVnode, newStartVnode)) {
			patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
			oldStartVnode = oldCh[++oldStartIdx]
			newStartVnode = newCh[++newStartIdx]
		} else if (sameVnode(oldEndVnode, newEndVnode)) {
			patchVNODE(oldEndVnode, newEndVnode, insertedVnodeQueue)
			oldEndVnode = oldCh[--oldEndIdx]
			newEndVnode = newCh[--newEndIdx]
		} else if (sameVnode(oldStartVnode, newEndVnode)) {
			patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
			canMove && nodeOps.insertBefore(parentElm, 
			oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
			oldStartVnode = oldCh[++oldStartIdx]
			newEndVnode = newCh[--newEndIdx]
		} else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
			patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
			canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
			oldEndVnode = oldCh[--oldEndIdx]
			newStartVnode = newCh[++newStartIdx]
		} else {
			if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh， oldStartIdx, oldEndIdx)
			idxInOld = isDef(newStartVnode.key)
			? oldKeyToIdx[newStartVnode.key]
			: findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
			if (isUndef(idxInOld)) { // New element
				createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
			} else {
				vnodeToMove = oldCh[idxInOld]
				if (sameVnode(vnodeToMove, newStartVnode)) {
					patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
					oldCh[idxInOld] = undefined
					canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
				} else {
					createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
				}
			}
			newStartVnode = newCh[++newStartIdx]
		}
	}
	if (oldStartIdx > oldEndIdx) {
		refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
		addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
	} else if (newStartIdx > newEndIdx) {
		removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
	}
}
```

组件更新的过程核心就是新旧vnode diff，对新旧节点相同以及不同的情况分别做不同的处理。新旧节点不同的更新流程是创建新节点
->更新父占位符节点->删除旧节点；而新旧节点相同的更新流程是去获取它们的children，根据不同的情况做不同的更新逻辑。
最复杂的情况是新旧节点相同且它们都存在子节点，那么会执行updateChildren逻辑。

## 编译
模版编译成render函数的过程叫编译
虽然我们可以直接为组件编写render函数，但是编写template模版更加直观，也更符合我们的开发习惯
Vue.js提供了2个版本，一个是Runtime + Compiler,一个是Runtime only，前者是包含编译代码的，可以把
编译过程放在运行时做，后者是不包含编译代码的，需要借助webpack的vue-loader事先把模版编译成render函数

### 编译入口

../platforms/web/entry-runtime-with-compiler.js
compileToFunctions
把模版template编译生成render以及staticRenderFns
```JavaScript
const { render, staticRenderFns } = compileToFunctions(template, {
	shouldDecodeNewlines,
	shouldDecodeNewlinesForHref,
	delimiters: options.delemiters,
	comments: options.comments
}, this)
options.render = render
options.staticRenderFns = staticRenderFns


```
staticRenderFns
	src/platforms/web/compiler/index.js
compileToFunctions实际上是createCompiler方法的返回值
```Javascript
import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

const { compiler, compilerToFunctions } = createCompiler(baseOptions)

export {compile, compileToFunctions }
```
createCompiler
实际上是通过调用createCompilerCreator方法返回的，该方法传入的参数是一个函数，真正的编译过程都在这个baseCompile
函数里执行
```JavaScript
// createCompilerCreator allows creating compulers that use alternative
// parse/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts
export const createCompiler = createCompilerCreator(function baseCompile(
	template: string,
	options: CompilerOptions
): CompiledResult {
	const ast = parse(template.trim(), options)
	if (options.optimize !== false) {
		optimize(ast, options)
	}
	const code = generate(ast, options)
	return {
		ast,
		render: code.render,
		staticRenderFns: code.staticRenderFns
	}
})
```
createCompilerCreator
src/compiler/create-compiler.js
该方法返回了一个createCompiler函数，它接收一个baseOptions的参数，返回的是一个对象，包括compile方法属性
和compileToFunctions属性
```JavaScript
export function createCompilerCreator(baseCompile: Function): Function{
	return function createCompiler (baseOptions: CompilerOptions) {
		function compile(
			template: string,
			options?: CompilerOptions
		): CompiledResult {
			const finalOptions = Object.create(baseOptions)
			const errors = []
			const tips = []
			finalOptions.warn = (msg, tip) => {
				(tip ? tips : errors).push(msg)
			}
			
			if (options) {
				// merge custom modules
				if (options.modules) {
					finalOptions.modules = 
						(baseOptions.modules || []).concat(options.modules)
				}
				// merge custom directives
				if (options.directives) {
					finalOptions.directives = extend(
						Object.create(baseOptions.directives || null),
						options.directives
					)
				}
				// copy other options
				for (const key in options) {
					if (key !== 'modules' && key !== 'directives') {
						finalOptions[key] = options[key]
					}
				}
			}
			
			const compiled = baseCompile(template, finalOptions)
			if (process.env.NODE_ENV !== 'production') {
				errors.push.apply(errors, detectErrors(compiled.ast))
			}
			compiled.errors = errors
			compiled.tips = tips
			return compiled
		}
		
		return {
			compile,
			compileToFunctions: createCompileToFunctionFn(compile)
		}
	}
}
```
createCompileToFunctionFn
src/compiler/to-function/js

接收三个参数、编译模版 templage,编译配置 options和Vue实例 vm
```JavaScript
export function createCompileToFunctionFn (compile: Function):Function {
	const cache = Object.create(null)
	
	return function compileToFunctions (
		template: string,
		options?: CompilerOptions,
		vm?: Component
	): CompiledFunctionResult {
		options = extend({}, options)
		const warn = options.warn || baseWarn
		delete options.warn
		
		/* istanbul ignore if */
		if (process.env.NODE_ENV !== 'production') {
			// delect possible CSP restriction
			try {
				new Function('return 1')
			} catch (e) {
				if (e.toString().match(/unsafe-eval|CSP/)) {
					warn(
						'It seems you are using the standalone build of Vue.js in an ' +
						'environment with Content Security Policy that prohibits unsafe-eval. ' +
						'The template compiler cannnot work in this environment. Consider ' +
						'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
						'templates into render functions.'
					)
				}
			}
		}
		
		// check cache
		const key = options.delimiters
			? String(options.delimiters) + template
			: template
		if (cache[key]) {
			return cache[key]
		}
		
		// compile
		// 核心代码
		const compiled = compile(template, options)
		
		// check compilation errors/tips
		if (process.env.NODE_ENV !== 'production') {
			if (compiled.errors && compiled.errors.length) {
				warn(
					`Error compiling template: \n\n${template}\n\n` + 
					compiled.errors.map(e => `- ${e}`).join('\n') + '\n',
					vm
				)
			}
			if (compiled.tips && compiled.tips.length) {
				compiled.tips.forEach(msg => tip(msg, vm))
			}
		}
		
		// turn code into functions
		const res = {}
		const fnGenErrors = []
		res.render = createFunction(compiled.render, fnGenErrors)
		res.staticRenderFns = compiled.staticRenderFns.map(code => {
			return createFunction(code, fnGenErrors)
		})
		
		// check function generation errors.
		// this should only happen if there is a bug in the compiler itself.
		// mostly for codegen development use
		/* instanbul ignore if */
		if (process.env.NODE_ENV !== 'production') {
			if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
				warn(
					`Failed to generate render function:\n\n` +
					fnGenErrors.map(({err, code}) => `${err.toString()} in \n\n${code}\n`).join('\n'),
					vm
				)
			}
		}
		
		return (cache[key] = res)
	}
}

function compile(
	template: string,
	options?: CompilerOptions
): CompiledResult{
	const finalOptions = Object.create(baseOptions)
	const errors = []
	const tips = []
	finalOptions.warn = (msg, tip) => {
		(tip ? tips: errors).push(msg)
	}
	
	if (options) {
		// merge custom modules
		if (options.modules) {
			finalOptions.modules = 
				(baseOptions.modules || []).concat(options.modules)
		}
		// merge custom directives
		if (options.directives) {
			finalOptions.directives = extend(
				Object.create(baseOptions.directives || null),
				options.directives
			)
		}
		// copy other options
		for (const key in options) {
			if (key !== 'modules' && key !== 'directives') {
				finalOptions[key] = options[key]
			}
		}
	}
	//执行编译
	const compiled = baseCompile(template, finalOptions)
	if (process.env.NODE_ENV !== 'production') {
		errors.push.apply(errors, detectErrors(compiled.ast))
	}
	compiled.errors = errors
	compiled.tips = tips
	return compiled
}

// baseCompile在执行createCompilerCreator方法时作为参数传入
export const createCompiler = createCompilerCreator(function baseCompiler(
	template: string,
	options: CompilerOptions
): CompiledResult{
	// 解析模版字符串生成ast
	const ast = parse(template.trim(), options)
	// 优化语法树
	optimize(ast, options)
	// 生成代码
	const code = generate(ast, options)
	return {
		ast,
		render: code.render,
		staticRenderFns: code.staticRenderFns
	}
})
```

Vue.js在不同的平台下都会有编译的过程，因此编译过程中的依赖的配置baseOptions会有所不同
Vue.js利用了函数柯里化的技巧很好的实现了baseOptions的参数保留。同样，Vue.js也是利用
柯里化技巧把baseCompile函数抽出来，把真正编译的过程和其它逻辑如对编译配置处理、缓存处理等剥离开

ast是用一个javascript对象对节点进行描述的一种抽象语法树的树状表现形式

parse
src/compiler/parser/index.js
```JavaScript
export function parse(
	template: string,
	options: CompilerOptions
): ASTElement | void {
	// 从options中获取方法和配置
	getFnsAndConfigFromOptions(options)
	
	parseHTML(template, {
		// options ...
		start (tag, attrs, unary) {
			let element = createASTElement(tag, attrs)
			processElement(element)
			treeManagement()
		},
		
		end () {
			treeManagement()
			closeElement()
		},
		
		chars (text: string) {
			handleText()
			createChildrenASTOfText()
		},
		comment(text: string) {
			createChildrenASTOfComment()
		}
	})
	return astRootElement
}

//options
// src/platforms/web/compiler/options
import{
	isPreTag,
	mustUseProp,
	isReservedTag,
	getTagNamespace
} from '../util/index'

import modules from './modules/index'
import directives from './directives/index'
import { genStaticKeys } from 'shared/util'
import { isUnaryTag, canBeLeftOpenTag } from './util'

export const baseOptions: CompilerOptions = {
	expectHTML: true,
	modules,
	directives,
	isPreTag,
	isUnaryTag,
	mustUseProp,
	canBeLeftOpenTag,
	isReservedTag,
	getTagNamespace,
	staticKeys: genStaticKeys(modules)
}

// getFnsAndConfigFromOptions
warn = options.warn || baseWarn

platformIsPreTag = options.isPreTag || no
platformMustUseProp = options.mustUseProp || no
platformGetTagNamespace = options.getTagNamespace || no

transforms = pluckModuleFunction(options.modules, 'transformNode')
preTransforms = pluckModuleFunction(options.modules, 'preTransformNode')
postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')

delimiters = options.delimiters
```

解析HTML模版
parseHTML
src/compiler/parser/html-parse
循环解析template，用正则做各种匹配，对于不同情况分别进行不同的处理，直到整个template被解析完毕。
在匹配的过程中会利用advance函数不断前进整个模版字符串，直到字符串末尾。
```JavaScript
export function parseHTML(html, options) {
	let lastTag
	while (html) {
		if (!lastTag || !isPlainTextElement(lastTag)) {
			let textEnd = html.indexOf('<')
			if (textEnd === 0) {
				if(matchComment) {
					advance(commentLength)
					continue
				}
				if(matchDoctype) {
					advance(doctypeLength)
					continue
				}
				if(matchEndTag) {
					advance(endTagLength)
					parseEndTag()
					continue
				}
				if(matchStartTag) {
					parseStartTag()
					handleStartTag()
					continue
				}
			}
			handleText()
			advance(textLength)
		} else {
			handlePlainTextElement()
			parseEndTag()
		}
	}
}

function advance(n) {
	index += n
	html = html.substring(n)
}
```
对于注释节点和文档类型节点的匹配，如果匹配到我们仅仅做的是做前进即可。
```JavaScript
if (comment.test(html)) {
	const commentEnd = html.indexOf('-->')
	
	if (commentEnd >= 0) {
		if (options.shouldKeepComment) {
			options.comment(html.substring(4, commentEnd))
		}
		advance(commentEnd + 3)
		continue
	}
}

if (conditionalComment.test(html)) {
	const conditionalEnd = html.indexOf(']>')
	
	if (conditionalEnd >= 0) {
		advance(conditionalEnd + 2)
		continue
	}
}

const doctypeMatch = html.match(doctype)
if (doctypeMatch) {
	advance(doctypeMatch[0].length)
	continue
}
```
对于注释和条件注释节点，前进至它们的末尾位置；对于文档类型节点，则前进它自身长度的距离。
开始标签
```JavaScript
const startTagMatch = parseStartTag()
if (startTagMatch) {
	handleStartTag(startTagMatch)
	if (shouldIgnoreFirstNewline(lastTag, html)) {
		advance(1)
	}
	continue
}

// parseStartTag
function parseStartTag () {
	const start = html.match(startTagOpen)
	if (start) {
		const match = {
			tagName: start[1],
			attrs: [],
			start: index
		}
		advance(start[0].length)
		let end, attr
		while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
			advance(attr[0].length)
			match.attrs.push(attr)
		}
		if (end) {
			match.unarySlash = end[1]
			advance(end[0].length)
			match.end = index
			return match
		}
	}
}

// handleStartTag
// 先判断开始标签是否是一元标签，接着对match.attrs遍历并做了一些处理，最后判断如果非一元标签
// 则往stack里push一个对象，并且把tagName赋值给lastTag。
function handleStartTag (match) {
	const tagName = match.tagName
	const unarySlash = match.unarySlash
	
	if (expectHTML) {
		if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
			parseEndTag(lastTag)
		}
		if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
			parseEndTag(tagName)
		}
	}
	
	const unary = isUnaryTag(tagName) || !!unarySlash
	
	const l = match.attrs.length
	const attrs = new Array(l)
	for (let i = 0; i < l; i++) {
		const args = match.attrs[i]
		if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
			if (args[3] === '') { delete args[3] }
			if (args[4] === '') { delete args[4] }
			if (args[5] === '') { delete args[5] }
		}
		const value = args[3] || args[4] || args[5] || ''
		const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
			? options.shouldDecodeNewlinesForHref
			: options.shouldDecodeNewlines
		attrs[i] = {
			name: args[1],
			value: decodeAttr(value, shouldDecodeNewlines)
		}
	}
	
	if (!unary) {
		stack.push({tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs})
		lastTag = tagName
	}
	if (options.start) {
		options.start(tagName, attrs, unary, match.start, match.end)
	}
}
```

闭合标签
```JavaScript
// 先通过正则endTag匹配到闭合标签，然后前进到闭合标签末尾，然后执行parseEndTag方法对闭合标签做解析。
const endTagMatch = html.match(endTag)
if (endTagMatch) {
	const curIndex = index
	advance(endTagMatch[0].length)
	parseEndTag(endTagMatch[1], curIndex, index)
	continue
}

// parseEndTag
// 对于闭合标签的解析，就是倒序stack,找到第一个和当前endTag匹配的元素
function parseEndTag (tagName, start, end) {
	let pos, lowerCasedTagName
	if (start == null) start = index
	if (end == null) end = index
	
	if (tagName) {
		lowerCasedTagName = tagName.toLowerCase()
	}
	
	if (tagName) {
		for (pos = stack.length - 1; pos >= 0; pos--) {
			if (stack[pos].lowerCasedTag === lowerCasedTagName) {
				break
			}
		}
	} else {
		pos = 0
	}
	
	if (pos >= 0) {
		for (let i = stack.length - 1; i >= pos; i--) {
			if (process.env.NODE_ENV !== 'production' &&
				(i > pos || !tagName) &&
				options.warn
			) {
				options.warn(
					`tag <${stack[i].tag}> has no matching end tag.`
				)
			}
			if (options.end) {
				options.end(stack[i].tag, start, end)
			}
		}
		stack.length = pos
		lastTag = pos && stack[pos - 1].tag
	} else if (lowerCasedTagName === 'br') {
		if (options.start) {
			options.start(tagName, [], true, start, end)
		}
	} else if (lowerCasedTagName === 'p') {
		if (options.start) {
			options.start(tagName, [], false, start, end)
		}
		if (options.end) {
			options.end(tagName, start, end)
		}
	}
}

// 文本
let text, rest, next
// 满足则说明从当前位置到textEnd位置都是文本，并且如果<是纯文本中的字符，就继续找到真正的文本结束的位置，
// 然后前进到结束的位置。
if (textEnd >= 0) {
	rest = html.slice(textEnd)
	while (
		!endTag.test(rest) &&
		!startTagOpen.test(rest) &&
		!comment.test(rest) &&
		!conditionalComment.test(rest)
	) {
		 next = rest.indexOf('<', 1)
		 if (next < 0) break
		 textEnd += next
		 rest = html.slice(textEnd)
	}
	text = html.substring(0, textEnd)
	advance(textEnd)
}

// 说明整个template解析完毕
if (textEnd < 0) {
	text = html
	html = ''
}

// 调用options.chars回调函数
if (options.chars && text) {
	options.chars(text)
}
```

处理开始标签
```JavaScript
start (tag, attrs, unary) {
	let element = createASTElement(tag, attrs)
	processElement(element)
	treeManagement()
}

//主要做三件事情，创建AST元素，处理AST元素，AST树管理

// 创建AST元素
// check namespace.
// inherit parent ns if there is one
const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

// handle IE svg bug
/* istanbul ignore if */
if (isIE && ns === 'svg') {
	attrs = guardIESVGBug(attrs)
}

let element: ASTElement = createASTElement(tag, attrs, currentParent)
if (ns) {
	element.ns = ns
}

// 通过createASTElement方法创建一个AST元素，每一个AST元素就是一个普通的JavaScript对象
export function createASTElement(
	tag: string,
	attrs: Array<Attr>,
	parent: ASTElement | void
): ASTElement {
	return {
		// AST元素类型
		type: 1,
		// 标签名
		tag,
		// 属性列表
		attrsList: attrs,
		// 属性印社表
		attrsMap: makeAttrsMap(attrs),
		// 父的AST元素
		parent,
		// 子AST元素集合
		children: []
	}
}

// 处理AST元素
if (isForbiddenTag(element) && !isServerRendering()) {
	element.forbidden = true
	process.env.NODE_ENV !== 'production' && warn(
		'Templates should only be responsible for mapping the state to the ' +
		'UI. Avoid placing tags with side-effects in your templates, such as ' +
		`<${tag}>` + ', as they will not be parsed.'
	)
}

// apply pre-transforms
for (let i = 0; i < preTransforms.length; i++) {
	element = preTransforms[i](element, options) || element
}

if (!inVPre) {
	processPre(element)
	if (element.pre) {
		inVPre = true
	}
}
if (platformIsPreTag(element.tag)) {
	inPre = true
}
if (inVPre) {
	processRawAttrs(element)
} else if (!element.processed) {
	// structural directives
	processFor(element)
	processIf(element)
	processOnce(element)
	// element-scope stuff
	processElement(element, options)
}

// processFor
// 从元素中拿到v-for指令的内容，然后分别解析出for、alias、iterator1、iterator2
export function processFor (el: ASTElement) {
	let exp
	if ((exp = getAndRemoveAttr(el, 'v-for'))) {
		const res = parseFor(exp)
		if (res) {
			extend(el, res)
		} else if (process.env.NODE_ENV !== 'production') {
			warn(
				`Invalid v-for expression: ${exp}`
			)
		}
	}
}

export const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
const stripParensRE = /^\(|\)$/g
export function parseFor (exp: string): ?ForParseResult {
	const inMatch = exp.match(forAliasRE)
	if (!inMatch) return
	const res = {}
	res.for = inMatch[2].trim()
	const alias = inMatch[1].trim().replace(stripParensRE, '')
	const iteratorMatch = alias.match(forIteratorRE)
	if (iteratorMatch) {
		res.alias = alias.replace(forIteratorRE, '')
		res.iterator1 = iteratorMatch[1].trim()
		if (iteratorMatch[2]) {
			res.iterator2 = iteratorMatch[2].trim()
		}
	} else {
		res.alias = alias
	}
	return res
}

// processIf
// 从元素中拿v-if指令的内容，如果拿到则给AST元素添加if属性和ifConditions属性；
// 否则尝试那v-else指令及v-else-if指令的内容，如果拿到则给AST元素分别添加else和elseif属性
function processIf (el) {
	const exp = getAndRemoveAttr(el, 'v-if')
	if (exp) {
		el.if = exp
		addIfCondition(el, {
			exp: exp,
			block: el
		})
	} else {
		if (getAndRemoveAttr(el, 'v-else') != null) {
			el.else = true
		}
		const elseif = getAndRemoveAttr(el, 'v-else-if')
		if (elseif) {
			el.elseif = elseif
		}
	}
}

export function addIfCondition (el: ASTElement, condition: ASTIfCondition) {
	if (!el.ifConditions) {
		el.ifCOnditions = []
	}
	el.ifConditions.push(condition)
}

// AST树管理
// AST树管理的目标是构建一颗AST树，本质上它要维护root根节点和当前父节点currentParent。未来保证元素
// 可以正确闭合，这里也利用了stack栈的数据结构

function checkRootConstraints (el) {
	if (process.env.NODE_ENV !== 'production') {
		if (el.tag === 'slot' || el.tag === 'template') {
			warnOnce(
				`Cannot use <$el.tag> as component root element because it may ` +
				'contain multiple nodes.'
			)
		}
		if (el.attrsMap.hasOwnProperty('v-for')) {
			warnOnce(
				'cannot use v-for on stateful component root element because ' +
				'it renders multiple elements.'
			)
		}
	}
	
	// tree management
	if (!root) {
		root = element
		checkRootConstraints(root)
	} else if (!stack.length) {
		// allow root elements with v-if, v-else-if and v-else
		if (root.if && (element.eleseif || element.else)) {
			checkRootConstraints(element)
			addIfCondition(root, {
				exp: element.elseif,
				block: element
			})
		} else if (process.env.NODE_ENV !== 'production') {
			warnOnce(
				`Component template should contain exactly one root element. ` +
				`If you are using v-if on multiple elements, ` +
				`use v-else-if to chain them instead.`
			)
		}
	}
	// 当我们在处理开始标签的时候，判断如果有currentParent,会把当前AST元素push到currentParent.children中，同时把AST元素的parent
	// 指向currentParent.
	if (currentParent && !element.forbidden) {
		if (element.elseif || element.else) {
			processIfConditions(element, currentParent)
		} else if (element.slotScope) { // scoped slot
			currentParent.plain = false
			const name = element.slotTarget || '"default"'
			;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
		} else {
			currentParent.children.push(element)
			element.parent = currentParent
		}
	}
	// 接着就是更新currentParent和stack，判断当前如果不是一个一元标签，我们要把它生成的AST元素push到stack中，并且把当前的AST元素
	// 赋值给currentParent
	if (!unary) {
		currentParent = element
		stack.push(element)
	} else {
		closeElement(element)
	}
}
```
## 处理闭合标签
```JavaScript
end () {
	treeManagement()
	closeElement()
}

// 首先处理了尾部空格的情况
// remove trailing whitespace
const element = stack[stack.length - 1]
const lastNode = element.children[element.children.length - 1]
if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
	element.children.pop()
}

// 然后把stack的元素弹一个出栈，并把stack最后一个元素赋值给currentParent
// pop stack
stack.length -= 1
currentParent = stack[stack.length - 1]
closeElement(element)


// closeElement(element):
function closeElement (element) {
	// check pre state
	if (element.pre) {
		inVPre = false
	}
	if (platformIsPreTag(element.tag)) {
		inPre = false
	}
	// apply post-transforms
	for (let i = 0; i < postTransforms.length; i++){
		postTransforms[i](element, options)
	}
}
```

处理文本内容
```JavaScript
chars (text: string) {
	handleText()
	createChildrenASTOfText()
}

const children = currentParent.children
text = inPre || text.trim()
	? isTextTag(currentParent) ? text : decodeHTMLCached(text)
	// only preserve whitespace if its not right after a starting tag
	: preserveWhitespace && children.length ? ' ' : ''
if (text) {
	let res
	if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
		// 有表达式的
		children.push({
			type: 2,
			expression: res.expression,
			tokens: res.tokens,
			text
		})
	} else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' '){
		// 纯文本
		children.push({
			type: 3,
			text
		})
	}
}
```
parseText(text, delimiters)
src/compiler/parse/text-parser.js
```JavaScript
const defaultTagRE = /\{\((?:.|\n)+?)\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
	const open = delimiters[0].replace(regexEscapeRE, '\\$&')
	const close = delimiters[1].replace(regexEscapeRE, '\\$&')
	return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

export function parseText (
	text: string,
	delimiters?: [string, string]
): TextParseResult | void {
	const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
	if (!tagRE.test(text)) {
		return
	}
	const tokens = []
	const rawTokens = []
	let lastIndex = tagRE.lastIndex = 0
	let match, index, tokenValue
	while ((match = tagRE.exec(text))) {
		index = match.index
		// push text token
		if(index > lastIndex) {
			rawTokens.push(tokenValue = text.slice(lastIndex, index))
			tokens.push(JSON.stringify(tokenValue))
		}
		// tag token
		const exp = parseFilters(match[1].trim())
		tokens.push(`_s(${exp})`)
		rawTokens.push({ '@binding': exp })
		lastIndex = index + match[0].length
	}
	if (lastIndex < text.length) {
		rawTokens.push(tokenValue = text.slice(lastIndex))
		tokens.push(JSON.stringify(tokenValue))
	}
	return {
		expression: tokens.join('+'),
		tokens: rawTokens
	}
}
```
## optimize
优化AST树
模版中不是所有数据都是响应式的，可以在patch的过程中跳过对他们的比对。
src/compiler/optimizer.js
```JavaScript
/**
 * Goal of the optimizer: walk the generated template AST tree
 * and delect sub-trees that are purely static, i.e. parts of
 * the DOM that never need to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 * create fresh nodes for them on each re-render;
 *
 * 2.Completely skip them in the patching process.
 *
 */
// markStatic(root) 标记静态节点
// markStaticRoots(root, false) 标记静态根
export function optimize(root: ?ASTElement, options: CompilerOptions) {
	if (!root) return
	isStaticKey = genStaticKeysCached(options.staticKeys || '')
	isPlatformReservedTag = options.isReservedTag || no
	// first pass: mark all non-static nodes.
	markStatic(root)
	// second pass: mark static roots.
	markStaticRoots(root, false)
}

function genStaticKeys (keys: string): Function{
	return makeMap(
	`'type, tag, attrsList, attrsMap, plain, parent, children, attrs' +
	 (keys ? ',' + keys : '')
	)
}

// markStatic
function markStatic(node: ASTNode) {
	// 是否是静态
	node.static = isStatic(node)
	if (node.type === 1) {
		// do not make component slot context static. this avoids
		// 1. components not able to mutate slot nodes
		// 2. static slot content fails for hot-reloading
		if (
			!isPlatformReservedTag(node.tag) &&
			node.tag !== 'slot' &&
			node.attrsMap['inline-template'] == null
		) {
			return
		}
		for (let i = 0, l = node.children.length; i < l;i++) {
			const child = node.children[i]
			markStatic(child)
			if (!child.static) {
				node.static = false
			}
		}
		if (node.ifConditions) {
			for (let i = 1, l = node.ifConditions.length; i < l;i++) {
				const block = node.ifConditions[i].block
				markStatic(block)
				if (!block.static) {
					node.static = false
				}
			}
		}
	}
	
	function isStatic (node: ASTNode): boolean {
		if (node.type === 2) { // expression
			return false
		}
		if (node.type === 3) { //text
			return true
		}
		return !!(node.pre || (
			!node.hasBindings && // no dynamic bindings
			!node.if && !node.for && // not v-if or v-for or v-else
			!isBuiltInTag(node.tag) && // not a built-in
			isPlatformReservedTag(node.tag) && // not a component
			!isDirectChildOfTemplateFor(node) &&
			Object.keys(node).every(isStaticKey)
		))
	}
}

// 标记静态根
function markStaticRoots (node: ASTNode, isInFor: boolean) {
	if (node.type === 1) {
		if (node.static || node.once) {
			node.staticInFor = isInFor
		}
		// For a node to qualify as a static root, it should have children that
		// are not just static text. Otherwise the cost of hoisting out will
		// out weigh the benefits and it's better off to just always render it fresh.
		if (node.static && node.children.length && !(
			node.children.length === 1 &&
			node.children[0].type === 3
		)) {
			node.staticRoot = true
			return
		} else {
			node.staticRoot = false
		}
		if (node.children) {
			for (let i = 0, l = node.children.length; i < l; i++) {
				markStaticRoots(node.children[i], isInFor || !!node.for)
			}
		}
		if (node.ifConditions) {
			for (let i = 1,l = node.ifConditions.length; i < l; i++) {
				markStaticRoots(node.ifConditions[i].block, isInFor)
			}
		}
	}
}
```

optimize的过程
就是深度遍历这个AST树，去检测它的每一颗子树是不是静态节点，如果是静态节点则它们生成DOM永远不需要改变
通过optimize把整个AST树中的每一个AST元素节点标记了static和staticRoot

## codegen
把优化后的AST树转换成可执行的代码
```JavaScript
component
export function installRenderHelpers (target: any) {
	target._o = markOnce
	target._n = toNumber
	target._s = toString
	// renderList 渲染列表
	target._l = renderList
	target._t = renderSlot
	target._q = looseEqual
	target._i = looseIndexOf
	target._m = renderStatic
	target._f = resolveFilter
	target._k = checkKeyCodes
	target._b = bindObjectProps
	// 创建文本VNode
	target._v = createTextVNode
	// 创建空的VNode
	target._e = createEmptyVNode
	target._u = resolveScopedSlots
	target._g = bindObjectListeners
}

// src/compler/to-function.js
const compiled = compile(template, options)
res.render = createFunction(compiled.render, fnGenErrors)

function createFunction (code, errors) {
	try {
		return new Function(code)
	} catch (err) {
		errors.push({ err, code })
		return noop
	}
}

// generate
const code = generate(ast, options)
// src/compiler/codegen/index.js
export function generate(
	ast: ASTElement | void,
	options: CompilerOptions
): CodegenResult {
	const state = new CodegenState(options)
	const code = ast ? genElement(ast, state) : '_c("div")'
	return {
		render: `with(this){return ${code}}`,
		staticRenderFns: state.staticRenderFns
	}
}

//genElement
export function genElement (el: ASTElement, state: CodegenState): string {
	if (el.staticRoot && !el.staticProcessed) {
		return genStatic(el, state)
	} else if (el.once && !el.onceProcessed) {
		return genOnce(el, state)
	} else if (el.for && !el.forProcessed) {
		return genIf(el, state)
	} else if (el.tag === 'template' && !el.slotTarget) {
		return genChildren(el, state) || 'void 0'
	} else if (el.tag === 'slot') {
		return genSlot(el, state)
	} else {
		// component or element
		let code
		if (el.component) {
			code = genComponent(el.component, el, state)
		} else {
			const data = el.plain ? undefined : genData(el, state)
			
			const children = el.inlineTemplate ? null : genChildren(el, state, true)
			code = `_c('${el.tag}'${
				data ? `,${data}` : '' //data
			}${
				children ? `,${children}` : '' //children
			})`
			// module transforms
			for (let i = 0; i < state.transforms.length; i++) {
				code = state.transforms[i](el, code)
			}
			return code
		}
	}
}

// genIf
export function genIf (
	el: any,
	state: CodegenState,
	altGen?: Function,
	altEmpty?: string
): string {
	el.ifProcessed = true // avoid recursion
	
	return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions (
	conditions: ASTIfConditions,
	state: CodegenState,
	altGen?: Function,
	altEmpty?: string
): string {
	if (!conditions.length) {
		return altEmpty || '_e()'
	}
	
	const condition = conditions.shift()
	if (condition.exp) {
		return `(${condition.exp})?${
			genTernaryExp(condition.block)
		}:${
			genIfConditions(conditions, state, altGen, altEmpty)
		}`
	} else {
		return `${genTernaryExp(condition.block)}`
	}
	
	// v-if with v-once should generate code like (a)?_m(0):_m(1)
	function genTernaryExp (el) {
		return altGen
			? altGen(el, state)
			: el.once
				? genOnce(el, state)
				: genElement(el, state)
	}
}

// genFor
export function genFor(
	el: any,
	state: CodegenState,
	altGen?: Function,
	altHelper?: string
): string {
	const exp = el.for
	const alias = el.alias
	const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
	const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''
	
	if (process.env.NODE_ENV !== 'production' &&
		state.maybeComponent(el) &&
		el.tag !== 'slot' &&
		el.tag !== 'template' &&
		!el.key) {
			state.warn(
				`<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` +
				`v-for should have explicit keys. ` +
				`See https://vuejs.org/guide/list.html#key for more info.`,
				true /* tip */
			)
		}
		
		el.forProcessed = true // avoid recursion
		return `${altHelper || '_l'}((${exp})),` +
		`function(${alias}${iterator1}${iterator2}){` +
		`return ${(altGen || genElement)(el, state)}` +
		'})'
}
```

```JavaScript
//event
let Child = {
	template: '<button @click="clickHandler($event)">' +
	'click me' +
	'</button>',
	methods: {
		clickHandler(e) {
			console.log('Button clicked!', e)
			this.$emit('select')
		}
	}
}

let vm = new Vue({
	el: '#app',
	template: '<div>' +
	'<child @select="selectHandler" @click.native.prevent="clickHandler"></child>' +
	'</div>',
	methods: {
		clickHandler() {
			console.log('Child clicked!')
		},
		selectHandler() {
			console.log('Child select!')
		}
	},
	components: {
		Child
	}
})

// 编译
// src/compiler/parse/index.js
export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:/
export const bindRE = /^:|^v-bind:/

function processAttrs (el) {
	const list = el.attrsList
	let i, l, name, rawName, value, modifiers, isProp
	for (i = 0, l = list.length; i < l; i++) {
		name = rawName = list[i].name
		value = list[i].value
		if (dirRE.test(name)) {
			el.hasBindings = true
			modifiers = parseModifiers(name)
			// 解析出修饰符
			if (modifiers) {
				name = name.replace(modifierRE, '')
			}
			if (bindRE.test(name)) {
				// ..
			} else if(onRE.test(name)) {
				name = name.replace(onRE, '')
				// 如果事件的指令
				addHandler(el, name, value, modifiers, false, warn)
			} else {
				// ...
			}
		} else {
			// ...
		}
	}
}

function parseModifiers (name: string): Object | void {
	const match = name.match(modifierRE)
	if (match) {
		const ret = {}
		match.forEach(m => { ret[m.slice(1)] = true})
		return ret
	}
}

// src/compiler/helpers.js
// 根据modifier 修饰符对事件名name做处理
// 接着根据modifier.native 判断是一个纯原生事件还是普通事件，分别对应el.nativeEvents 和 el.events
// 最后按照name对事件做归类，并把回调函数的字符串保留到对应的事件中。
export function addHandler (
	el: ASTElement,
	name: string,
	value: string,
	modifiers: ?ASTModifiers,
	important?: boolean,
	warn?: Function
) {
	modifiers = modifiers || emptyObject
	// warn prevent and passive modifier
	/* istanbul ignore if */
	if (
		process.env.NODE_ENV !== 'production' && warn &&
		modifiers.prevent && modifiers.passive
	) {
		warn(
			'passive and prevent can\'t be used together. ' +
			'Passive handler can\'t prevent default event.'
		)
	}
	
	// check capture modifier
	if (modifiers.capture) {
		delete modifiers.capture
		name = '!' + name // mark the event as captured
	}
	if (modifiers.once) {
		delete modifiers.once
		name = '~' + name // mark the event as once
	}
	/* istanbul ignore if */
	if (modifiers.passive) {
		delete modifiers.passive
		name = '&' + name // mark the event as passive
	}
	
	// normalize click.right and click.middle since they don't actually,fire
	// this is technically browser-specific, but at least for now browsers are
	// the only target envs that have right/middle clicks.
	if (name === 'click') {
		if (modifiers.right) {
			name = 'contextmenu'
			delete modifiers.right
		} else if (modifiers.middle) {
			name = 'mouseup'
		}
	}
	
	let events
	if (modifiers.native) {
		delete modifiers.native
		events = el.nativeEvents || (el.nativeEvents = {})
	} else {
		events = el.events || (el.events = {})
	}
	
	cosnt newHandler: any = {
		value: value.trim()
	}
	if (modifiers !== emptyObject) {
		newHandler.modifiers = modifiers
	}
	const handlers = events[name]
	/* istanbul ignore if */
	if (Array.isArray(handlers)) {
		important ? handlers.unshift(newHandler) : handlers.push(newHandler)
	} else if (handlers) {
		events[name] = important ? [newHandler, handlers] : [handlers, newHandler]
	} else {
		events[name] = newHandler
	}
	
	el.plain = false
}
```

然后在codegen阶段，会在genData函数中根据AST元素节点上的events和nativeEvents生成data数据
```JavaScript
// src/compiler/codegen/index.js
export function genData (el: ASTElement, state: CodegenState): string {
	let data = '{'
	// ...
	if (el.events) {
		data += `${genHandlers(el.events, false, state.warn)},`
	}
	if (el.nativeEvents) {
		data += `${genHandlers(el.nativeEvents, true, state.warn)},`
	}
	// ... 
	return data
}

// 对于这俩个属性，会调用genHandlers函数，定义在src/compiler/codegen/events.js中：
export function genHandlers (
	events: ASTElementHandlers,
	isNative: boolean,
	warn: Function
): string {
	let res = isNative ? 'nativeOn:{' : 'on:{'
	for (const name in events) {
		res += `"{name}":${genHandler(name, events[name])},`
	}
	return res.slice(0, -1) + '}'
}

const fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/
const simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\ [\d+]|\[[A-Za-z_$][\w$]*])*\s*$/
function genHandler (
  name: string,
  handler: ASTElementHandler | Array<ASTElementHandler>
): string {
  if (!handler) {
    return 'function(){}'
  }
  // 遍历事件对象events
if (Array.isArray(handler)) {
return `[${handler.map(handler => genHandler(name, handler)).join(',')}]`
  }
  const isMethodPath = simplePathRE.test(handler.value)
  const isFunctionExpression = fnExpRE.test(handler.value)
  if (!handler.modifiers) {
    if (isMethodPath || isFunctionExpression) {
      return handler.value
    }
    /* istanbul ignore if */
    if (__WEEX__ && handler.params) {
		return genWeexHandler(handler.params, handler.value)
	}
	return `function($event){${handler.value}}` // inline statement
} else {
	let code = ''
	let genModifierCode = ''
	const keys = []
	for (const key in handler.modifiers) {
		if (modifierCode[key]) {
			genModifierCode += modifierCode[key]
			// left/right
			if (keyCodes[key]) {
				keys.push(key)
			}
		} else if (key === 'exact') {
			const modifiers: ASTModifiers = (handler.modifiers: any)
			genModifierCode += genGuard(
				['ctrl', 'shift', 'alt', 'meta']
					.filter(keyModifier => !modifiers[keyModifier])
					.map(keyModifier => `$event.${keyModifier}key`)
					.join('||')
			)
		} else {
			keys.push(key)
		}
	}
	if (keys.length) {
		code += genKeyFilter(keys)
	}
	// Make sure modifiers like prevent and stop get executed after key firtering
	if (genModifierCode) {
		code += genModifierCode
	}
	const handlerCode = isMethodPath
		? `return ${handler.value}($event)`
		: isFunctionExpression
			? `return (${handler.value})($event)`
			: handler.value
	/* istanbul ignore if */
	if (__WEEX__ && handler.params) {
		return genWeexHandler(handler.params.code + handlerCode)
	}
	return `function($event){${code}${handlerCode}}`
}
```

vue事件有2种，一种是原生DOM事件，一种是用户自定义事件
## DOM事件
在patch过程种的创建阶段和更新阶段都会执行updateDOMListeners:
```JavaScript
let target: any
function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
	if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
		return
	}
	// 首先获取vnode.data.on
	const on = vnode.data.on || {}
	const oldOn = oldVnode.data.on || {}
	// 当前vnode对应的DOM对象
	target = vnode.elm
	normalizeEvents(on)
	updateListeners(on, oldOn, add, remove, vnode.context)
	target = undefined
}

// src/core/vdom/helpers/update-listeners.js
export function updateListeners(
	on: Object,
	oldOn: Object,
	add: Function,
	remove: Function,
	vm: Component
) {
	let name, def, cur, old, event
	// 遍历on去添加事件监听
	for (name in on) {
		def = cur = on[name]
		old = oldOn[name]
		event = normalizeEvent(name)
		/* istanbul ignore if */
		if (__WEEX__ && isPlainObject(def)) {
			cur = def.handler
			event.params = def.params
		}
		if (isUndef(cur)) {
			process.env.NODE_ENV !== 'production' && warn(
				`Invalid handler for event "${event.name}": got ` + String(cur),
				vm
			)
		} else if (isUndef(old)) {
			if (isUndef(cur.fns)) {
				// 创建一个回调函数
				cur = on[name] = createFnInvoker(cur)
			}
			// 完成一次事件绑定
			add(event.name, cur, event.once, event.capture, event.passive, event.params)
		} else if (cur !== old) {
			old.fns = cur
			on[name] = old
		}
	}
	// 遍历oldOn去移除事件监听
	for (name in oldOn) {
		if (isUndef(on[name])) {
			event = normalizeEvent(name)
			remove(event.name, oldOn[name], event.capture)
		}
	}
}

//关于监听和移除事件的方法都是外部传入的，因为它即处理原生DOM事件的添加删除
//也处理自定义事件的添加删除

const normalizeEvent = cached((name: string): {
	name: string,
	once: boolean,
	capture: boolean,
	passive: boolean,
	handler?: Function,
	params?: Array<any>
} =>{
	const passive = name.charAt(0) === '&'
	name = passive ? name.slice(1) : name
	const once = name.charAt(0) === '~'
	name = once ? name.slice(1) : name
	const capture = name.charAt(0) === '!'
	name = capture ? name.slice(1) : name
	return {
		name,
		once,
		capture,
		passive
	}
})

// createFnInvoker
export function createFnInvoker(fns: Function | Array<Function>): Function {
	function invoker() {
		const fns = invoker.fns
		if (Array.isArray(fns)) {
			const cloned = fns.slice()
			for (let i = 0; i < cloned.length; i++) {
				cloned[i].apply(null, arguments)
			}
		} else {
			return fns.apply(null, arguments)
		}
	}
	invoker.fns = fns
	return invoker
}
```

add
```JavaScript
// src/platforms/web/runtime/modules/event.js
function add (
	event: string,
	handler: Function,
	once: boolean,
	capture: boolean,
	passive: boolean
) {
	handler = withMacroTask(handler)
	if (once) handler = createOnceHandler(handler, event, capture)
	target.addEventListener(
		event,
		handler,
		supportsPassive
			? {capture, passive}
			: capture
	)
}

function remove (
	event: string,
	handler: Function,
	capture: boolean,
	_target?: HTMLElement
) {
	(_target || target).removeEventListener(
		event,
		handler._withTask || handler,
		capture
	)
}

// withMacroTask(handler)
// src/core/util/next-tick.js
export function withMacroTask(fn: Function): Function {
	return fn._withTask || (fn._withTask = function (){
		useMacroTask = true
		const res = fn.apply(null, arguments)
		useMacroTask = false
		return res
	})
}
```

## 自定义事件
除了原生DOM事件，Vue还支持来自定义事件，并且自定义事件只能作用于组件上，如果在组件上使用原生事件，
需要加.native修饰符，普通元素上使用.native修饰符无效
```JavaScript
// render
// scr/core/vdom/create-component.js
export function createComponent(
	Ctor: Class<Component> | Function | Object | void,
	data: ?VNodeData,
	context: Component,
	children: ?Array<VNode>,
	tag?: string
): VNode | Array<VNode> | void {
	// ...
	const listeners = data.on
	
	data.on = data.nativeOn
	
	// ...
	const name = Ctor.options.name || tag
	// 把listeners作为vnode的componentOptions传入
	// 它是在子组件初始化阶段中处理的，所以它的处理环境是子组件。
	const vnode = new VNode(
		`vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
		data, undefined, undefined, undefined, context,
		{ Ctor, propsData, listeners, tag, children },
		asyncFactory
	)
	
	return vnode
}

// initInternalComponent
// src/core/instance/init.js
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
	const opts = vm.$options = Object.create(vm.constructor.options)
	// ...
	const vnodeComponentOptions = parentVnode.componentOptions
	
	opts._parentListeners = vnodeComponentOptions.listeners
}

// initEvents
// src/core/instance/event.js
export function initEvents(vm: Component) {
	vm._events = Object.create(null)
	vm._hasHookEvent = false
	// init parent attached events
	const listeners = vm.$options._parentListeners
	if (listeners) {
		updateComponentListeners(vm, listeners)
	}
}


let target: any
export function updateComponentListeners(
	vm: Component,
	listeners: Object,
	oldListeners: ?Object
) {
	target = vm
	// 自定义事件和原生DOM事件处理的差异就在事件添加和删除的实现上
	updateListeners(listeners, oldListeners || {}, add, remove, vm)
	target = undefined
}

function add(event, fn, once) {
	if (once) {
		target.$once(event, fn)
	} else {
		target.$on(event, fn)
	}
}

function remove (event, fn) {
	target.$off(event, fn)
}

// Vue事件中心
export function eventsMixin(Vue: Class<Component>) {
	const hookRE = /^hook:/
	Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
		const vm: Component = this
		if (Array.isArray(event)) {
			for (let i = 0, l = event.length; i < l; i++) {
				this.$on(event[i], fn)
			}
		} else {
			(vm._events[event] || (vm._events[event] = [])).push(fn)
			// optimize hook:event cost by using a boolean flag marked at registration
			// instead of a hash lookup
			if (hookRE.test(event)) {
				vm._hasHookEvent = true
			}
		}
		return vm
	}
	
	Vue.prototype.$once = function (event: string, fn: Function): Component {
		const vm: Component = this
		function on () {
			vm.$off(event, on)
			fn.apply(vm, arguments)
		}
		on.fn = fn
		vm.$on(event, on)
		return vm
	}
	
	Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
		const vm: Component = this
		// all
		if (!arguments.length) {
			vm._events = Object.create(null)
			return vm
		}
	}
	// array of events
	if (Array.isArray(event)) {
		for (let i = 0, l = event.length; i < l; i++) {
			this.$off(event[i], fn)
		}
		return vm
	}
	// specific event
	const cbs = vm._events[event]
	if (!cbs) {
		return vm
	}
	if (!fn) {
		vm._events[event] = null
		return vm
	}
	if (fn) {
		// specific handler
		let cb
		let i = cbs.length
		while (i--) {
			cb = cbs[i]
			if (cb === fn || cb.fn === fn) {
				cbs.splice(i, 1)
				break
			}
		}
	}
	return vm
}

Vue.prototype.$emit = function (event: string): Component {
	const vm: Component = this
	if (process.env.NODE_ENV !== 'production') {
		const lowerCaseEvent = event.toLowerCase()
		if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
			tip(
				`Event "${lowerCaseEvent}" is emitted in component ` +
				`${formatComponentName(vm)} but the handler is registered for "${event}".`
				+
				`Note that HTML attributes are case-insensitive and you cannot use ` +
				`v-on to listen to camelCase events when using in-DOM templates. ` +
				`You should probably use "${hyphenate(event)}" instead of "${event}".`
			)
		}
	}
	let cbs = vm._events[event]
	if (cbs) {
		cbs = cbs.length > 1 ? toArray(cbs) : cbs
		const args = toArray(arguments, 1)
		for (let i = 0, l = cbs.length; i < l; i++) {
			try {
				cbs[i].apply(vm, args)
			} catch (e) {
				handleError(e, vm, `event handler for "${event}"`)
			}
		}
	}
	return vm
}
```
Vue支持2种事件类型，原生DOM事件和自定义事件，它们主要的区别在于添加和删除事件的方式不一样，并且自定义事件的派发
是往当前实例上派发，但是可以利用在父组件环境定义回调函数来实现父子组件的通讯。

## v-model
vue的数据响应式原理，都是通过数据的改变去驱动DOM视图的变化，而双向绑定除了数据驱动DOM外，DOM的变化反过来影响数据，
是一个双向关系，在Vue中，我们可以通过v-model来实现双向绑定。

v-model即可以作用在普通表单元素上，🈶️可以作用在组件上，它其实是一个语法糖。
```JavaScript
// genDirectives(el, state)
// src/compiler/codegen/index.js

function genDirectives(el: ASTElement, state: CodegenState): string | void {
	const dirs = el.directives
	if (!dirs) return
	let res = 'directives:['
	let hasRuntime = false
	let i, l, dir, needRuntime
	// 遍历el.directives
	for (i = 0, l = dirs.length; i < l; i++){
		dir = dirs[i]
		needRuntime = true
		const gen: DirectiveFunction = state.directives[dir.name]
		if (gen) {
			// compile-time directive that manipulates AST.
			// returns true if it also needs a runtime counterpart.
			needRuntime = !!gen(el, dir, state.warn)
		}
		if (needRuntime) {
			hasRuntime = true
			res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
				dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}`
			: ''
			}${
				dir.arg ? `,arg:"${dir.arg}"` : ''
			}${
				dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
			}},`
		}
	}
	if (hasRuntime) {
		return res.slice(0, -1) + ']'
	}
}

// baseOptions: CompilerOptions
// src/platforms/web/compiler/options
export const baseOptions: CompilerOptions = {
	expectHTML: true,
	modules,
	directives,
	isPreTag,
	isUnaryTag,
	mustUseProp,
	canBeLeftOpenTag,
	isReservedTag,
	getTagNamespace,
	staticKeys: genStaticKeys(modules)
}

// directives
// src/platforms/web/compiler/directives/index.js
export default {
	model,
	text,
	html
}

//v-model directives
export default function model (
	el: ASTElement,
	dir: ASTDirective,
	_warn: Function
): ?boolean {
	warn = _warn
	const value = dir.value
	const modifiers = dir.modifiers
	const tag = el.tag
	const type = el.attrsMap.type
	
	if (process.env.NODE_ENV !== 'production') {
		// inputs with type="file" are read only and setting the input's
		// value will throw an error.
		if (tag === 'input' && type === 'file') {
			warn(
				`<${el.tag} v-model="${value}" type="file">:\n` +
				`File inputs are read only. Use a v-on:change listener instead.`
			)
		}
	}
	
	if (el.component) {
		genComponentModel(el, value, modifiers)
		// component v-model doesn't need extra runtime
		return false
	} else if (tag === 'select') {
		genSelect(el, value, modifiers)
	} else if (tag === 'input' && type === 'checkbox') {
		genCheckboxModel(el, value, modifiers)
	} else if (tag === 'input' && type === 'radio') {
		genRadioModel(el, value, modifiers)
	} else if (tag === 'input' || tag === 'textarea') {
		genDefaultModel(el, value, modifiers)
	} else if (!config.isReservedTag(tag)) {
		genComponentModel(el, value, modifiers)
		// component v-model doesn't need extra runtime
		return false
	} else if (process.env.NODE_ENV !== 'production'){
		warn(
			`<${el.tag} v-model="${value}">` +
			`v-model is not supported on this element type. ` +
			'If you are working with contenteditable, it\'s recommended to ' +
			'wrap a library dedicated for that purpose inside a custom component.'
		)
	}
	//ensure runtime directive metadata
	return true
}

// genDefaultModel
function genDefaultModel (
	el: ASTElement,
	value: string,
	modifiers: ?ASTModifiers
): ?boolean {
	const type = el.attrsMap.type
	
	// warn if v-bind:value conflicts with v-model
	// except for inputs with v-bind:type
	if (process.env.NODE_ENV !== 'production') {
		const value = el.attrsMap['v-bind:value'] || el.attrsMap[':value']
		const typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type']
		if (value && !typeBinding) {
			const binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value'
			warn(
				`${binding}="${value}" conflicts with v-model on the same element ` +
				'because the latter already expands to a value binding internally'
			)
		}
	}
	
	const { lazy, number, trim } = modifiers || {}
	const needCompositionGuard = !lazy && type !== 'range'
	const event = lazy
		? 'change'
		: type === 'range'
			? RANGE_TOKEN
			: 'input'
			
	let valueExpression = '$event.target.value'
	if (trim) {
		valueExpression = `$event.target.value.trim()`
	}
	if (number) {
		valueExpression = `_n(${valueExpression})`
	}
	
	let code = genAssignmentCode(value, valueExpression)
	if (needCompositionGuard) {
		// message=$event.target.value
		code = `if($event.target.composing)return;${code}`
	}
	addProp(el, 'value', `(${value})`)
	addHandler(el, event, code, null, true)
	if (trim || number) {
		addHandler(el, 'blur', '$forceUpdate()')
	}
}	

// genAssignmentCode
// src/compiler/directives/model.js
/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
export function genAssignmentCode (
	value: string,
	assignment: string
): string {
	const res = parseModel(value)
	if (res.key === null) {
		return `${value}=${assignment}`
	} else {
		return `$set(${res.exp}, ${res.ley}, ${assignment})`
	}
}
```
input实现v-model的精髓，通过修改AST元素，给el添加一个prop,相当于我们在input上动态绑定了value,
又给el添加了事件处理，相当于在input上绑定了input事件
<input v-bind:value="message" v-on:input="message=$event.target.value">
动态绑定了input的value指向了message变量，并且在触发input事件的时候去动态把message设置为目标值，
这样实际上就完成了数据双向绑定了，所以说v-model实际上就是语法糖
```JavaScirpt
let vm = new Vue({
	el: '#app',
	template: '<div>'
	+ '<input v-model="message" placeholder="edit me">' +
	'<p>Message is: {{ message }}</p>' +
	'</div>',
	data() {
		return {
			message: ''
		}
	}
})

with(this) {
	return _c('div', [_c('input', {
		directives: [{
			name: "model",
			rawName: "v-model",
			value: (message),
			expression: "message"
		}],
		attrs: {"placeholder": "edit me"},
		domProps: {"value": (message)},
		on: {"input": function($event){
			if($event.target.composiong)
				return;
			message=$event.target.value
		}}
	}),_c('p', [_v("Message is: " + _s(message))])
	])
}
```

## 组件
```JavaScript
let Child = {
	template: '<div>'
	+ '<input :value="value" @input="updateValue" placeholder="edit me">' +
	'</div>',
	props: ['value'],
	methods: {
		updateValue(e) {
			this.$emit('input', e.target.value)
		}
	}
}

let vm = new Vue({
	el: '#app',
	templage: '<div>' +
	'<child v-model="message"></child>' +
	'<p>Message is: {{ message }}</p>' +
	'</div>',
	data() {
		return {
			message: ''
		}
	},
	components: {
		Child
	}
})
```
对于父组件而言，在编译阶段会解析v-model指令，依然会执行genData函数中的genDirectives函数
接着执行src/platforms/web/compiler/directives/model.js
```JavaScript
else if (!config.isReservedTag(tag)) {
	genComponentModel(el, value, modifiers);
	return false
}

// genComponentModel
// src/compiler/directives/model.js
export function genComponentModel(
	el: ASTElement,
	value: string,
	modifiers: ?ASTModifiers
): ?boolean {
	const { number, trim } = modifiers || {}
	
	const baseValueExpression = '$$v'
	let valueExpression = baseValueExpression
	if (trim) {
		valueExpression =
			`(typeof ${baseValueExpression} === 'string'` +
			`? ${baseValueExpression}.trim()` +
			`: ${baseValueExpression})`
	}
	if (number) {
		valueExpression = `_n(${valueExpression})`
	}
	const assignment = genAssignmentCode(value, valueExpression)
	
	el.model = {
		value: `(${value})`,
		expression: `"${value}"`,
		callback: `function (${baseValueExpression}) {${assignment}}`
	}
	
	// 对应例子而言
	/**
	 * el.model = {
			callback: 'function ($$v) {message=$$v}',
			expression: '"message"',
			value: '(message)'
	   }
	 */
}
```

父组件最终生成的render代码如下：
```JavaScript
with(this) {
	return _c('div', [_c('child', {
		model: {
			value: (message),
			callback: function ($$v) {
				message=$$v
			},
			expression:"message"
		}
	}),
	_c('p', [_v("Message is: "+_s(message))])],1)
}
```
创建子组件vnode阶段，会执行createComponent函数
src/core/vdom/create-component.js
```JavaScript
export function createComponent (
	Ctor: Class<Component> | Function | Object | void,
	data: ?VNodeData,
	context: Component,
	children: ?Array<VNode>,
	tag?: string
): VNode | Array<VNode> | void {
	// transform component v-model data into props & events
	if (isDef(data.model)) {
		transformModel(Ctor.options, data)
	}
	
	// extract props
	const propsData = extractPropsFromVNodeData(data, Ctor, tag)
	// extract listeners, since these needs to be treated as
	// child component listeners instead of DOM listeners
	const listeners = data.on
	
	const vnode = new VNode(
		`vue-componet-${Ctor.cid}${name ? `-${name}` : ''}`,
		data, undefined, undefined, undefined, context,
		{ Ctor, propsData, listeners, tag, children},
		asyncFactory
	)
	
	return vnode
}

// transformModel(Ctor.options, data)
// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data: any) {
	const prop = (options.model && options.model.prop) || 'value'
	const event = (options.model && options.model.event) || 'input'
	;(data.props || (data.props = {}))[prop] = data.model.value
	const on = data.on || (data.on = {})
	if (isDef(on[event])) {
		on[event] = [data.model.callback].concat(on[event])
	} else {
		on[event] = data.model.callback
	}
}
```
transformModel 给data.props添加data.model.value，并且给dagta.on添加data.model.callback
```JavaScript
data.props = {
	value: (message),
}
data.on = {
	input: function ($$v) {
		message = $$v
	}
}
```
v-model是Vue双向绑定的真正实现，但本质上就是一种语法糖，它即可以支持原生表单元素，也可以支持自定义组件。
在组件的实现中，我们是可以配置子组件接收的prop名称，以及派发的事件名称。

## slot
## 编译
编译是发生在调用vm.$mount的时候，所以编译的顺序是先编译父组件，再编译子组件。
首先编译父组件，在parse阶段，执行processSlot处理slot
```JavaScript
// src/compiler/parse/index.js
// 当解析到标签上有slot属性的时候，会给对应的AST元素节点添加slotTarget属性，
// 然后在codegen阶段，在genData中会处理slotTarget
function processSlot (el) {
	if (el.tag === 'slot') {
		el.slotName = getBindingAttr(el, 'name')
		if (process.env.NODE_ENV !== 'production' && el.key) {
			warn(
				`\`key\` dose not work on <slot> because slots are abstract outlets ` +
				`and can possibly expand into multiple elements. ` +
				`Use the key on a wrapping element instead.`
			)
		}
	} else {
		let slotScope
		if (el.tag === 'template') {
			slotScope = getAndRemoveAttr(el, 'scope')
			/* istanbul ignore if */
			if (process.env.NODE_ENV !== 'production' && slotScope) {
				warn(
					`the "scope" attribute for scoped slots have been deprecated and ` +
					`replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
					`can also be used on plain elements in addition to <template> to ` +
					`denote scoped slots.`
					true
				)
			}
			el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
		} else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
			/* istanbul ignore if */
			if (process.env.NODE_ENV !== 'production' && el.attrsMap['v-for']) {
				warn(
					`Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
					`(v-for takes higher priority). Use a wrapper <template> for the ` +
					`scoped slot to make it clearer.`,
					true
				)
			}
			el.slotScope = slotScope
		}
		const slotTarget = getBindingAttr(el, 'slot')
		if (slotTarget) {
			el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
			// preserve slot as an attribute for native shadow DOM compat
			// only for non-scoped slots.
			if (el.tag !== 'template' && !el.slotScope) {
				addAttr(el, 'slot', slotTarget)
			}
		}
	}
}

//src/compiler/codegen/index.js
// 会给data添加一个slot属性，并指向slotTarget
if (el.slotTarget && !el.slotScope) {
	data += `slot:${el.slotTarget},`
}

// 编译子组件，在parse阶段会执行processSlot处理函数
// src/compiler/parse/index.js
function processSlot (el) {
	if (el.tag === 'slot') {
		el.slotName = getBindingAttr(el, 'name')
	}
}

// 在codegen阶段会判断如果当前AST元素节点是slot标签，则执行genSlot函数
// src/compiler/codegen/index.js
function genSlot (el: ASTElement, state: CodegenState): string {
	const slotName = el.slotName || '"default"'
	const children = genChildren(el, state)
	let res = `_t(${slotName}${children ? `,${children}` : ''})`
	const attrs = el.attrs && `{${el.attrs.map(a => `${camelize(a.name)}:${a.value}`).join(',')}}`
	const bind = el.attrsMap['v-bind']
	if ((attrs || bind) && !children) {
		res += `,null`
	}
	if (attrs) {
		res += `,${attrs}`
	}
	if (bind) {
		res += `${attrs ? '' : ',null'},${bind}`
	}
	return res + ')'
}

// 先不考虑slot标签上有attrs以及v-bind的情况
const slotName = el.slotName || '"default"'
const children = genChildren(el, state)
let res = `_t(${slotName}${children ? `,${children}` : ''})`
```
子组件最终生成的代码：
```JavaScript
with(this) {
	return _c('div', {
		staticClass: "container"
	}, [
		_c('header', [_t("header")], 2),
		_c('main', [_t("default", [_v("默认内容")])], 2),
		_c('footer', [_t("footer")],2)
	])
}
```

_t对应的就是renderSlot方法
src/core/instance/render-helpers/render-slot.js
```JavaScript
/**
 * Runtime helper for rendering <slot>
 */
export function renderSlot (
	// 插槽名称
	name: string,
	// 插槽默认内容生成的vnode数组
	fallback: ?Array<VNode>,
	props: ?Object,
	bindObject: ?Object
): ?Array<VNode> {
	const scopedSlotFn = this.$scopedSlots[name]
	let nodes
	if (scopedSlotFn) { // scoped slot
		props = props || {}
		if (bindObject) {
			if (process.env.NODE_ENV !== 'production' && !isObject(bindObject)) {
				warn(
					'slot v-bind without argument expects an Object',
					this
				)
			}
			props = extend(extend({}, bindObject), props)
		}
		nodes = scopedSlotFn(props) || fallback
	} else {
		const slotNodes = this.$slots[name]
		// warn duplicate slot usage
		if (slotNodes) {
			if (process.env.NODE_ENV !== 'production' && slotNodes._rendered) {
				warn(
					`Duplicate presence of slot "${name}" found in the same render tree ` +
					`- this will likely cause render errors.`,
					this
				)
			}
			slotNodes._rendered = true
		}
		nodes = slotNodes || fallback
	}
	
	const target = props && props.slot
	if (target) {
		return this.$createElement('template', { slot: target }, nodes)
	} else {
		return nodes
	}
}

// initRender
// src/core/instance/render.js
export function initRender (vm: Component) {
	// ...
	const parentVnode = vm.$vnode = options._parentVnode
	// the placeholder node in parent tree
	const renderContext = parentVnode && parentVnode.context
	vm.$slots = resolveSlots(options._renderChildren, renderContext)
}

// resolveSlots
// src/core/instance/render-helpers/resolve-slot.js
/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
// 遍历 children
export function resolveSlots (
	// 父vnode的children
	children: ?Array<VNode>,
	// 父vnode的上下文
	context: ?Component
): { [key: string]: Array<VNode> } {
	const slots = {}
	if (!children) {
		return slots
	}
	for (let i = 0, l = children.length; i < l; i++) {
		const child = chilldren[i]
		const data = child.data
		// remove slot attribute if the node is resolved as a Vue slot node
		if (data && data.attrs && data.attrs.slot) {
			delete data.attrs.slot
		}
		// named slots should only be respected if the vnode was rendered in the
		// same context.
		if ((child.context === context || child.fnCcontext === context) &&
			data && data.slot != null
		) {
			const name = data.slot
			const slot = (slots[name] || (slots[name] = []))
			if (child.tag === 'template') {
				slot.push.apply(slot, child.children || [])
			} else {
				slot.push(child)
			}
		} else {
			(slots.default || (slots.default = [])).push(child)
		}
	}
	// ignore slots that contains only whitespace
	for (const name in slots) {
		if (slots[name].every(isWhitespace)) {
			delete slots[name]
		}
	}
	return slots
}
```

## 作用域插槽
<slot text="hello" :msg="msg"></slot>
<template slot-scope="props"></template>
子组件的slot标签多了text属性，以及msg属性。父组件实现插槽的部分多了一个template标签，
以及scope-slot属性，其实在Vue2.5，scoped-slot可以作用在普通元素上。

先编译父组件，同样是通过processSlot函数去处理scoped-slot，它的定义在
```JavaScript
// src/compiler/parse/index.js
function processSlot (el) {
	// ...
	if (el.tag === 'template') {
		slotScope = getAndRmoveAttr(el, 'scope')
		/* istanbul ignore if */
		if (process.env.NODE_ENV !== 'production' && slotScope) {
			warn(
				`the "scope" attribute for scoped slots have been deprecated and ` +
				`replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
				`can also be used on plain elements in addition to <template> to ` +
				`denote scoped slots.`,
				true
			)
		}
		el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
	} else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
		/* istanbul ignore if */
		if (process.env.NODE_ENV !== 'production' && el.attrsMap['v-for']) {
			warn(
				`Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
				`(v-for takes higher priority). Use a wrapper <template> for the ` +
				`scoped slot to make it clearer.`,
				true
			)
		}
		el.slotScope = slotScope
	}
}
```

读取scoped-slot 属性并赋值给当前ast元素节点的slotScope属性，
构建ast

对于用于scopedSlot属性的AST元素节点而言，是不会作为children添加到当前AST树中，
而是存到父AST元素节点的scopedSlots属性上，它是一个对象，以插槽名称name为key
```JavaScript
if （element.elseif || element.else) {
	processIfConditions(element, currentParent)
} else if (element.slotScope) {
	currentParent.plain = false
	const name = element.slotTarget || '"default"'
	;(currentParent.scopedSlots || (currentParent.scopedSlotss = {}))[name] = element
} else {
	currentParent.children.push(element)
	element.parent = currentParent
}
```

genData
```JavaScript
if (el.scopedSlots) {
	data += `${genScopedSlots(el.scopedSlots, state)},`
}

function genScopedSlots (
	slots: { [key: string]: ASTElement },
	state: CodegenState
): string {
	return `scopedSlots:_u([${
		Object.keys(slots).map(key => {
			return genScopedSlot(key, slots[key], state)
		}).join(',')
	}])`
}

// genScopedSlots就是对scopedSlots对象遍历，执行genScopedSLOT
function genScopedSlot (
	key: string,
	el: ASTElement,
	state: CodegenState
): string {
	if (el.for && !el.forProcessed) {
		return genForScopedSlot(key, el, state)
	}
	const fn = `function(${String(el.slotScope)}){` +
	`return ${el.tag === 'template'
		? el.if
			? `${el.if}?${genChildren(el, state) || 'undefined'}:undefined`
			: genChildren(el, state) || 'undefined'
		: genElement(el, state)
	}}`
	return `{key:{key}, fn:${fn}}`
}
```

普通插槽和作用域插槽的实现。它们有一个很大的差别是数据作用域，普通插槽是在父组件编译和渲染阶段生成vnodes，
所以数据的作用域是父组件实例，子组件渲染的时候直接拿到这些渲染好的vnodes。而对于作用域插槽，父组件在编译
和渲染阶段并不会直接生成vnodes，而是在父节点vnode的data中保留一个scopedSlots对象，存储着不同名称的插槽
以及它们对应的渲染函数，只有在编译和渲染子组件阶段才会执行这个渲染函数生成Vnodes，由于是在子组件环境执行的，
所以对应的数据作用域是子组件实例。

## keep-alive
内置组件
keep-alive 组件的实现也是一个对象，它有一个属性abstract为true，是一个抽象组件
```JavaScript
export default {
	name: 'keep-alive',
	abstract: true,
	
	props: {
		// 只有匹配的组件会被缓存
		include: patternTypes,
		// 任何匹配的组件都不会被缓存
		exclude: patternTypes,
		// 缓存大小
		max: [String, Number]
	},
	
	// 它就是去缓存已经创建过的vnode
	created () {
		this.cache = Object.create(null)
		this.keys = []
	},
	
	destroyed () {
		for (const key in this.cache) {
			pruneCacheEntry(this.cache, key, this.keys)
		}
	},
	
	mounted () {
		this.$watch('include', val=> {
			pruneCache(this, name => matches(val, name))
		})
		this.$watch('exclude', val => {
			pruneCache(this, name => !matches(val, name))
		})
	},
	
	render () {
		// 获取第一个子元素的 vnode:
		const slot = this.$slot.default
		const vnode: VNode = getFirstComponentChild(slot)
		const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
		if (componentOptions) {
			// check pattern
			const name: ?string = getComponentName(componentOptions)
			const { include, exclude } = this
			if (
				// not included
				(include && (!name || !matches(include, name))) ||
				// excluded
				(exclude && name && matches(exclude, name))
			) {
				return vnode
			}
			
			const { cache, keys } = this
			const key: ?string = vnode.key == null
			// same constructor may get registered as different local components
			// so cid alone is not enough
			? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
			: vnode.key
			if (cache[key]) {
				vnode.componentInstance = cache[key].componentInstance
				// make current key freshest
				remove(keys, key)
				keys.push(key)
			} else {
				cache[key] = vnode
				keys.push(key)
				// prune oldest entry
				if (this.max && keys.length > parseInt(this.max)) {
					pruneCacheEntry(cache, keys[0], keys, this._vnode)
				}
			}
			
			vnode.data.keepAlive = true
		}
		return vnode || (slot && slot[0])
	}
}

// 判断当前组件的名称和include、exclude的关系
// check pattern
const name: ?string = getComponentName(componentOptions)
const { include, exclude } = this
if (
	// not included
	(include && (!name || !matches(include, name))) ||
	// excluded
	(exclude && name && matches(exclude, name))
) {
	return vnode
}

// 判断是否是数组、字符串、正则表达式 匹配的话直接返回这个组件的vnode,否则的话走下一步缓存；
function matches (pattern: stringb| RegExp | Array<string>, name: string): boolean {
	if(Array.isArray(pattern)) {
		return pattern.indexOf(name) > -1
	} else if (typeof pattern === 'string') {
		return pattern.split(',').indexOf(name) > -1
	} else if (isRegExp(pattern)) {
		return pattern.test(name)
	}
	return false
}

const {cache, keys} = this
const key: ?string = vnode.key == null
// same constructor may get registered as different local components
// so cid alone is not enough
	? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}`
	: '')
		: vnode.key
	// 如果命中缓存，则直接从缓存中拿vnode的组件实例，并且重新调整了key的顺序放在最后一个
	if (cache[key]) {
		vnode.componentInstance = cache[key].componentInstance
		// make current key freshest
		remove(keys, key)
		keys.push(key)
	} else {
		// 否则把vnode设置进缓存
		cache[key] = vnode
		keys.push(key)
		// prune oldest entry
		// 如果配置了max并且max的长度超过了this.max，还要从缓存中删除第一个；
		if (this.max && keys.length > parseInt(this.max)) {
			pruneCacheEntry(cache, keys[0], keys, this._vnode)
		}
	}

// 判断如果删除的缓存中的组件tag不是当前渲染组件tag，也执行
// 删除缓存的组件实例的$destroy方法
// 最后设置vnode.data.keepAlive = true
function pruneCacheEntry (
	cache: VNodeCache,
	key: string,
	keys: Array<string>,
	current?: VNode
) {
	const cached = cache[key]
	if (cached && (!current || cached.tag !== current.tag)) {
		cached.componentInstance.$destroy()
	}
	cache[key] = null
	remove(keys, key)
}

// <keep-alive>组件也是为观测include和exclude的变化，对缓存做处理：
watch: {
	include (val: string | RegExp | Array<string>) {
		pruneCache(this, name => matches(val, name))
	},
	exclude (val: string | RegExp | Array<string>) {
		pruneCache(this, name => !matches(val, name))
	}
}

// 对cache 遍历，发现缓存的节点名称和新的规则没有匹配上的时候，就把这个缓存节点从缓存中摘除。
function pruneCache (keepAliveInstance: any, filter: Function){
	const { cache, keys, _vnode } = keepAliveInstance
	for (const key in cache) {
		const cachedNode: ?VNode = cache[key]
		if (cachedNode) {
			const name: ?string = getComponentName(cachedNode.componentOptions)
			if (name && !filter(name)) {
				pruneCacheEntry(cache, key, keys, _vnode)
			}
		}
	}
}
```

## 组件渲染
keep-alive组件包裹的子组件渲染，首次渲染和缓存渲染

## 首次渲染
Vue的渲染最后都会到patch过程，而组件的patch过程会执行createComponent方法
src/core/vdom/patch.js
```JavaScript
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
	let i = vnode.data
	if (isDef(i)) {
		// 第一次渲染的时候 vnode.componentInstance为undefined
		const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
		if (isDef(i = i.hook) && isDef(i = i.init)) {
			i(vnode, false)
		}
		// after calling the init hook, if the vnode is a child component
		// it should've created a child instance and mounted it. the child
		// component also has set the placeholder vnode's elm.
		// in that case we can just return the element and be done.
		if (isDef(vnode.componentInstance)) {
			initComponent(vnode, insertedVnodeQueue)
			insert(parentElm, vnode.elm, refElm)
			if (isTrue(isReactivated)) {
				reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
			}
			return true
		}
	}
}

// initComponent
function initComponent (vnode, insertedVnodeQueue) {
	if (isDef(vnode.data.pendingInsert)) {
		insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
		vnode.data.pendingInsert = null
	}
	vnode.elm = vnode.componentInstance.$el
	if (isPatchable(vnode)) {
		invokeCreateHooks(vnode, insertedVnodeQueue)
		setScope(vnode)
	} else {
		// empty component root.
		// skip all element-related modules except for ref
		registerRef(vnode)
		// make sure to invoke the insert hook
		insertedVnodeQueue.push(vnode)
	}
}
```

## 缓存渲染
```JavaScript
// prepatch
// src/core/vdom/create-component
const componentVNodeHooks = {
	prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
		const options = vnode.componentOptions
		const child = vnode.componentInstance = oldVnode.componentInstance
		updateChildComponent(
			child,
			options.propsData, // updated props
			options.listeners, // update listeners
			vnode, // new parent vnode
			options.children // new children
		)
	}
}

// updateChildComponent
// 更新组件实例的一些属性
// src/core/instance/lifecycle.js
export function updateChildComponent (
	vm: Component,
	propsData: ?Object,
	listeners: ?Object,
	parentVnode: MountedComponentVNode,
	renderChildren: ?Array<VNode>
) {
	const hasChildren = !!(
		renderChildren ||
		vm.$options._renderChildren ||
		parentVnode.data.scopedSlots ||
		vm.$scopedSlots !== emptyObject
	)
	
	if (hasChildren) {
		vm.$slots = resolveSlots(renderChildren, parentVnode.context)
		// 重新执行<keep-alive> render方法
		vm.$forceUpdate()
	}
}
```

```JavaScript
// init
// src/core/vdom/create-component.js
const componentVNodeHooks = {
	init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
		if (
			vnode.componentInstance &&
			!vnode.componentInstance._isDestroyed &&
			vnode.data.keepAlive
		) {
			// kept-alive components, treat as a patch
			const mountedNode: any = vnode // work around flow
			componentVNodeHooks.prepatch(mountedNode, mountedNode)
		} else {
			const child = vnode.componentInstance = createComponentInstanceForVnode(
				vnode,
				activeInstance
			)
			child.$mount(hydrating ? vnode.elm : undefined, hydrating)
		}
	},
}

function reactiveComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
	let i
	let innerNode = vnode
	while (innerNode.componentInstance) {
		innerNode = innerNode.componentInstance._vnode
		if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
			for (i = 0; i < cbs.activate.length; ++i) {
				cbs.activate[i](emptyNode, innerNode)
			}
			insertedVnodeQueue.push(innerNode)
			break
		}
	}
	// unlike a newly created component
	// a reactivated keep-alive component doesn't insert itself
	// 把缓存的DOM对象直接插入到目标元素中，这样就完成了在数据更新的情况下的渲染过程
	insert(parentElm, vnode.elm, refElm)
}
```

### 生命周期
activated keep-alive包裹的组件渲染的时候
在渲染的最后一步  会执行invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
```JavaScript
// src/core/vdom/create-component.js
const componentVNodeHooks = {
	insert (vnode: MountedComponentVNode) {
		const { context, componentInstance } = vnode
		if (!componentInstance._isMounted) {
			componentInstance._isMounted = true
			callHook(componentInstance, 'mounted')
		}
		if (vnode.data.keepAlive) {
			if (context._isMounted) {
				// During updates, a kept-alive component's child components may
				// change, so directly walking the tree here may call activated hooks
				// on incorrect children. Instead we push them into a queue which will
				// be processed after the whole patch process ended.
				queueActivatedComponent(componentInstance)
			} else {
				activateChildComponent(componentInstance, true)
			}
		}
	}
}

// activateChildComponent
// src/core/instance/lifecycle.js
export function activateChildComponent (vm: Component, direct?: boolean) {
	if (direct) {
		vm._directInactive = false
		if (isInInactiveTree(vm)) {
			return
		}
	} else if (vm._directInactive) {
		return
	}
	if (vm._inactive || vm._inactive === null) {
		vm._inactive = false
	}
	for (let i = 0; i < vm.$children.length; i++) {
		activateChildComponent(vm.$children[i])
	}
	callHook(vm, 'activated')
}

// queueActivatedComponent
// src/core/observer/scheduler.js
// 把当前vm实例添加到activatedChildren数组中，等所有的渲染完毕
// 在nextTick后执行flushSchedulerQueue
export function queueActivatedComponent ( vm: Component) {
	vm._inactive = false
	activatedChildren.push(vm)
}

// 遍历所有的activatedChildren 执行activateChildComponent
// 通过队列的方式把整个activated时机延后了
function flushSchedulerQueue() {
	// ...
	const activatedQueue = activatedChildren.slice()
	callActivatedHooks(activatedQueue)
	// ...
}

function callActivatedHooks (queue) {
	for (let i = 0; i < queue.length; i++) {
		queue[i]._inactive = true
		activateChildComponent(queue[i], true)
	}
}
```

activated钩子函数 对应deactivated钩子函数 发生在vnode的destory钩子函数
```JavaScript
// src/core/vdom/create-component.js
const componentVNodeHooks = {
	destroy (vnode: MountedComponentVNode) {
		const { componentInstance } = vnode
		if (!componentInstance._isDestroyed) {
			if (!vnode.data.keepAlive) {
				componentInstance.$destroy()
			} else {
				deactivateChildComponent(componentInstance, true)
			}
		}
	}
}

//src/core/instance/lifecycle.js
export function deactivateChildComponent (vm: Component, direct?: boolean) {
	if (direct) {
		vm._directInactive = true
		if (isInInactiveTree(vm)) {
			return
		}
	}
	if (!vm._active) {
		vm._inactive = true
		for (let i = 0; i < vm.$children.length; i++) {
			deactivateChildComponent(vm.$children[i])
		}
		callHook(vm, 'deactivated')
	}
}
```
<keep-alive>组件是一个抽象组件，它的实现通过自定义render函数并且利用了插槽，并且<keep-alive>缓存vnode,
了解组件包裹的子元素———也就是插槽是如何做更新的。且在patch过程中对于已缓存的组件不会执行mounted，没有一般组件的
生命周期但是又提供了activated和deactivated钩子函数。keep-alive的props除了include和exclude还有max,它能
控制我们缓存的个数。

## transition
过渡效果：
条件渲染
条件展示
动态组件
组件根节点
```JavaScript
let vm = new Vue({
	el: "#app",
	template: '<div id="demo">' +
	'<button v-on:click="show = !show">' +
	'Toggle' +
	'</button>' +
	'<transition :appear="true" name="fade">' +
	'<p v-if="show">hello</p>' +
	'<transition>' +
	'</div>',
	data() {
		return {
			show: true
		}
	}
})

.fade-enter-active, .fade-leave-active {
	transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
	opacity: 0;
}
```

### 内置组件
transition 组件是web平台独有的
```JavaScript
// src/platforms/web/runtime/component/transition.js

export default {
	name: 'transition',
	props: transitionProps,
	abstract: true,
	
	render (h: Function) {
		// render 函数主要作用就是渲染生成vnode
		// 处理 children
		let children: any = this.$slots.default
		if (!children) {
			return
		}
		
		// filter out text nodes (possible whitespaces)
		children = children.filter((c: VNode) => c.tag || isAsyncPlaceholder(c))
		/* istanbul ignore if */
		if (!children.length) {
			return
		}
		
		// warn multiple elements
		if (process.env.NODE_ENV !== 'production' && children.length > 1) {
			warn(
				'<transition> can only be used on a single element. Use ' +
				'<transition-group> for lists.',
				this.$parent
			)
		}
		
		// 处理model
		// 过渡组件对mode的支持只有2种，in-out或者是out-in
		const mode: string = this.mode
		
		// warn invalid mode
		if (process.env.NODE_ENV !== 'production' &&
			mode && mode !== 'in-out' && mode !== 'out-in'
		) {
			warn(
				'invalid <transitino> mode: ' + mode,
				this.$parent
			)
		}
		
		// 获取rawChild & child
		// 第一个子节点 vnode
		const rawChild: VNode = children[0]
		
		// if this is a component root node and the component's
		// parent container node also has transition, skip.
		if (hasParentTransition(this.$vnode)) {
			return rawChild
		}
		
		// apply transition data to child
		// use getRealChild() to ignore abstract components e.g. keep-alive
		const child: ?VNode = getRealChild(rawChild)
		/* istanbul ignore if */
		if (!child) {
			return rawChild
		}
		
		if (this._leaving) {
			return placeholder(h, rawChild)
		}
		
		// 处理 id & data
		// ensure a key that is unique to the vnode type and to this transition
		// component instance. This key will be used to remove pending leaving nodes
		// during entering.
		const id: string = `__transition-${this._uid}-`
		child.key = child.key == null
			? child.isComment
				? id + 'comment'
				: id + child.tag
			: isPrimitive(child.key)
				? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
				: child.key
		
		const data: Object = (child.data || (child.data = {})).transition = extractTransitionData(this)
		const oldRawChild: VNode = this._vnode
		const oldChild: VNOde = getRealChild(oldRawChild)
		
		// mark v-show
		// so that the transition module can hand over the control to the directive
		if (child.data.directives && child.data.directives.some(d => d.name === 'show')) {
			child.data.show = true
		}
		
		if (
			oldChild &&
			oldChild.data &&
			!isSameChild(child, oldChild) &&
			!isAsyncPlaceholder(oldChild) &&
			// component root is a comment node
			!(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
		) {
			// replace old child transition data with fresh one
			// important for dynamic transitions!
			const oldData: Object = oldChild.data.transition = extend({}, data)
			// handle transition mode
			if (mode === 'out-in') {
				// return placeholder node an queue update when leave finishes 
				this._leaving = true
				mergeVNodeHook(oldData, 'afterLeave', () => {
					this._leaving = false
					this.$forceUpdate()
				})
				return placeholder(h, rawChild)
			} else if (mode === 'in-out') {
				if (isAsyncPlaceholder(child)) {
					return oldRawChild
				}
				let delayedLeave
				const performLeave = () => { delayedLeave() }
				mergeVNodeHook(data, 'afterEnter', performLeave)
				mergeVNodeHook(data, 'enterCancelled', performLeave)
				mergeVNodeHook(oldData, 'delayLeave', leave => { delayedLeave = leave})
			}
		}
		
		return rawChild
	}
}
```

transition 是抽象组件，直接实现了render函数，同样利用了默认插槽，支持的props非常多
```JavaScript
export const transitionProps = {
	name: String,
	appear: Boolean,
	css: Boolean,
	mode: String,
	type: String,
	enterClass: String,
	leaveClass: String,
	enterToClass: String,
	leaveToClass: String,
	enterActiveClass: String,
	leaveActiveClass: String,
	appearClass: String,
	appearActiveClass: String,
	appearToClass: String,
	duration: [Number, String, Object]
}

// hasParentTransition
// vnode 是transition 组件的占位vnode,只有当它同时作为根vnode，它的parent才不会为空
// 并且判断parent也是 <transition>组件，才会回true
function hasParentTrasition (vnode: VNode): ?boolean {
	while ((vnode = vnode.parent)) {
		if (vnode.data.transtion) {
			return true
		}
	}
}

// getRealChild 的目的是获取组件的非抽象子节点，因为<transition>很可能会包裹一个keep-alive
// in case the child is alos an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode: ?VNode): ?VNode {
	const compOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
	if (compOptions && compOptions.Ctor.options.abstract) {
		return getRealChild(getFirstComponentChild(compOptions.children))
	} else {
		return vnode
	}
}

// extractTransitionData
export function extractTransitionData (comp: Component): Object {
	const data = {}
	const options: ComponentOptions = comp.$options
	// props
	// 遍历props 赋值到data中
	for (const key in options.propsData) {
		data[key] = comp[key]
	}
	// 遍历所有父组件的事件，把事件回调赋值到data中
	// events.
	// extract listeners and pass them directly to the transition methods
	const listeners: ?Object = options._parentListeners
	for (const key in listeners) {
		data[camelize(key)] = listeners[key]
	}
	return data
}
```
transition module
动画
src/platforms/web/modules/transition.js
```JavaScript
function _enter (_: any, vnode: VNodeWithData) {
	if (vnode.data.show !== true) {
		enter(vnode)
	}
}

export default inBrowser ? {
	create: _enter,
	activate: _enter,
	remove (vnode: VNode, rm: Function) {
		/* istanbul ignore else */
		if (vnode.data.show !== true) {
			leave(vnode, rm)
		} else {
			rm()
		}
	}
} : {}
```

### entering 
整个entering过程的实现是enter函数
```JavaScript
export function enter (vnode: VNodeWithData, toggleDisplay: ?() => void) {
	const el: any = vnode.elm
	
	// call leave callback now
	if (isDef(el._leaveCb)) {
		el._leaveCb.cancelled = true
		el._leaveCb()
	}
	
	// 解析过渡数据
	const data = resolveTransition(vnode.data.transition)
	if (isUndef(data)) {
		return
	}
	
	if (isDef(el._enterCb) || el.nodeType !== 1) {
		return
	}
	
	const {
		css,
		type,
		enterClass,
		enterToClass,
		enterActiveClass,
		appearClass,
		appearToClass,
		appearActiveClass,
		beforeEnter,
		enter,
		afterEnter,
		enterCancelled,
		beforeAppear,
		appear,
		afterAppear,
		appear,
		afterAppear,
		appearCancelled,
		duration
	} = data
	
	// 处理边界情况
	// activeInstance will always be the <transition> component managing this
	// transition. One edge case to check is when the <transition> is placed
	// as the root ndoe of a child component. In that case we need to check
	// <transition>'s parent for appear check.
	let context = activeInstance
	// 作为子组件的根节点
	let transitionNode = activeInstance.$vnode
	while (transitionNode && transitionNode.parent) {
		transitionNode = transitionNode.parent
		context = transitionNode.context
	}
	
	// 表示当前上下文实例还没有mounted
	const isAppear = !context._isMounted || !vnode.isRootInsert
	
	// 如果是第一次并且<transition>组件没有配置appear的话 直接返回
	if (isAppear && !appear && appear !== '') {
		return
	}
	
	// 定义过渡类名、钩子函数和其它配置
	// startClass定义进入过渡的开始状态，在元素被插入时生效，在下一个帧移除；
	const startClass = isAppear && appearClass
		? appearClass
		: enterClass
	// 定义过渡的状态，在元素整个过渡过程中作用，在元素被插入时生效，在transition/animation完成后移除；
	const activeClass = isAppear && appearActoveClass
		? appearActiveClass
		: enterActiveClass
	// 定义进入过渡的结束状态，在元素被插入一帧后生效，在<transition>/animation完成之后移除
	const toClass = isAppear && appearToClass
		? appearToClass
		: enterToClass
	
	// 过渡开始前执行的钩子函数
	const beforeEnterHook = isAppear
		? (beforeAppear || beforeEnter)
		: beforeEnter
	// 在元素插入后或者是v-show显示切换后执行的钩子函数
	cosnt enterHook = isAppear
		? (typeof appear === 'function' ? appear : enter)
		: enter
	// 在过渡动画执行完后的钩子函数
	const afterEnterHook = isAppear
		? (afterAppear || afterEnter)
		: afterEnter
	const enterCancelledHook = isAppear
		? (appearCancelled || enterCancelled)
		: enterCancelled
	// 表示enter动画执行的时间
	const explicitEnterDuration: any = toNumber(
		isObject(duration)
			? duration.enter
			: duration
	)
	
	if (process.env.NODE_ENV !== 'production' && explicitEnterDuration != null) {
		checkDuration(explicitEnterDuration, 'enter', vnode)
	}
	
	const expectsCSS = css !== false && !isIE9
	const userWantsControl = getHookArgumentsLength(enterHook)
	// cb 定义的是过渡完成执行的回调函数
	const cb = el._enterCb = once(() => {
		if (expectsCSS) {
			removeTransitionClass(el, toClass)
			removeTransitionClass(el, activeClass)
		}
		if (cb.cancelled) {
			if (expectsCSS) {
				removeTransitionClass(el, startClass)
			}
			enterCancelledHook && enterCancelledHook(el)
		} else {
			afterEnterHook && afterEnterHook(el)
		}
		el._enterCb = null
	})
	// 合并insert钩子函数
	if (!vnode.data.show) {
		// remove pending leave element on enter by injecting an insert hook
		mergetVNodeHook(vnode, 'insert', () => {
			const parent = el.parentNode
			const pendingNode = parent && parent_pending && parent._pending[vnode.key]
			if (pendingNode &&
				pendingNode.tag === vnode.tag && 
				pendingNode.elm._leaveCb
			) {
				pendingNode.elm._leaveCb()
			}
			enterHook && enterHook(el, cb)
		})
	}
	
	// start enter transition
	// 开始执行过渡动画
	// 首先执行beforeEnterHook钩子函数，把当前元素的DOM节点el传入，然后判断expectsCSS
	// 如果为true则表明希望用CSS来控制动画，
	beforeEnterHook && beforeEnterHook(el)
	if (expectsCSS) {
		addTransitionClass(el, startClass)
		addTransitionClass(el, activeClass)
		nextFrame(() => {
			removeTransitionClass(el, startClass)
			if (!cb.cancelled) {
				addTransitionClass(el, toClass)
				if (!userWantsControl) {
					if (isValidDuration(explicitEnterDuration)) {
						setTimeout(cb, explicitEnterDuration)
					} else {
						whenTransitionEnds(el, type, cb)
					}
				}
			}
		})
	}
	
	if (vnode.data.show) {
		toggleDisplay && toggleDisplay()
		enterHook && enterHook(el, cb)
	}
	
	if (!expectsCSS && !userWantsControl) {
		cb()
	}
}

// src/platforms/web/transition-util.js
// 通过autoCssTransition 处理name属性，生成一个用来描述各个阶段的Class名称的对象
// 扩展到def中并返回给data
export function resolveTransition (def?: string | Object): ?Object {
	if (!def) {
		return
	}
	if (typeof def === 'object') {
		const res = {}
		if (def.css !== false) {
			extend(res, autoCssTransition(def.name || 'v'))
		}
		extend(res, def)
		return res
	} else if (typeof def === 'string') {
		return autoCssTransition(def)
	}
}

const autoCssTransition: (name: string) => Object = cached(name => [
	return {
		enterClass: `${name}-enter`,
		enterToClass: `${name}-enter-to`,
		enterActiveClass: `${name}-enter-active`,
		leaveClass: `${name}-leave`,
		leaveToClass: `${name}-leave-to`,
		leaveActiveClass: `${name}-leave-active`
	}
])

// mergeVNodeHook
// src/core/vdom/helpers/merge-hook.js
// 把hook函数合并到def.data.hook[hookey] 生成新的invoker
export function mergeVNodeHook (def: Object, hookKey: string, hook: Function) {
	if (def instanfeof VNode) {
		def = def.data.hook || (def.data.hook = {})
	}
	let invoker
	const oldHook = def[hookkey]
	
	function wrappedHook () {
		hook.apply(this, arguments)
		// important: remove merge hook to ensure it's called only once
		// and prevent memory leak
		remove(invoker.fns, wrappedHook)
	}
	
	if (isUndef(oldHook)) {
		// no existing hook
		invoker = createFnInvoker([wrappedHook])
	} else {
		if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
			// already a merged invoker
			invoker = oldHook
			invoker.fns.push(wrappedHook)
		} else {
			// existing plain hook
			invoker = createFnInvoker([oldHook, wrappedHook])
		}
	}
	invoker.merged = true
	def[hookKey] = invoker
}

// addTransitionClass
// src/platforms/runtime/transition-util.js
// 给当前DOM元素el添加样式cls 所以这里添加了startClass和activeClass
export function addTransitionClass (el: any, cls: string) {
	const transitionClasses = el._transitionClasses || (el._transitionClasses = [])
	if (transitionClasses.indexOf(cls) < 0) {
		transitionClasses.push(cls)
		addClass(el, cls)
	}
}

// nextFrame:
// 它的参数fn会在下一帧执行，因此下一帧执行removeTransitionClass(el, startClass)
const raf = inBrowser 
	? window.requestAnimationFrame
		? window.requestAnimationFrame.bind(window)
		: setTimeout
	: fn => fn()
	
export function nextFrame (fn: Function) {
	raf(() => {
		raf(fn)
	})
}

// 把startClass，如果用户执行了explicitEnterDuration，则延时这个时间执行cb，
// 否则通过whenTransitionEnds(el, type, cb)决定执行cb的时机：
export function removeTransitionClass (el: any, cls: string) {
	if (el._transitionClasses) {
		remove(el._transitionClasses, cls)
	}
	removeClass(el, cls)
}

// 本质上利用了过渡动画的结束事件来决定cb函数的执行
export function whenTransitionEnds (
	el: Element,
	expectedType: ?string,
	cb: Function
) {
	const { type, timeout, propCount } = getTransitionInfo(el, expectedType)
	if (!type) return cb()
	const event: string = type === <transition> ? transitionEndEvent : animationEndEvent
	let ended = 0
	const end = () => {
		el.removeEventListener(event, onEnd)
		cb()
	}
	const onEnd = e => {
		if (e.target === el) {
			if (++ended >= propCount) {
				end()
			}
		}
	}
	setTimeout(() => {
		if (ended < propCount) {
			end()
		}
	}, timeout + 1)
	el.addEventListener(event, onEnd)
}

// cb
const cb = el._enterCb = once(() => {
	// 移除 toClass 和 activeClass
	if (expectsCSS) {
		removeTransitionClass(el, toClass)
		removeTransitionClass(el, activeClass)
	}
	if (cb.cancelled) {
		// 移除startClass
		if (expectsCSS) {
			removeTransitionClass(el, startClass)
		}
		enterCancelledHook && enterCancelledHook(el)
	} else {
		afterEnterHook && afterEnterHook(el)
	}
	el._enterCb = null
})
```

### leaving
和enter的实现几乎是一个镜像过程，不同的是从data中解析出来的是leave相关的样式类名和钩子函数。
还有一点不同是可以配置delayLeave，它是一个函数，可以延时执行leave的相关过渡动画，在leave动画
执行完后，它会执行rm函数把节点从DOM中真正做移除。
entering 主要发生在组件插入后，而leaving主要发生在组件销毁前。
```JavaScript
export function leave (vnode: VNodeWithData, rm: Function) {
	const el: any = vnode.elm
	
	// call enter callback now
	if (isDef(el._enterCb)) {
		el._enterCb.cancelled = true
		el._enterCb()
	}
	
	const data = resolveTransition(vnode.data.transition)
	if (isUndef(data) || el.nodeType !== 1) {
		return rm()
	}
	
	if (isDef(el._leaveCb)) {
		return
	}
	
	const {
		css,
		type,
		leaveClass,
		leaveToClass,
		leaveActiveClass,
		beforeLeave,
		leave,
		afterLeave,
		leaveCancelled,
		delayLeave,
		duration
	} = data
	
	const expectsCSS = css !== false && !isIE9
	const userWantsControl = getHookArgumentsLength(leave)
	
	const explicitLeaveDuration: any = toNumber(
		isObject(duration)
			? duration.leave
			: duration
	)
	
	if (process.env.NODE_ENV !== 'production' && isDef(explicitLeaveDuration)) {
		checkDuration(explicitLeaveDuration, 'leave', vnode)
	}
	
	const cb = el._leaveCb = once(() => {
		if (el.parentNode && el.parentNode._pending) {
			el.parentNode._pending[vnode.key] = null
		}
		if (expectsCSS) {
			removeTransitionClass(el, leaveToClass)
			removeTransitionClass(el, leaveActiveClass)
		}
		if (cb.cancelled) {
			if (expectsCSS) {
				removeTransitionClass(el, leaveClass)
			}
			leaveCancelled && leaveCancelled(el)
		} else {
			rm()
			afterLeave && afterLeave(el)
		}
		el._leaveCb = null
	})
	
	if (delayLeave) {
		delayLeave(performLeave)
	} else {
		performLeave()
	}
	
	function performLeave() {
		// the delayed leave may have already been cancelled
		if (cb.cancelled) {
			return
		}
		// record leaving element
		if (!vnode.data.show) {
			(el.parentNode_pending || (el.parentNode._pending = {}))[(vnode.key: any)] = vnode
		}
		beforeLeave && beforeLeave(el)
		if (expectsCSS) {
			addTransitionClass(el, leaveClass)
			addTransitionClass(el, leaveActiveClass)
			nextFrame(() => {
				removeTransitionClass(el, leaveClass)
				if (!cb.cancelled) {
					addTransitionClass(el, leaveToClass)
					if (!userWantsControl) {
						if (isValidDuratino(explicitLeaveDuration)) {
							setTimeout(cb, explicitLeaveDuration)
						} else {
							whenTransitionEnds(el, type, cb)
						}
					}
				}
			})
		}
		leave && leave(el, cb)
		if (!expectsCSS && !userWantsControl) {
			cb()
		}
	}
}
```
Vue的过渡实现分为以下几个步骤：
1.自动嗅探目标元素是否应用了CSS过渡或动画，如果是，在恰当的时机添加/删除CSS类名
2.如果过渡组件提供了JavaScript钩子函数，这些钩子函数将在恰当的时机被调用。
3.如果没有找到JavaScript钩子并且也没有检测到CSS过渡/动画，DOM操作在下一帧中立即执行
真正执行动画的是我们写的CSS或者JavaScript钩子函数，而Vue的<transition></transition>
只是帮我们很好地管理了这些CSS的添加/删除，以及钩子函数的执行时机。

### transition-group
实现了列表的过渡效果
transition-group 也是由render函数渲染生成vnode
src/platforms/web/runtime/components/transitions.js
```JavaScript
const props = extend({
	tag: String,
	moveClass: String
}, transitionProps)

delete props.mode

export default {
	props,
	
	beforeMount () {
		const update = this._update
		this._update = (vnode, hydrating) => {
			// force removing pass
			this.__patch__(
				this._vnode,
				this.kept,
				false, // hydrating
				true // removeOnly (!important, avoids unnecessary moves)
			)
			this._vnode = this.kept
			update.call(this, vnode, hydrating)
		}
	},
	
	// 实现插入和删除的元素的缓动动画
	render (h: Function) {
		// 定义一些变量 
		// span
		const tag: string = this.tag ||this.$vnode.data.tag || 'span'
		const map: Object = Object.create(null)
		// 存储上一次的子节点
		const prevChildren: Array<VNode> = this.prevChildren = this.children
		// 表示 transition-group 包裹的原始子节点
		const rawChildren: Array<VNode> = this.$slots.default || []
		// 存储当前的子节点
		const children: Array<VNode> = this.children = []
		// 提取的一些渲染数据
		const transitionData: Object = extractTransitionData(this)
		
		// 遍历 rawChildren 初始化children
		for (let i = 0; i < rawChildren.length; i++) {
			const c: VNode = rawChildren[i]
			if (c.tag) {
				// 把刚刚提取的过渡数据transitionData添加的vnode.data.transition
				if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
					children.push(c)
					map[c.key] = c;
					(c.data || (c.data = {})).transition = transitionData
				} else if (process.env.NODE_ENV !== 'production') {
					const opts: ?VNodeComponentOptions = c.componentOptions
					const name: string = opts ? (opts.Ctor.options.name || opts.tag || ''): c.tag
					warn(`<transition-group> children must be keyed: <${name}>`)
				}
			}
		}
		
		// 当有prevChildren 对它遍历 获取到每个vnode
		// 然后把transitionData 赋值到vnode.data.transition，
		if (prevChildren) {
			cosnt kept: Array<VNode> = []
			const removed: Array<VNode> = []
			for (let i = 0; i < prevChildren.length; i++) {
				const c: VNode = prevChildren[i]
				// 这个是为了当它在enter和leave的钩子函数中有过渡动画
				c.data.transition = transitionData
				// 获取到原生dom的位置信息，记录到vnode.data.pos
				c.data.pos = c.elm.getBoundingClientRect()
				//如果在放入kept中
				if (map[c.key]) {
					kept.push(c)
				} else {
					removed.push(c)
				}
			}
			// 整个render函数通过h(tag, null, children)生成渲染vnode
			this.kept = h(tag, null, kept)
			this.removed = removed
		}
		
		return h(tag, null, children)
	},
	
	// move过渡实现
	updated () {
		// 判断子元素是否定义move相关样式
		const children: Array<VNode> = this.prevChildren
		const moveClass: string = this.moveClass || ((this.name || 'v) + '-move')
		if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
			return
		}
		
		// we divide the work-into three loops to avoid mixing DOM reads and writes
		// in each iteration - which helps prevent layout thrashing
		// 子节点预处理
		children.forEach(callPendingCbs)
		children.forEach(recordPosition)
		children.forEach(applyTranslation)
		
		// force reflow to put everything in position
		// assign to this to avoid being removed in tree-shaking
		// $flow-disable-line
		// 首先通过document.body.offsetHeight 强制触发浏览器重绘
		this._reflow = document.body.offsetHeight
		
		// 对children遍历
		children.forEach((c: VNode) => {
			if (c.data.moved) {
				var el: any = c.elm
				var s: any = el.style
				// 先给子节点添加moveClass
				addTransitionClass(el, moveClass)
				s.transform = s.WebkitTransform = s.transitionDuration = ''
				// 监听 清理
				el.addEventListener(transitionEndEvent, el._moveCb = function cb(e){
					if (!e || /transform$/.test(e.propertyName)) {
						el.removeEventListener(transitionEndEvent, cb)
						el._moveCb = null
						removeTransitionClass(el, moveClass)
					}
				})
			}
		})
	},
	
	methods: {
		hasMove (el: any, moveClass: string): boolean {
			if (!hasTransition) {
				return false
			}
			if (this._hasMove) {
				return this._hasMove
			}
			// Detect whether an element with the move class applied has
			// CSS transitions. Since the element may be inside an entering
			// transition at this very moment, we make a clone of it and remove
			// all other transition classes applied to ensure only the move class
			// is applied.
			// 首先克隆一个DOM节点
			const clone: HTMLElement = el.cloneNode()
			if (el._transitionClasses) {
				el._transitionClasses.forEach((cls: string) => { removeClass(clone, cls)})
			}
			addClass(clone, moveClass)
			clone.style.display = 'none'
			this.$el.appendChild(clone)
			// 获取它的一些缓动相关的信息
			const info: Object = getTransitionInfo(clone)
			this.$el.removeChild(clone)
			return (this._hasMove = info.hasTransform)
		}
	}
}

// callPendingCbs
// 在前一个过渡动画每执行完又再次执行到该方法的时候，会提前执行_moveCb和_enterCb
function callPendingCbs (c: VNode) {
	if (c.elm._moveCb) {
		c.elm._moveCb()
	}
	if (c.elm._enterCb) {
		c.elm._enterCb()
	}
}

// 记录节点的新位置
function recordPosition (c: VNode) {
	c.data.newPos = c.elm.getBoundingClientRect()
}

// 先计算节点新位置和旧位置的差值，如果差值不为0，则说明这些节点是需要移动的
// 所以记录vnode.data.moved为true，并且通过设置transform把需要移动的节点
// 的位置又偏移到之前的旧位置，目的是为了做move缓动做准备
function applyTranslation (c: VNode) {
	const oldPos = c.data.pos
	const newPos = c.data.newPos
	const dx = oldPos.left - newPos.left
	const dy = oldPos.top - newPos.top
	if (dx || dy) {
		c.data.moved = true
		const s = c.elm.style
		s.transform = s.WebkitTransform = `translate(${dx}px,${dy}px)`
		s.transitionDuration = '0s'
	}
}
```
由于虚拟dom的子元素更新算法是不稳定的，它不能保证被移除元素的相对位置，所以我们强制<transition-group>
组件更新子节点通过2个步骤：第一步我们移除需要移除的vnode，同时触发它们的leaving过渡；第二步我们需要把插入
和移动的节点达到它们的最终态，同时还要保证移除的节点保留在应该的位置，而这个是通过beforeMount钩子函数来实现的：
```JavaScript
beforeMount () {
	const update = this._update
	this._update = (vnode, hydraing) => {
		// force removing pass
		this.__patch__(
			this._vnode,
			this.kept,
			false, // hydrating
			true // removeOnly (!important, avoids unnecessary moves)
		)
		this._vnode = this.kept
		update.call(this, vnode, hydrating)
	}
}
```

通过把__patch__方法的第四个参数removeOnly设置为true，这样在updateChildren阶段，是不会移动vnode节点的。

总结：
<transition-group>组件的实现原理就介绍完毕了，它和<transition>组件相比，实现了列表的过渡，以及它会渲染成
真实的元素。当我们去修改列表的数据的时候，如果是添加或者删除数据，则会触发相应元素本身过渡动画，这点和<transition>
组件实现效果一样，除此之外<transition>还实现了move的过渡效果，让我们的列表过渡动画更加丰富。


Vue-Router
## 路由注册
Vue.use 全局API注册插件

// 每个插件都需要实现一个静态的install方法，当我们执行vue.use注册插件，就会执行这个install方法
// 并且在这个install方法的第一个参数我们可以拿到Vue对象，这样就不需要再额外去import vue
```JavaScript
// vue/src/core/global-api/use.js
export function initUse (Vue: GlobalAPI) {
	// 接受一个plugin参数，并且维护了一个_installedPlugins数组，存储所有注册过的plugin
	// 接着又判断plugin有没有定义install方法，如果有的话则调用该方法，并且该方法执行的第一个参数是Vue
	// 最后把plugin存储到installedPlugins中
	Vue.use = function (plugin: Function | Object) {
		const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
		if (installedPlugins.indexOf(plugin) > -1) {
			return this
		}
		
		const args = toArray(arguments, 1)
		args.unshift(this)
		if (typeof plugin.install === 'function') {
			plugin.install.apply(plugin, args)
		} else if (typeof plugin === 'function') {
			plugin.apply(null, args)
		}
		installedPlugins.push(plugin)
		return this
	}
}

```

路由安装
vue-router的入口文件是src/index.js 其中定义了vuerouter
vuerouter.install = install src/install.js

当用户执行Vue.use(VueRouter)的时候，实际上就是在执行install函数，为了确保install逻辑只执行一次，用了install.installed
Vue-Router安装最重要的一步就是利用Vue.mixin去把beforeCreate和destroyed钩子函数注入到每一个组件中。
```JavaScript
export let _Vue
export function install (Vue) {
	if (install.installed && _Vue === Vue) return 
	install.installed = true
	
	_Vue = Vue
	
	const isDef = v => v !== undefined
	
	const registerInstance = (vm, callVal) => {
		let i = vm.$options._parentVnode
		if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteINstance)) {
			i(vm, callVal)
		}
	}
	
	Vue.mixin({
		beforeCreate () {
			if (isDef(this.$options.router)) {
				// 表示自身
				this._routerRoot = this
				// 表示vuerouter的实例router
				this._router = this.$options.router
				// 初始化router
				this._router.init(this)
				// 把this._route变成响应式
				Vue.util.defineReactive(this, '_route', this._router.history.current)
			} else {
				this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
			}
			registerInstance(this, this)
		},
		destroyed () {
			registerInstance(this)
		}
	})
	
	Object.defineProperty(Vue.prototype, '$router', {
		get () { return this._routerRoot._router }
	})
	
	Object.defineProperty(Vue.prototype, '$route', {
		get () { return this._routerRoot._route }
	})
	
	Vue.component('RouterView', View)
	Vue.component('RouterLink', Link)
	
	const starts = Vue.config.optionMergeStartegies
	starts.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = starts.created
}

```

Vue.mixin
/vue/src/core/global-api/mixin.js
// 把要混入的对象通过mergeOption合并到Vue的options中，由于每个组件的构造函数都会在extend阶段合并Vue.options到自身的options，
所以也就相当于每个组件都定义了mixin定义的选项
```JavaScript
export function initMixin (Vue: GlobalAPI) {
	Vue.mixin = function (mixin: Object) {
		this.options = mergeOptions(this.options, mixin)
		return this
	}
}
```

总结 Vue-Router的安装过程，Vue编写插件的时候一定要提供静态的install方法，我们通过Vue.use(plugin)时候，就是在执行install方法。
Vue-Router的install方法会给每一个组件注入beforeCreated和destoryed钩子函数，在beforeCreated做一些私有属性定义和路由初始化工作。

VueRouter对象
VueRouter的实现是一个类
```JavaScript
export default class VueRouter {
	static install: () => void;
	static version: string;
	
	app: any;
	apps: Array<any>;
	ready: boolean;
	readyCbs: Array<Function>;
	options: RouterOptions;
	mode: string;
	history: HashHistory | HTML6History | AbstractHistory;
	matcher: Mather;
	fallback: boolean;
	beforeHooks: Array<?NavigationGuard>;
	resolveHooks: Array<?NavagationGuard>;
	afterHooks: Array<:?AfterNavigationHook>;
	
	constructor (options: RouterOptions = {}) {
		// 表示根Vue实例
		this.app = null
		// 保存所有子组件的Vue实例
		this.apps = []
		// 保存传入的路由配置
		this.options = options
		this.beforeHooks = []
		this.resolveHooks = []
		this.afterHooks = []
		// 表示路由匹配器
		this.matcher = createMather(options.routes || [], this)
		
		let mode = options.mode || 'hash'
		// 表示路由创建失败的回调函数
		this.fallback = mode === 'hsitory' && !supportsPushState && options.fallback != false
		// 表示路由创建的模式
		if (this.fallback) {
			mode = 'hash'
		}
		if (!inBrowser) {
			mode = 'abstract'
		}
		this.mode = mode
		
		switch (mode) {
			// 表示路由历史的具体的实现实例
			case 'history':
				this.history = new HTML5History(this, options.base)
				break
			case 'hash':
				this.history = new HashHistory(this, options.base, this.fallback)
				break
			case 'abstract'
				this.history = new AbstractHistory(this, options.base)
				break
			default:
				if (process.env.NODE_ENV !== 'production') {
					assert(false, `invalid mode: ${mode}`)
				}
		}
	}
	
	match (
		raw: RawLocation,
		current?: Route,
		redirectiedFrom?: Location
	): Route {
		return this.matcher.match(raw, current, redirectedFrom)
	}
	
	get currentRoute (): ?Route {
		return this.history && this.history.current
	}
	
	// 传入的参数是Vue实例
	init (app: any) {
		process.env.NODE_ENV !== 'production' && assert(
			install.installed,
			`not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
			`before creating root instance.`
		)
		
		this.apps.push(app)
		
		if (this.app) {
			return
		}
		
		this.app = app
		
		const history = this.history
		
		if (history instanceof HTML5History) {
			history.transitionTo(history.getCurrentLocation())
		} else if (history instanceof HashHistory) {
			
			const setupHashListener = () => {
				history.setupListeners()
			}
			history.transitionTo(
				history.getCurrentLocation(),
				setupHashListener,
				setupHashListener
			)
			history.listen(route => {
				this.apps.forEach((app) => {
					app._route = route
				})
			})
		}
		
		beforeEach (fn: Function): Function {
			return registerHook(this.beforeHooks, fn)
		}
		
		beforeResolve (fn: Function): Function {
			return registerHook(this.resolveHooks, fn)
		}
		
		afterEach (fn: Function): Functionv{
			return registerHook(this.afterHooks, fn)
		}
		
		onReady (cb: Function, errorCbs?: Function) {
			this.history.onReady(cb, errorCb)
		}
		
		onError (errorCb: Function) {
			this.history.onError(errorCb)
		}
		
		push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
			this.history.push(location, onComplete, onAbort)
		}
		
		replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
			this.history.replace(location, onComplete, onAbort)
		}
		
		go (n: number) {
			this.history.go(n)
		}
		
		back () {
			this.go(-1)
		}
		
		forward () {
			this.go(1)
		}
		
		getMatchedComponents (to?: RawLocation | Route): Array<any> {
			const route: any = to
				? to.matched
					? to
					: this.resolve(to).route
				: this.currentRoute
			if (!route) {
				return []
			}
			return [].concat.appky([], route.matched.map(m =>{
				return Object.keys(m.components).map(key => {
					return m.components[key]
				})
			}))
		}
		
		resolve (
			to: RawLocation,
			current?: Route,
			append?: boolean
		): {
			location: Location,
			route: Route,
			href: string,
			normalizedTo: Location,
			resolved: Route
		} {
			const location = normalizeLocation(
				to,
				current || this.history.current,
				append,
				this
			)
			const route = this.match(location, current)
			const fullPath = route.redirectedFrom || route.fullPath
			const base = this.history.base
			const href = createHref(base, fullPath, this.mode)
			return {
				location,
				route,
				href,
				normalizedTo: location,
				resolved: route
			}
		}
		
		addRoutes (routes: Array<RouteConfig>) {
			this.matcher.addRoutes(routes)
			if (this.history.current !== START) {
				this.history.transitionTo(this.history.getCurrentLocation)
			}
		}
	}
}

transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Funvtion) {
	const route = this.router.match(location, this.current)
}

```


```JavaScript
// src/create-matcher.js
export type Matcher = {
	match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
	addRoutes: (routes: Array<RouteConfig>) => void;
};

// Location
// flow/declaration.js
declare type Location = {
	_normalized?: boolean;
	name?: string;
	path?: string;
	hash?: string;
	query?: Dictionary<string>;
	params?: Dictionary<string>;
	append?: boolean;
	replace?: boolean;
}

// Route
declare type Route = {
	path: string;
	name: ?string;
	hash: string;
	query: Dictionary<string>;
	params: Dictionary<string>;
	fullPath: string;
	matched: Array<RouteRecord>;
	redirectedFrom?: string;
	meta?: any;
}
```
vue-router定义的location数据结构和浏览器提供的window.locaiton的部分结构有点类似，
它们都是对url的结构化描述

route表示的是路由中的一条线路，除了描述类似Location的path、query、hash这些概念，
还有matched表示匹配到的所有RouteRecord

createMatcher
```JavaScript
export function creteMatcher (
	// 用户定义的路由配置
	routes: Array<RouteConfig>,
	// new VueRouter返回的实例
	router: VueRouter
): Matcher {
	const { pathList, pathMap, nameMap } = createRouteMap(routes)
	
	function addRoutes (routes) {
		createRouteMap(routes, pathList, pathMap, nameMap)
	}
	
	
	function match (
		// 可以是一个url字符串，也可以是一个Location对象
		raw: RawLocation,
		// Route类型，它表示当前的路径
		currentRoute?: Route,
		redirectedFrom?: Location
	): Route {
		const location = normalizeLocation(raw, currentRoute, false, router)
		const { name } = location
		
		if (name) {
			const record = nameMap[name]
			if (process.env.NODE_ENV !== 'production') {
				warn(record, `Route with name '${name}' does not exist`)
			}
			if (!record) return _createRoute(null, location)
			const paramNames = record.regex.keys
				.filter(key => !key.optional)
				.map(key => key.name)
			
			if (typeof location.params !== 'object') {
				location.params = {}
			}
			
			if (currentRoute && typeof currentRoute.params === 'object') {
				for (const key in currentRoute.params) {
					if (!(key in location.params) && paramNames.indexOf(key) > -1) {
						location.params[key] = currentRoute.params[key]
					}
				}
			}
			
			if (record) {
				location.path = fillParams(record.path, location.params, `named route "${name}"`)
				return _createRoute(record, location, redirectedFrom)
			}
		} else if (location.path) {
			location.params = {}
			for (let i = 0; i < pathList.length; i++) {
				const path = pathList[i]
				const record = pathMap[path]
				if (matchRoute(record.regex, location.path, location.params)) {
					return _createRoute(record, location, redirectedFrom)
				}
			}
		}
		return _createRoute(null, location)
	}
	
	function _createRoute(
		record: ?RouteRecord,
		location: Location,
		redirectedFrom?: Location
	): Route {
		if (record && record.redirect) {
			return redirect(record, redirectedFrom || location)
		}
		if (record && record.matchAs) {
			return alias(record, location, record.matchAs)
		}
		return createRoute(record, location, redirectedFrom, router)
	}
	
	return {
		match,
		addRoutes
	}
}

// createRouteMap
// src/create-route-map
export function createRouteMap (
	routes: Array<RouteConfig>,
	oldPathList?: Array<string>,
	oldPathMap?: Dictionary<RouteRecord>,
	oldNameMap?: Dictionary<RouteRecord>
) {
	// 存储所有的path
	pathList: Array<string>,
	// path 到 RouteRecord的映射关系
	pathMap: Dictionary<RouteRecord>;
	// name 到 RouteReccord的映射关系
	nameMap: Dictionary<RouteRecord>;
} {
	const pathList: Array<string> = oldPathList || []
	const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
	const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)
	
	routes.forEach(route => {
		addRouteRecord(pathList, pathMap, nameMap, route)
	})
	
	for (let i = 0, l = pathList.length; i < l; i++) {
		if (pathList[i] === '*') {
			pathList.push(pathList.splice(i, 1)[0])
			l--
			i--
		}
	}
	
	return {
		pathList,
		pathMap,
		nameMap
	}
}

declare type RouteRecord = {
	path: string;
	regex: RouteRegExp;
	components: Dictionary<any>;
	instances: Dictionary<any>;
	name: ?string;
	parent: ?RouteRecord;
	redirect: ?RedirectOptions;
	matchAs: ?string;
	beforeEnter: ?NavigationGuard;
	meta: any;
	props: boolean | Object | Function | Dictionary<boolean | Object | Function>;
}

function addRouteRecord (
	pathList: Array<string>,
	pathMap: Dictionary<RouteRecord>,
	nameMap: Dictionary<RouteRecord>,
	route: RouteConfig,
	parent?: RouteRecord,
	matchAs?: string
) {
	const { path, name } = route
	if (process.env.NODE_ENV !== 'production') {
		assert(path != null, `"path" is required in a route configuration.`)
		assert(
			typeof route.component !== 'string',
			`route config "component" for path: ${String(path || name)} cannot be a ` +
			`string id. Use an actual component installed.`
		)
	}
	
	const pathToRegexpOptions: PathToRegexpOptions = route.pathToRegexpOptions || {}
	const normalizedPath = normalizePath(
		path,
		parent,
		pathToRegexpOptions.strict
	)
	
	if (typeof route.caseSensitive === 'boolean') {
		pathToRegexpOptions.sensitive = route.caseSensitive
	}
	
	const record: RouteRecord = {
		path: normalizedPath,
		regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
		components: route.components || { default: route.component },
		instances: {},
		name,
		parent,
		matchAs,
		redirect: route.redirect,
		beforeEnter: route.beforeEnter,
		meta: route.meta || {},
		props: route.props == null
			? {}
			: route.components
				? route.props
				: { default: route.props }
	}
	
	if (route.children) {
		if (process.env.NODE_ENV !== 'production') {
			if (route.name && !route.redirect && route.children.some(child => /^\/?$/.test(child.path))) {
				warn(
					false,
					`Named Route '${route.name}' has a default child route. ` +
					`When navigating to this named route (:to="{name: '${route.name}'}"), ` +
					`the default child route will not be rendered. Remove the name from ` +
					`this route and use the name of the default child route for named ` +
					`links instead.`
				)
			}
		}
		route.children.forEach(child => {
			const childMachAs = matchAs
				? cleanPath(`${matchAs}/${child.path}`)
				: undefined
			addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
		})
	}
	
	if (route.alias !== undefined) {
		const aliases = Array.isArray(route.alias)
			? route.alias
			: [route.alias]
		
		aliases.forEach(alias => {
			const aliasRoute = {
				path: alias,
				children: route.children
			}
			addRouteRecord(
				pathList,
				pathMap,
				nameMap,
				aliasRoute,
				parent,
				record.path || '/'
			)
		})
	}
	
	if (!pathMap[record.path]) {
		pathList.push(record.path)
		pathMap
	}
}

// normalizeLocation 
// src/util/location.js
export function normalizeLocation (
	raw: RawLocation,
	current: ?Route,
	append: ?boolean,
	router: ?VueRouter
): Location {
	let next: Location = typeof raw === 'string' ? { path: raw } : raw
	if (next.name || next._normalized) {
		return next
	}
	
	if (!next.path && next.params && current) {
		next = assign({}, next)
		next._normalized = true
		const params: any = assign(assign({}, current.params), next.params)
		if (current.name) {
			next.name = current.name
			next.params = params
		} else if (current.matched.length) {
			const rawPath = current.matched[current.matched.length - 1].path
			next.path = fillParams(rawPath, params, `path ${current.path}`)
		} else if (process.env.NODE_ENV !== 'production') {
			warn(false, `relative params navigation requires a current route.`)
			return next
		}
		
		const parsedPath = parsePath(next.path || ')
		const basePath = (current && current.path) || '/'
		const path = parsedPath.path
			? resolvePath(parsedPath.path, basePath, append || next.append)
			: basePath
			
		const query = resolveQuery(
			parsedPath.query,
			next.query,
			router && router.options.parseQuery
		)
		
		let hash = next.hash || parsedPath.hash
		if (hash && hash.charAt(0) !== '#') {
			hash = `#${hash}`
		}
		
		return {
			_normalized: true,
			path,
			query,
			hash
		}
	}
}

// createRoute
export function createRoute (
	record: ?RouteRecord,
	location: Location,
	redirectedFrom?: ?Location,
	router?: VueRouter
): Route {
	const stringifyQuery = router && router.options.stringifyQuery
	
	let query: any = location.query || {}
	try {
		query = clone(query)
	} catch (e) {}

	const route: Route = {
		name: location.name || (record && record.name),
		meta: (record && record.meta) || {},
		path: location.path || '/',
		hash: location.hash || '',
		query,
		params: location.params || {},
		fullPath: getFullPath(location, stringifyQuery),
		matched: record ? formatMatch(record) : []
	}
	if (redirectedFrom) {
		route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
	}
	return Object.freeze(route)
}

function formatMatch (record: ?RouteRecord): Array<RouteRecord> {
	const res = []
	while (record) {
		res.unshift(record)
		record = record.parent
	}
	return res
}

```
transitionTo
src/history/base.js
```JavaScript
transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
	const route = this.router.match(location, this.current)
	this.confirmTransition(route, () => {
		this.updateRoute(route)
		onComplete && onComplete(route)
		this.ensureURL()
		
		if (!this.ready) {
			this.ready = true
			this.readyCbs.forEach(cb => { cb(route) })
		}
	}, err => {
		if (onAbort) {
			onAbort(err)
		}
		if (err && !this.ready) {
			this.ready = true
			this.readyErrorCbs.forEach(cb => { cb(err) })
		}
	})
}


// this.current 是 history维护的当前路径
this.current = START

// src/util/route.js
export const START = createRoute(null, {
	path: '/'
})

confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
	const current = this.current
	const abort = err => {
		if (isError(err)) {
			if (this.errorCbs.length) {
				this.errorCbs.forEach(cb => { cb(err) })
			} else {
				warn(false, 'uncaught error during route navigation:')
				console.error(err)
			}
		}
		onAbort && onAbort(err)
	}
	if (
		isSameRoute(route, current) &&
		route.matched.length === current.matched.length
	) {
		this.ensureURL()
		return abort()
	}
	
	const {
		updated,
		deactivated,
		activated
	} = resolveQueue(this.current.matched, route.matched)
	
	// 1.在失活的组件里调用离开守卫。
	// 2.调用全局的beforeEach 守卫
	// 3.在重用的组件里调用beforeRouteUpdate守卫
	// 4.在激活的路由配置里调用beforeEnter
	// 5.解析异步路由组件
	const queue: Array<?NavigationGuard> = [].concat(
		extractLeaveGuards(deactivated),
		this.router.beforeHooks,
		extractUpdateHooks(updated),
		activated.map(m => m.beforeEnter),
		resolveAsyncComponents(activated)
	)
	
	this.pending = route
	const iterator = (hook: NavigationGuard, next) => {
		if (this.pending !== route) {
			return abort()
		}
		try {
			hook(route, current, (to: any) => {
				if (to === false || isError(to)) {
					this.ensureURL(true)
					abort(to)
				} else if (
					typeof to === 'string' ||
					(typeof to === 'object' && (
						typeof to.path === 'string' ||
						typeof to.name === 'string'
					))
				) {
					abort()
					if (typeof to === 'object' && to.replace) {
						this.replace(to)
					} else {
						this.push(to)
					}
				} else {
					next(to)
				}
			})
		} catch (e) {
			abort(e)
		}
	}
	
	// src/util/async.js
	runQueue(queue, iterator, () => {
		const postEnterCbs = []
		const isValid = () => this.current === route
		const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
		const queue = enterGuards.concat(this.router.resolveHooks)
		runQueue(queue, iterator, () => {
			if (this.pending !== route) {
				return abort()
			}
			this.pending = null
			onComplete(route)
			if (this.router.app) {
				this.route.app.$nextTick(() => {
					postEnterCbs.forEach(cb => { cb() })
				})
			}
		})
	})
}

// resolveQueue
function resolveQueue (
	current: Array<RouteRecord>,
	next: Array<RouteRecord>
): {
	updated: Array<RouteRecord>,
	activated: Array<RouteRecord>,
	deactivated: Array<RouteRecord>
} {
	let i
	const max = Math.max(current.length, next.length)
	for (i = 0; i < max; i++) {
		if (current[i] !== next[i]) {
			break
		}
	}
	return {
		updated: next.slice(0, i),
		activated: next.slice(i),
		deactivated: current.slice(i)
	}
}

// src/util/async.js
export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function){
	const step = index => {
		if (index >= queue.length) {
			cb()
		} else {
			if (queue[index]) {
				fn(queue[index], () => {
					step(index + 1)
				})
			} else {
				step(index + 1)
			}
		}
	}
	step(0)
}

function extractLeaveGuards (deactivated: Array<RouteRecord>): Array<?Function> {
	return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}

function extractGuards (
	records: Array<RouteRecord>,
	name: string,
	bind: Function,
	reverse?: boolean
): Array<?Function> {
	const guards = flatMapComponents(records, (def, instance, match, key) => {
		const guard = extractGuard(def, name)
		if (guard) {
			return Array.isArray(guard)
				? guard.map(guard => bind(guard, instance, match, key))
				: bind(guard, instance, match, key)
		}
	})
	return flatten(reverse ? guards.reverse() : guards)
}

//src/util/resolve-components.js
// 返回一个数组
export function flatMapComponents (
	matched: Array<RouteRecord>,
	fn: Function
): Array<?Function> {
	return flatten(matched.map(m => {
		return Object.keys(m.components).map(key => fn(
			m.components[key],
			m.instances[key],
			m, key
		))
	}))
}

// 把二维数组拍平成
export function flatten (arr: Array<any>): Array<any> {
	return Array.prototype.concat.apply([], arr)
}

// 执行每个fn的时候，通过extractGuard(def, name)获取到组件中对应name的导航守卫：
function extractGuard (
	def: Object | Function,
	key: string
): NavigattionGuard | Array<NavigationGuard> {
	if (typeof def !== 'function') {
		def = _Vue.extend(def)
	}
	return def.options[key]
}

// 调用bind方法把组件的实例Instance作为函数执行的上下文绑定到guard上，bind方法对应的上bindGuard
function bindGuard (guard: NavigationGuard, instance: ?_Vue): ?NavigationGuard {
	if (instance) {
		return function boundRouteGuard () {
			return guard.apply(instance, arguments)
		}
	}
}

```

第二步上 this.router.beforeHooks
beforeEach
// src/index.js
```
beforeEach (fn: Function): Function {
	return registerHook(this.beforeHooks, fn)
}

function registerHook (list: Array<any>, fn: Function): Function {
	list.push(fn)
	return () => {
		const i = list.indexOf(fn)
		if (i > -1) list.splice(i, 1)
	}
}
```

第五步 resolveAsyncComponents(activated)
返回的是一个导航守卫函数，有标准的to、from、next参数
src/util/resolve-components.js
```
export function resolveAsyncComponents (matched: Array<RouteRecord>): Function {
	return (to, from, next) => {
		let hasAsync = false
		let pending = 0
		let error = null
		
		// 从matched中
		flatMapComponents(matched, (def, _, match, key) => {
			if (typeof def === 'function' && def.cid === undefined) {
				hasAsync = true
				pending++
				
				const resolve = once(resolvedDef => {
					if (isESModule(resolvedDef)) {
						resolvedDef = resolvedDef.default
					}
					def.resolved = typeof resolvedDef === 'function'
						? resolvedDef
						: _Vue.extend(resolvedDef)
					match.components[key] = resolvedDef
					pending--
					if (pending <= 0) {
						next()
					}
				})
				
				const reject = once(reason => {
					const msg = `Failed to resolve async component ${key}: ${reason}`
					process.env.NODE_ENV !== 'production' && warn(false, msg)
					if (!error) {
						error = isError(reason)
							? reason
							: new Error(msg)
						next(error)
					}
				})
				
				let res
				try {
					res = def(resolve, reject)
				} catch (e) {
					reject(e)
				}
				if (res) {
					if (typeof res.then === 'function') {
						res.then(resolve, reject)
					} else {
						const comp = res.component
						if (comp && typeof comp.then === 'function') {
							comp.then(resolve, reject)
						}
					}
				}
			}
		})
		
		if (!hasAsync) next()
	}
}


// 第六步
// 解析完所有激活的异步组件后
// 1.在被激活的组件里调用 beforeRouteEnter
// 2.调用全局的 beforeResolve守卫
// 3.调用全局的 afterEach钩子

runQueue(queue, iterator, () => {
	const postEnterCbs = []
	const isValid = () => this.current === route
	const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
	const queue = enterGuards.concat(this.router.resolveHooks)
	runQueue(queue, iterator, () => {
		if (this.pending !== route) {
			return abort()
		}
		this.pending = null
		onComplete(route)
		if (this.router.app) {
			this.router.app.$nextTick(() => {
				postEnterCbs.forEach(cb => { cb() })
			})
		}
	})
})

// 也是利用了extractGuards方法提取组件中的beforeRouteEnter导航钩子函数。
// beforeRouteEnter钩子函数是拿不到组件实例
// 因为当守卫执行前，组件实例还没被创建，但是我们可以通过一个回调给next来访问组件实例
// 在导航被确认的时候执行回调，并且把组件实例作为回调方法的参数
function extractEnterGuards (
	activated: Array<RouteRecord>,
	cbs: Array<Function>,
	isValid: () => boolean
): Array<?Function> {
	return extractGuards(activated, 'beforeRouteEnter', (guard, _, match, key) => {
		return bindEnterGuard(guard, match, key, cbs, isValid)
	})
}

function bindEnterGuard(
	guard: NavigationGuard,
	match: RouteRecord,
	key: string,
	cbs: Array<Function>,
	isValid: () => boolean
): NavigationGuard {
	return function routeEnterGuard (to, from, next) {
		return guard(to, from, cb => {
			next(cb)
			if (typeof cb === 'function') {
				cbs.push(() => {
					poll(cb, match.instances, key, isValid)
				})
			}
		})
	}
}

function poll (
	cb: any,
	instances: Object,
	key: string,
	isValid: () => boolean
) {
	if (instances[key]) {
		cb(instandes[key])
	} else if (isValid()) {
		setTimeout(() => {
			poll(cb, instanes, key, isValid)
		}, 16)
	}
}

// 第七步是获取 this.router.resolveHooks
beforeResolve (fn: Function): Function {
	return registerHook(this.resolveHooks, fn)
}

// 第八步是在最后执行了 onComplete(route)后，执行 this.updateRoute(route)方法
updateRoute (route: Route) {
	const prev = this.current
	this.current = route
	this.cb && this.cb(route)
	this.router.afterHooks.forEach(hook => {
		hook && hook(route, prev)
	})
}

// afterEach
// 当用户使用router.afterEach注册了一个全局守卫，就会往router.afterHooks添加一个钩子函数
// 这样this.router.afterHooks 获取的就是用户注册的全局afterHooks守卫
afterEach (fn: Function): Function {
	return registerHook(this.afterHooks, fn)
}
<<<<<<< .mine
```

路由切换除了执行钩子函数，从表象上来看有2个地方会发生变化，一个是url发生变化，
一个是组件发生变化。

### url
在confirmTransition 的 onComplete函数中，在updateRoute后，会执行this.ensureURL()函数
hash模式该函数的实现

首先判断当前hash和当前路径是否相等，如果不相等，则根据push参数决定
执行pushHash或者是replaceHash
```JavaScript
//src/history/hash.js
ensureURL (push?: boolean) {
	const current = this.current.fullPath
	if (getHash() !== current) {
		push ? pushHash(current) : replaceHash(current)
	}
}

export function getHash(): string {
	const href = window.location.href
	const index = href.indexOf('#')
	return index === -1 ? '' : href.slice(index + 1)
}

function getUrl (path) {
	const href = window.location.href
	const i = href.indexOf('#')
	const base = i >= 0 ? href.slice(0, i) : href
	return `${base}#${path}`
}

function pushHash (path) {
	if (supportsPushState) {
		pushState(getUrl(path))
	} else {
		window.location.hash = path
	}
}

function replaceHash (path) {
	if (supportsPushState) {
		replaceState(getUrl(path))
	} else {
		window.location.replace(getUrl(path))
	}
}

// supportsPushState 
// src/util/push-state.js
export const suppoertsPushState = inBrowser && (function () {
	const ua = window.navigator.userAgent
	
	if (
		(ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
		ua.indexOf('Mobile Safari') !== -1 &&
		ua.indexOf('Chrome') === -1 &&
		ua.indexOf('Windows Phone') === -1
	) {
		return false
	}
	
	return window.history && 'pushState' in window.history
})()

//pushState会调用浏览器原生的history的pushState接口或者replaceState接口，
// 更新浏览器的URl地址，并把当前url压入历史栈中
export function pushState (url?: string, replace?: boolean) {
	saveScrollPosition()
	const history = window.history
	try {
		if (replace) {
			history.replaceState({ key: _key }, '', url)
		} esle {
			_key = genKey()
			history.pushState({ key: _key }, '', url)
		}
	} catch (e) {
		window.location[replace ? 'replace' : 'assign'](url)
	}
}

// 在history的初始化中，会设置一个监听器，监听历史栈的变化：
setupListeners () {
	const router = this.router
	const expectScroll = router.options.scrollBehavior
	const supportsScroll = supportsPushState && expectScroll
	
	if (supportsScroll) {
		setupScroll()
	}
	
	window.addEventListener(supportsPushState ? 'popstate' : 'hashchange', () => {
		const current = this.current
		if (!ensureSlash()) {
			return
		}
		this.transitionTo(getHash(), route => {
			if (supportsScroll) {
				handleScroll(this.router, route, current, true)
			}
			if (!supportsPushState) {
				replaceHash(route.fullPath)
			}
		})
	})
}
```

实例化HashHistory的时候，构造函数会执行ensureSlash()方法
会把 http://localhost:8080 修改为http://localhost:8080/#/
```JavaScript
function ensureSlash (): boolean {
	const path = getHash()
	if (path.charAt(0) === '/') {
		return true
	}
	replaceHash('/' + path)
	return false
}
```

### 组件
路由最终的渲染离不开组件，Vue-Router内置了<router-view></router-view>组件
```JavaScript
// src/components/view.js
export default {
	name: 'RouterView',
	functional: true,
	props: {
		name: {
			type: String,
			default: 'default'
		}
	},
	render (_, { props, children, parent, data }) {
		data.routerView = true
		
		const h = parent.$createElement
		const name = props.name
		const route = parent.$route
		const cache = parent._routeViewCache || (parent._routerViewCache = {})
		
		let depth = 0
		let inactive = false
		while (parent && parent._routerRoot !== parent) {
			if (parent.$vnode && parent.$vnode.data.routerView) {
				depth++
			}
			if (parent._inactive) {
				inactive = true
			}
			parent = parent.$parent
		}
		data.routerViewDepth = depth
		
		if (inactive) {
			return h(cache[name], data, children)
		}
		
		const matched = route.matched[depth]
		if (!matched) {
			cache[name] = null
			return h()
		}
		
		const component = cache[name] = matched.components[name]
		
		data.registerRouteInstance = (vm, val) => {
			const current = matched.instances[name]
			if (
				(val && current !== vm) ||
				(!val && current === vm)
			) {
				matched.instances[name] = val
			}
		}
		
		(data.hook || (data.hook = {})).prepatch = (_, vnode) => {
			matched.instances[name] = vnode.componentInstance
		}
		
		let propsToPass = data.props = resolveProps(route, matched.props && matched.props[name])
		if (propsToPass) {
			propsToPass = data.props = extend({}, propsToPass)
			const attrs = data.attrs = data.attrs || {}
			for (const key in propsToPass) {
				if (!component.props || !(key in component.props)) {
					attrs[key] = propsToPass[key]
					delete propsToPass[key]
				}
			}
		}
		
		return h(component, data, children)
	}
}

```

router-view 是一个functional 组件，它的渲染也是依赖render函数
首先获取当前的路径：
```JavaScript
const route = parent.$route

// src/install/js 给Vue原型定义了 $router
Object.dedineProperty(Vue.prototype, '$route', {
	get () {return this._routerRoot._route }
})

// src/index.js 在执行router.init
history.listen(route => {
	this.apps.forEach((app) => {
		app._route = route
	})
})

// src/history/base.js history.listen
listen (cb: Function) {
	this.cb = cb
}

// updateRoute 的时候执行this.cb
updateRoute (route: Route) {
	this.current = route
	this.cb && this.cb(route)
}
```
