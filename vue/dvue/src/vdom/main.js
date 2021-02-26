import dVue from './index'

var dVues = new dVue({
	el: '#app',
	render: function (createElement) {
		return createElement('div', {
			attrs: {
				id: 'app',
				class: "class_box"
			},
		}, this.message)
	},
	data: {
		message: 'Hello Vue!'
	}
});
