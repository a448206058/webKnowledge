import VNode from './vnode'
import {parse, optimize, generate} from './template.js'

const inBrowser = typeof window !== 'undefined';

export default class dVue {
    constructor(options) {
		let vm = this;
        // 1、保存vue实例传递过来的数据
        vm.$options = options // options是vue实例传递过来的对象
        vm.$data = options.data // 传递过来的data数据
		
        // el 是字符串还是对象
        vm.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el,
		vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
		
		vm._v = createTextVNode;
		// console.log(vm.$vnode)
		vm.$mount(vm.$el);
		  
  //       var render = options.render
  //       vm.vnode = render.call(vm, createVNode)
		// console.log(vm.vnode)
		// vm.vnode.children[0].text = '1111'
	
		
		// setTimeout(function(){
		// 	console.log(vm.vnode.children)
		// 	vm.vnode.children.text = '1111'
		// 	vm.$mount(vm.$el);
		// }, 1000)

		// setTimeout(function(){
		// 	vm.$data.items = ['cc12', 'cc2', 'cc3']
		// 	vm.vnode = render.call(vm, createVNode)
		// 	vm.$mount(vm.$el);
		// }, 1000)
    }
}

function createVNode(tag, data, children) {
    var vnodes = new VNode(tag, undefined, undefined, undefined)
    // {tag: tag, data: undefined, children: undefined, text: undefined}
    if (typeof data === 'string') {
        vnodes.text = data
    } else {
        vnodes.data = data;
        if (Array.isArray(children)) {
            vnodes.children = children
        } else {
            vnodes.children = [ children ]
        }
    }
    return vnodes
}

function createElm(vnode, parentElm, refElm) {
    var elm
	
    // 创建真实DOM节点
    if (vnode.tag) {
        elm = document.createElement(vnode.tag)
    } else if (vnode.text) {
        elm = document.createTextNode(vnode.text)
    }

    // 将真实DOM节点插入到文档中
    if (refElm) {
        parentElm.insertBefore(elm, refElm)
        parentElm.removeChild(refElm)
    } else {

        parentElm.appendChild(elm)
    }
    // 递归创建子节点
    if (Array.isArray(vnode.children)) {
        for (var i = 0, l = vnode.children.length; i < l; i++) {
            var childVNode = vnode.children[i]
            createElm(childVNode, elm)
        }
    } else if (vnode.text) {
        elm.textContent = vnode.text
    } else if (vnode.children.text) {
        elm.textContent = vnode.children.text
    } else if(vnode.children && vnode.children.tag){
		createElm(vnode.children, elm)
	}

	vnode.elm = elm;

    return elm
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
	
	var refElm = el
	var parentElm = refElm.parentNode
	
	let vm = this;
	
	let updateComponent = () => {
		const vnode = vm._render()
		vm._update(vnode, true)
	}
	updateComponent()
	
	return this
}

dVue.prototype._render = function(){
	const vm = this;
	const render = vm.$options.render;
	let vnode = render.call(vm, createVNode)
	return vnode
}

dVue.prototype._update = function(vnode, hydrating) {
	const vm = this;
	const prevVnode = vm._vnode;
	vm._vnode = this.vnode;
	if(!prevVnode) {
		// 第一个参数为真实的node节点，则为初始化
		patch(vm.$el, vnode, hydrating, false)
	} else {
		// 如果需要diff的prevVnode存在，那么对prevVnode和vnode进行diff
		patch(prevVnode, vnode)
	}
}

function patch(oldVnode, vnode, hydrating, removeOnly) {
	if (!isNode(oldVnode)) {
		// 当oldVnode不存在时，创建新的节点
		// isInitialPatch = true
		createElm(vnode, oldVnode.parentNode, oldVnode);
	} else {
		// 对oldVnode和vnode进行diff,并对oldVnode打patch
		const isRealElement = isDef(oldVnode.nodeType)
		if (!sameVnode(oldVnode, vnode)) {
			// patch existing root node
			patchVnode(oldVnode, vnode, null, null, removeOnly)
		}
		patchVnode(oldVnode, vnode, null, null, removeOnly)
	}
}

function sameVnode (a, b) {
	return (
		a.key === b.key &&
		a.tag === b.tag &&
		a.isComment === b.isComment &&
		isDef(a.data) === isDef(b.data) &&
		sameInputType(a, b)
	)
}

function sameInputType (a, b) {
  if (a.tag !== 'input') { return true }
  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

//

function patchVnode (oldVnode, vnode, ownerArray, index, removeOnly) {
	const elm = vnode.elm = oldVnode.elm
	const oldCh = oldVnode.children
	const ch = vnode.children
	// 如果vnode没有文本节点
	if (isUndef(vnode.text)) {
		// 如果oldVnode的children属性存在且vnode的children属性也存在
		if (isDef(oldCh) && isDef(ch)) {
			// updateChildren,对子节点进行diff
			if (oldCh !== ch) updateChildren(elm, oldCh, ch, removeOnly)
		} else if (isDef(ch)) {
			// 如果oldVnode的text存在，首先清空text的内容，然后将vnode的children添加进去
			if (isDef(oldVnode.text)) setTextContent(elm, '')
			addVnodes(elm, null, ch, 0, ch.length - 1)
		} else if (isDef(oldCh)) {
			// 删除elm下的oldchildren
			removeVnodes(elm, oldCh, 0, oldCh.length - 1)
		} else if (isDef(oldVnode.text)) {
			// oldVnode有子节点，而vnode没有，那么就清空这个节点
			setTextContent(elm, '')
		}
	} else if (oldVnode.text !== vnode.text) {
		// 如果oldVnode和vnode文本属性不同，那么直接更新真的dom节点文本元素
		setTextContent(elm, vnode.text)
	}
}

  function updateChildren (parentElm, oldCh, newCh, removeOnly) {
    // 为oldCh和newCh分别建立索引，为之后遍历的依据
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // 直到oldCh或者newCh被遍历完后跳出循环
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, newCh, newEndIdx)
        nodeOps.insertBefore(parentElm, oldStartVnode.elm, nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, newCh, newStartIdx)
        nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }


  function isNode(v) {
	  return v.tag
  }

  function isUndef (v) {
    return v === undefined || v === null
  }

  function isDef (v) {
    return v !== undefined && v !== null
  }

class nodeOps {
	insertBefore (parentNode, newNode, referenceNode) {
	  parentNode.insertBefore(newNode, referenceNode)
	}
}

function nextSibling (node) {
    return node.nextSibling
}

function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

function setTextContent (node, text) {
	 node.textContent = text
}

export const isTextInputType = makeMap('text,number,password,search,email,tel,url')

export function makeMap (str, expectsLowerCase){
    const map = Object.create(null)
    const list = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase
        ? val => map[val.toLowerCase()]
        : val => map[val]
}

export function createElementNS (namespace, tagName) {
	return document.createElementNS(namespaceMap[namespace], tagName)
}

export function createTextNode(text) {
	return document.createTextNode(text)
}

export function insertBefore(parentNode, newNode, referenceNode) {
	parentNode.insertBefore(newNode, referenceNode)
}

export function removeChild (node, child) {
	node.removeChild(child)
}


function removeVnodes (vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

function removeNode (el) {
    const parent = nodeOps.parentNode(el)
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
        nodeOps.removeChild(parent, el)
    }
}



function findIdxInOld (node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
        const c = oldCh[i]
        if (isDef(c) && sameVnode(node, c)) return i
    }
}


function createKeyToOldIdx (children, beginIdx, endIdx) {
    let i, key
    const map = {}
    for (i = beginIdx; i <= endIdx; ++i) {
        key = children[i].key
        if (isDef(key)) map[key] = i
    }
    return map
}



// 2


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

 function createTextVNode (val) {
    return new VNode(undefined, undefined, undefined, String(val))
  }
  
  export function createElement (
      context,
      tag,
      data,
      children,
      normalizationType,
      alwaysNormalize
  ){
	  
	  // debugger
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
  
  /**
   * Return the same value.
   */
  var identity = function (_) { return _; };
  
  var config = ({
    isReservedTag: function(a, b, c){
  	   return false
    },
     parsePlatformTagName: identity,
    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop
  });
  
  var no = function (a, b, c) { return false; };
  
  export function _createElement (
  	context,
  	tag,
  	data,
  	children,
  	normalizationType
  ){
  	// debugger
  	let vnode, ns
  	if (typeof tag === 'string') {
  		let Ctor
  		ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
  		// 如果是普通的HTML标签
  		if (tag) {
  			// vnode = new VNode(undefined, undefined, undefined, String('111'))
  			// vnode = new VNode(
  			// 	config.parsePlatformTagName(tag), data, children,
  			// 	undefined, undefined, context
  			// )
			
			vnode = new VNode(
				tag, data, children,
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
  
  // ref #5318
  // necessary to ensure parent re-render when deep bindings like :style and
  // :class are used on slot nodes
  function registerDeepBindings (data) {
    if (isObject(data.style)) {
      traverse(data.style);
    }
    if (isObject(data.class)) {
      traverse(data.class);
    }
  }
  
  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }