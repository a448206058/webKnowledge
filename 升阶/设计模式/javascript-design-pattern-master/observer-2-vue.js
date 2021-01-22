// observer方法遍历并包装对象属性
function observe(target) {
	// 若target是一个对象，则遍历它
	if(target && typeof target === 'object') {
		Object.keys(target).forEach(key => {
			// defineReactive方法会给目标属性装上“监听器”
			defineReactive(target, key, target[key]);
		});
	}
}

// 定义defineReactive方法
function defineReactive(target, key, val) {
	const dep = new Dep();
	// 属性值也可能是object类型，这种情况下需要调用observer进行递归遍历
	observe(val);
	// 为当前属性安装监听器
	Object.defineProperty(target, key, {
		// 可枚举
		enumerable: true,
		// 不可配置
		configurable: false,
		get: function () {
			return val;
		},
		// 监听器函数
		/*set: function (value) {
			console.log(`${target}的${key}属性从${val}值变成了${value}`);
			val = value;
		}*/
		// 改写监听器
		set: (value) => {
			// 通知所有订阅者
			dep.notify();
		}
	});
}

// 定义订阅者类Dep
class Dep {
	constructor() {
		// 初始化订阅队列
		this.subs = [];
	}

	// 增加订阅者
	addSub(sub) {
		this.subs.push(sub);
	}

	// 通知订阅者
	notify() {
		this.subs.forEach(sub => {
			sub.update();
		});
	}
}