在编写template函数之前，首先了解下template的原理及实现过程

## template是干嘛的？
template是编译成render function的过程
```JavaScript
function baseCompile (
	template: string,
	options: CompilerOptions
): CompiledResult {
	/*parse解析得到ast树*/
	const ast = parse(template.trim(), options)
	/**
	 * 将AST树进行优化
	 * 优化的目标：生成模版AST树，检测不需要进行DOM改变的静态子树。
	 * 一旦检测到这些静态树，我们就能做以下事情：
	 * 1.把它们变成常数，这样我们就再也不需要每次重新渲染时创建新的节点了。
	 * 2.在patch的过程中直接跳过。
	 */
	optimize(ast, options) {
		/*根据ast树生成所需的code(内部包含render与staticRenderFns)*/
		const code = generate(ast, options)
		return {
			ast, 
			render: code.render,
			staticRenderFns: code.staticRenderFns
		}
	}
}
```

### parse
parse会用正则等方式解析template模版中的指令、class、style等数据，形成AST语法树

### optimize
optimize的主要作用是标记static静态节点，这是Vue在编译过程中的一处优化，后面当update
更新界面时，会有一个patch的过程，diff算法会直接跳过静态节点，从而减少了比较的过程，
优化了patch的性能。

### generate
generate是将AST语法树转化成render function字符串的过程，得到结果是render的字符串
以及staticRenderFns字符串。

### 第一步 建立页面 index.html
src/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<div id="app"></div>
</body>
</html>
```

### 第二步 建立引用 main.js
src/main.js
初始化template的值
```JavaScript
import dVue from "./index";

var vm = new dVue({
	el: '#app',
	data: {
		s1:''
	},
	template: '<ul><li class="1" :class="s1">11</li><li class="2">222</li><li class="3">333</li></ul>',
	methods: {
	}
});
```

### 第三步 建立构造函数 index.js
第一步 建立构造函数dVue
第二步 原型上绑定$mount 

    实现获取到template
    然后通过compileToFunctions把模版template编译生成render以及staticRenderFns
    compileToFunctions实际上是createCompiler方法的返回值
    createCompiler
    实际上是通过调用createCompilerCreator方法返回的，该方法传入的参数是一个函数，真正的编译过程都在这个baseCompile
    该方法返回了一个createCompiler函数，它接收一个baseOptions的参数，返回的是一个对象，包括compile方法属性
    和compileToFunctions属性
```JavaScript
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

//该方法返回了一个createCompiler函数，它接收一个baseOptions的参数，返回的是一个对象，包括compile方法属性
//和compileToFunctions属性
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
```

### 第四步 构建template.js 实现 parse optimize  generate 函数
```JavaScript
const ncname = '[a-zA-Z_][\\w\\-\\.]*';
const singleAttrIdentifier = /([^\s"'<>/=]+)/
const singleAttrAssign = /(?:=)/
const singleAttrValues = [
  /"([^"]*)"+/.source,
  /'([^']*)'+/.source,
  /([^\s"'=<>`]+)/.source
]
const attribute = new RegExp(
  '^\\s*' + singleAttrIdentifier.source +
  '(?:\\s*(' + singleAttrAssign.source + ')' +
  '\\s*(?:' + singleAttrValues.join('|') + '))?'
)

const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g

const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/

const stack = [];
let currentParent, root;

let index = 0;

var html = ''

function advance (n) {
    index += n
    html = html.substring(n)
}

function makeAttrsMap (attrs) {
    const map = {}
    for (let i = 0, l = attrs.length; i < l; i++) {
        map[attrs[i].name] = attrs[i].value;
    }
    return map
}

function parseStartTag () {
    const start = html.match(startTagOpen);
    if (start) {
        const match = {
            tagName: start[1],
            attrs: [],
            start: index
        }
        advance(start[0].length);

        let end, attr
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length)
            match.attrs.push({
                name: attr[1],
                value: attr[3]
            });
        }
        if (end) {
            match.unarySlash = end[1];
            advance(end[0].length);
            match.end = index;
            return match
        }
    }
}

function parseEndTag (tagName) {
    let pos;
    for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === tagName.toLowerCase()) {
            break;
        }
    }

    if (pos >= 0) {
        if (pos > 0) {
            currentParent = stack[pos - 1];
        } else {
            currentParent = null;
        }
        stack.length = pos;
    }
}

function parseText (text) {
    if (!defaultTagRE.test(text)) return;

    const tokens = [];
    let lastIndex = defaultTagRE.lastIndex = 0
    let match, index
    while ((match = defaultTagRE.exec(text))) {
        index = match.index

        if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }

        const exp = match[1].trim()
        tokens.push(`_s(${exp})`)
        lastIndex = index + match[0].length
    }

    if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return tokens.join('+');
}

function getAndRemoveAttr (el, name) {
    let val
    if ((val = el.attrsMap[name]) != null) {
        const list = el.attrsList
        for (let i = 0, l = list.length; i < l; i++) {
            if (list[i].name === name) {
                list.splice(i, 1)
                break
            }
        }
    }
    return val
}

function processFor (el) {
    let exp;
    if ((exp = getAndRemoveAttr(el, 'v-for'))) {
        const inMatch = exp.match(forAliasRE);
        el.for = inMatch[2].trim();
        el.alias = inMatch[1].trim();
    }
}

function processIf (el) {
    const exp = getAndRemoveAttr(el, 'v-if');
    if (exp) {
        el.if = exp;
        if (!el.ifConditions) {
            el.ifConditions = [];
        }
        el.ifConditions.push({
            exp: exp,
            block: el
        });
    }
}

/*解析HTML*/
function parseHTML () {
    while(html) {
        let textEnd = html.indexOf('<');
        if (textEnd === 0) {
            const endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                parseEndTag(endTagMatch[1]);
                continue;
            }
            if (html.match(startTagOpen)) {
                const startTagMatch = parseStartTag();
                const element = {
                    type: 1,
                    tag: startTagMatch.tagName,
                    lowerCasedTag: startTagMatch.tagName.toLowerCase(),
                    attrsList: startTagMatch.attrs,
                    attrsMap: makeAttrsMap(startTagMatch.attrs),
                    parent: currentParent,
                    children: []
                }

                processIf(element);
                processFor(element);

                if(!root){
                    root = element
                }

                if(currentParent){
                    currentParent.children.push(element);
                }

                if(!startTagMatch.unarySlash) {
                    stack.push(element);
                    currentParent = element;
                }
                continue;
            }
        } else {
            var text = html.substring(0, textEnd)
            advance(textEnd)
            let expression;
            if (expression = parseText(text)) {
                currentParent.children.push({
                    type: 2,
                    text,
                    expression
                });
            } else {
                currentParent.children.push({
                    type: 3,
                    text,
                });
            }
            continue;
        }
    }
    return root;
}

export function parse (htmls) {
    html = htmls
    return parseHTML();
}

export function optimize (rootAst) {
    function isStatic (node) {
		if(node){
			if (node.type === 2) {
			    return false
			}
			if (node.type === 3) {
			    return true
			}
			return (!node.if && !node.for);
		}
        return false

    }
    function markStatic (node) {
		if(node){
			node.static = isStatic(node);
			if (node.type === 1) {
			    for (let i = 0, l = node.children.length; i < l; i++) {
			        const child = node.children[i];
			        markStatic(child);
			        if (!child.static) {
			            node.static = false;
			        }
			    }
			}
		}

    }

    function markStaticRoots (node) {
		if(node){
			if (node.type === 1) {
			    if (node.static && node.children.length && !(
			    node.children.length === 1 &&
			    node.children[0].type === 3
			    )) {
			        node.staticRoot = true;
			        return;
			    } else {
			        node.staticRoot = false;
			    }
			}
		}
    }

    markStatic(rootAst);
    markStaticRoots(rootAst);
}

export function generate (rootAst) {

    function genIf (el) {
        el.ifProcessed = true;
        if (!el.ifConditions.length) {
            return '_e()';
        }
        return `(${el.ifConditions[0].exp})?${genElement(el.ifConditions[0].block)}: _e()`
    }

    function genFor (el) {
        el.forProcessed = true;

        const exp = el.for;
        const alias = el.alias;
        const iterator1 = el.iterator1 ? `,${el.iterator1}` : '';
        const iterator2 = el.iterator2 ? `,${el.iterator2}` : '';

        return `_l((${exp}),` +
            `function(${alias}${iterator1}${iterator2}){` +
            `return ${genElement(el)}` +
        '})';
    }

    function genText (el) {
        return `_v(${el.expression})`;
    }

    function genNode (el) {
        if (el.type === 1) {
            return genElement(el);
        } else {
            return genText(el);
        }
    }

    function genChildren (el) {
        const children = el.children;

        if (children && children.length > 0) {
            return `${children.map(genNode).join(',')}`;
        }
    }

    function genElement (el) {
        if (el.if && !el.ifProcessed) {
            return genIf(el);
        } else if (el.for && !el.forProcessed) {
            return genFor(el);
        } else {
            const children = genChildren(el);
            let code;
            code = `_c('${el.tag}',{
                staticClass: ${el.attrsMap && el.attrsMap[':class']},
                class: ${el.attrsMap && el.attrsMap['class']},
            }${
                children ? `,${children}` : ''
            })`
            return code;
        }
    }

    const code = rootAst ? genElement(rootAst) : '_c("div")'
    return {
        render: `with(this){return ${code}}`,
    }
}
```
