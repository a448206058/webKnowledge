import {observe} from './Observer'

(function(global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ?
		module.exports = factory :
		typeof define === 'function' && define.amd ?
		define(factory) :
		(global.dVue = factory())
})(this, function() {
	'use strict'

	function dVue(option) {
		var vue = Object.create(option);
		vue._data = option.data;
		observe(vue._data);
		return vue;
	}

	// function updateDOM() {}
	return dVue;
})
