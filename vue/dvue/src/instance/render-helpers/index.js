/* @flow */

import { toNumber, toString, looseEqual, looseIndexOf } from '../../shared/util'
import { createTextVNode, createEmptyVNode } from '../core/vdom/vnode'
import { renderList } from './render-list'
import { renderSlot } from './render-slot'
import { resolveFilter } from './resolve-filter'
import { checkKeyCodes } from './check-keycodes'
import { bindObjectProps } from './bind-object-props'
import { renderStatic, markOnce } from './render-static'
import { bindObjectListeners } from './bind-object-listeners'
import { resolveScopedSlots } from './resolve-scoped-slots'
import { bindDynamicKeys, prependModifier } from './bind-dynamic-keys'

export function installRenderHelpers (target) {
  // 处理v-once（通过对tree循环给每个节点标记isStatic和isOnce
  target._o = markOnce
  // 通过parseFloat转化为数字
  target._n = toNumber
  // 转换为数字
  target._s = toString
  // 处理v-for函数
  target._l = renderList
  // 处理slot
  target._t = renderSlot
  // 检测两个变量是否相等(通过类型判断和递归的方式)
  target._q = looseEqual
  // 检测arr数组中是否包含与val变量相等的项（for循环和looseEqual结合）
  target._i = looseIndexOf
  // 处理static树的渲染（通过cached缓存和markOnce)
  target._m = renderStatic
  // 处理filters
  target._f = resolveFilter
  // 检查eventKeyCode是否存在
  target._k = checkKeyCodes
  // 合并v-bind指令到VNode中
  target._b = bindObjectProps
  // 创建一个文本节点
  target._v = createTextVNode
  // 创建一个空VNode节点
  target._e = createEmptyVNode
  // 处理ScopedSlot
  target._u = resolveScopedSlots
  // 绑定监听事件
  target._g = bindObjectListeners
  target._d = bindDynamicKeys
  target._p = prependModifier
}
