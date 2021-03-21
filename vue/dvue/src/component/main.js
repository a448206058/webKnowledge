import dVue from "./index";

dVue.component('my-button', {
	template: '<button>hello</button>'
})

var vm = new dVue({
	el: '#app',
	components: {
		'my-button': {
			template: '<button>world</button>'
		}
	},
});

