import {parse, optimize, generate} from './template.js'
import VNode from './vnode'

const inBrowser = typeof window !== 'undefined';

export default class dVue {
    constructor(options) {
		let vm = this;
		options._base = vm
        // 1、保存vue实例传递过来的数据
        vm.$options = options // options是vue实例传递过来的对象
        vm.$data = options.data // 传递过来的data数据
        // el 是字符串还是对象
        vm.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el;
		
		
		
		this._init(options)

        vm.$mount(vm.$el);
		
		var render = options.render
		console.log(render)
		vm.vnode = vm.$createElement(vm)
		console.log(vm.vnode)
		
		console.log(render)
    }
}

dVue.prototype.$mount = function (el, hydrating) {
	const options = this.$options
	if (!options.render) {
		let template = options.template
		// template存在的时候取template，不存在的时候取el的outerHTML
		if(template){
			if(typeof template === 'string'){
				if (template.charAt(0) === '#') {
					template = idToTemplate(template)
				}
			} else if (template.nodeType) {
				// 当template为DOM节点的时候
				template = template.innerHTML
			} else {
				return this
			}
		}else if (el) {
			/* 获取element的outerHTML*/
			template = getOuterHTML(el)
		}
		if (template) {
			const { render, staticRenderFns } = compileToFunctions(template, {
				shouldDecodeNewlines,
				delimiters: options.delimiters
			}, this)
			options.render = render
			options.staticRenderFns = staticRenderFns
		}
	}
}

// createCompiler创建编译器，返回值是compile以及compileToFunctions
const createCompiler = createCompilerCreator(function baseCompiler(
	template,
	options
){
	if(template){
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
	}
})

export const baseOptions = {
	expectHTML: true,
	// modules,
	// directives,
	// isPreTag,
	// isUnaryTag,
	// mustUseProp,
	// canBeLeftOpenTag,
	// isReservedTag,
	// getTagNamespace,
	// staticKeys: genStaticKeys(modules)
}

function genStaticKeys (keys){
	return makeMap(
		`'type, tag, attrsList, attrsMap, plain, parent, children, attrs' +
	 (keys ? ',' + keys : '')`
	)
}

// baseCompile在执行createCompilerCreator方法时作为参数传入
const { compiler, compileToFunctions } = createCompiler(baseOptions);

let div;
function getShouldDecode (href) {
  div = div || document.createElement('div')
  div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`
  return div.innerHTML.indexOf('&#10;') > 0
}

// #3663: IE encodes newlines inside attribute values while other browsers don't
const shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

function getOuterHTML (el) {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
	console.log(el)
	el = typeof el === 'string' ? document.querySelector(el) : el;
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

function query (el) {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}


export function createCompilerCreator(baseCompile){
	return function createCompiler (baseOptions) {
		function compile(
			template,
			options
		){
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
				compiled.errors = errors
				compiled.tips = tips
				return compiled
			}
		}
		return {
			compile,
			compileToFunctions: createCompileToFunctionFn(compile)
		}
	}
}


function createCompileToFunctionFn (compile) {
	const cache = Object.create(null)

	return function compileToFunctions (
		template,
		options,
		vm
	){
		options = extend({}, options)
		const warn = options.warn
		delete options.warn

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

		// turn code into functions
		const res = {}
		const fnGenErrors = []

		res.render = createFunction(compiled.render, fnGenErrors)
		// res.rebder = compiled.render
		if(compiled.staticRenderFns){
			res.staticRenderFns = compiled.staticRenderFns.map(code => {
				return createFunction(code, fnGenErrors)
			})
		}
		return (cache[key] = res)
	}
}

function compile(
	template,
	options
){
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
	compiled.errors = errors
	compiled.tips = tips
	return compiled
}



function makeMap (str, expectsLowerCase){
    const map = Object.create(null)
    const list = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase
        ? val => map[val.toLowerCase()]
        : val => map[val]
}



export function extend (to, _from) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

function createFunction (code, errors) {
	 try {
		return new Function(code)
	} catch (err) {
		errors.push({ err, code })
		return noop
	}
}

export function noop (a, b, c) {}





/*
  component
*/

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
	dVue[type] = function (id, definition){
		if (!definition) {
			return this.options[type + 's'][id]
		} else {
			// 组件注册
			if (type === 'component' && isPlainObject(definition)) {
				definition.name = definition.name || id
				// 如果definition是一个对象，需要调用Vue.extend()转换成函数。Vue.extend会创建一个Vue的子类（组件类）	
				// 并返回子类的构造函数
				if(this.options){
					definition = this.options._base.extend(definition)
				}
				
			}
			// 这里很关键，将组件添加到构造函数的选项对象中Vue.options上
			if(this.options){
				this.options[type + 's'][id] = definition
			}
			return definition
		}
	}
})

const _toString = Object.prototype.toString

export function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}


const ALWAYS_NORMALIZE = 2;
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
	// if (options && options._isComponent) {
		console.log(options.components)
	if (options && options.components) {
    // if (options && options._isComponent) {
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
	// console.log(vm.$options.el)
    if (vm.$options.el) {
        vm.$mount(vm.$options.el)
    }
	
	 initRender(vm)
}


export function initRender (vm) {
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


//src/core/vdom/create-element.js

 // wrapper function for providing a more flexible interface
 // without getting yelled at by flow
 export function createElement (
     context,
     tag,
     data,
     children,
     normalizationType,
     alwaysNormalize
 ){
	 console.log(111)
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
  * Check if value is primitive.
  */
 function isPrimitive (value) {
   return (
     typeof value === 'string' ||
     typeof value === 'number' ||
     // $flow-disable-line
     typeof value === 'symbol' ||
     typeof value === 'boolean'
   )
 }
 
 function isTrue (v) {
   return v === true
 }
 
 function isUndef (v) {
   return v === undefined || v === null
 }
 
 /**
  * Quick object check - this is primarily used to tell
  * Objects from primitive values when we know the value
  * is a JSON-compliant type.
  */
 function isObject (obj) {
   return obj !== null && typeof obj === 'object'
 }

var strats = Object.create(null);

var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };
  
/**
 * Check whether an object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return obj ? hasOwnProperty.call(obj, key) : false
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
/**
	 * mergeOptiopns
	 * 	src/core/util/options.js
	 *  mergeOptions主要功能就是把parent和child这俩个对象根据一些合并策略，合并成一个新对象并返回。
	 * 	先递归把extends和mixins合并到parent上，然后遍历parent，调用mergeField，然后再遍历child，如果
	 * 	key不在parent的自身属性上，则调用mergeField
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
	// console.log(parent)
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
		if(parent && parent[key]){
			 options[key] = strat(parent[key], child[key], vm, key)
		}
       
    }
	
	console.log(options)

    return options
}

/**
 * Validate component names
 */
function checkComponents (options) {
  for (var key in options.components) {
    validateComponentName(key);
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options, vm) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      "Invalid value for option \"props\": expected an Array or an Object, " +
      "but got " + (toRawType(props)) + ".",
      vm
    );
  }
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options, vm) {
  var inject = options.inject;
  if (!inject) { return }
  var normalized = options.inject = {};
  if (Array.isArray(inject)) {
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] };
    }
  } else if (isPlainObject(inject)) {
    for (var key in inject) {
      var val = inject[key];
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val };
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      "Invalid value for option \"inject\": expected an Array or an Object, " +
      "but got " + (toRawType(inject)) + ".",
      vm
    );
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def$$1 = dirs[key];
      if (typeof def$$1 === 'function') {
        dirs[key] = { bind: def$$1, update: def$$1 };
      }
    }
  }
}

var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

function validateComponentName (name) {
  // if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) {
  //   warn(
  //     'Invalid component name: "' + name + '". Component names ' +
  //     'should conform to valid custom element name in html5 specification.'
  //   );
  // }
  // if (isBuiltInTag(name) || config.isReservedTag(name)) {
  //   warn(
  //     'Do not use built-in or reserved HTML elements as component ' +
  //     'id: ' + name
  //   );
  // }
}


export function _createElement (
	context,
	tag,
	data,
	children,
	normalizationType
){
	console.log(111)
	let vnode, ns
	if (typeof tag === 'string') {
		let Ctor
		ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
		// 如果是普通的HTML标签
		if (config.isReservedTag(tag)) {
			vnode = new VNode(
				config.parsePlatformTagName(tag), data, children,
				undefined, undefined, context
			)
		} else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
			// 如果是组件标签，e.g. my-custom-tag
			vnode = createComponent(Ctor, data, context, children, tag)
		} else {
			vnode = new VNode(
				tag, data, children,
				undefined, undefined, context
			)
		}
	} else {
		// direct component options / constructor
		vnode = createComponent(tag, data, context, children)
	}
	
	console.log(vnode)
	
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

// function getOuterHTML (el) {
//   if (el.outerHTML) {
//     return el.outerHTML
//   } else {
//     const container = document.createElement('div')
// 	// 新增
// 	el = typeof el === 'string' ? document.querySelector(el) : el;
	
//     container.appendChild(el.cloneNode(true))
//     return container.innerHTML
//   }
// }

export function resolveAsset (
	options,
	type,
	id,
	warnMissing
) {
	if (typeof id !== 'string'){
		return
	}
	const assets = options[type]
	
	// 首先检查vue实例本身有无该组件
	if (hasOwn(assets, id)) return assets[id]
	const camelizedId = camelize(id)
	if (hasOwn(assets, camelizedId)) return assets[camelizedId]
	const PascalCaseId = capitalize(camelizedId)
	if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
	
	// 如果实例上没有，去查找原型链
	const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
	if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
		warn(
			'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
			options
		)
	}
	return res
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
    if (isObject(Ctor)) {

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
		
		console.log(baseCtor)
		console.log(Ctor)
        // Ctor = baseCtor.extend(Ctor)
		 Ctor = dVue.prototype.extend(Ctor)
    }

    // if at this stage it's not a constructor or an async component factory,
    // reject.
	// 如果Ctor还不是一个构造函数或者异步组件工厂函数，不再往下执行
    if (typeof Ctor !== 'function') {
        if (process.env.NODE_ENV !== 'production') {
            warn(`Invalid Component definition: ${String(Ctor)}`, context)
        }
        return
    }

    // async component
	// 异步组件
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
	// 重新解构构造函数的选项对象，在组件构造函数创建后，
	// Vue可能会使用全局混入造成构造函数选项对象改变。
    resolveConstructorOptions(Ctor)

    // transform component v-model data into props & events
	// 处理组件的v-model
    if (isDef(data.model)) {
        transformModel(Ctor.optiopns, data)
    }

    // extract props
	// 提取props
	
	    // const propsData = extractPropsFromVNodeData(data, Ctor, tag)
    const propsData = {}

    // functional component
	// 函数式组件
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
	// 安装组件hooks
    installComponentHooks(data)

    // return a placeholder vnode
	// 创建 vnode
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
    // if (__WEEX__ && isRecycleableComponent(vnode)) {
    //     return renderRecyclableComponentTemplate(vnode)
    // }

    return vnode
}

function isDef (v) {
  return v !== undefined && v !== null
}

export function resolveConstructorOptions (Ctor) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

let cid = 0;
// 以Vue的原型为原型创建Vue组件子类。继承实现方式采用Object.create()，在内部实现中，加入了缓存的机制
// 避免重复创建子类
dVue.prototype.extend = function (extendOptions) {
	// extendOptions 是组件的选项对象，与vue接收的一样
    extendOptions = extendOptions || {}
	// 保存对父类vue的引用
    const Super = this
	// superId 保存父类的cid
    const SuperId = Super.cid

	// 缓存构造函数
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
    }
	
	// 获取组件的名字
    // const name = extendOptions.name || Super.options.name
    // if (process.env.NODE_ENV !== 'production' && name) {
    //     validateComponentName(name)
    // }
	
	// 定义组件的构造函数
    const Sub = function VueComponent(options) {
        this._init(options)
    }
	
	// 组件的原型对象指向Vue的选项对象
	console.log(dVue.prototype)
	console.log(Super.prototype)
	// Sub.prototype = Object.create(Super.prototype)
    Sub.prototype = Object.create(Super.prototype ? Super.prototype : {})
    Sub.prototype.constructor = Sub
	
	// 为组件分配一个cid
    Sub.cid = cid++
	
	// 将组件的选项对象与Vue的选项合并
    Sub.options = mergeOptions(
        Super.options,
        extendOptions
    )
	// 通过super属性指向父类
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
	// 将组件实例的props和computed属性代理到组件原型对象上，避免每个实例创建的时候重复调用Object.defineProperty
    if (Sub.options.props) {
        initProps(Sub)
    }
	
    if (Sub.options.computed) {
        initComputed(Sub);
    }

    // allow further extension/mixin/plugin usage
	// 复制父类Vue的extend/mixin/use等全局方法
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
	// 复制父类Vue上的component、directive、filter等资源注册方法
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
	// 保存父类Vue的选项对象
    Sub.superOptions = Super.options
	// 保存组件的选项对象
    Sub.extendOptions = extendOptions
	// 保存最终的选项对象
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
	// 缓存组件的构造函数
    cachedCtors[SuperId] = Sub
    return Sub
}

function installComponentHooks(data) {
    const hooks = data.hook || (data.hook = {})
    for (let i = 0; i < hooksToMerge.length; i++) {
        const key = hooksToMerge[i];
		// 外部定义的钩子
        const existing = hooks[key]
		// 内置的组件vnode钩子
        const toMerge = componentVNodeHooks[key]
		// 合并钩子
        if (existing !== toMerge && !(existing && existing._merged)) {
            hooks[key] == existing ? mergeHook(toMerge, existing) : toMerge
        }
    }
}


// install component management hooks onto the placeholder node
// installComponentHooks(data)
// 组件vnode钩子
const componentVNodeHooks = {
	// 实例化组件
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
			// 生成组件实例
            const child = vnode.componentInstance = createComponentInstanceForVnode(
                vnode,
                activeInstance
            )
			// 挂载组件，与vue的$mount一样
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

// function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
// 	let i = vnode.data
// 	if (isDef(i)) {
// 		const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
// 		// 执行组件钩子中的init钩子，创建组件实例
// 		if (isDef(i = i.hook) && isDef(i = i.init)) {
// 			i(vnode, false)
// 		}
		
// 		// init钩子执行后，如果vnode是个子组件，该组件应该创建一个vue子实例，并挂载到DOM元素上。
// 		// 子组件的vnode.elm也设置完成。
// 		if (isDef(vnode.componentInstance)) {
// 			// 设置vnode.elm
// 			initComponent(vnode, insertedVnodeQueue)
// 			// 将组件的elm插入到父组件的dom节点上
// 			insert(parentElm, vnode.elm, refElm)
// 			if (isTrue(isReactivated)) {
// 				reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
// 			}
// 			return true
// 		}
// 	}
// }

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
	const opts = vm.$options = Object.create(vm.constructor.options ? vm.constructor.options : {})

    // doing this because it's faster than dynamic enumeration.
    const parentVnode = options._parentVnode

    //把之前我们通过createComponentInstanceForVnode函数传入的几个参数合并到内部的选项$options
    opts.parent = options.parent
    opts._parentVnode = parentVnode

    const VNodeComponentOptions = parentVnode ? parentVnode.componentOptions : {}
    opts.propsData = VNodeComponentOptions.propsData
    opts._parentListeners = VNodeComponentOptions.listeners
    opts._renderChildren = VNodeComponentOptions.children
    opts._componentTag = VNodeComponentOptions.tag

    if (options.render) {
        opts.render = options.render
        opts.staticRenderFns = options.staticRenderFns
    }
}

