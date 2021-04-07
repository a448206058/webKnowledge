## v-model
vue的响应式原理，都是通过数据的改变去驱动DOM视图的变化，而双向绑定除了数据驱动DOM外，DOM的变化反过来影响数据，是一个双向关系，在Vue中，我们可以通过v-model来实现双向绑定。

v-model可以作用在普通表单元素上，也可以作用在组件上，它其实是一个语法糖。

```JavaScript
// genDirectives(el, state)
// src/compiler/codegen/index.js

function genDirectives(el: ASTElement, state: CodegenState): string | void {
	const dirs = el.directives
	if (!dirs) return
	let res = 'directives:['
	let hasRuntime = false
	let i, l, dir, needRuntime
	// 遍历el.directives
	for (i = 0, l = dirs.length; i < l; i++){
		dir = dirs[i]
		needRuntime = true
		const gen: DirectiveFunction = state.directives[dir.name]
		if (gen) {
			// compile-time directive that manipulates AST.
			// returns true if it also needs a runtime counterpart.
			needRuntime = !!gen(el, dir, state.warn)
		}
		if (needRuntime) {
			hasRuntime = true
			res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
				dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}`
			: ''
			}${
				dir.arg ? `,arg:"${dir.arg}"` : ''
			}${
				dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
			}},`
		}
	}
	if (hasRuntime) {
		return res.slice(0, -1) + ']'
	}
}

// baseOptions: CompilerOptions
// src/platforms/web/compiler/options
export const baseOptions: CompilerOptions = {
	expectHTML: true,
	modules,
	directives,
	isPreTag,
	isUnaryTag,
	mustUseProp,
	canBeLeftOpenTag,
	isReservedTag,
	getTagNamespace,
	staticKeys: genStaticKeys(modules)
}

// directives
// src/platforms/web/compiler/directives/index.js
export default {
	model,
	text,
	html
}

//v-model directives
export default function model (
	el: ASTElement,
	dir: ASTDirective,
	_warn: Function
): ?boolean {
	warn = _warn
	const value = dir.value
	const modifiers = dir.modifiers
	const tag = el.tag
	const type = el.attrsMap.type
	
	if (process.env.NODE_ENV !== 'production') {
		// inputs with type="file" are read only and setting the input's
		// value will throw an error.
		if (tag === 'input' && type === 'file') {
			warn(
				`<${el.tag} v-model="${value}" type="file">:\n` +
				`File inputs are read only. Use a v-on:change listener instead.`
			)
		}
	}
	
	if (el.component) {
		genComponentModel(el, value, modifiers)
		// component v-model doesn't need extra runtime
		return false
	} else if (tag === 'select') {
		genSelect(el, value, modifiers)
	} else if (tag === 'input' && type === 'checkbox') {
		genCheckboxModel(el, value, modifiers)
	} else if (tag === 'input' && type === 'radio') {
		genRadioModel(el, value, modifiers)
	} else if (tag === 'input' || tag === 'textarea') {
		genDefaultModel(el, value, modifiers)
	} else if (!config.isReservedTag(tag)) {
		genComponentModel(el, value, modifiers)
		// component v-model doesn't need extra runtime
		return false
	} else if (process.env.NODE_ENV !== 'production'){
		warn(
			`<${el.tag} v-model="${value}">` +
			`v-model is not supported on this element type. ` +
			'If you are working with contenteditable, it\'s recommended to ' +
			'wrap a library dedicated for that purpose inside a custom component.'
		)
	}
	//ensure runtime directive metadata
	return true
}

// genDefaultModel
function genDefaultModel (
	el: ASTElement,
	value: string,
	modifiers: ?ASTModifiers
): ?boolean {
	const type = el.attrsMap.type
	
	// warn if v-bind:value conflicts with v-model
	// except for inputs with v-bind:type
	if (process.env.NODE_ENV !== 'production') {
		const value = el.attrsMap['v-bind:value'] || el.attrsMap[':value']
		const typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type']
		if (value && !typeBinding) {
			const binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value'
			warn(
				`${binding}="${value}" conflicts with v-model on the same element ` +
				'because the latter already expands to a value binding internally'
			)
		}
	}
	
	const { lazy, number, trim } = modifiers || {}
	const needCompositionGuard = !lazy && type !== 'range'
	const event = lazy
		? 'change'
		: type === 'range'
			? RANGE_TOKEN
			: 'input'
			
	let valueExpression = '$event.target.value'
	if (trim) {
		valueExpression = `$event.target.value.trim()`
	}
	if (number) {
		valueExpression = `_n(${valueExpression})`
	}
	
	let code = genAssignmentCode(value, valueExpression)
	if (needCompositionGuard) {
		// message=$event.target.value
		code = `if($event.target.composing)return;${code}`
	}
	addProp(el, 'value', `(${value})`)
	addHandler(el, event, code, null, true)
	if (trim || number) {
		addHandler(el, 'blur', '$forceUpdate()')
	}
}	

// genAssignmentCode
// src/compiler/directives/model.js
/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
export function genAssignmentCode (
	value: string,
	assignment: string
): string {
	const res = parseModel(value)
	if (res.key === null) {
		return `${value}=${assignment}`
	} else {
		return `$set(${res.exp}, ${res.ley}, ${assignment})`
	}
}
```

input实现v-model的精髓，通过修改AST元素，给el添加一个prop,相当于我们在input上绑定了value,
又给el添加了事件处理，相当于在input上绑定了input事件
<input v-bind:value="message" v-on:input="message=$event.target.value">
动态绑定了input的value指向了message变量，并且在触发input事件的时候动态把message设置为目标值，这样实际上就完成了数据的双向绑定，所以说v-model实际上就是语法糖
```JavaScirpt
let vm = new Vue({
	el: '#app',
	template: '<div>'
	+ '<input v-model="message" placeholder="edit me">' +
	'<p>Message is: {{ message }}</p>' +
	'</div>',
	data() {
		return {
			message: ''
		}
	}
})

with(this) {
	return _c('div', [_c('input', {
		directives: [{
			name: "model",
			rawName: "v-model",
			value: (message),
			expression: "message"
		}],
		attrs: {"placeholder": "edit me"},
		domProps: {"value": (message)},
		on: {"input": function($event){
			if($event.target.composiong)
				return;
			message=$event.target.value
		}}
	}),_c('p', [_v("Message is: " + _s(message))])
	])
}
```

## 组件
```JavaScript
let Child = {
	template: '<div>'
	+ '<input :value="value" @input="updateValue" placeholder="edit me">' +
	'</div>',
	props: ['value'],
	methods: {
		updateValue(e) {
			this.$emit('input', e.target.value)
		}
	}
}

let vm = new Vue({
	el: '#app',
	templage: '<div>' +
	'<child v-model="message"></child>' +
	'<p>Message is: {{ message }}</p>' +
	'</div>',
	data() {
		return {
			message: ''
		}
	},
	components: {
		Child
	}
})
```

对于父组件而言，在编译阶段会解析v-model指令，依然会执行genData函数中的genDirectives函数
接着执行src/platforms/web/compiler/directives/model.js
```JavaScript
else if (!config.isReservedTag(tag)) {
	genComponentModel(el, value, modifiers);
	return false
}

// genComponentModel
// src/compiler/directives/model.js
export function genComponentModel(
	el: ASTElement,
	value: string,
	modifiers: ?ASTModifiers
): ?boolean {
	const { number, trim } = modifiers || {}
	
	const baseValueExpression = '$$v'
	let valueExpression = baseValueExpression
	if (trim) {
		valueExpression =
			`(typeof ${baseValueExpression} === 'string'` +
			`? ${baseValueExpression}.trim()` +
			`: ${baseValueExpression})`
	}
	if (number) {
		valueExpression = `_n(${valueExpression})`
	}
	const assignment = genAssignmentCode(value, valueExpression)
	
	el.model = {
		value: `(${value})`,
		expression: `"${value}"`,
		callback: `function (${baseValueExpression}) {${assignment}}`
	}
	
	// 对应例子而言
	/**
	 * el.model = {
			callback: 'function ($$v) {message=$$v}',
			expression: '"message"',
			value: '(message)'
	   }
	 */
}
```

父组件最终生成的render代码如下：
```JavaScript
with(this) {
	return _c('div', [_c('child', {
		model: {
			value: (message),
			callback: function ($$v) {
				message=$$v
			},
			expression:"message"
		}
	}),
	_c('p', [_v("Message is: "+_s(message))])],1)
}
```
创建子组件vnode阶段，会执行createComponent函数
src/core/vdom/create-component.js
```JavaScript
export function createComponent (
	Ctor: Class<Component> | Function | Object | void,
	data: ?VNodeData,
	context: Component,
	children: ?Array<VNode>,
	tag?: string
): VNode | Array<VNode> | void {
	// transform component v-model data into props & events
	if (isDef(data.model)) {
		transformModel(Ctor.options, data)
	}
	
	// extract props
	const propsData = extractPropsFromVNodeData(data, Ctor, tag)
	// extract listeners, since these needs to be treated as
	// child component listeners instead of DOM listeners
	const listeners = data.on
	
	const vnode = new VNode(
		`vue-componet-${Ctor.cid}${name ? `-${name}` : ''}`,
		data, undefined, undefined, undefined, context,
		{ Ctor, propsData, listeners, tag, children},
		asyncFactory
	)
	
	return vnode
}

// transformModel(Ctor.options, data)
// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data: any) {
	const prop = (options.model && options.model.prop) || 'value'
	const event = (options.model && options.model.event) || 'input'
	;(data.props || (data.props = {}))[prop] = data.model.value
	const on = data.on || (data.on = {})
	if (isDef(on[event])) {
		on[event] = [data.model.callback].concat(on[event])
	} else {
		on[event] = data.model.callback
	}
}
```
transformModel 给data.props添加data.model.value，并且给dagta.on添加data.model.callback
```JavaScript
data.props = {
	value: (message),
}
data.on = {
	input: function ($$v) {
		message = $$v
	}
}
```
v-model是Vue双向绑定的真正实现，但本质上就是一种语法糖，它即可以支持原生表单元素，也可以支持自定义组件。
在组件的实现中，我们是可以配置子组件接收的prop名称，以及派发的事件名称。
