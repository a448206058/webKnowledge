// (function(global, factory) {
// 	global.niuniu = factory
// })(this, function(options) {
// 	function Vue(options) {
// 		console.log(options)
// 		this.name = options.name;
// 		this._init();
// 		console.log(options.name)
// 	}

// 	function _init() {
// 		Vue.prototype.age = 18;
// 		Vue.prototype.id = 10;
// 	}
// 	return Vue
// })

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
		defineReactive(vue._data);
		return vue;
	}
	
	function defineReactive(obj) {
		for (var key in obj) {
			if (obj[key] instanceof Array) {
				defineReactive(obj[key]);
			} else if (obj[key] instanceof Object) {
				defineReactive(obj[key]);
			} else {
				defineProperty(obj, key);
			}
		}
	}
	
	function defineProperty(object, key) {
		Object.defineProperty(object, key, {
			get() {},
			set(newValue) {console.log('监听到变化')}
		});
	}
	// function updateDOM() {}
	return dVue;
})
