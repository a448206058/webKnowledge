## 本文主要学习自黄轶老师的vue源码教程 大家可以去慕课网学习，非常感谢。
/**
 * vue核心思想
 *   核心思想有哪些？
 *      数据驱动
 *          数据驱动概念是什么？
 *              是指视图是由数据驱动生成的，我们对视图的修改，不会直接操作DOM，而是通过修改数据。
 *              数据更新驱动视图变化
 *          数据驱动思想由什么好处？
 *              它相比我们传统的前端开发，大大简化来代码量，特别是当交互复杂的时候，只关心数据的修改会让代码的逻辑变的非常清晰。
 *              因为DOM变成来数据的映射，我们所有的逻辑都是对数据的修改，而不用碰触DOM，这样的代码非常利于维护。
 *          数据驱动思想主要是来干什么？
 *              为了构建逻辑结构更清晰的代码，降低复杂度
 *          vue中是如何用到数据驱动的概念的？
 *              通过采用简洁的模版语法来声明式的将数据渲染为DOM
 */

import {resolveConstructorOptions} from "./vue/vue-dev/src/core/instance/init";
import {initInjections} from "./vue/vue-dev/src/core/instance/inject";
import {formatComponentName} from "./vue/vue-dev/src/core/util";
import {mountComponent} from "./vue/vue-dev/src/core/instance/lifecycle";
import {measure} from "./vue/vue-dev/src/core/util/perf";

/**
 * new Vue
 *      new Vue是干什么的？
 *          new Vue是创建了一个vue的实例，通过这个实例去调用vue的方法和属性
 *          new 关键字是干什么的？
 *              new关键字在JavaScript语言中代表实例化一个对象
 *          Vue是什么？
 *              Vue实际上是一个类，类在Javascript中是用Function来实现
 *          源码：
 *              在src/core/instance/index.js
 */

//解析：Vue只能通过new关键字初始化，然后会调用this._init方法
function Vue (options) {
    if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
        warn('Vue is a constructror and should be called with the `new` keyword')
    }
    this._init(options)
}

/**
 * init
 * _init:私有方法
 * 源码：
 *      在src/core/instance/init.js中定义
 *
 * _init是干什么的？
 *      初始化一个Vue实例
 *
 * _init做了什么？
 *      vue初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，
 *      初始化data、props、computed、watcher等等
 *
 *      uid是做什么的？
 *      startTag和endTag是做什么的？
 *      performance定义是什么？
 *          Whether to record perf
 *          是否记住性能
 *      make是干什么的？
 *          性能记录标签
 *
 *      如果有vm.$options.el属性 就使用vm.$mount挂载它vm.$mount(vm.$options.el)
 *
 *
 * _init为什么要做这些？
 *      一次性初始化方便调用内部方法和属性
 */
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

/**
 * $mount
 * Vue实例挂载
 *
 * $mount是干什么的？
 *      Vue中我们是通过$mount实例方法去挂载vm的
 *
 * $mount做了哪些事情？
 *      源码：compiler版本
 *      src/platform/web/entry-runtime-with-compiler.js
 *      就是在没有render函数的时候把template转换成render
 *      mark compile compile end
 *      这段代码首先缓存了原型上的$mount方法，再重新定义该方法
 *      首先，它对el做了限制，Vue不能挂载在body、html这样的根节点上。
 *      接下来，如果没有定义render方法，则会把el或者template字符串转换成render方法。
 *      在Vue2.0版本中，所有Vue的组件的渲染最终都需要render方法，它是调用compileToFunctions方法实现的，
 *      编译过程我们之后会介绍。最后，调用原型上的$mount方法挂载
 */
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
    // resolve template/el and convert to render funciton
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
                     + 'render functions, or use the compiler-included build.',
                     vm
                 )
             } else {
                 warn(
                     'Failed to mount component: template or render function not defined.',
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
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
        vm._isMounted = true
        callHook(vm, 'mounted')
    }
    return vm
 }


/**
 * $mount为什么要这样做？
 *  结构清晰
 *
 *  _render方法
 *      _render方法是干什么的？
 *          是实例的一个私有方法，它用来把实例渲染成一个虚拟Node。
 *      _render方法是怎么实现的？
 *          源码：
 *          src/code/instance/render.js
 */
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

/**
 * vnode
 * Virtual DOM
 * Virtual DOM是什么？
 *      Virtual DOM就是用一个原生的JS对象去描述一个DOM节点
 *
 * Virtual DOM是干什么的？
 *      浏览器中的DOM元素是非常庞大的。当我们频繁的去做dom更新，会产生一定的性能问题。
 *      它比创建一个DOM的代价要小很多。
 *
 * Virtual DOM是怎么实现的？
 *      源码：
 *      src/core/vdom/vnode.js
 *
 *      VNode是对真实DOM的一种抽象描述，它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等，其它属性都是用来扩展VNode
 *      的灵活性以及实现一些特殊feature的。由于VNode只是用来映射到真实DOM的渲染，不需要包含操作DOM的方法，因此它是非常轻量和简单的。
 *
 *      Virtual DOM除了它的数据结构的定义，映射到真实DOM实际上要经历VNode的create、diff、patch等过程
 */
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

/**
 * createElement是做什么的？
 *  是Vue.js用来创建VNode
 *
 * createElement怎么实现的？
 *      源码：
 *      src/core/vdom/create-element.js
 *      createElement方法实际上是对_createElement方法的封装，它允许传入的参数更加灵活，在处理这些参数后，调用真正创建VNode的函数
 */

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
	 
	 /**
	  * Dep是整个getter依赖收集的核心
	  * 	src/core/observe/dep.js
	  */
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
	 
	 /**
	  *  Dep实际上就是对Watcher的一种管理，Dep脱离Watcher单独存在是没有意义的
	  * 	src/core/observer/watcher.js
	  */
	 
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
				}
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
// 在nextTick后才会真正执行watcher的回调函数。而一旦我们设置了sync，就可以在当前Tick中同步之心watcher的回调函数。

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




