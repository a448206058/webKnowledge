## transition
### transition的概念
Vue提供了transition的封装组件，在下列情形中，可以给任何元素和组件添加进入/离开过渡
* 条件渲染（使用v-if）
* 条件展示（使用v-show）
* 动态组件
* 组件根节点

当插入或删除包含在transition组件中的元素时，Vue将会做以下处理：
1. 自动嗅探目标元素是否应用了CSS过渡或动画，如果是，在恰当的时机添加/删除css类名。
2. 如果过渡组件提供了JavaScript钩子函数，这些钩子函数将在恰当的时机被调用
3. 如果没有找到JavaScript钩子并且也没有检测到CSS过渡/动画，DOM操作（插入/删除）在下一帧中立即执行

过渡的类名
在进入/离开的过渡中，会有6个class切换
1. v-enter:定义进入过渡的开始状态
2. v-enter-active: 定义进入过渡生效时的状态
3. v-enter-to:定义进入过渡的结束状态。
4. v-leave: 定义离开过渡的开始状态。
5. v-leave-active: 定义离开过渡生效时的状态。
6. v-leave-to: 定义离开过渡的结束状态。

### 例子
```HTML
<div id="demo">
  <button v-on:click="show = !show">
    Toggle
  </button>
  <transition name="fade">
    <p v-if="show">hello</p>
  </transition>
</div>
```
```JavaScript
new Vue({
  el: '#demo',
  data: {
    show: true
  }
})
```
```CSS
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
```

### transition的实现？
transition 组件是web平台独有的

transition 是抽象组件，直接实现了render函数，同样利用了默认插槽，支持的props非常多
```JavaScript
// src/platforms/web/runtime/component/transition.js

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

```JavaScript
//src/platforms/web/modules/transition.js
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

### transition-group
实现了列表的过渡效果
transition-group 也是由render函数渲染生成vnode
```JavaScript
//src/platforms/web/runtime/components/transitions.js
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