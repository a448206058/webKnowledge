// Dep 的核心是 notify
// 通过自定义数组subs进行控制
// 主要实现 addSub removeSub 循环遍历subs 去通知watch 更新

export default class Dep {

    constructor () {
        this.id = uid++;
        this.subs = [];
    }

	addSub (sub) {
		this.subs.push(sub);
	}

	removeSub(sub) {
		remove(this.subs, sub)
	}

	// 这个方法等同于 this.subs.push(Watcher);
	depend() {
    	if (Dep.target) {
    		Dep.target.addDep(this);
		}
	}

	// 这个方法就是发布通知 告诉你 有改变了
	notify() {
		const subs = this.subs.slice()
		subs.sort((a, b) => a.id - b.id);
		for (let i = 0, l = subs.length; i < l;i++){
			subs[i].update()
		}
	}
}

Dep.target = null;
