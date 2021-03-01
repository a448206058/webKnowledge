import Dep from './Dep'
/**
 * 当data数据发生变化，dep对象中的notify方法内通知所有的watcher对象，去更新视图
 * Watcher类自身实例化的时候，向dep对象中addSub方法中添加自己（1、2）
 */

export default class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm // vue的实例对象
        this.key = key // data中的属性名称
        this.cb = cb // 回调函数，负责更新视图

        // 1、把watcher对象记录到Dev这个类中的target属性中
        Dep.target = this // this 就是通过Watcher类实例化后的对象，也就是watcher对象
        // 2、触发observer对象中的get方法，在get方法内会调用dep对象中的addSub方法
        this.oldValue = vm[key] //更新之前的页面数据
        // console.log(Dep.target)
        Dep.target = null

    }
    // 当data中的数据发生变化的时候，去更新视图
    update () {
        // console.log(this.key)
        const newValue = this.vm[this.key]
        if (newValue === this.oldValue) {
            return
        }
        this.cb(newValue)
    }
}
