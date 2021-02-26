import dVue from "./index";
import Watcher from "../Watch";
import {noop} from "./config"
import {renderMixin} from '../intance/render'

export function initMixin (dVue) {
    dVue.prototype._init = function(options) {
        const vm = this
        vm.$options = options;
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
        return vm;
    }

    dVue.prototype.$mount = function(el, hydrating){
        el = el && query(el)

        return mountComponent(this, el, hydrating);
    }

    dVue.prototype._update = function(vnode, hydrating) {
        console.log(1111)
        const vm = this
        const prevEl = vm.$el
        const prevVnode = vm._vnode
        const restoreActiveInstance = setActiveInstance(vm)
        vm._vnode = vnode;
        console.log(vm._vnode)
        if(!prevVnode){
            // 第一个参数为真实的node节点，则为初始化
        }
    }

    renderMixin(dVue);
}

function query(el) {
    if (typeof el === 'string') {
        const selected = document.querySelector(el)
        if (!selected){
            return document.createElement('div');
        }
    } else {
        return el
    }
}

function mountComponent(vm, el, hydrating) {
    vm.$el = el
    let updateComponent
    updateComponent = () => {
        vm._update(vm._render(), hydrating)
    }
    vm._update(vm._render(), hydrating)

    new Watcher(vm, updateComponent, noop, {
        before() {
            if (vm._isMounted && !vm._isDestroyed){
                callHook(vm, 'beforeUpdate')
            }
        }
    }, true)
    hydrating = false

    return vm
}

