## event

### vue中event有哪些？
1. 原生DOM事件
2. 用户自定义事件

### DOM事件和用户自定义事件的区别？
Vue支持2种事件类型，原生DOM事件和自定义事件，它们主要的区别在于添加和删除事件的方式不一样，并且自定义事件的派发
是往当前实例上派发，但是可以利用在父组件环境定义回调函数来实现父子组件的通讯。

### event是在什么地方创建的？
在patch过程的创建和更新阶段都会执行updateDOMListeners

updateDOMListeners内部实现
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

### 自定义事件
自定义事件只能用在组件上，如果要在组件上用原生事件需要加.native修饰符，普通元素上使用.native修饰符无效。

```JavaScript
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