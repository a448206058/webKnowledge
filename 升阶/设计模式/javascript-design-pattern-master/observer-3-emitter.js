
class EventEmitter {
	constructor() {
		// handlers是一个map，用于存储事件与回调之间的对应关系
		this.handlers = {};
	}

	// on：用于安装事件监听器，接收目标事件名和回调函数作为参数
	on(eventName, cb) {
		// 先检查目标事件是否有对应的监听函数队列
		if(!this.handlers[eventName]) {
			// 如果没有，那么初始化一个监听函数队列
			this.handlers[eventName] = [];
		}
		// 把回调函数推入目标事件的监听函数队列里去
		this.handlers[eventName].push(cb);
	}

	// emit：用于触发目标事件，接收事件名和监听函数入参作为参数
	emit(eventName, ...args) {
		// 检查目标事件是否有监听函数队列
		if(this.handlers[eventName]) {
			// 如果有，则逐个调用队列里的回调函数
			this.handlers[eventName].forEach(calllback => {
				calllback(...args);
			});
		}
	}

	// off：用于移除某个事件回调队列里的指定回调函数
	off(eventName, cb) {
		const calllbacks = this.handlers[eventName];
		const index = calllback.indexOf(cb);
		if(index!==-1) {
			calllbacks.splice(index, 1);
		}
	}

	// once：为事件注册单次监听器
	once(eventName, cb) {
		// 对回调函数进行包装，使其执行完毕自动被移除
		const wrapper = (...args) => {
			cb(...args);
			this.off(eventName, wrapper);
		}
		this.on(eventName, wrapper);
	}
}