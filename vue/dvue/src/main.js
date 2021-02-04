(function(global, factory) {
}(this, (function () {
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
		set(newValue) {}
	});
}


function updateDOM() {}
// export default dVue;

return dVue;
})
));
