// watch 有四类 dep watch computed watch user watch sync watch
// 在这里我们只设置 computed watch 也就是渲染watch
// 需要id 定义 get函数 update函数 run函数

let uid = 0;
export default class Watcher {
    vm: Component;
    id: number;
    deps: Array<Dep>;
    newDeps: Array<Dep>;
    depIds: Set;
    newDepIds: Set;
    getter: Function;
    value: any;
	
    constructor(vm: Component){
        this.vm = vm;

        this.id = ++uid;
        this.deps = [];
        this.newDeps = [];
        this.depIds = new Set();
        this.newDepIds = new Set();
        this.value = this.get();
    }

    get () {
        let value
        const vm = this.vm
        value = this.getter.call(vm, vm);
        return value;
    }
	
	addDep(dep) {
		const id = dep.id;
		if(!newDepIds.has(id)) {
			this.newDepIds.add(id);
			this.newDeps.push(dep);
			if(!this.depIds.has(id)) {
				dep.addSub(this);
			}
		}
	}

    update() {
        queueWatcher(this)
    }
	
	run() {
		const value = this.get()
		
		if(value !== this.value || isObject(value) || this.deep){
			const oldValue = this.value
			this.value = value
			if (this.user) {
				this.cb.call(this.vm, value, oldValue)
			}
		} else {
			this.cb.call(this.vm, value, oldValue)
		}
	}
	
	depend() {
		let i = this.deps.length
		while(i--){
			this.deps[i].depend()
		}
	}
}
