import dVue from "./index";

var vm = new dVue({
	el: '#app',
	data: {
		items: [
			'item1',
			'item2',
			'item3',
		],
		s1:''
	},
	template: '<ul><li class="1" :class="s1">11</li><li class="2">222</li><li class="3">333</li></ul>',
	methods: {
	}
});
