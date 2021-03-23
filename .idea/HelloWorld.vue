<template>
	<div class="hello">
		<h1>{{ msg }}</h1>
		<p>
			For a guide and recipes on how to configure / customize this project,<br>
			check out the
			<a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
		</p>
		<h3>Installed CLI Plugins</h3>
		<ul>
			<li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank" rel="noopener">babel</a></li>
		</ul>
		<h3>Essential Links</h3>
		<ul>
			<li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>
			<li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>
			<li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>
			<li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
			<li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>
		</ul>
		<h3>Ecosystem</h3>
		<ul>
			<li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
			<li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
			<li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>
			<li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
			<li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>
		</ul>

		<iframe id="test" src="http://159.75.70.9:8081/pull?u=00001019751B08D11324FE0AD0889EC3">

		</iframe>
	</div>
</template>

<script>
	import axios from 'axios'
	export default {
		name: 'HelloWorld',
		props: {
			msg: String
		},
		data: {
			t: '',
			a: '',
			cc: 1,
			pull: {},
			func: ''
		},
		async mounted() {
			// await this.test()
			// await this.test1()
			// console.time()
			// let cc = await fetch(
			// 	"data:application/octet-binary;base64,AGFzbQEAAAABBwFgAn9/AX8CFwIETWF0aANtaW4AAARNYXRoA21heAAAAwIBAAcHAQNSdW4AAgpgAV4BBn8gACECIAFBAWsiBARAA0AgAiEDQQAhBkEKIQcDQCADQQpwIQUgA0EKbiEDIAUgBhABIQYgBSAHEAAhByADQQBLDQALIAIgBiAHbGohAiAEQQFrIgQNAAsLIAIL"
			// );
			// let cc1 = (await cc).arrayBuffer();
			// let cc2 = await WebAssembly.compile(await cc1)
			// let cc3 = await WebAssembly.instantiate(cc2, {
			// 	Math: Math
			// })
			// this.func = (cc3).exports;
			//259423204
			//72886

			// let a = 273589994
			// let b =5757366
			// let result = 273590012
			// let ss = this.func.Run(...[273589994,6]);
			// console.timeEnd()
			// console.log(ss)
			this.control()
		},
		methods: {
			async control() {
				let _this = this;
				// await _this.test();
				// var val = await (await _this.jia(_this.pull.c))(_this.pull)

				// var val = await (await _this.hehe(_this.pull.c))(_this.pull)
				// var val = await (await _this.run4s(_this.pull.c))(_this.pull)

				// var val = _this.func.Run(...[_this.a[0], 100]);
				// console.log(111)
				console.time()
				//647659163463390
				//647659163463390
				//549240552640020
				//909222965867040
				//876329644586738

				//1125899906842597
				//1125899906842597
				this.pull = {
					a: [1846443, 5832672, 2104330, 4606519, 5823104, 8701887, 2975792, 8795965, 3061092, 4538106, 2870395, 1840881],
					// a: [1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000],
					// a: [8778740,3852682,3828102,8388704,7915962,1630555,2793159,6297659,7446880,8503168,9502157,3681192],
					c: "CA1807EB"
				}

				// this.t = "00001019010000036459E22024438044";
				// setTimeout(function(){
				// 	console.log(document.getElementById("test").contentWindow.document.body.innerHTML)
				// }, 2000)

				//337545406799737
				//869230333689353
				// console.log((await _this.run5(_this.pull.c)))
				var val = await (await _this.run5(_this.pull.c))(_this.pull)
				// var val = await (await _this.run5(_this.pull.c))({a: 1})
				// var val = await (await _this.hehe(_this.pull.c))(_this.pull)
				// this.a = 869230333689353;
				this.a = val;
				// this.a = 800935612759348;
				// console.log(val)
				console.log(val)
				console.timeEnd()
				// console.log(222)
				// var val = await (await _this.hehe(_this.pull.c))(_this.pull)
				// console.log(window.A593C8B8)
				// let ss =  (_x) {
				// 	return _ref.apply(this, arguments);
				// }
				// var val = 74264157;
				// _this.a = val;
				_this.test1()
			},
			async test() {
				let _this = this;
				// let url='http://159.75.70.9:8081/pull?u=00001019751B08D11324FE0AD0889EC3'


				let url='/pull?u=00001019751B08D11324FE0AD0889EC3'
				// url=url.replace(/&/g,'$')
				return new Promise((resolve, reject) => {
					_this.$axios({
						method: 'get',
						url: url
					})
							.then((response) => {
								_this.t = response.data.t;
								_this.a = response.data.a;
								console.log(response)
								// console.log(response)

								// _this.test1();
								// _this.run(response.data.c);
								// _this.hehe(response.data.c);
								_this.pull = response.data;
								resolve()

							})
							.catch((error) => {
								console.log(error)
								reject()
							})
				})

			},
			async test1() {
				let _this = this;
				let url='/push?t=' + this.t + '&a=' + this.a
				// url=url.replace(/&/g,'$')
				return new Promise((resolve, reject) => {
					this.$axios({
						method: 'get',
						// url: '/push?t=' + this.t + '&a=' + this.a,
						url: url
					})
							.then((response) => {

								if (_this.cc >= 10) {

								} else {
									// _this.control();
								}
								_this.cc = _this.cc + 1;
								// console.log(response)
							})
							.catch((error) => {
								console.log(error)
							})
				})
			},
			hehe(name) {
				const assets = "http://159.75.70.9:8080";
				// let name = this.t;
				const url = `${assets}/${name}.js`;

				return new Promise((resolve, reject) => {
					function resolving() {
						if (window[name]) {
							return resolve(window[name]);
						} else {
							return reject();
						}
					}

					if (document.querySelector(`head > script[ src = "${url}" ]`) !== null) {
						return resolving();
					}

					const script = document.createElement("script");
					script.src = url;
					script.onload = resolving;
					script.onerror = reject;
					document.head.appendChild(script);
				});
			},
			jia(name) {

			},
			run1(name) {
				let _this = this;
				let a = _this.a
				_this.a = a[0] * a[0] + a[0]
			},
			run2(name) {
				// eval(atob(
				// 	"dmFyIF8weGU5MzY9WydBNTQ3Mzc4OCddOyhmdW5jdGlvbihfMHg0OGU4NWMsXzB4ZTkzNmQ4KXt2YXIgXzB4MjNmYzVhPWZ1bmN0aW9uKF8weDI4NThkOSl7d2hpbGUoLS1fMHgyODU4ZDkpe18weDQ4ZTg1Y1sncHVzaCddKF8weDQ4ZTg1Y1snc2hpZnQnXSgpKTt9fTtfMHgyM2ZjNWEoKytfMHhlOTM2ZDgpO30oXzB4ZTkzNiwweDE5NikpO3ZhciBfMHgyM2ZjPWZ1bmN0aW9uKF8weDQ4ZTg1YyxfMHhlOTM2ZDgpe18weDQ4ZTg1Yz1fMHg0OGU4NWMtMHgwO3ZhciBfMHgyM2ZjNWE9XzB4ZTkzNltfMHg0OGU4NWNdO3JldHVybiBfMHgyM2ZjNWE7fTt3aW5kb3dbXzB4MjNmYygnMHgwJyldPWZ1bmN0aW9uKF8weDMzNTQzNyl7dmFyIF8weDFhYWMwMj0weDMwZDNmO2Zvcih2YXIgXzB4M2JlZDZhPTB4MzBkM2Y7XzB4M2JlZDZhPjB4MDtfMHgzYmVkNmEtLSl7dmFyIF8weDM3NTM0MD0weDA7Zm9yKHZhciBfMHgxZGRiNzc9MHgwO18weDFkZGI3NzxfMHgzYmVkNmE7XzB4MWRkYjc3Kyspe18weDM3NTM0MCs9XzB4MzM1NDM3WydhJ11bMHgwXTt9XzB4Mzc1MzQwJV8weDMzNTQzN1snYSddWzB4Ml09PV8weDMzNTQzN1snYSddWzB4MV0mJl8weDNiZWQ2YTxfMHgxYWFjMDImJihfMHgxYWFjMDI9XzB4M2JlZDZhKTt9cmV0dXJuIF8weDFhYWMwMjt9Ow=="
				// ))
				// console.log(eval(atob(
				// 	"dmFyIF8weGU5MzY9WydBNTQ3Mzc4OCddOyhmdW5jdGlvbihfMHg0OGU4NWMsXzB4ZTkzNmQ4KXt2YXIgXzB4MjNmYzVhPWZ1bmN0aW9uKF8weDI4NThkOSl7d2hpbGUoLS1fMHgyODU4ZDkpe18weDQ4ZTg1Y1sncHVzaCddKF8weDQ4ZTg1Y1snc2hpZnQnXSgpKTt9fTtfMHgyM2ZjNWEoKytfMHhlOTM2ZDgpO30oXzB4ZTkzNiwweDE5NikpO3ZhciBfMHgyM2ZjPWZ1bmN0aW9uKF8weDQ4ZTg1YyxfMHhlOTM2ZDgpe18weDQ4ZTg1Yz1fMHg0OGU4NWMtMHgwO3ZhciBfMHgyM2ZjNWE9XzB4ZTkzNltfMHg0OGU4NWNdO3JldHVybiBfMHgyM2ZjNWE7fTt3aW5kb3dbXzB4MjNmYygnMHgwJyldPWZ1bmN0aW9uKF8weDMzNTQzNyl7dmFyIF8weDFhYWMwMj0weDMwZDNmO2Zvcih2YXIgXzB4M2JlZDZhPTB4MzBkM2Y7XzB4M2JlZDZhPjB4MDtfMHgzYmVkNmEtLSl7dmFyIF8weDM3NTM0MD0weDA7Zm9yKHZhciBfMHgxZGRiNzc9MHgwO18weDFkZGI3NzxfMHgzYmVkNmE7XzB4MWRkYjc3Kyspe18weDM3NTM0MCs9XzB4MzM1NDM3WydhJ11bMHgwXTt9XzB4Mzc1MzQwJV8weDMzNTQzN1snYSddWzB4Ml09PV8weDMzNTQzN1snYSddWzB4MV0mJl8weDNiZWQ2YTxfMHgxYWFjMDImJihfMHgxYWFjMDI9XzB4M2JlZDZhKTt9cmV0dXJuIF8weDFhYWMwMjt9Ow=="
				// )))
				// console.log(atob(
				// 	"dmFyIF8weGU5MzY9WydBNTQ3Mzc4OCddOyhmdW5jdGlvbihfMHg0OGU4NWMsXzB4ZTkzNmQ4KXt2YXIgXzB4MjNmYzVhPWZ1bmN0aW9uKF8weDI4NThkOSl7d2hpbGUoLS1fMHgyODU4ZDkpe18weDQ4ZTg1Y1sncHVzaCddKF8weDQ4ZTg1Y1snc2hpZnQnXSgpKTt9fTtfMHgyM2ZjNWEoKytfMHhlOTM2ZDgpO30oXzB4ZTkzNiwweDE5NikpO3ZhciBfMHgyM2ZjPWZ1bmN0aW9uKF8weDQ4ZTg1YyxfMHhlOTM2ZDgpe18weDQ4ZTg1Yz1fMHg0OGU4NWMtMHgwO3ZhciBfMHgyM2ZjNWE9XzB4ZTkzNltfMHg0OGU4NWNdO3JldHVybiBfMHgyM2ZjNWE7fTt3aW5kb3dbXzB4MjNmYygnMHgwJyldPWZ1bmN0aW9uKF8weDMzNTQzNyl7dmFyIF8weDFhYWMwMj0weDMwZDNmO2Zvcih2YXIgXzB4M2JlZDZhPTB4MzBkM2Y7XzB4M2JlZDZhPjB4MDtfMHgzYmVkNmEtLSl7dmFyIF8weDM3NTM0MD0weDA7Zm9yKHZhciBfMHgxZGRiNzc9MHgwO18weDFkZGI3NzxfMHgzYmVkNmE7XzB4MWRkYjc3Kyspe18weDM3NTM0MCs9XzB4MzM1NDM3WydhJ11bMHgwXTt9XzB4Mzc1MzQwJV8weDMzNTQzN1snYSddWzB4Ml09PV8weDMzNTQzN1snYSddWzB4MV0mJl8weDNiZWQ2YTxfMHgxYWFjMDImJihfMHgxYWFjMDI9XzB4M2JlZDZhKTt9cmV0dXJuIF8weDFhYWMwMjt9Ow=="
				// ))
				return new Promise((resolve, reject) => {
					function resolving() {
						if (window[name]) {
							return resolve(window[name]);
						} else {
							return reject();
						}
					}

					var _0xe936 = ['A5473788'];
					(function(_0x48e85c, _0xe936d8) {
						var _0x23fc5a = function(_0x2858d9) {
							while (--_0x2858d9) {
								_0x48e85c['push'](_0x48e85c['shift']());
							}
						};
						_0x23fc5a(++_0xe936d8);
					}(_0xe936, 0));
					var _0x23fc = function(_0x48e85c, _0xe936d8) {
						// _0x48e85c = _0x48e85c - 0;
						var _0x23fc5a = _0xe936[_0x48e85c / 1];
						return _0x23fc5a;
					};
					window[_0x23fc('0x0')] = function(_0x335437) {
						var _0x1aac02 = 199999;
						// var _0x3bed6a = 110009
						//7508
						//106369
						for (var _0x3bed6a = 199999; _0x3bed6a > 0; _0x3bed6a--) {
							var _0x375340 = 0;
							// for (var _0x1ddb77 = 0; _0x1ddb77 < _0x3bed6a; _0x1ddb77++) {
							// 	_0x375340 += _0x335437['a'][0];
							// }
							_0x375340 = _0x335437['a'][0] * _0x3bed6a;
							if (_0x375340 % _0x335437['a'][2] == _0x335437['a'][1] && _0x3bed6a < _0x1aac02) {
								_0x1aac02 = _0x3bed6a
								console.log(1)
								// return _0x1aac02;
							}
							// _0x375340 % _0x335437['a'][2] == _0x335437['a'][1] && _0x3bed6a < _0x1aac02 && (_0x1aac02 = _0x3bed6a);
						}
						return _0x1aac02;
					}
					resolving()
					// }
					// eval(ssa)
				});
			},
			run3s(name) {
				let _this = this;
				return new Promise((resolve, reject) => {
					function resolving() {
						if (window[name]) {
							return resolve(window[name]);
						} else {
							return reject();
						}
					}
					window.A593C8B8 = async () => {
						let result = this.a.sort((a, b) => a - b);
						let c = result[0];
						c = -c;
						c = c * result[1];
						c = c + result[2];
						c = c - result[3];
						c = c * result[4];
						c = c + result[5];
						c = c - result[6];

						c = Math.abs(c)
						// console.log(c)
						return c;


					}
					resolving()
				})
			},
			run4s(name) {
				let _this = this;
				return new Promise((resolve, reject) => {
					function resolving() {
						if (window[name]) {
							return resolve(window[name]);
						} else {
							return reject();
						}
					}
					window.A661E542 = async () => {
						console.time()
						let c4 = _this.func.Run(..._this.a);
						console.timeEnd()
						return c4
					}
					resolving()
				})
			},
			run4(name) {
				let func = this.func;
				return new Promise((resolve, reject) => {
					function resolving() {
						if (window[name]) {
							return resolve(window[name]);
						} else {
							return reject();
						}
					}

					// console.log("data:application/octet-binary;base64,AGFzbQEAAAABBwFgAn9/AX8CFwIETWF0aANtaW4AAARNYXRoA21heAAAAwIBAAcHAQNSdW4AAgpgAV4BBn8gACECIAFBAWsiBARAA0AgAiEDQQAhBkEKIQcDQCADQQpwIQUgA0EKbiEDIAUgBhABIQYgBSAHEAAhByADQQBLDQALIAIgBiAHbGohAiAEQQFrIgQNAAsLIAIL")
					// window.A661E542 = async function({
					// 	a: A
					// }) {
					// 	return (await WebAssembly.instantiate(await WebAssembly.compile(await (await fetch(
					// 		"data:application/octet-binary;base64,AGFzbQEAAAABBwFgAn9/AX8CFwIETWF0aANtaW4AAARNYXRoA21heAAAAwIBAAcHAQNSdW4AAgpgAV4BBn8gACECIAFBAWsiBARAA0AgAiEDQQAhBkEKIQcDQCADQQpwIQUgA0EKbiEDIAUgBhABIQYgBSAHEAAhByADQQBLDQALIAIgBiAHbGohAiAEQQFrIgQNAAsLIAIL"
					// 	)).arrayBuffer()), {
					// 		Math: Math
					// 	})).exports.Run(...A)
					// }
					// let cc = WebAssembly.instantiate(await WebAssembly.compile(await (await fetch(
					//  		"data:application/octet-binary;base64,AGFzbQEAAAABBwFgAn9/AX8CFwIETWF0aANtaW4AAARNYXRoA21heAAAAwIBAAcHAQNSdW4AAgpgAV4BBn8gACECIAFBAWsiBARAA0AgAiEDQQAhBkEKIQcDQCADQQpwIQUgA0EKbiEDIAUgBhABIQYgBSAHEAAhByADQQBLDQALIAIgBiAHbGohAiAEQQFrIgQNAAsLIAIL"
					//  	)).arrayBuffer()), {

					// 		Math: Math
					// 	});
					// 	console.log(cc)
					// let ccs = async function(){
					// 	let cc = await fetch(
					// 	 		"data:application/octet-binary;base64,AGFzbQEAAAABBwFgAn9/AX8CFwIETWF0aANtaW4AAARNYXRoA21heAAAAwIBAAcHAQNSdW4AAgpgAV4BBn8gACECIAFBAWsiBARAA0AgAiEDQQAhBkEKIQcDQCADQQpwIQUgA0EKbiEDIAUgBhABIQYgBSAHEAAhByADQQBLDQALIAIgBiAHbGohAiAEQQFrIgQNAAsLIAIL"
					// 	 	);
					// 	let cc1 = (await cc).arrayBuffer();
					// 	let cc2 =  await WebAssembly.compile(await cc1)
					// 	let cc3 = await WebAssembly.instantiate(cc2, {
					// 		Math: Math
					// 	})
					// }
					// ccs();

					window.A661E542 = async function({
														 a: A
													 }) {

						// let c4 = func.Run(...A);
						let c4 = this.func.Run(...[a[0], 6])
						return c4
						// console.log(A)
						// return (await WebAssembly.instantiate(await WebAssembly.compile(await (await fetch(
						// 		"data:application/octet-binary;base64,AGFzbQEAAAABBwFgAn9/AX8CFwIETWF0aANtaW4AAARNYXRoA21heAAAAwIBAAcHAQNSdW4AAgpgAV4BBn8gACECIAFBAWsiBARAA0AgAiEDQQAhBkEKIQcDQCADQQpwIQUgA0EKbiEDIAUgBhABIQYgBSAHEAAhByADQQBLDQALIAIgBiAHbGohAiAEQQFrIgQNAAsLIAIL"
						// 	)).arrayBuffer()), {

						// 	Math: Math
						// })).exports.Run(...A)
					}
					//422627820
					//[422627778, 8913506]
					// 42
					//396544701
					//396544674, 6802313
					// 37
					// 294227330
					//294227294, 9955637

					// console.log(window.A661E542)
					resolving()
				})
			},
			run5s(name){
				let _this = this;
				return new Promise((resolve, reject) => {
					function resolving() {
						if (window[name]) {
							return resolve(window[name]);
						} else {
							return reject();
						}
					}
					_this.func;
					resolving()
				})
			},
			run5(name) {
				let _this = this;
				return new Promise((resolve, reject) => {
					function resolving() {
						if (window[name]) {
							return resolve(window[name]);
						} else {
							return reject();
						}
					}
					if(_this.func){
						var __TENCENT_CHAOS_STACK = _this.func;
					}else{
						var __TENCENT_CHAOS_STACK = function() {
							function __TENCENT_CHAOS_VM(f, e, c, r, l, g, s, a) {
								var n = !r;
								f = +f, e = e || [0], r = r || [
									[this],
									[{}]
								], l = l || {};
								// console.log(f)
								var t = [],
										o = null,
										u = [function() {
											// 0
											r[r.length - 2] = r[r.length - 2] | r.pop()
										}, , , function() {
											// 3
											for (var o = e[f++], u = [], n = e[f++], t = e[f++], p = [], h = 0; h < n; h++) u[e[f++]] = r[e[f++]];
											for (h = 0; h < t; h++) p[h] = e[f++];
											r.push(function i() {
												var n = u.slice(0);
												n[0] = [this], n[1] = [arguments], n[2] = [i];
												for (var t = 0; t < p.length && t < arguments.length; t++) 0 < p[t] && (n[p[t]] = [arguments[t]]);
												return __TENCENT_CHAOS_VM(o, e, c, n, l, g, s, a)
											})
										}, , function() {
											//5
											r.push(undefined)
										}, , function() {
											// 7 结束
											return !0
										}, function() {
											// 8
											var n = r[r.length - 2];
											n[0][n[1]] = r[r.length - 1]
										}, function() {
											// 9
											r.push(!r.pop())
										}, , , function() {
											//12
											r.push([e[f++]])
										}, function() {
											//13
											r[r.length - 1] = e[f++]
										}, , function() {
											//15
											r[r.length - 2] = r[r.length - 2] % r.pop()
										}, function() {
											//16
											r.push("")
										}, function() {
											//17
											f = e[f++]
										}, , , , , , , function() {
											//24
											var n = r.pop();
											r.push([r[r.pop()][0], n])
										}, function() {
											//25
											var n = e[f++];
											r[n] = r[n] === undefined ? [] : r[n]
										}, , , , , , function() {
											// 31
											var n = e[f++],
													t = r[r.length - 2 - n];
											r[r.length - 2 - n] = r.pop(), r.push(t)
										}, function() {
											//32
											var n = e[f++];
											r[r.length - 1] && (f = n)
										}, function() {
											//33
											r.length = e[f++]
										}, function() {
											//34
											r[r.length - 2] = r[r.length - 2] >= r.pop()
										}, , , function() {
											//37
											r.pop()
										}, , , , function() {
											//41
											r[r[r.length - 2][0]][0] = r[r.length - 1]
										}, , , function() {
											//44
											r[r.length - 2] = r[r.length - 2] * r.pop()
										}, function() {
											//45
											r.push([c, r.pop()])
										}, , , function() {
											//48
											r.push(r[r.pop()[0]][0])
										}, , , , function() {
											//52
											var n = e[f++],
													t = n ? r.slice(-n) : [];
											r.length -= n;
											var o = r.pop();
											r.push(o[0][o[1]].apply(o[0], t))
										}, function() {
											//53
											// debugger
											r.push(r[e[f++]][0])
										}, , function() {
											//55
											r.push(e[f++])
										}, , function() {
											//57
											var n = r.pop();
											r.push(n[0][n[1]])
										}, function() {
											//58
											r.push(r[r.length - 1])
										}, , , , , function() {
											//63
											r.length -= e[f++]
										}, , function() {
											//65
											var n = r.pop(),
													t = r.pop();
											r.push([t[0][t[1]], n])
										}, function() {
											//66
											r[r.length - 2] = r[r.length - 2] + r.pop()
										}, , function() {
											//68
											r[r.length - 1] += String.fromCharCode(e[f++])
											console.log(r[r.length - 1])
											// console.log(r[r.length - 1])
										}];
								let count = 0;
								for (0;;) try {
									let map = new Map();
									for (var p = !1; !p;){
										let num = f;
										num++;
										// if(map.has(e[num])){
										// 	p = u[e[39]]();
										// 	map.clear();
										// 	break;
										// }
										// map.set(e[num], true);
										// if(e[f] <= u.length){
										// 	// console.log(u[e[f++]]())
										// 	// let s1 = f + 1;
										// 	// console.log(e[s1])
										// 	p = u[e[f++]]();
										// }else{
										// 	f++;
										// }
										let cs = f+1;
										if(e[cs]){
											// console.log(cs-1)
											// console.log(e[cs])
										}
										// if(count>=190000){
										// 	console.log(e[cs])
										// }
										// if()
										// console.log(e[cs])
										count++;
										p = u[e[f++]]();
										// console.log(map)

									}
									if(count >= 300000){
										return;
									}

									if (0, o) throw o;
									let value;
									if(n){
										value = (r.pop(), r.slice(3 + __TENCENT_CHAOS_VM.v));
									}else{
										value = r.pop();
									}
									return value
									console.log(value)
									// console.log(n)
									// console.log(r)

									// console.log(u[e[f++]]())



								} catch (i) {
									0;
									var h = t.pop();
									if (h === undefined) throw i;
									o = i, f = h[0], r.length = h[1], h[2] && (r[h[2]][0] = o)
								}
							}
							// 3 是开始
							// 110 表示结束

							__TENCENT_CHAOS_VM.v = 0;
							return __TENCENT_CHAOS_VM(0, [33, 3, 25, 2, 16, 68, 119, 68, 105, 68, 110, 68, 100, 68, 111, 68, 119, 45, 16, 68, 67,
								68, 65, 68, 49, 68, 56, 68, 48, 68, 55, 68, 69, 68, 66, 65, 17, 2426, 33, 7, 25, 2, 25, 3, 25, 4, 25, 5, 25, 6, 12,
								4, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 55, 0, 52, 1, 41, 12, 5, 55, 0, 41, 31, 0, 12, 6,
								16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 55, 1, 52, 1, 41, 31, 0, 63, 6, 12, 5, 48, 12, 3, 16,
								68, 97, 24, 55, 0, 65, 57, 34, 9, 32, 123, 37, 17, 243, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68,
								110, 68, 116, 45, 16, 68, 49, 68, 54, 68, 54, 68, 49, 68, 53, 68, 57, 68, 52, 52, 1, 44, 41, 31, 0, 12, 6, 58, 48,
								16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68,
								57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 58, 48,
								58, 31, 1, 31, 0, 55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5, 37, 17, 103, 12, 5, 55, 0, 41, 31, 0, 37, 37, 12, 5,
								48, 12, 3, 16, 68, 97, 24, 55, 1, 65, 57, 34, 9, 32, 272, 37, 17, 392, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103,
								68, 73, 68, 110, 68, 116, 45, 16, 68, 50, 68, 52, 68, 55, 68, 55, 68, 54, 68, 50, 68, 55, 52, 1, 44, 41, 31, 0, 12,
								6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56,
								68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12,
								5, 58, 48, 58, 31, 1, 31, 0, 55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5, 37, 17, 252, 12, 4, 58, 48, 53, 6, 66, 41,
								31, 0, 12, 4, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68,
								53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41,
								31, 0, 12, 5, 55, 0, 41, 31, 0, 12, 6, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 55, 1, 52, 1,
								41, 31, 0, 63, 8, 12, 5, 48, 12, 3, 16, 68, 97, 24, 55, 2, 65, 57, 34, 9, 32, 511, 37, 17, 631, 12, 6, 58, 48, 16,
								68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 54, 68, 56, 68, 55, 68, 56, 68, 55, 68, 57, 68, 52,
								52, 1, 44, 41, 31, 0, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68,
								49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55,
								52, 1, 15, 41, 31, 0, 12, 5, 58, 48, 58, 31, 1, 31, 0, 55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5, 37, 17, 491, 12,
								5, 55, 0, 41, 31, 0, 37, 37, 12, 5, 48, 12, 3, 16, 68, 97, 24, 55, 3, 65, 57, 34, 9, 32, 660, 37, 17, 780, 12, 6,
								58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 55, 68, 53, 68, 52, 68, 54, 68, 51, 68,
								54, 68, 52, 52, 1, 44, 41, 31, 0, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16,
								68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68,
								57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 58, 48, 58, 31, 1, 31, 0, 55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5, 37,
								17, 640, 12, 4, 58, 48, 53, 6, 66, 41, 31, 0, 12, 4, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68,
								116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68,
								50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 55, 0, 41, 31, 0, 12, 6, 16, 68, 66, 68, 105, 68, 103, 68,
								73, 68, 110, 68, 116, 45, 55, 1, 52, 1, 41, 31, 0, 63, 8, 12, 5, 48, 12, 3, 16, 68, 97, 24, 55, 4, 65, 57, 34, 9,
								32, 899, 37, 17, 1019, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 50, 68,
								57, 68, 57, 68, 49, 68, 57, 68, 49, 68, 57, 52, 1, 44, 41, 31, 0, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68,
								73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68,
								56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 58, 48, 58, 31, 1, 31, 0, 55, 1, 66, 41,
								37, 13, 0, 31, 0, 0, 63, 5, 37, 17, 879, 12, 5, 55, 0, 41, 31, 0, 37, 37, 12, 5, 48, 12, 3, 16, 68, 97, 24, 55, 5,
								65, 57, 34, 9, 32, 1048, 37, 17, 1168, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45,
								16, 68, 50, 68, 49, 68, 56, 68, 50, 68, 54, 68, 52, 68, 51, 52, 1, 44, 41, 31, 0, 12, 6, 58, 48, 16, 68, 66, 68,
								105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68,
								48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 58, 48, 58, 31, 1, 31, 0,
								55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5, 37, 17, 1028, 12, 4, 58, 48, 53, 6, 66, 41, 31, 0, 12, 4, 58, 48, 16,
								68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57,
								68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 55, 0, 41, 31,
								0, 12, 6, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 55, 1, 52, 1, 41, 31, 0, 63, 8, 12, 5, 48,
								12, 3, 16, 68, 97, 24, 55, 6, 65, 57, 34, 9, 32, 1287, 37, 17, 1407, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103,
								68, 73, 68, 110, 68, 116, 45, 16, 68, 55, 68, 57, 68, 51, 68, 48, 68, 48, 68, 57, 68, 52, 52, 1, 44, 41, 31, 0, 12,
								6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56,
								68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12,
								5, 58, 48, 58, 31, 1, 31, 0, 55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5, 37, 17, 1267, 12, 5, 55, 0, 41, 31, 0, 37,
								37, 12, 5, 48, 12, 3, 16, 68, 97, 24, 55, 7, 65, 57, 34, 9, 32, 1436, 37, 17, 1556, 12, 6, 58, 48, 16, 68, 66, 68,
								105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 52, 68, 52, 68, 52, 68, 56, 68, 54, 68, 49, 52, 1, 44,
								41, 31, 0, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50,
								68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15,
								41, 31, 0, 12, 5, 58, 48, 58, 31, 1, 31, 0, 55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5, 37, 17, 1416, 12, 4, 58, 48,
								53, 6, 66, 41, 31, 0, 12, 4, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68,
								49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55,
								52, 1, 15, 41, 31, 0, 12, 5, 55, 0, 41, 31, 0, 12, 6, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45,
								55, 1, 52, 1, 41, 31, 0, 63, 8, 12, 5, 48, 12, 3, 16, 68, 97, 24, 55, 8, 65, 57, 34, 9, 32, 1675, 37, 17, 1795, 12,
								6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 53, 68, 53, 68, 57, 68, 54, 68, 48,
								68, 50, 68, 52, 52, 1, 44, 41, 31, 0, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45,
								16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53,
								68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 58, 48, 58, 31, 1, 31, 0, 55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5,
								37, 17, 1655, 12, 5, 55, 0, 41, 31, 0, 37, 37, 12, 5, 48, 12, 3, 16, 68, 97, 24, 55, 9, 65, 57, 34, 9, 32, 1824,
								37, 17, 1944, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 54, 68, 50, 68,
								52, 68, 54, 68, 56, 68, 55, 68, 51, 52, 1, 44, 41, 31, 0, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68,
								110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68,
								52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 58, 48, 58, 31, 1, 31, 0, 55, 1, 66, 41, 37, 13,
								0, 31, 0, 0, 63, 5, 37, 17, 1804, 12, 4, 58, 48, 53, 6, 66, 41, 31, 0, 12, 4, 58, 48, 16, 68, 66, 68, 105, 68, 103,
								68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54,
								68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 55, 0, 41, 31, 0, 12, 6, 16, 68, 66,
								68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 55, 1, 52, 1, 41, 31, 0, 63, 8, 12, 5, 48, 12, 3, 16, 68, 97, 24,
								55, 10, 65, 57, 34, 9, 32, 2063, 37, 17, 2183, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68,
								116, 45, 16, 68, 56, 68, 55, 68, 50, 68, 54, 68, 57, 68, 48, 68, 57, 52, 1, 44, 41, 31, 0, 12, 6, 58, 48, 16, 68,
								66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57, 68, 57, 68,
								57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 58, 48, 58, 31, 1,
								31, 0, 55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5, 37, 17, 2043, 12, 5, 55, 0, 41, 31, 0, 37, 37, 12, 5, 48, 12, 3,
								16, 68, 97, 24, 55, 11, 65, 57, 34, 9, 32, 2212, 37, 17, 2332, 12, 6, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73,
								68, 110, 68, 116, 45, 16, 68, 53, 68, 56, 68, 49, 68, 49, 68, 55, 68, 55, 68, 51, 52, 1, 44, 41, 31, 0, 12, 6, 58,
								48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68, 56, 68, 57,
								68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0, 12, 5, 58,
								48, 58, 31, 1, 31, 0, 55, 1, 66, 41, 37, 13, 0, 31, 0, 0, 63, 5, 37, 17, 2192, 12, 4, 58, 48, 53, 6, 66, 41, 31, 0,
								12, 4, 58, 48, 16, 68, 66, 68, 105, 68, 103, 68, 73, 68, 110, 68, 116, 45, 16, 68, 49, 68, 49, 68, 50, 68, 53, 68,
								56, 68, 57, 68, 57, 68, 57, 68, 48, 68, 54, 68, 56, 68, 52, 68, 50, 68, 53, 68, 57, 68, 55, 52, 1, 15, 41, 31, 0,
								16, 68, 112, 68, 97, 68, 114, 68, 115, 68, 101, 68, 73, 68, 110, 68, 116, 45, 53, 4, 52, 1, 7, 5, 7, 63, 4, 3, 38,
								0, 1, 3, 8, 31, 0, 5, 7, 37, 37
							], window)
						}();

						__TENCENT_CHAOS_STACK.g = function() {
							console.log(__TENCENT_CHAOS_STACK)
							console.log(__TENCENT_CHAOS_STACK.shift()[0])
							return __TENCENT_CHAOS_STACK.shift()[0]
						};
						// }
						this.func = __TENCENT_CHAOS_STACK;
					}
					resolving();
				})
			}
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	h3 {
		margin: 40px 0 0;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		display: inline-block;
		margin: 0 10px;
	}

	a {
		color: #42b983;
	}
</style>
