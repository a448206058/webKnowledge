import vnode from './vnode'

export default class dVue {
    constructor(options) {
        // 1、保存vue实例传递过来的数据
        this.$options = options // options是vue实例传递过来的对象
        this.$data = options.data // 传递过来的data数据
        // el 是字符串还是对象
        this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el

        var render = options.render
        this.vnode = render.call(this, createVNode)

        this.$mount(this.$el);
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

    return elm
}

dVue.prototype.$mount = function (ref) {
    var refElm = ref
    var parentElm = refElm.parentNode
    createElm(this.vnode, parentElm, refElm)
    return this
}
