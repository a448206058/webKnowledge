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
		patch(vm.$el, vm.vnode, hydrating, false)
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
	console.log(node)
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
