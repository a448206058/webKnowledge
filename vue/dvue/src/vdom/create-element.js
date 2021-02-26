import VNode, {createEmptyVNode, createTextVNode} from './vnode'
import config from './config'

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

export function createElement(context, tag, data, children, normalizationType){
    if(normalizationType === ALWAYS_NORMALIZE){
        // 场景是render函数不是生成的
        children = normalizeChildren(children)
    } else if (normalizationType === SIMPLE_NORMALIZE) {
        // 场景是render函数是编译生成的
        children = simpleNormalizeChildren(children)
    }
    let vnode, ns
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
    )
    // let vnode, ns
    // if (typeof tag === 'string') {
    //     let Ctor
    //     ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    //     if (config.isReservedTag(tag)) {
    //         // 创建虚拟vnode
    //         vnode = new VNode(
    //             config.parsePlatformTagName(tag), data, children,
    //             undefined, undefined, context
    //         )
    //     } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    //         // component
    //         vnode = createComponent(Ctor, data, context, children, tag)
    //     } else {
    //         vnode = new VNode(
    //             tag, data, children,
    //             undefined, undefined, context
    //         )
    //     }
    // } else {
    //     vnode = createComponent(tag, data, context, children)
    // }
}

export function normalizeChildren(children){
    return isPrimitive(children)
        ? [createTextVNode(children)]
        : Array.isArray(children)
            ? normalizeChildren(children)
            : undefined
}

export function simpleNormalizeChildren(children) {
    for (let i = 0; i < children.length;i++){
        if (Array.isArray(children[i])) {
            return Array.prototype.concat.apply([], children)
        }
    }
    return children
}

export function isPrimitive (value){
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        // $flow-disable-line
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    )
}
