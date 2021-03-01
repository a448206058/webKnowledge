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
	render(h) {
		var children = this.$data.items.map(item => h('li', item))
		var vnode = h('ul', null, children)
		return vnode
	},
	methods: {
	}
});
