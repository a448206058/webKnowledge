import customName from './test.js';
customName(); // 'foo'
function dVue (option) {
	Object.defineProperty(this, option, {
		getter: function() {
			console.log('getter');
			updateDOM();
		},
		setter: function() {
			console.log('setter');
		}
	});
}

function updateDOM() {
}

export default dVue;