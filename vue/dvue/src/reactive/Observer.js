import Dep from './Dep'

/**
 * Observer类：作用是把data对象里面的所有属性转换成getter和setter
 * data 是创建vue实例的时候，传递过来的对象里面的data，data也是个对象
 */

export default class Observer {
    // constructor 是创建实例的时候，立刻自动执行的
    constructor(data) {
        this.walk(data);
    }

    // 遍历data对象的所有属性
    // data 是创建vue实例的时候，传递过来的对象里面的data，data也是个对象
    walk (data) {
        // 判断data是否是对象
        if (!data || typeof data !== 'object') {
            return
        }
        const keys = Object.keys(data)
        for (let i = 0; i < keys.length; i++) {
            this.defineReactive(data, keys[i], data[keys[i]])
        }

    }
    // 把data对象里面的所有属性转换成getter和setter
    defineReactive (obj, key, val) {
        // 解决this的指向问题
        let that = this

        // 为data中的每一个属性，创建dev对象，用来收集依赖和发送通知
        // 收集依赖:就是保存观察者
        let dep = new Dep()

        // 如果val也是对象，就把val内部的属性也转换成响应式数据，
        /// 也就是调用Object.defineProperty()的getter和setter
        console.log(key)
        // console.log(val)
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get () {
                // Dep.target就是观察者对象，调用dev对象的addSub方法，把观察者保存在dev对象内
                // target是Dep类的静态属性，但是却是在Watcher类中声明的
                if(Dep.target){
                    dep.addSub(Dep.target)
                }
                // Dep.target && dep.addSub(Dep.target)

                return val
            },
            set (newValue) {
                if (newValue === val) {
                    return
                }
                val = newValue
                // 对vue实例初始化后，传入的data数据的值进行修改，由字符串变成对象
                // 也要把新赋值的对象内部的属性，转成响应式
                that.walk(newValue)
                // debugger
                // data里面的数据发生了变化，调用dev对象的notify方法，通知观察者去更新视图
                dep.notify()
            }
        })
    }
}
