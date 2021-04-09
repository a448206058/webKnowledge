## keep-alive
### keep-alive的定义
内置组件
keep-alive 组件的实现也是一个对象，它有一个属性abstract为true，是一个抽象组件

### keep-alive的初始化
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
			// 判断当前组件的名称和include、exclude的关系
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
			
			vnode.data.keepAlive = true
		}
		return vnode || (slot && slot[0])
	}
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

### 组件渲染
keep-alive组件包裹的子组件渲染，首次渲染和缓存渲染

### 首次渲染
Vue的渲染最后都会到patch过程，而组件的patch过程会执行createComponent方法
```JavaScript
//src/core/vdom/patch.js
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

### 缓存渲染
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