## vuex

### vuex初始化
包括安装、实例化过程2个方面
```JavaScript
// src/index.js

export default {
	Store,
	install,
	version: '__VERSION__',
	mapState,
	mapMutations,
	mapGetters,
	mapActions,
	createNamespacedHelpers
}

// install
// src/store.js
export function install (_Vue) {
	if (Vue && _Vue === Vue) {
		if (process.env.NODE_ENV !== 'production') {
			console.error(
				'[vuex] already installed. Vue.use(Vuex) should be called only once.'
			)
		}
		return
	}
	Vue = _Vue
	applyMixin(Vue)
}

// applyMixin(Vue) src/mixin.js
// 全局混入了一个beforeCreated钩子函数
export default function (Vue) {
	const version = Number(Vue.version.split('.')[0])
	
	if (version >= 2) {
		Vue.mixin({ beforeCreate: vuexInit })
	} else {
		// override init and inject vuex init procedure
		// for 1.x backwards compatibility.
		const _init = Vue.prototype._init
		Vue.prototype._init = function (options = {}) {
			options.init = options.init
				? [vuexInit].concat(options.init)
				: vuexInit
			_init.call(this, options)
		}
	}

	/**
	 * Vuex init hook, injected into each instances init hooks list.
	 */
	// 把options.store保存在所有组件的this.$store中，这个options.store就是我们在
	// 实例化Store对象的实例
	function vuexInit () {
		const options = this.$options
		// store injection
		if (options.store) {
			this.$store = typeof options.store === 'function'
				? options.store()
				: options.store
		} else if (options.parent && options.parent.$store) {
			this.$store = options.parent.$store
		}
	}
}
```

### Store实例化
在import Vuex之后，会实例化其中的Store对象，返回store实例并传入new Vue的options中，也就是我们
刚才提到的options.store
```JavaScript
export default new Vuex.Store({
	actions,
	getters,
	state,
	mutation,
	modules
})

// src/store.js
export class Store {
	constructor (options = {}) {
		// Auto install if it is not done yet and `window` has `Vue`.
		// To allow users to avoid auto-installation in some cases,
		// this code should be placed here. See
		if (!Vue && typeof window !== 'undefined' && window.Vue) {
			install(window.Vue)
		}
		
		if (process.env.NODE_ENV !== 'production') {
			assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
			assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
			assert(this instanceof Store, `Store must be called with the new operator`)
		}
		
		const {
			plugins = [],
			strict = false
		} = options
		
		// store internal state
		this._committing = false
		this._actions = Object.create(null)
		this._actionSubscribers = []
		this._mutations = Object.create(null)
		this._wrappedGetters = Object.create(null)
		this._modules = new ModuleCollection(options)
		this._modulesNamespaceMap = Object.create(null)
		this._subscribers = []
		this._watcherVM = new Vue()
		
		// bind commit and dispatch to self
		const store = this
		const { dispatch, commit } = this
		this.dispatch = function boundDispatch (type, payload) {
			return dispatch.call(store, type, payload)
		}
		this.commit = function boundCommit (type, payload, options) {
			return commit.call(store, type, payload, options)
		}
		
		// stroct mode
		this.strict = strict
		
		const state = this._modules.root.state
		
		// init root mudule.
		// this also recursively registers all sub-modules
		// and collects all module getters inside this._wrappedGetters
		installModule(this, state, [], this._modules.root)
		
		// initialize the store vm, which is responsible for the reactivity
		// (also registers _wrappedGetters as computed properties)
		resetStoreVM(this, state)
		
		// apply plugins
		plugins.forEach(plugin => plugin(this))
		
		if (Vue.config.devtools) {
			devtoolPlugin(this)
		}
	}
}
```

### 初始化模块
模块的意义：避免应用复杂时，store对象变的臃肿
```JavaScript
const moduleA = {
	state: { ... },
	actions: { ... },
	actions: { ... },
	getters: { ... }
}

const moduleB = {
	state: { ... },
	mutations: { ... },
	actions: { ... },
	getters: { ... }
}

const store = new Vuex.Store({
	modules: {
		a: moduleA,
		b: moduleB
	}
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

从数据结构上来看，模块的设计就是一个树型结构，store本身可以理解为一个root module，
它下面的modules 就是子模块，Vuex需要完成这颗树的构建
```JavaScript
// 构建入口

this._modules = new ModuleCollection(options)

// src/module/module-collection.js
export default class ModuleCollection {
	constructor (rawRootModule) {
		// register root module (Vuex.Store options)
		this.register([], rawRootModule, false)
	}
	
	get (path) {
		return path.reduce((module, key) => {
			return module.getChild(key)
		}, this.root)
	}

	getNamespace (path) {
		let module = this.root
		return path.reduce((namespace, key) => {
			module = module.getChild(key)
			return namespace + (module.namespaced ? key + '/' : '')
		}, '')
	}
	
	update (rawRootModule) {
		update([], this.root, rawRootModule)
	}

	// path 表示路径
	// rawModule表示定义模块的原始配置
	// runtime表示是否是一个运行时创建的模块
	register (path, rawModule, runtime = true) {
		if (process.env.NODE_ENV !== 'production'){
			assertRawModule(path, rawModule)
		}
		
		const newModule = new Module(rawModule, runtime)
		
		// 判断当前的path的长度如果为0，则说明它是一个根模块
		// 所以把newModule赋值给了this.root，否则就需要建立父子关系
		if (path.length === 0) {
			this.root = newModule
		} else {
			const parent = this.get(path.slice(0, -1))
			parent.addChild(path[path.length - 1], newModule)
		}
		
		// register nested modules
		if (rawModule.modules) {
			forEachValue(rawModule.modules, (rawChildModule, key) => {
				this.register(path.concat(key), rawChildModule, runtime)
			})
		}
	}

	unregister (path) {
		const parent = this.get(path.slice(0, -1))
		const key = path[path.length - 1]
		if (!parent.getChild(key).runtime) return
		
		parent.removeChild(key)
	}
}

// Module 是用来描述单个模块的类
// src/module/module.js
export default class Module {
	constructor (rawModule, runtime) {
		this.runtime = runtime
		// Store some children item
		// 表示它所有的子模块
		this._children = Object.create(null)
		// Store the origin module object which passed by programmer
		// 模块的配置
		this._rawModule = rawModule
		const rawState = rawModule.state
		
		// Store the origin module's state
		// 表示这个模块定义的state
		this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
	}
	get namespaced () {
		return !!this._rawModule.namespaced
	}
	
	addChild (key, module) {
		this._children[key] = module
	}
	
	removeChild (key) {
		delete this._children[key]
	}
	
	getChild (key) {
		return this._children[key]
	}
	
	update (rawModule) {
		this._rawModule.namespaced = rawModule.namespaced
		if (rawModule.actions) {
			this._rawModule.actions = rawModule
		}
		if (rawModule.mutations) {
			this._rawModule.mutations = rawModule.mutations
		}
		if (rawModule.getters) {
			this.rawModule.getters = rawModule.getters
		}
	}
	
	forEachChild (fn) {
		forEachValue(this._children, fn)
	}
	
	forEachGetter (fn) {
		if (this._rawModule.getters) {
			forEachValue(this._rawModule.getters, fn)
		}
	}
	
	forEachAction (fn) {
		if (this._rawModule.actions) {
			forEachValue(this._rawModule.actions, fn)
		}
	}
	
	forEachMutation (fn) {
		if (this._rawModule.mutations) {
			forEachValue(this._rawModule.mutations, fn)
		}
	}
}
```

### 安装模块
```JavaScript
const state = this._modules.root.state
installModule(this, state, [], this._modules.root)

// installModule
// store 表示root store
// state 表示root state
// path 表示模块的访问路径
// module 表示当前的模块
// hot 表示是否是热更新
function installModule (store, rootState, path, module, hot) {
	const isRoot = !path.length
	const namespace = store._modules.getNamespace(path)
	
	// register in namespace map
	if (module.namespaced) {
		store._modulesNamespaceMap[namespace] = module
	}
	
	// set state
	if (!isRoot && !hot) {
		const parentState = getNestedState(rootState, path.slice(0, -1))
		const moduleName = path[path.length - 1]
		store._withCommit(() => {
			Vue.set(parentState, moduleName, module.state)
		})
	}
	
	// 构造了一个本地上下文环境
	const local = module.context = makeLocalContext(store, namespace, path)
	
	module.forEachMutation((mutation, key) => {
		const namespacedType = namespace + key
		registerMuation(store, namespacedType, mutation, local)
	})
	
	module.forEachAction((action, key) => {
		const type = action.root ? key : namespace + key
		const handler = action.handler || action
		registerAction(store, type, handler, local)
	})
	
	module.forEachGetter((getter, key) => {
		const namespacedType = namespace + key
		registerGetter(store, namespacedType, getter, local)
	})
	
	module.forEachChild((child, key) => {
		installModule(store, rootState, path.concat(key), child, hot)
	})
}

// src/module/module-collection.js
getNamespace (path) {
	let module = this.root
	return path.reduce((namespace, key) => {
		module = module.getChild(key)
		return namespace + (module.namespaced ? key + '/' : '')
	}, '')
}

function makeLocalContext (store, namespace, path) {
	const noNamespace = namespace === ''
	
	const local = {
		dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
			const args = unifyObjectStyle(_type, _payload, _options)
			const { payload, options } = args
			let { type } = args
			
			if (!options || !options.root) {
				type = namespace + type
				if (process.env.NODE_ENV !== 'production' && !store._actions[type]) {
					console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
					return 
				}
			}
			
			return store.dispatch(type, payload)
		},
		
		commit: noNamespace ? store.commit : (_type, _payload, _options) => {
			const args = unifyObjectStyle(_type, _payload, _options)
			const { payload, options } = args
			let { type } = args
			
			if (!options || !options.root) {
				type = namespace + type
			}
			
			if (process.env.NODE_ENV !== 'production' && !store._mutations[type]) {
				console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
				return
			}
		}
		
		store.commit(type, payload, options)
	}
}

// getters and state object must be gotten lazily
// because they will be changed by vm update
// 如果没有namespace，则直接返回root store 的getters
// 否则返回makeLocalGetters(store, namespace)的返回值
Object.defineProperties(local, {
	getters: {
		get: noNamespace
			? () => store.getters
			: () => makeLocalGetters(store, namespace)
	},
	state: {
		get: () => getNestedState(store.state, path)
	}
})

return local
}

// makeLocalGetters

function makeLocalGetters (store, namespace) {
	const gettersProxy = {}
	
	//首先获取namespace的长度，然后遍历Root store下所有getters
	const splitPos = namespace.length
	Object.keys(store.getters).forEach(type => {
		// skip if the target getter is not match this namespace
		if (type.slice(0, splitPos) !== namespace) return
		
		// extract local getter type
		const localType = type.slice(splitPos)
		
		// add a port to the getters proxy.
		// Define as getter property because
		// we do not want to evaluate the getters in this time.
		Object.defineProperty(gettersProxy, localType, {
			get: () => store.getters[type],
			enumerable: true
		})
	})
	
	return gettersProxy
}

// 从 root state 开始，一层层根据模块名访问到对应path的state，
// 每一层关系的建立实际上就是通过这段State的初始化 逻辑
function getNestedState (state, path) {
	return path.length
		? path.reduce((state, key) => state[key], state)
		: state
}

function registerMutation(store, type, handler, local) {
	const entry = store._mutations[type] || (store._mutations[type] = [])
	entry.push(function wrappedMutationHandler (payload) {
		handler.call(store, local.state, payload)
	})
}

// 给 root store 上的_actions[types] 添加wrappedActionHandler方法
function registerAction (store, type, handler, local) {
	const entry = store._actions[type] || (store._actions[type] = [])
	entry.push(function wrappedActionHandler (payload, cb){
		let res = handler.call(store, {
			dispatch: local.dispatch,
			commit: local.commit,
			getters: local.getters,
			state: local.state,
			rootGetters: store.getters,
			rootState: store.state
		}, payload, cb)
		if (!isPromise(res)) {
			res = Promise.resolve(res)
		}
		if (store._devtoolHook) {
			return res.catch(err => {
				store._devtoolHook.emit('vuex:error', err)
				throw err
			})
		} else {
			return res
		}
	})
}

// 实际上就是给root store 上的 _wrappedGetters[key] 指定 wrappedGetter方法
// 同一type的_wrappedGetters只能定义一个
function registerGetter (store, type, rawGetter, local) {
	if (store._wrappedGetters[type]) {
		if (process.env.NODE_ENV !== 'production') {
			console.err(`[vuex] duplicate getter key: ${type}`)
		}
		return
	}
	store._wrappedGetters[type] = function wrappedGetter (store) {
		return rawGetter(
			local.state, // local state
			local.getters, // local getters
			store.state, // root state
			store.getters // root getters
		)
	}
}
```

### 初始化 store._vm
Store实例化的最后一步，就是执行初始化store._vm的逻辑：

resetStoreVM的作用实际上上想建立getters和state的联系，因为从设计上getters的获取就依赖了state，并且
希望它的依赖能被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。因此这里利用了Vue中用computed计算属性来实现。


当我们根据Key访问store.getters的某一个getter的时候，实际上就是访问了store._vm[key]，也就是computed[key]，在执行
computed[key]对应的函数的时候，会执行rawGetter(local.state, ...)方法，那么就会访问到store.state，进而访问到
store._vm_data.$$state,这样就建立了一个依赖关系。当store.state发生变化的时候，下一次再访问store.getters的时候会
重新计算。
```JavaScript
resetStoreVM(this, state)

function resetStoreVM(store, state, hot) {
	const oldVm = store._vm
	
	// bind store public getters
	store.getters = {}
	const wrappedGetters = store._wrappedGetters
	const computed = {}
	// 首先遍历了_wrappedGetters获取每个getter的函数fn和key
	forEachValue(wrappedGetters, (fn, key) => {
		// use computed to leverage its lazy-caching mechanism
		computed[key] = () => fn(store)
		Object.defineProperty(store.getters, key, {
			get: () => store._vm[key],
			enumerable: true // for local getters
		})
	})
	
	// use a Vue instance to store the state tree
	// suppress warnings just in case the user has added
	// some funky global mixins
	const silent = Vue.config.silent
	Vue.config.silent = true
	// 接着实例化一个Vue实例 store._vm 并把computed传入
	// 我们访问 store.state的时候，实际上会访问Store类上定义的state的get方法：
	// get state () { return this._vm._data.$$state }
	store._vm = new Vue({
		data: {
			$$state: state
		},
		computed
	})
	
	Vue.config.silent = silent
	
	// enable strict mode for new vm
	if (store.strict) {
		enableStrictMode(store)
	}
	
	if (oldVm) {
		if (hot) {
			// dispatch changes in all subscribed watchers
			// to force getter re-evaluation for hot reloading.
			store._withCommit(() => {
				oldVm._data.$$state = null
			})
		}
		Vue.nextTick(() => oldVm.$destroy())
	}
}

// fn
store._wrappedGetters[type] = function wrappedGetter (store) {
	return rawGetter(
		local.state, // local state
		local.getters, // local getters
		store.state, // root state
		store.getters // root getters
	)
}

// 严格模式下，当store.state被修改的时候，store._committing必须为true，否则在开发阶段会报警告。
function enableStrictMode (store) {
	store._vm.$watch(function () { return this._data.$$state }, ()  => {
		if (process.env.NODE_ENV !== 'production') {
			assert(store._committing, `Do not mutate vuex store state outside mutation handlers.`)
		}
	}, {deep: true, sync: true})
}

// 对fn包装了一个环境，确保在fn中执行任何逻辑的时候 this._committing = true
_withCommit (fn) {
	const committing = this._committing
	this._committing = true
	fn()
	this._committing = committing
}
```

### API
数据获取
Vuex最终存储的数据是在state上的，我们之前分析过在store.state存储的是root state

递归执行installModule的过程，完成了整个state的建设，
这样我们就可以通过module名的path去访问到一个深层module的state
```JavaScript
function installModule (store, rootState, path, module, hot) {
	const isRoot = !path.length
	
	if (!isRoot && !hot) {
		const parentState = getNestedState(rootState, path.slice(0, -1))
		const moduleName = path[path.length - 1]
		store._withCommit(() => {
			Vue.set(parentState, moduleName, module.state)
		})
	}
}

// 有些时候，我们获取的数据不仅仅是一个state,而是由多个state计算而来，Vuex提供了getters，允许我们定义一个getter函数
getters: {
	total (state, getters, localState, localGetters) {
		// 可访问全局state和getters，以及如果是在modules下面，可以访问到局部state和局部getters
		return state.a + state.b
	}
}
```

在installModule的过程中，递归执行了所有getters定义的注册，在之后的resetStoreVM过程中，执行了store.getters的初始化工作：

在installModule的过程中，为建立了每个模块的上下文环境，因此当我们访问store.getters.xxx的时候，实际上就是执行了rawGetter(local.state, ...
rawGetter就是我们定义的getter方法，这也就是为什么我们的getter函数支持这四个参数，并且除了全局的state和getter外，我们还可以访问到当前
Module下的state和getter。

### 数据存储
Vuex对数据存储的存储本质上就是对state修改，并且只允许我们通过提交mutaion的形式去修改state,mutation是一个函数，初始化也是在installModule

```JavaScript
function installModule(store, rootState, path, module, hot) {
	const namespace = store._modules.getNamespace(path)

	const local = module.context = makeLocalContext(store, namespace, path)

	module.forEachMutation((mutation, key) => {
		const namespacedType = namespace + key
		registerMutation(store, namespacedType, mutation, local)
	})
}

function registerMutation (store, type, handler, local) {
	const entry = store._mutations[type] || (store._mutations[type] = [])
	entry.push(function wrappedMutationHandler (payload){
		handler.call(store, local.state, payload)
	})
}
```

store提供了commit方法提交一个mutation:
```JavaScript
commit (_type, _payload, _options) {
	// check object-style commit
	const {
		type,
		payload,
		options
	} = unifyObjectStyle(_type, _payload, _options)

	const mutation = { type, payload }
	const entry = this._mutations[type]
	if (!entry){
		if (process.env.NODE_ENV !== 'production') {
			console.error(`[vuex] unknown mutation type: ${type}`)
		}
		return
	}
	this._withCommit(() => {
		entry.forEch(function.commitIterator(handler) {
			handler(payload)
		})
	})
	this._subscribers.forEach(sub => sub(mutation, this.state))

	if (
		process.env.NODE_ENV !== 'production' &&
		options && options.silent
	) {
		console.warn(
			`[vuex] mutation type: ${type}. Silent options has been removed. ` +
			'Use the filter functionality in the vue-devtools'
		)
	}
}
```

store 提供了dispatch 方法让我们提交一个action:
```JavaScript
dispatch (_type, _payload) {
	// check object-style dispatch
	const {
		type,
		payload
	} = unifyObjectStyle(_type, _payload)

	const action = {type, payload}
	const entry = this._actions[type]
	if (!entry) {
		if (process.env.NODE_ENV !== 'production') {
			console.error(`[vuex] unknown action type: ${type}`)
		}
		return
	}

	this._actionSubscribers.forEach(sub => sub(action, this.state))

	return entry.length > 1
		? Promise.all(entry.map(handler => handler(payload)))
		: entry[0](payload)
}
```

### mapState
```JavaScript
// 在单独构建的版本中辅助函数为Vuex.mapState
import { mapState } from 'vuex'

export default {
	computed: mapState({
		count: state => state.count,

		countAlias: 'count',

		countPlusLocalState (state) {
			return state.count + this.localCount
		}
	})
}

// src/helpers.hs
// namespace 表示命名空间， map 表示具体的对象
export const mapState = normalizeNamespace((namespace, states) => {
	const res = {}
	normalizeMap(states).forEach(({key, val}) => {
		res[key] = function mappedState () {
			let state = this.$store.state
			let getters = this.$store.getters
			if (namespace) {
				const module = getModuleByNamespace(this.$store, 'mapState', namespace)
				if (!module) {
					return
				}
				state = module.context.state
				getters = module.context.getters
			}
			return typeof val === 'function'
				? val.call(this, state, getters)
				: state[val]
		}
		// mark vuex getter for devtools
		res[key].vuex = true
	})
	return res
})

function normalizeNamespace (fn) {
	return (namespace, map) => {
		if (typeof namespace !== 'string') {
			map = namespace
			namespace = ''
		} else if (namespace.charAt(namespace.length - 1) !== '/') {
			namespace += '/'
		}
		return fn(namespace, map)
	}
}

function normalizeMap (map) {
	return Array.isArray(map)
		? map.map(key => ({key, val: key}))
		: Object.keys(map).map(key => ({ key, val: map[key] }))
}

```

### mapGetters
```JavaScript
import { mapGetters } from 'vuex'

export default {
	computed: {
		// 使用对象展开运算符 将getter混入computed对象中
		mapGetters([
			'doneTodosCount',
			'anotherGetter'
		])
	}
}

export const mapGetters = normalizeNamespace((namespace, getters) => {
	const res = {}
	normalizeMap(getters).forEach(({key, val}) => {
		// this namespace has been mutate by normalizeNamespace
		val = namespace + val
		res[key] = function mappedGetter () {
			if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
				return
			}
			if (process.env.NODE_ENV !== 'production' && !(val in this.$store.getters)) {
				console.error(`[vuex] unknown getter: ${val}`)
				return
			}
			return this.$store.getters[val]
		}
		// mark vuex getter for devtools
		res[key].vuex = true
	})
	return res
})
```

mapMutations 支持传入一个数组或者一个对象，目标都是组件中对应的methods映射为store.commit的调用
```JavaScript
export const mapMutations = normalizeNamespace((namespace, mutations) => {
	const res = {}
	normalizeMap(mutations).forEach(({key, val}) => {
		res[key] = function mappedMutation (...args) {
			// Get the commit method from store
			let commit = this.$store.commit
			if (namespace) {
				const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
				if (!module) {
					return
				}
				commit = module.context.commit
			}
			return typeof val === 'function'
				? val.apply(this, [commit].concat(args))
				: commit.apply(this.$store, [val].concat(args))
		} 
	})
	return res
})
```

mapActions
```JavaScript
export const mapActions = normalizeNamespace((namespace, actions) => {
	const res = {}
	normalizeMap(actions).forEach(({key, val}) => {
		res[key] = function mappedAction (...args) {
			// get dispatch function from store
			let dispatch = this.$store.dispatch
			if (namespace) {
				const module = getModuleByNamespace(this.$store, 'mapActions', namespace)
				if (!module){
					return
				}
				dispatch = module.context.dispatch
			}
			return typeof val === 'function'
				? val.apply(this, [dispatch].concat(args))
				: dispatch.apply(this.$store, [val].concat(args))
		}
	})
	return res
})
```

### 动态更新模块
store 提供了一个registerModule
```JavaScript
registerModule (path, rawModule, options = {}) {
	if (typeof path === 'string') path = [path]
	if (process.env.NODE_ENV !== 'production') {
		assert(Array.isArray(path), `module path must be a string or an Array.`)
		assert(path.length > 0, 'cannot register the root module by using registerModule.')
	}
}

this._modules.register(path, rawModule)
installModule(this, this.state, path, this._modules.get(path), options.preserveState)
// reset store to update getters...
resetStoreVM(this, this.state)
```

registerModule 支持传入一个path模块路径和rawModule模块定义，首先执行register方法扩展模块树，接着执行installModule安装模块，最后执行resetStoreVM重新实例化store._vm，并销毁旧的store._vm

store 提供了一个 unregisterModule 模块动态卸载功能
```JavaScript
unregisterModule (path) {
	if (typeof path === 'string') path = [path]

	if (process.env.NODE_ENV !== 'production') {
		assert(Array.isArray(path), `module path must be a string or an Array.`)
	}

	this._modules.unregister(path)
	this._withCommit(() => {
		const parentState = getNestedState(this.state, path.slice(0, -1))
		Vue.delete(parentState, path[path.length - 1])
	})
	resetStore(this)
}

unregister (path) {
	const parent = this.get(path.slice(0, -1))
	const key = path[path.length - 1]
	if (!parent.getChild(key).runtime) return

	parent.removeChild(key)
}

function resetStore (store, hot) {
	store._actions = Object.create(null)
	store._mutations = Object.create(null)
	store._wrappedGetters = Object.create(null)
	store._modulesNamespaceMap = Object.create(null)
	const state = store.state
	// init all modules
	installModule(store, state, [], store._modules.root, true)
	// reset vm
	resetStoreVM(store, state, hot)
}
```

### 插件
Vuex除了提供的存取能力，还提供了一种插件能力，让我们可以监控store的变化过程来做一些事情
Vuex的store接受plugins选项，我们在实例化Store的时候可以传入插件，它是一个数组，然后在执行Store构造函数的时候，会执行这些插件：
```JavaScript
const {
	plugins = [],
	strict = false
} = options
// apply plugins
plugins.forEach(plugin => plugin(this))
```

### Logger 插件
相当于订阅来mutation的提交，它的prevState表示之前的state，nextState表示提交mutation后的state，这俩个state都需要执行deepCopy方法拷贝一份对象的副本，这样对他们的修改就不会影响原始store.state

接下来就构造一些格式化的消息，打印除一些事件消息message，之前的状态prevState，对应的mutation操作formattedMutation以及下一个状态nextState。

```Javascript
// src/plugins/logger.js
export default function createLogger({
	collapsed = true,
	filter = (mutation, stateBefore, stateAfter) => true,
	transformer = state => state,
	mutationTransformer = mut => mut,
	logger = console
} = {}){
	return store => {
		let prevState = deepCopy(store.state)

		store.subscribe((mutation, state) => {
			if (typeof logger === 'undefined'){
				return
			}
			const nextState = deepCopy(state)

			if (filter(mutation, prevState, nextState)) {
				const time = new Date()
				const formattedTime = `@ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`
				const formattedMutation = mutationTransformer(mutation)
				const message = `mutation ${mutation.type}${formattedTime}`
				const startMessage = collapsed
					? logger.groupCollapsed
					: logger.group
				try {
					startMessage.call(logger, message)
				} catch (e) {
					console.log(message)
				}

				logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', transformer(prevState))
				logger.log('%c mutation', 'color: #03A9F4; font-weight: bold', formattedMutation)
				logger.log('%c next state', 'color: #4CAF50; font-weight: bold',transformer(nextState))

				try {
					logger.groupEnd()
				} catch (e) {
					logger.log('—— log eng ——')
				}
			}

			prevState = nextState
		})
	}
}

function repeat (str, times) {
	return (new Array(times + 1).join(str))
}

function pad (num, maxLength) {
	return repeat('0', maxLength - num.toString().length) + num	
}
```

subscribe
```JavaScript
subscribe (fn) {
	return genericSubscribe(fn, this._subscribers)
}

function genericSubscribe (fn, subs) {
	if (subs.indexOf(fn) < 0) {
		subs.push(fn)
	}
	return () => {
		const i = subs.indexOf(fn)
		if (i > -1) {
			subs.splice(i, 1)
		}
	}
}

```
