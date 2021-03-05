import dVue from "./index";

var vm = new dVue({
	el: '#app',
	data: {
		items: [
			'item1',
			'item2',
			'item3',
		]
	},
	template: '<ul><li>11</li><li>222</li><li>333</li></ul>',
	methods: {
	}
});
