// Dep 的核心是 notify
// 通过自定义数组subs进行控制
// 主要实现 addSub removeSub 循环遍历subs 去通知watch 更新

let uid = 0;

export default Class Dep {
    static target: ?Watcher;
    id: number;
    subs: Array<Watcher>;

    constructor () {
        this.id = uid++;
        this.subs = [];
    }
	
	addSub (sub: Watcher) {
		this.subs.push(sub);
	}
	
	removeSub(sub: Watcher) {
		remove(this.subs, sub)
	}
	
	notify() {
		const subs = this.subs.slice()
		subs.sort((a, b) => a.id - b.id);
		for (let i = 0, l = subs.length; i < l;i++){
			subs[i].update()
		}
	}
}
