function dVue (option) {
	Object.defineProperty(option, 'data', {
		get() { console.log(111); },
		getter() { console.log(2222)},
		set(newValue) { console.log(newValue); }
	});
	return option;
}

function updateDOM() {
}

export default dVue;
