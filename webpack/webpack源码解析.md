对于webpack每个文件就是一个module

import 最终为 __webpack__require__函数执行
```JavaScript
// main.js
import { A } from './a'
import B from './b'
console.log(A)
B()

// a.js
export const A = 'a'

// b.js
export default function () {
    console.log('b')
}

// bundle.js
(function(modules) {
    ...(webpack的函数)
// 开始主入口函数的执行
    return __webpack_require__(__webpack_require__.s = "./demo1/main.js")
})(
{
    "./demo01/a.js": (function(){...}),
    "./demo01/b.js": (function(){...}),
    "./demo01/main.js": (function(){...}),
}
)
```

对于webpack每个文件就是一个module
调用每一个module函数时，参数为module、module.exports、__webpack_require__。
module.exports用来收集module中所有的export
```JavaScript
(function(module, __webpack_exports__, __webpack_require__) {
    ...
    // 简单理解就是
    // __webpack_exports__.A = A
    __webpack_require__.d(__webpakc_exports__, "A", function() { return A;})
    const A = 'a'

/***/ })

__webpack_require__.d = function(exports, name, getter) {
    if(!__webpack_require__.o(exports, name)) {
        Object.defineProperty(exports, name, {
            configurable: false,
            enumerable: true,
            get: getter
        });
    }
};

// Object.prototype.hasOwnProperty.call
__webpack_require__.o = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
};
```

## 异步加载
```JavaScript
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0], {
"./demo/c.js": (function(module, __webpack_exports__, __webpack_require__){
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_exports__["default"] = ({
        key2: 'key2'
    });
})
}])

var t = window["webpackJsonp"] = window["webpackJsonp"] || [])
t.push([[0], {function(){...}}])

// main.js
var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
jsonpArray.push = webpackJsonpCallback;
```

## webpack 编译总流程
step1 webpack 配置文件处理
    首先会有一个入口文件写在配置文件中，确定webpack从哪个文件开始处理。
step2 文件位置解析
    在写entry的时候，写过./main.js 这是一个相对目录，所以会有一个将相对目录变成绝对目录的处理
step3 加载文件
    step3.1 找到所有对应的loader,然后逐个执行
step4 文件解析
    module合并成chunk中
step5 从解析结果中找到文件引入的其它文件

#Tapable
webpack的整体执行过程，总的来看就是被事件驱动的。从一个事件，走向下一个事件。
Tapable用来提供各种类型的Hook
    hook事件注册——>hook触发——>生成hook执行代码——>执行

##  事件注册
先通过类实例的tap方法注册对应Hook的处理函数：
tap/tapAsync/tapPromise
taps.push({
    name: 'a',
    type: 'sync', // 'async','promise'
    fn: fn
})

##  事件触发
call/callAsync/promise
```JavaScript
this.call = this._call = this._createCompileDelegate("call", "sync");
this.promise = this._promise = this._createCompileDelegate("promise", "promise");
this.callAsync = this._callAsync = this._createCompileDelegate("callAsync", "async");
// ...
_createCall(type) {
    return this.compile({
        taps: this.taps,
        interceptors: this.interceptors,
        args: this._args,
        type: type
    });
}

_createCompileDelegate(name, type) {
    const lazyCompileHook = (...args) => {
        this[name] = this._createCall(type);
        return this[name](...args);
    };
    return lazyCompileHook;
}

```

##  compile
```JavaScript
class SyncHookCodeFactory extends HookCodeFactory {
    content({ onError, onResult, onDone, rethrowIfPossible }) {
        return this.callTapsSeries({
            onError: (i, err) => onError(err),
            onDone,
            rethrowIfPossible
        });
    }
}

const factory = new SyncHookCodeFactory();

class SyncHook extends Hook {
    compile(options) {
        factory.setup(this, options);
        return factory.create(options);
    }
}

// create
create(options) {
    this.init(options);
    switch(this.options.type) {
        case "sync":
            return new Function(this.args(), "\"use strict\";\n" + this.header() + this.content({
                onError: err => `throw ${err};\n`,
                onResult: result => `return ${result};\n`,
                onDone: () => "",
                rethrowIfPossible: true
            }));
        case "async":
            return new Function(this.args({
                after: "_callback" 
            }), "\"use strict\";\n" + this.header() + this.content({
                onError: err => `_callback(${err});\n`,
                onResult: result => `_callback(null, ${result});\n`,
                onDone: () => "_callback();\n",
            }));
        case "promise":
            let code = "";
            code += "\"use strict\";\n";
            code += "return new Promise({_resolve, _reject) => {\n";
            code += "var _sync = true;\n";
            code += this.header();
            code += this.content({
                onError: err => {
                    let code = "";
                    code += "if(_sync)\n";
                    code += `_resolve(Promise.resolve().then(() => { throw ${err}; }));\n`;
                    code += "else\n";
                    code += `_reject(${err});\n`;
                    return code;
                },
                onResult: result => `_resolve(${result});\n`,
                onDone: () => "_resolve();\n"
            });
            code += "_sync = false;\n";
            code += "});\n";
            return new Function(this.args(), code);
    }
}

// syncHook
class SyncHookCodeFactory extends HookCodeFactory {
    content({ onError, onResult, onDone, rethrowIfPossible }) {
        return this.callTapsSeries({
            onError: (i, err) => onError(err),
            onDone,
            rethrowIfPossible
        });
    }
}

// syncBailHook
content({ onError, onResult, onDone, rethrowIfPossible }) {
    return this.callTapsSeries({
        onError: (i, err) => onError(err),
        onResult: (i, result, next) => `if($result} !== undefined {\n${onResult(result)};\n} else {\n{${next()}\n`,
        onDone,
        rethrowIfPossible
    })
}
//AsyncSeriesLoopHook
class AsyncSeriesLoopHookCodeFactory extends HookCodeFactory {
    content({ onError, onDone }) {
        return this.callTapsLooping({
            onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),
            onDone
        })
    }
}

callTap(tapIndex, { onError, onResult, onDone, rethrowIfPossible }) {
	let code = "";
	let hasTapCached = false;
	// 这里的 interceptors 先忽略
	for(let i = 0; i < this.options.interceptors.length; i++) {
		const interceptor = this.options.interceptors[i];
		if(interceptor.tap) {
			if(!hasTapCached) {
				code += `var _tap${tapIndex} = ${this.getTap(tapIndex)};\n`;
				hasTapCached = true;
			}
			code += `${this.getInterceptor(i)}.tap(${interceptor.context ? "_context, " : ""}_tap${tapIndex});\n`;
		}
	}
	code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;
	const tap = this.options.taps[tapIndex];
	switch(tap.type) {
		case "sync":
			if(!rethrowIfPossible) {
				code += `var _hasError${tapIndex} = false;\n`;
				code += "try {\n";
			}
			if(onResult) {
				code += `var _result${tapIndex} = _fn${tapIndex}(${this.args({
					before: tap.context ? "_context" : undefined
				})});\n`;
			} else {
				code += `_fn${tapIndex}(${this.args({
					before: tap.context ? "_context" : undefined
				})});\n`;
			}
			if(!rethrowIfPossible) {
				code += "} catch(_err) {\n";
				code += `_hasError${tapIndex} = true;\n`;
				code += onError("_err");
				code += "}\n";
				code += `if(!_hasError${tapIndex}) {\n`;
			}
			if(onResult) {
				code += onResult(`_result${tapIndex}`);
			}
			if(onDone) {
				code += onDone();
			}
			if(!rethrowIfPossible) {
				code += "}\n";
			}
			break;
		case "async":
			let cbCode = "";
			if(onResult)
				cbCode += `(_err${tapIndex}, _result${tapIndex}) => {\n`;
			else
				cbCode += `_err${tapIndex} => {\n`;
			cbCode += `if(_err${tapIndex}) {\n`;
			cbCode += onError(`_err${tapIndex}`);
			cbCode += "} else {\n";
			if(onResult) {
				cbCode += onResult(`_result${tapIndex}`);
			}
			if(onDone) {
				cbCode += onDone();
			}
			cbCode += "}\n";
			cbCode += "}";
			code += `_fn${tapIndex}(${this.args({
				before: tap.context ? "_context" : undefined,
				after: cbCode
			})});\n`;
			break;
		case "promise":
			code += `var _hasResult${tapIndex} = false;\n`;
			code += `_fn${tapIndex}(${this.args({
				before: tap.context ? "_context" : undefined
			})}).then(_result${tapIndex} => {\n`;
			code += `_hasResult${tapIndex} = true;\n`;
			if(onResult) {
				code += onResult(`_result${tapIndex}`);
			}
			if(onDone) {
				code += onDone();
			}
			code += `}, _err${tapIndex} => {\n`;
			code += `if(_hasResult${tapIndex}) throw _err${tapIndex};\n`;
			code += onError(`_err${tapIndex}`);
			code += "});\n";
			break;
	}
	return code;
}

callTapsSeries({ onError, onResult, onDone, rethrowIfPossible }) {
	if(this.options.taps.length === 0)
		return onDone();
	const firstAsync = this.options.taps.findIndex(t => t.type !== "sync");
	const next = i => {
		if(i >= this.options.taps.length) {
			return onDone();
		}
		const done = () => next(i + 1);
		const doneBreak = (skipDone) => {
			if(skipDone) return "";
			return onDone();
		}
		return this.callTap(i, {
			onError: error => onError(i, error, done, doneBreak),
			// onResult 和 onDone 的判断条件，就是说有 onResult 或者 onDone
			onResult: onResult && ((result) => {
				return onResult(i, result, done, doneBreak);
			}),
			onDone: !onResult && (() => {
				return done();
			}),
			rethrowIfPossible: rethrowIfPossible && (firstAsync < 0 || i < firstAsync)
		});
	};
	return next(0);
}

callTapsLooping({ onError, onDone, rethrowIfPossible }) {
	if(this.options.taps.length === 0)
		return onDone();
	const syncOnly = this.options.taps.every(t => t.type === "sync");
	let code = "";
	if(!syncOnly) {
		code += "var _looper = () => {\n";
		code += "var _loopAsync = false;\n";
	}
	// 在代码开始前加入 do 的逻辑
	code += "var _loop;\n";
	code += "do {\n";
	code += "_loop = false;\n";
	// interceptors 先忽略，只看主要部分
	for(let i = 0; i < this.options.interceptors.length; i++) {
		const interceptor = this.options.interceptors[i];
		if(interceptor.loop) {
			code += `${this.getInterceptor(i)}.loop(${this.args({
				before: interceptor.context ? "_context" : undefined
			})});\n`;
		}
	}
	code += this.callTapsSeries({
		onError,
		onResult: (i, result, next, doneBreak) => {
			let code = "";
			code += `if(${result} !== undefined) {\n`;
			code += "_loop = true;\n";
			if(!syncOnly)
				code += "if(_loopAsync) _looper();\n";
			code += doneBreak(true);
			code += `} else {\n`;
			code += next();
			code += `}\n`;
			return code;
		},
		onDone: onDone && (() => {
			let code = "";
			code += "if(!_loop) {\n";
			code += onDone();
			code += "}\n";
			return code;
		}),
		rethrowIfPossible: rethrowIfPossible && syncOnly
	})
	code += "} while(_loop);\n";
	if(!syncOnly) {
		code += "_loopAsync = true;\n";
		code += "};\n";
		code += "_looper();\n";
	}
	return code;
}

callTapsParallel({ onError, onResult, onDone, rethrowIfPossible, onTap = (i, run) => run() }) {
	if(this.options.taps.length <= 1) {
		return this.callTapsSeries({ onError, onResult, onDone, rethrowIfPossible })
	}
	let code = "";
	code += "do {\n";
	code += `var _counter = ${this.options.taps.length};\n`;
	if(onDone) {
		code += "var _done = () => {\n";
		code += onDone();
		code += "};\n";
	}
	for(let i = 0; i < this.options.taps.length; i++) {
		const done = () => {
			if(onDone)
				return "if(--_counter === 0) _done();\n";
			else
				return "--_counter;";
		};
		const doneBreak = (skipDone) => {
			if(skipDone || !onDone)
				return "_counter = 0;\n";
			else
				return "_counter = 0;\n_done();\n";
		}
		code += "if(_counter <= 0) break;\n";
		code += onTap(i, () => this.callTap(i, {
			onError: error => {
				let code = "";
				code += "if(_counter > 0) {\n";
				code += onError(i, error, done, doneBreak);
				code += "}\n";
				return code;
			},
			onResult: onResult && ((result) => {
				let code = "";
				code += "if(_counter > 0) {\n";
				code += onResult(i, result, done, doneBreak);
				code += "}\n";
				return code;
			}),
			onDone: !onResult && (() => {
				return done();
			}),
			rethrowIfPossible
		}), done, doneBreak);
	}
	code += "} while(false);\n";
	return code;
}
```
create中只实现了代码的主模板，实现了公共的部分，然后留出差异的部分content,交给各个子类来实现。
调用了 callTapsSeries/callTapsParallel/callTapsLooping
onError, onResult, onDone, rethrowIfPossible
都会走到一个callTap
callTap内是一次函数执行的模板，也是根据调用方式的不同，分为sync/async/promise三种

## compile 流程
sync(result处理、done处理、error处理)    async(result处理、done处理、error处理)   promise(result处理、done处理、error处理)
            |                                           |                                   |
                                                    差异化处理
                                                        |
callTapsSeries                          callTapsLooping                         callTapsParallel
            |                                           |                                   |
                                                    差异化处理
            |                   |               |               | 
BasicHook                       BallHook        WaterfallHook   LoopHook                                                     

## 总结
Tapable作为webpack底层事件流库，最终事件触发后的执行，是先动态生成执行的code，然后通过new Function来执行。
相比于我们平时直接遍历或者递归的调用每一个事件来说，这种执行方法效率上来说更搞笑；

## resolve
```flow

st=>start: 开始框

op=>operation: 处理框

cond=>condition: 判断框(是或否?)

sub1=>subroutine: 子流程

io=>inputoutput: 输入输出框

e=>end: 结束框

st->op->cond

cond(yes)->io->e

cond(no)->sub1(right)->op

```
