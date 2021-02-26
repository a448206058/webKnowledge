import Compiler from './Compiler'
import Observer from './Observer'

import { initMixin } from './init'

export default class dVue {
	constructor(options) {
		// 1、保存vue实例传递过来的数据
		this.$options = options // options是vue实例传递过来的对象
		this.$data = options.data // 传递过来的data数据
		// el 是字符串还是对象
		this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
		// 2、把this.$data中的成员转换成getter 和setter ，并且注入到vue实例中，使vue实例中有data里面的属性
		// 但是this.$data自身内部成员并没有实现在自身内部属性的gettter和setter，需要通过observer对象来实现
		this._proxyData(this.$data)
		// 3、调用observer对象，监视data数据的变化
		new Observer(this.$data)
		// 4、调用compiler对象，解析指令和差值表达式
		// debugger
		new Compiler(this) // this是vue实例对象
	}

	_proxyData (data) {
		// 遍历传递过来的data对象的数据，key是data对象中的属性名
		Object.keys(data).forEach((key) => {
			// 使用js的Object.defineProperty()，把数据注入到vue实例中,this就是vue实例
			Object.defineProperty(this, key, {
				configurable: true, // 可修改
				enumerable: true, // 可遍历
				// get 是 Object.defineProperty()内置的方法
				get () {
					return data[key]
				},
				// set 是 Object.defineProperty()内置的方法
				set (newValue) {
					if (newValue === data[key]) {
						return
					}
					data[key] = newValue
				}
			})
		})
	}
}
