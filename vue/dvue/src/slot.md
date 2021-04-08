## slot 作用域插槽
<slot text="hello" :msg="msg"></slot>
<template slot-scope="props"></template>
子组件的slot标签多了text属性，以及msg属性。父组件实现插槽的部分多了一个template标签，
以及scope-slot属性，其实在Vue2.5，scoped-slot可以作用在普通元素上。

先编译父组件，同样是通过processSlot函数去处理scoped-slot
```JavaScript
// src/compiler/parse/index.js
function processSlot (el) {
	// ...
	if (el.tag === 'template') {
		slotScope = getAndRmoveAttr(el, 'scope')
		/* istanbul ignore if */
		if (process.env.NODE_ENV !== 'production' && slotScope) {
			warn(
				`the "scope" attribute for scoped slots have been deprecated and ` +
				`replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
				`can also be used on plain elements in addition to <template> to ` +
				`denote scoped slots.`,
				true
			)
		}
		el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
	} else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
		/* istanbul ignore if */
		if (process.env.NODE_ENV !== 'production' && el.attrsMap['v-for']) {
			warn(
				`Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
				`(v-for takes higher priority). Use a wrapper <template> for the ` +
				`scoped slot to make it clearer.`,
				true
			)
		}
		el.slotScope = slotScope
	}
}
```

```JavaScript
if （element.elseif || element.else) {
	processIfConditions(element, currentParent)
} else if (element.slotScope) {
	currentParent.plain = false
	const name = element.slotTarget || '"default"'
	;(currentParent.scopedSlots || (currentParent.scopedSlotss = {}))[name] = element
} else {
	currentParent.children.push(element)
	element.parent = currentParent
}
```

genData
```JavaScript
if (el.scopedSlots) {
	data += `${genScopedSlots(el.scopedSlots, state)},`
}

function genScopedSlots (
	slots: { [key: string]: ASTElement },
	state: CodegenState
): string {
	return `scopedSlots:_u([${
		Object.keys(slots).map(key => {
			return genScopedSlot(key, slots[key], state)
		}).join(',')
	}])`
}

// genScopedSlots就是对scopedSlots对象遍历，执行genScopedSLOT
function genScopedSlot (
	key: string,
	el: ASTElement,
	state: CodegenState
): string {
	if (el.for && !el.forProcessed) {
		return genForScopedSlot(key, el, state)
	}
	const fn = `function(${String(el.slotScope)}){` +
	`return ${el.tag === 'template'
		? el.if
			? `${el.if}?${genChildren(el, state) || 'undefined'}:undefined`
			: genChildren(el, state) || 'undefined'
		: genElement(el, state)
	}}`
	return `{key:{key}, fn:${fn}}`
}
```

普通插槽和作用域插槽的实现。它们有一个很大的差别是数据作用域，普通插槽是在父组件编译和渲染阶段生成vnodes，
所以数据的作用域是父组件实例，子组件渲染的时候直接拿到这些渲染好的vnodes。而对于作用域插槽，父组件在编译
和渲染阶段并不会直接生成vnodes，而是在父节点vnode的data中保留一个scopedSlots对象，存储着不同名称的插槽
以及它们对应的渲染函数，只有在编译和渲染子组件阶段才会执行这个渲染函数生成Vnodes，由于是在子组件环境执行的，
所以对应的数据作用域是子组件实例。