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
webpack编译

    webpack配置处理
        错误检查、增加默认配置等
    编译前的准备工作
        处理webpack配置中的plugin、webpack自己的一堆plugin、初始化compiler等
    开始编译主入口
    resolve阶段：解析文件路径&loaders
        将文件的绝对路径解析出；同时解析出inline和我们配置在webpack.config.js匹配的
        loaders,将loaders解析为固定的格式以及loaders执行文件路径
    loaders逐个执行
    parse阶段
        文件转为ast树，解析出import和export等
    递归处理依赖
    module一些优化&增加id
    生成chunk，决定每个chunk中包含的module
    生成文件
        根据模板生成文件名称；生成文件，这里会再次用到前面parse阶段的内容，将'import xxx'/export xxx
        替换成webpack的写法 
    写文件。结束

webpack源码中resolve流程开始的入口在factory阶段
factory事件会触发NormalModuleFactory中的函数

    factory->获取resolve执行函数->解析出行内loader
                                获取loaderResolver  -> 解析loader路径
                                普通文件request
                                获取normalResolver  -> 解析文件路径

```JavaScript                              
//normalModuleFactory.js
    this.hooks.factory.tap("NormalModuleFactory", () => (result, callback) => {
        // 首先得到 resolver
        let resolver = this.hooks.resolver.call(null);

        // Ignored
        if (!resolver) return callback();

        // 执行
        resolver(result, (err, data) => {
            if (err) return callback(err);

            // Ignored
            if (!data) return callback();
            
            // direct module
            if (typeof data.source === "function") return callback(null, data);

            this.hooks.afterResolve.callAsync(data, (err, result) => {
                    //... resolve 结束流程
            });
        });
    });
```
resolver函数中，从整体看分为俩大主要流程loader和文件
loader流程
1.获取到inline loader 的request部分，从中解析出路径
2.得到loader类型的resolver处理实例，即const loaderResolver = this.getResolver("loader");
3.对每一个loader用loaderResolver依次处理，得到执行文件的路径。

文件流程
1.得到普通文件的resolver处理实例，即代码 const normalResolver = this.getResolver("normal", data.resolveOptions);
2.用normalResolver处理文件，得到最终文件绝对路径

```JavaScript

this.hooks.resolver.tap("NormalModuleFactory", () => (data, callback) => {
    const contextInfo = data.contextInfo;
    const context = data.context;
    const request = data.request;
    
    // 处理 inline loaders，拿到 loader request 部分
    let elements = request
                    .replace(/^-?!+/, "")
                    .replace(/!!+/g, "!")
                    .split("!")
    let resource = elements.pop();
    // 提取出具体的loader
    elements = elements.map(identToLoaderRequest);

    const loaderResolver = this.getResolver("loader");
    const normalResolver = this.getResolver("normal", data.resolveOptions);

    asyncLib.parallel(
        [
            callback =>
                this.resolveRequestArray(
                    contextInfo,
                    context,
                    elements,
                    loaderReslver,
                    callback
                ),
            callback => {
                if (resource === "" || resource[0] === "?") {
                    return callback(null, {
                        resource
                    });
                }
    
                normalResolver.resolve(
                    contextInfo,
                    context,
                    resource,
                    {},
                    (err, resource, resourceResolveData => {
                        if (err) return callback(err);
                        callback(null, {
                            resourceResolveData,
                            resource
                        })
                    });
                )
            }
        ],
        (err, results) => {
            // ... resolver callback
        })
    )
})
```
webpack中的options配置
在WebpackOptionsDefaulter()配置了很多关于resolve和resolveLoader的配置

普通文件的resolver过程
普通文件resolver处理入口为webpack中normalResolver.resolve方法，而整个resolve过程可以看成事件的串联，
当所有串联在一起的事件执行完之后，resolve就结束了
```JavaScript
doResolve(hook, request, message, resolveContext, callback) {
    // 生成 context 栈
    const stackLine = hook.name + ": (" + request.path + ")" +
                (request.request || "") + (request.query || "") +
                (request.directory ? " directory" : "") +
                (request.module ? " module" : "");

    let newStack;
    if(resolveContext.stack) {
        newStack = new Set(resolveContext.stack);
        if(resolveContext.stack.has(stackLine)) {
            // Prevent recursion
            const recursionError = new Error("Recursion in resolving\nStack:\n " + Array.from(newStack).join("\n "));
            recursionError.recursion = true;
            if(resolveContext.log) resolveContext.log("abort resolving because of recursion");
            return callback(recursionError);
        }
        newStack.add(stackLine);
    } else {
        newStack = new Set([stackLine]);
    }
    this.hooks.resolveStep.call(hook, request);
    
    // 如果该hook有注册过事件，则调触发该hook
    if(hook.isUsed()) {
        const innerContext = createInnerContext({
            log: resolveContext.log,
            missing: resolveContext.missing,
            stack: newStack
        }, message);
        return hook.callAsync(request, innerContext, (err, result) => {
            if(err) return callback(err);
            if(result) return callback(null, result);
            callback();
        });
    } else {
        callback();
    }
}

// 调用到hook.callAsync时，进入UnsafeCachePlugin
//分为俩部分：事件注册和事件执行
class UnsafeCachePlugin {
    constructor(source, filterPredicate, cache, withContext, target) {
        this.source = source;
        this.target = target;
    }
    apply(resolver) {
        // ensureHook主要逻辑：如果resolver已经有对应的hook则返回；如果没有，则会给resolver增加一个this.target类型的hook
        const target = resolver.ensureHook(this.target);
        // getHook会根据this.source字符串获取对应的hook
        resolver.getHook(this.source).tapAsync("UnsageCachePlugin", (request, resolveContext, callback) => {
            //... 先省略 UnsafeCache中其它逻辑，只看衔接部分
            // 继续调用 doResolve,但是注意这里的target
            resolver.doResolve(target, request, null, resolveContext, (err, result) => {
                if(err) return callback(err);
                if(result) return callback(null, this.cache[cacheId] = result);
                callback();
            });
        });
    }
}
```
事件执行阶段，递归地阿偶用resolver.doResolve形成事件流
```JavaScript
exports.createResolver = function(options) {
    // 根据options中条件的不同，加入各种plugin
    if(unsafeCache) {
        plugins.push(new UnsafeCachePlugin("resolve", cachePredicate, unsafeCache, cacheWithContext, "new-resolve"));
        plugins.push(new ParsePlugin("new-resolve", "parsed-resolve"));
    } else {
        plugins.push(new ParsePlugin("resolve", "parsed-resolve"));
    }

    plugins.forEach(plugin => {
        plugin.apply(resolver);
    });   
}
```
1.UnsafeCachePlugin
增加一层缓存，提高效率，会默认启用
2.ParsePlugin
初步解析路径
3.DescriptionFilePlugin和NextPlugin
DescriptionFilePlugin寻找描述文件，默认会寻找package.json。
首先会在request.path目录下寻找，没有则一层层往上
nextPlugin起衔接作用，内部逻辑就是直接调用doResolve
4.AliasPlugin/AliasFieldPlugin
处理别名
5.ModuleKindPlugin
根据request.module的值走不同的分支
6.JoinRequestPlugin
将request中path和request合并起来
7.DescriptionFilePlugin
8.FileKindPlugin
判断是否为一个directory
9.TryNextPlugin/ConcordExtensionsPlugin/AppendPlugin
10.AliasPlugin/AliasFields/ConcorModulesPlugin/SymlinkPlugin
11.FileExistsPlugin
读取request.path所在的文件，看文件是否存在。
12.NextPlugin/ResultPlugin
request保存了resolve的结果

module的resolve过程
1.ModuleAppendPlugin/TryNextPlugin
2.ModulesInHierachicDirectoriesPlugin/ModulesInRootPlugin
3.与普通文件resolve过程分叉点
4.DirectoryExistsPlugin
5.MainFieldPlugin
6.UseFilePlugin
7.DescriptionFilePlugin/TryNextPlugin
8.AppendPlugin

loader的resolve过程

从原理到优化
利用resolve配置来减少文件搜索范围
1.使用resolve.alias
2.设置resolve.modules
3.对第三方模块设置resolve.alias
4.合理设置resolve.extensions，减少文件查找
