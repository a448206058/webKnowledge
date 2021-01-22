// 定义发布者类
class Publisher {
	constructor() {
		this.observers = [];
		console.log('Publisher created.');
	}
	// 增加订阅者（拉群）
	add(observer) {
		console.log('Publisher.add invoked.');
		this.observers.push(observer);
	}
	// 移除订阅者（踢人）
	remove(observer) {
		console.log('Publisher.remove invoked.');
		this.observers.forEach((item, i) => {
			if(item === observer) {
				this.observers.splice(i, 1);
			}
		})
	}
	// 通知所有订阅者
	notify() {
		console.log('Publisher.notify invoked.');
		this.observers.forEach((observer) => {
			observer.update(this);
		});
	}
}


// 定义订阅者
class Observer {
	constructor() {
		console.log('Observer created.');
	}
	update(publisher) {
		console.log('Observer.update invoked.');
	}
}

// 定义一个具体的需求文档PRD发布类
class PrdPublisher extends Publisher {
	constructor() {
		super();
		// 初始化需求文档
		this.prdState = null;
		// 拉群前，开发群目前为空
		this.observers = [];
		console.log('PrdPublisher created.');
	}
	// 用于获取当前的prdState
	getState() {
		console.log('PrdPublisher.getState invoked.');
		return this.prdState;
	}
	// 用于改变prdState的值
	setState(state) {
		console.log('PrdPublisher.setState invoked');
		// prd的值发生变化
		this.prdState = state;
		// 需求文档变更，立刻通知所有人
		this.notify();
	}
}
// 定义一个具体的开发订阅者
class DeveloperObserver extends Observer {
	constructor() {
		super();
		//
		this.prdState = {};
		console.log('DeveloperObserver created.');
	}
	update(publisher) {
		// super.update(publisher);
		console.log('DeveloperObserver.update invoked.');
		// 更新需求文档
		this.prdState = publisher.getState();
		// 调用工作函数
		this.work();
	}
	// 一个专门的搬砖方法
	work() {
		// 获取需求文档
		const prd = this.prdState;
		// 开始根据需求文档提供的信息搬砖
		// ...
		console.log('996 begins...');
	}
}

// 创建订阅者：前端李雷
const lilei = new DeveloperObserver();
// 创建订阅者：小A
const A = new DeveloperObserver();
// 创建订阅者：小B
const B = new DeveloperObserver();
// 创建发布者：韩梅梅
const hanMeiMei = new PrdPublisher();
// 需求文档出现
const prd = {
	// .. 具体的需求内容
	name: '111',
	step: '123'
}
// 韩梅梅拉群
hanMeiMei.add(lilei);
hanMeiMei.add(A);
hanMeiMei.add(B);
// 韩梅梅更新了需求文档并@了所有人
hanMeiMei.setState(prd);