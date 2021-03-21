import VNode from './vnode'

export default class dVue {
    constructor(options) {
        let vm = this;
        // 1、保存vue实例传递过来的数据
        vm.$options = options // options是vue实例传递过来的对象
        vm.$data = options.data // 传递过来的data数据
        // el 是字符串还是对象
        vm.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el


        this._init(options)
        vm.$mount(vm.$el);

        var render = options.render

        console.log(render)
    }
}

/**
 * ASSET_TYPES
 *    src/shared/constants.js
 */
export const ASSET_TYPES = [
    'component',
    'directive',
    'filter'
]

// Vue.component
ASSET_TYPES.forEach(type => {
	Vue[type] = function (id, definition){
		if (!definition) {
			return this.options[type + 's'][id]
		} else {
			// 组件注册
			if (type === 'component' && isPlainObject(definition)) {
				definition.name = definition.name || id
				// 如果definition是一个对象，需要调用Vue.extend()转换成函数。Vue.extend会创建一个Vue的子类（组件类）	
				// 并返回子类的构造函数
				definition = this.options._base.extend(definition)
			}
			
			// 这里很关键，将组件添加到构造函数的选项对象中Vue.options上
			this.options[type + 's'][id] = definition
			return definition
		}
	}
})

/**
 * _init
 *        src/core/instance/init.js
 */
/**
 * 合并配置
 *        new Vue的过程通常有2种场景，一种是外部我们的代码主动调用new Vue(options)的方式实例化一个Vue对象；另一种是内部通过
 *        new Vue(options)实例化子组件
 *        无论哪种场景，都会执行实例的_init(options)方法，它首先会执行一个merge options的逻辑，
 *        源码：src/core/instance/init.js
 */
dVue.prototype._init = function (options) {
    const vm = this;
	vm._isVue = true
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
            vm.$options,
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

dVue.prototype.$mount = function (el, hydrating) {
    const options = this.$options
    if (!options.render) {
        let template = options.template
        // template存在的时候取template，不存在的时候取el的outerHTML
        if (template) {
            if (typeof template === 'string') {
                if (template.charAt(0) === '#') {
                    template = idToTemplate(template)
                }
            } else if (template.nodeType) {
                // 当template为DOM节点的时候
                template = template.innerHTML
            } else {
                return this
            }
        } else if (el) {
            /* 获取element的outerHTML*/
            template = getOuterHTML(el)
        }
        if (template) {
            const {render, staticRenderFns} = compileToFunctions(template, {
                shouldDecodeNewlines,
                delimiters: options.delimiters
            }, this)
            options.render = render
            options.staticRenderFns = staticRenderFns
        }
    }
}

export function createComponent(
    Ctor,
    data,
    context,
    children,
    tag
) {
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
         *    在src/core/global-api/index.js
         *    initGlobalAPI
         *    //this is used to identify the "base" constructor to extend all plain-object
         *    // components with in Weex's multi-instance scenarios.
         *    Vue.options._base = Vue
         *
         * Vue.options和 context.$options
         *    在src/core/instance/init.js里Vue原型上的_init函数
         *    vm.$options = mergeOptions(
         *        resolveConstructorOptions(vm.constructor),
         *        options || {},
         *        vm
         *    )
         *    这样就把Vue上的一些option扩展到了vm.$option上，所以我们也就能通过vm.$options._base
         *    拿到Vue这个构造函数了。mergeOptions的功能是把Vue构造函数的options和用户传入的options
         *    做一层合并，到vm.$options上。
         *
         */
        Ctor = baseCtor.extend(Ctor)
    }

    // if at this stage it's not a constructor or an async component factory,
    // reject.
    if (typeof Ctor !== 'function') {
        if (process.env.NODE_ENV !== 'production') {
            warn(`Invalid Component definition: ${String(Ctor)}`, context)
        }
        return
    }

    // async component
    let asyncFactory
    if (isUndef(Ctor.cid)) {
        asyncFactory = Ctor
        Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
        if (Ctor === undefined) {
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
    if (isDef(data.model)) {
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

    if (isTrue(Ctor.options.abstract)) {
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
    if (__WEEX__ && isRecycleableComponent(vnode)) {
        return renderRecyclableComponentTemplate(vnode)
    }

    return vnode
}


dVue.extend = function (extendOptions) {
    extendOptions = extendOptions || {}
    const Super = this
    const SupperId = Super.cid
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
        validateComponentName(name)
    }

    const Sub = function VueComponent(options) {
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
    ASSET_TYPES.forEach(function (type) {
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


// install component management hooks onto the placeholder node
// installComponentHooks(data)

const componentVNodeHooks = {
    init(vnode, hydrating) {
        if (
            vnode.componentInstance &&
            !vnode.componentInstance._isDestroyed &&
            vnode.data.keepAlive
        ) {
            // kept-alive components, treat as a patch
            const mountedNode = vnode;// work around flow
            componentVNodeHooks.prepatch(mountedNode, mountedNode)
        } else {
            const child = vnode.componentInstance = createComponentInstanceForVnode(
                vnode,
                activeInstance
            )
            child.$mount(hydrating ? vnode.elm : undefined, hydrating)
        }
    },
    prepatch(oldVnode, vnode) {
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

    insert(vnode) {
        const {context, componentInstance} = vnode
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

    destroy(vnode) {
        const {componentInstance} = vnode
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


function installComponentHooks(data) {
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

function mergeHook(f1, f2) {
    const merged = (a, b) => {
        // flow complains about extra args which is why we use any
        f1(a, b);
        f2(a, b)
    }
    merged._merged = true
    return merged
}

// const name = Ctor.options.name || tag
// const vnode = new VNode()
// return vnode

/**
 * 钩子函数
 *    src/core/vdom/create-component.js
 *        init钩子函数执行是通过createComponentInstanceForVnode创建一个Vue的实例，
 *        然后调用$mount方法挂载子组件
 */
function init(vnode, hydrating) {
    if (
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
    ) {
        // kept-alive components, treat as a patch
        const mountedNode = vnode// work around flow
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
 *        构造的一个内部组件的参数，然后执行new vnode.componentOptions.Ctor(options)
 */

export function createComponentInstanceForVnode(
    vnode, // we konw it's MountedComponentVNode but flow doesn't
    parent // activeInstance in lifecycle state
) {
    const options = {
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

export function initInternalComponent(vm, options) {

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

dVue.prototype._render = function () {
    const vm = this;
    const {render, _parentVnode} = vm.$options

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
 *        src/core/instance/lifecycle.js
 */
export let activeInstance = null
dVue.prototype._update = function (vnode, hydrating) {
    const vm = this;
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
export function initLifecycle(vm) {
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
// vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)

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
 *        这里传入的vnode是组件渲染的vnode,也就是我们之前说的vm._vnode，如果组件的根节点是个普通元素，
 *        那么vm._vnode也是普通的vnode
 *        先创建一个父节点占位符，然后再遍历所有子VNode递归调用createElm,在遍历的过程中，如果遇到子VNode是一个组件的
 *        VNode，则重复开始的过程，这样通过一个递归的方式就可以完整地构建来整个组件树。
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


// initGlobalAPI(Vue)
/**
 * 首先通过Vue.options = Object.create(null)创建一个空对象，然后遍历ASSET_TYPES
 */
export function initGlobalAPI(Vue) {
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
 * mergeOptiopns
 *    src/core/util/options.js
 *  mergeOptions主要功能就是把parent和child这俩个对象根据一些合并策略，合并成一个新对象并返回。
 *    先递归把extends和mixins合并到parent上，然后遍历parent，调用mergeField，然后再遍历child，如果
 *    key不在parent的自身属性上，则调用mergeField
 */

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
export function mergeOptions(
    parent,
    child,
    vm
) {
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
        for (let i = 0, l = child.mixins.length; i < l; i++) {
            parent = mergeOptions(parent, child, mixins[i], vm)
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
// function mergeHook (
// 	parentVal,
// 	childVal
// ){
// 	/**
// 	 * 如果不存在childVal,就返回parentVal;否则再判断是否存在parentVal,如果存在就把childVal
// 	 * 添加到parentVal后返回新数组；否则返回childVal的数组。mergeOptions函数，一旦parent和child
// 	 * 都定义了相同的钩子函数，那么它们会把2个钩子函数合并成一个数组。
// 	 */
// 	return childVal
// 		? parentVal
// 			? parentVal.concat(childVal)
// 			: Array.isArray(childVal)
// 				? childVal
// 				: [childVal],
// 		: parentVal
// }


/**
 * LIFECYCLE_HOOKS
 *    src/shared/constants.js
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

// LIFECYCLE_HOOKS.forEach(hook => {
//     strats[hook] = mergeHook
// })
