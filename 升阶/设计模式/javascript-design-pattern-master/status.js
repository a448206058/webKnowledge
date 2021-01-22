/*
STEP 1
最简单粗暴的if-else
*/
/*
// 咖啡机类
class CoffeeMaker {
	constructor() {
		// ... 省略与咖啡状态切换无关的初始化逻辑
		// 初始化状态，没有切换任何咖啡模式
		this.state = 'init';
	}
	// 咖啡机状态切换函数
	changeState(state) {
		this.state = state;
		if(state === 'american') {
			// 用 console 代指咖啡制作流程的业务逻辑
			console.log('只吐黑咖啡');
		} else if(state === 'latte') {
			console.log('黑咖啡加奶');
		} else if(state === 'vanillaLatte') {
			console.log('黑咖啡加奶加香草糖浆');
		} else if(state === 'mocha') {
			console.log('黑咖啡加奶加巧克力');
		}
	}
}
*/

/*
STEP2 职责分离
*/
/*
class CoffeeMaker {
	constructor() {
		// ... 省略与咖啡状态切换无关的初始化逻辑
		// 初始化状态，没有切换任何咖啡模式
		this.state = 'init';
	}
	// 咖啡机状态切换函数
	changeState(state) {
		this.state = state;
		if(state === 'american') {
			// 用 console 代指咖啡制作流程的业务逻辑
			this.americanProcess();
		} else if(state === 'latte') {
			this.latteProcess();
		} else if(state === 'vanillaLatte') {
			this.vanillaLatteProcess();
		} else if(state === 'mocha') {
			this.mochaProcess();
		}
	}
	americanProcess() {
		console.log('只吐黑咖啡');
	}
	latteProcess() {
		this.americanProcess();
		console.log('加奶');
	}
	vanillaLatteProcess() {
		this.latteProcess();
		console.log('加香草糖浆');
	}
	mochaProcess() {
		this.latteProcess();
		console.log('加巧克力');
	}
}
*/

/*
STEP3 开放封闭
*/
/*
const stateToProcessor = {
	american() {
		console.log('只吐黑咖啡');
	},
	latte() {
		this.american();
		console.log('加奶');
	},
	vanillaLatte() {
		this.latte();
		console.log('加香草糖浆');
	},
	mocha() {
		this.latte();
		console.log('加巧克力');
	}
};

class CoffeeMaker {
	constructor() {
		// ... 省略与咖啡状态切换无关的初始化逻辑
		// 初始化状态，没有切换任何咖啡模式
		this.state = 'init';
	}
	// 咖啡机状态切换函数
	changeState(state) {
		this.state = state;
		// 若状态不存在，则返回
		if(!stateToProcessor[state]) {
			return;
		}
		stateToProcessor[state]();
	}
}
*/

/*
STEP 4
再次改造：将状态处理函数与咖啡机主体关联
*/
// node执行报错，浏览器console可执行
class CoffeeMaker {
	constructor() {
		// ... 省略与咖啡状态切换无关的初始化逻辑
		// 初始化状态，没有切换任何咖啡模式
		this.state = 'init';
		// 初始化牛奶的存储量
		this.leftMilk = '500ml';
	}
	stateToProcessor = {
		that: this,
		american() {
			console.log('咖啡机现在的牛奶存储量是：', this.that.leftMilk);
			console.log('只吐黑咖啡');
		},
		latte() {
			this.american();
			console.log('加奶');
		},
		vanillaLatte() {
			this.latte();
			console.log('加香草糖浆');
		},
		mocha() {
			this.latte();
			console.log('加巧克力');
		}
	}
	// 咖啡机状态切换函数
	changeState(state) {
		this.state = state;
		// 若状态不存在，则返回
		if(!this.stateToProcessor[state]) {
			return;
		}
		this.stateToProcessor[state]();
	}
}

const mk = new CoffeeMaker();
mk.changeState('latte');