import Dep from './Dep'

export class Observer {
    constructor(value) {
        this.value = value;
        if(Array.isArray(value)){
            this.observeArray(value);
        } else {
            console.log(value)
            console.log(value.shuzu)
            this.walk(value);
        }
    }

    walk(obj) {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            if(Array.isArray(keys[i])){
                console.log(keys[i])
            }
            this.defineReactive(obj, keys[i]);
        }
    }

    observeArray(items) {
        for (let i = 0; i < items.length; i++){
            observe(items[i])
        }
    }

    defineReactive(object, key, val) {
        let dep = new Dep();
        let childOb = observe(val);
        Object.defineProperty(object, key, {
            get() {
                return val
            },
            set(newValue) {
                val = newValue;
                childOb = observe(val)
                dep.notify();
                console.log('监听到变化1')
            }
        });
    }
}

export function observe (value) {
    if (typeof value === 'object' && !Array.isArray(value)) {
        value = new Observer(value)
    }
}
