
import dVue from './index'

var dVues = new dVue({
	el: '#app',
	data: {
		text: 1,
		object: {cc: 'cc1', dd: '2'},
		array: [{c1: '1', d1: '2'}, {c2: '11', d2: '22'}],
	},
	methods: {
		changeText() {
			dVues.text = '2'
		},
		changeObject(){
			// dVues.object.cc = '3'
			dVues.object = 222
		},
		changeObjectValue(){
			dVues.object.cc = '3'
			console.log(dVues.object.cc)
			// dVues.object = 222
		},
		changeArray() {
			dVues.array[0].c1 = '333';
		}
	}
});
