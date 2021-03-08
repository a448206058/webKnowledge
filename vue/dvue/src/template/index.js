import {parse, optimize, generate} from './template.js'

const inBrowser = typeof window !== 'undefined';

export default class dVue {
    constructor(options) {
		let vm = this;
        // 1、保存vue实例传递过来的数据
        vm.$options = options // options是vue实例传递过来的对象
        vm.$data = options.data // 传递过来的data数据
        // el 是字符串还是对象
        vm.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el

        vm.$mount(vm.$el);

		var render = options.render

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

