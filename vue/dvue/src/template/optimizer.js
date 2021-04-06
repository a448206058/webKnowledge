/* @flow */

import { makeMap, isBuiltInTag, cached, no } from '../shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 * 优化器的目标：遍历生成的模板树
 * 并检测纯静态的子树，即
 * 永远不需要改变的DOM
 *
 * Once we detect these sub-trees, we can:
 * 一旦我们检测到这些子树，我们就可以
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 1. 把他们提升成常数，这样我们就不需要
 * 在每次重新渲染时为它们创建新节点；
 * 2. Completely skip them in the patching process.
 * 在修改过程中完全跳过它们
 */
export function optimize (root, options) {
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes.
  // 第一步：标记所有非静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 第二步：标记所有静态节点
  markStaticRoots(root, false)
}

function genStaticKeys (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic (node) {
  node.static = isStatic(node)
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 不要使组件槽内容成为静态的。这避免了
    // 1. components not able to mutate slot nodes
    // 1. 无法改变插槽节点的组件
    // 2. static slot content fails for hot-reloading
    // 2. 静态插槽内容因为热更新报错
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    // 遍历node的children 进行标记
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      if (!child.static) {
        node.static = false
      }
    }
    // 遍历node的条件表达式进行标记
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // 要使节点符合静态根的条件，它应该有
    // are not just static text. Otherwise the cost of hoisting out will
    // 不仅仅是静态文本。否则额外的消耗
    // outweigh the benefits and it's better off to just always render it fresh.
    // 得不偿失，最好总是保持更新。
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}

// 判断是不是静态节点
function isStatic (node) {
  // 如果node.type 为2即表达式 则不是静态节点
  if (node.type === 2) { // expression
    return false
  }
  // 如果node.type 为3即文本 则是静态节点
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}
