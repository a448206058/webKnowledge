import {createElement} from '../vdom/create-element'
export let currentRenderingInstance = null

export function renderMixin(dVue){
    dVue.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
    dVue.prototype._render = function() {

        const vm = this;
        console.log(vm.$options)
        const { render, _parentVnode } = vm.$options
        let vnode
        try {
            currentRenderingInstance = vm
            // 调用createElement 方法来返回vnode
            vnode = render.call(vm._renderProxy, vm.$createElement)
        } catch (e) {
            // handleError(e, vm, `render`){}
            console.log(2223)
        }
        // set parent
        vnode.parent = _parentVnode
        console.log(vnode)
        return vnode
    }
}

