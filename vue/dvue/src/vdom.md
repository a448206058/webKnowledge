##虚拟dom
Virtual DOM就是用一个原生的JS对象去描述一个DOM节点

VNode是对真实DOM的一种抽象描述，它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等，其它属性都是用来扩展VNode
的灵活性以及实现一些特殊feature的。由于VNode只是用来映射到真实DOM的渲染，不需要包含操作DOM的方法，因此它是非常轻量和简单的。

Virtual DOM除了它的数据结构的定义，映射到真实DOM实际上要经历VNode的create、diff、patch等过程

实现思路：
初始化页面index.html, 用 webpack 引入main.js
```JavaScript
// index.html
/*
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
*/

// main.js
import dVue from "./index";

var vm = new dVue({
	el: '#app',
	data: {
		items: [
			'item1',
			'item2',
			'item3',
		]
	},
	render(h) {
		var children = this.$data.items.map(item => h('li', item))
		var vnode = h('ul', null, children)
		return vnode
	},
	methods: {
	}
});

```
1.首先定义一个vnode.js 简单定义一下vnode的属性
```JavaScript
export default class VNode{
    constructor(tag, data, children, text){
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
    }
}
```

2.定义一个index.js 初始化dVue，和reactive过程中的类似，有兴趣的可以看一下
```JavaScript
import vnode from './vnode'

export default class dVue {
    constructor(options) {
		let vm = this;
        // 1、保存vue实例传递过来的数据
        vm.$options = options // options是vue实例传递过来的对象
        vm.$data = options.data // 传递过来的data数据
        // el 是字符串还是对象
        vm.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    }
}
```

3.接下来通过render函数初始化vnode节点，调用$mount挂载$el
```JavaScript
import vnode from './vnode'

export default class dVue {
    constructor(options) {
		let vm = this;
        // 1、保存vue实例传递过来的数据
        vm.$options = options // options是vue实例传递过来的对象
        vm.$data = options.data // 传递过来的data数据
        // el 是字符串还是对象
        vm.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el

        var render = options.render
        vm.vnode = render.call(vm, createVNode)
		
        vm.$mount(vm.$el);
    }
}

function createVNode(tag, data, children) {
    var vnodes = new vnode(tag, undefined, undefined, undefined)
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
```

4.$mount实现
```JavaScript
dVue.prototype.$mount = function (ref) {
    var refElm = ref
    var parentElm = refElm.parentNode

	let vm = this;

	let updateComponent = () => {
		const vnode = vm._render()
		vm._update(vnode, true)
	}
	updateComponent()

    return this
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


```

5.接下来通过createElm来实现真实节点的渲染
```JavaScript
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
    }

	vnode.elm = elm;

    return elm
}
```
至此其实也就完成了第一次的渲染
然后为了改变实例，了解下diff和patch的过程
```JavaScript
export default class dVue {
    constructor(options) {
		let vm = this;
        // 1、保存vue实例传递过来的数据
        vm.$options = options // options是vue实例传递过来的对象
        vm.$data = options.data // 传递过来的data数据
        // el 是字符串还是对象
        vm.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el

        var render = options.render
        vm.vnode = render.call(vm, createVNode)

        vm.$mount(vm.$el);

		setTimeout(function(){
			vm.$data.items = ['cc1', 'cc2', 'cc3']
			vm.vnode = render.call(vm, createVNode)
			vm.$mount(vm.$el);
		}, 1000)
    }
}
```

6.patch
patch方法中分为俩种情况，一种是当oldVnode不存在时，会创建新的节点;
另一种是已经存在oldVnode，那么会对oldVnode和vnode进行diff及patch的过程。
其中patch过程中会调用sameVnode方法来对传入的2个vnode节点进行基本属性的比较，只有当基本属性相同的情况下才认为这2个
vnode只是局部发生了更新，然后才会对这2个vnode进行diff，如果2个vnode的基本属性存在不一致的情况，那么就会直接跳过diff的
过程，进而依据vnode新建一个真实的dom，同时删除老的dom节点。

```JavaScript
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
```

7.实现一下diff
比较prevVnode 和 vnode 并根据需要操作的vdom节点 patch，最后生成新的真实dom节点完成视图的更新
通过patch进行比较 首先比较父节点是否相同，不同的情况下比较子节点

diff算法是通过同层的树节点进行比较而非对树进行逐层搜索遍历的方式，所以时间复杂度只有O(n)，
是一种非常高效的算法。

参考snabbdom

对于同层的子节点，主要有删除、创建的操作，同时通过移位的方法，达到最大复用存在节点的目的，
其中需要维护四个索引
oldStartIdx => 旧头索引
oldEndIdx => 旧尾索引
newStartIdx => 新头索引
newEndIdx => 新尾索引

然后将旧子节点组和新子节点组进行逐一比对，直到遍历完任一子节点组，比对策略有5种：
oldStartVnode和newStartVnode进行比对，如果相似，则进行patch，然后新旧头索引都后移
oldEndVnode和newEndVnode进行比对，如果相似，则进行patch，然后新旧尾索引前移
oldStartVnode和newEndVnode进行比对，如果相似，则进行patch，旧旧节点移位到最后
oldEndVnode和newStartVnode进行比对，处理和上面类似，只不过改为左移
如果以上情况都失败来，旧只能复用key相同的节点了。首先我们要通过createKeyToOldIdx

创建key-index的映射，如果新节点在旧节点中不存在，我们将它插入到旧头索引节点前，然后
新头索引向后；如果新节点在旧节点组中存在，先找到对应的旧节点，然后patch，并将旧节点组中
对应节点设置为undefined，代表已经遍历过了，不再遍历，否则可能存在重复插入的问题，最后
将节点移位到旧头索引之前，新头索引向后

遍历完之后，当旧头索引大于旧尾索引是，代表旧节点组已经遍历完，将剩余的新Vnode添加到
最后一个新节点的位置后
如果新节点组先遍历完，那么代表旧节点组中剩余节点都不需要，所以直接删除

```JavaScript
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
```


    
		
