import dVue from 'index'
import Watcher from "../Watch";

const mount = dVue.prototype.$mount
dVue.prototype.$mount = function(el, hydrating){
    el = el && query(el)

    return mountComponent(this, el, hydrating);
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
