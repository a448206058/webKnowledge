import dVue from "./index";

// var vm = new dVue({
// 	el: '#app',
// 	data: {
// 		items: [
// 			'item1',
// 			'item2',
// 			'item3',
// 		],
// 		value1: 'value1',
// 		value2: 'value2'
// 	},
// 	// render(h) {
// 	// 	var children = this.$data.items.map(item => h('li', item))
// 	// 	var vnode = h('ul', null, children)
// 	// 	return vnode
// 	// },
// 	template: '<ul><li v-for="el in items">111</li></ul><div>11122111</div><div>{{value2}}</div>',
// 	methods: {
// 	}
// });

var app = new dVue({
	// app initial state
	el: '#app',
	data: {
		  firstName: 'Foo',
		  lastName: 'Bar',
	  newVal: ''
	  },
	  template: '<ul><li v-text="firstName">1111</li><li>222</li><li>{{firstName}}</li></ul>',
	//   template: '<div><div>computed:{{firstName}}</div><div @click="firstName=firstName+1">watched:{{newVal}}</div></div>',
	watch:{
	  firstName: {
		deep: true,
		handler(newVal){
		  this.newVal = newVal;
		  console.log(newVal)
		}
	  }
	},
	  computed: {
		  fullName: function () {
			  return this.firstName + ' ' + this.lastName
		  }
	  }
  })
  
