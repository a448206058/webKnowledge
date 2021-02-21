// import {observe} from './Observer'

(function(global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ?
		module.exports = factory :
		typeof define === 'function' && define.amd ?
		define(factory) :
		(global.dVue = factory())
})(this, function() {
	'use strict'

	function dVue(option) {
		var vue = Object.create(option);
		vue._data = option.data;
		observe(vue._data);
		return vue;
	}
	
	class Observer {
	    constructor(value) {
	        this.value = value;
	        if(Array.isArray(value)){
	            this.observeArray(value);
	        } else {
	            this.walk(value);
	        }
	    }
	
	    walk(obj) {
	        const keys = Object.keys(obj);
	        for (let i = 0; i < keys.length; i++) {
	            this.defineReactive(obj, keys[i]);
	        }
	    }
	
	    observeArray(items) {
	        for (let i = 0; i < items.length; i++){
	            observe(items[i])
	        }
	    }
	
	    defineReactive(object, key, val) {
			debugger
	        let dep = new Dep();
	        let childOb = observe(val);
	        Object.defineProperty(object, key, {
	            get() {
	                // return val
	            },
	            set(newValue) {
	                // val = newValue;
	                // childOb = observe(val)
	                // dep.notify();
	                console.log('监听到变化1')
	            }
	        });
	    }
	}
	
	function observe (value) {
	    if (typeof value === 'object' && !Array.isArray(value)) {
	        value = new Observer(value)
	    }
	}
	
	class Dep {
	    constructor () {
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
	
	

	// function updateDOM() {}
	return dVue;
})
