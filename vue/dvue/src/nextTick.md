```JavaScript
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
```