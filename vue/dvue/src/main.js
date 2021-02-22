import dVue from './index'
var dVues = new dVue({
	data: {
		a: 1,
		duixiang: {cc: '1', dd: '2'},
		shuzu: [{c1: '1', d1: '2'}, {c2: '11', d2: '22'}],
	}
});
dVues.data.a = 2
dVues.data.duixiang.cc = 'cc';
dVues.data.shuzu[0].c1 = '1';
