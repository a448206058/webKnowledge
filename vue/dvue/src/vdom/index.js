import { initMixin } from './init'

function dVue(options) {
	this._init(options);
}

initMixin(dVue);

export default dVue;
