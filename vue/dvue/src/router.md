## vue-router
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

// 把要混入的对象通过mergeOption合并到Vue的options中，由于每个组件的构造函数都会在extend阶段合并Vue.options到自身的options，
所以也就相当于每个组件都定义了mixin定义的选项
```JavaScript
//vue/src/core/global-api/mixin.js
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

vue-router定义的location数据结构和浏览器提供的window.locaiton的部分结构有点类似，
它们都是对url的结构化描述

route表示的是路由中的一条线路，除了描述类似Location的path、query、hash这些概念，
还有matched表示匹配到的所有RouteRecord
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
```JavaScript
// src/index.js
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
```JavaScript
// src/util/resolve-components.js
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