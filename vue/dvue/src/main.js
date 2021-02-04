(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.dVue = factory()); //执行factory()函数，将返回值Vue传递给window.Vue
}(this, (function () {
	function dVue(option) {
	console.log(222)
	console.log(option)
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
		set(newValue) {}
	});
}


function updateDOM() {}

export default dVue;
})));
