
  ## Promise
  The Promise object represents the eventual completion (or failure) of an asynchronous operation and its resulting value.
  promise对象代表异步操作的最终完成（或失败）及其结果值
 
  To learn about the way promises work and how you can use them, we advise you to read Using promises first.
  为了了解Promises的运行方法以及如何使用它们，我们建议你先阅读使用promise
 
  ### Description
 
  A promise is a proxy for a value not necessarily known when the promise is created.It allows you to associate handlers with
  an asynchronous action's eventual success value or failure reason.This lets asynchronous methods return values like synchronous
  methods:instead of immediately returning the final value, the asynchronous method returns a promise to supply the value at some
  point in the future.
  promise是一个值的代理，该值在创建的时候不一定已知。它允许你将处理程序与异步操作的最终成功值或者失败原因。这使得异步方法像同步方法一样返回值：
  而不是立即返回最终值，这个异步方法返回在未来某个时间提供值的promise.
 
  A Promise is in one of these states:
       pending: initial state,neither fulfilled nor rejected.
       fulfilled: meaning that the operation was completed successfully.
       rejected: meaning that the operation failed.
  一个promise是以下三种状态之一：
       pending:初始状态，既不是fulfilled也不是rejected。
       fulfilled: 代表了操作是成功完成
       rejected: 代表了操作失败
 
   A pending promise can either be fulfilled with a value or rejected with a reason(error).When either of these options happens, the associated
   handlers queued up by a promise's then method are called.If the promise has already been fulfilled or rejected when a conrresponding handler
   is attached, the handler will be called,so there is no race condition between an asynchronous operation completing and its handlers being attached.
   A pending的promise能够转变为一个带有value的fulfilled或者是一个错误原因的rejected。当发生这些操作时，插入由promise的then方法调用的相关处理队列。如果promise
   如果在附加相应的处理程序时promise已经转换为fulfilled或者rejected状态时，因此异步操作完成与其附加的处理程序之间不存在竞争条件。
 
   As the Promise.prototype.then() and Promise.prototype.catch() methods return promises,they can be chained.
   像Promise.prototype.then()和Promise.prototype.catch()方法返回一个promises，他们可以被链接。
 
   * Chained Promises
   The methods promise.then(),promise.catch(),and promise.finally() are used to associate further action with a promise that becomes settled.
   These methods also return a newly generated promise object, which can optionally be used for chaining;for example,like this:
   链式Promises
   promise.then(),promise.catch()和promise.finally()方法被用来联系进一步的操作与要成为的结果。这些方法也返回了一个新生成的promise对象，可以
   选择用于链接。
 
   ### Constructor
   Promise()
   Creates a new Promise object.The constructor is primarily used to wrap functions that do not already support promises.
   创建一个新的promise对象。这个构造函数主要用于包装不支持promises的函数
 
   Static methods
 
   Promise.all(iterable)
   Wait for all promises to be resolved,or for any to be rejected.
   等待所有的promises转变成resolved或者rejected
   If the returned promise resolves, it is resolved with an aggregating array of the values from the resolved promises,
   in the same order as defined in the iterable of multiple promises.
   如果返回promise resolves,它是resolved用一个从resolved promises的值的数组联合，按照多个可迭代的promises中定义的顺序。
   If it rejects, it is rejected with the reason from the first promise in the iterable that was rejected.
   如果是rejects,它是用一个reason从第一个可迭代的rejected的promise返回
 ```JavaScript
   Promise.all = function(ps) {
       let resolve
       let reject
       const promise = new Promise((r, j) => {
           resolve = r
           reject = j
       })
       let fulfilledCount = 0
       let index = 0
       const ret = []
       const wrapFulfilled = i => {
           return val => {
               fulfilledCount += 1
               ret[i] = val
               if(fulfilledCount >= index){
                   resolve(ret)
               }
           }
       }
       const wrapRejected = i => {
           return err => {
               reject(er)
           }
       }
       for (let p of ps) {
           Promise.resolve(p).then(wrapFulfilled(index), wrapRejected(index))
           index += 1
       }
       return promise
   }
```
### Promise.allSettled(iterable)
   Wait until all promises have settled (each may resolve or reject).
   Returns a Promise that resolves after all of the given promises have either resolved or rejected,with an array
   of objects that each describe the outcome of each promise.
   等待所有的promises已经被解决了（每一个可能是resolve或者reject)
   返回一个在所有提供的promises都变成了resolved或者rejected的promise,用一个数组对象来描述每个promise的结果
 ```JavaScript
   Promise.allSettled = function(ps) {
       let resolve
       let reject
       const promise = new Promise((r, j) => {
           resolve = r
           reject = j
       })
       let finishedCount = 0
       let index = 0;
       const ret = [];
       const wrapFulfilled = i => {
           return val => {
               finishedCount += 1
               ret[i] = {
                   status: 'fulfilled',
                   value: val
               }
               if (finishedCount >= index) {
                   resolve(ret)
               }
           }
       }
       const wrapRejected = i => {
           return err => {
               finishedCount += 1
               ret[i] = {
                   status: 'rejected',
                   value: err
               }
               if (finishedCount >= index) {
                   resolve(ret)
               }
           }
       }
       for (let p of ps) {
           Promise.resolve(p).then(wrapFulfilled(index), wrapRejected(index))
           index += 1
       }
       return promise
   }
```
### Promise.any(iterable)
   Takes an iterable of Promise objects and, as soon as one of the promises in the iterable fulfills, returns a single
   promise that resolves with the value from that promise.
   获取Promise对象的可迭代的，一旦迭代器中的一个promises变成了fulfills，返回单一的带value的resolves状态的promise
   只要其中的一个promise 成功，就返回那个已经成功的promise。如果可迭代对象中没有一个promise成功（即所有的promises都失败/拒绝），
   就返回一个失败的promise和AggregateError类型的实例，它是Error的一个子类，用于把单一的错误集合在一起。
   本质上，这个方法和Promise.all()是相反的
```JavaScript
   Promise.any = function(ps) {
       let resolve
       let reject
       const promise = new Promise((r, j) => {
           resolve = r
           reject = j
       })
       let errCount = 0
       let pCount = 0
       for (let p of ps) {
           pCount += 1
           Promise.resolve(p).then(
               val => resolve(val),
               err => {
                   errCount += 1
                   if (errCount >= pCount) {
                       reject(new AggregateError('All promises were rejected'))
                   }
               }
           )
       }
       return promise
   }
```

###  剖析Promise内部结构
  Promise标准解读
  	1.只有一个then方法，没有catch，race，all等方法，甚至没有构造函数
  	2.then方法返回一个新的Promise
  	3.不同Promise的实现需要可以相互调用(interoperable)
  	4.Promise的初始状态为pending，它可以由此状态转换为fulfilled或者rejected，一旦状态确定，就不可以再次转换为其它状态，
 	状态确定的过程称为settle
 
  	一步一步实现一个Promise
  		构造函数

// Promise构造函数接收一个executor函数，executor函数执行完同步或异步操作后，调用它的俩个参数resolve和reject


  then 方法
  Promise对象有一个then方法，用来注册在这个Promise状态确定后的回调，then方法需要写在原型链上。
  then方法会返回一个Promise,Promise/A+标准并没有要求返回的这个Promise是一个新的对象，但在Promise/A标准中，明确规定了then要返回一个
  新的对象，目前的Promise实现中then几乎都是返回一个新的Promise对象
 
  Promise总共有三种可能的状态，分三个if块来处理，在里面分别都返回一个new Promise。
```JavaScript
var promise = new Promise(function(resolve, reject) {
	/
		如果操作成功，调用resolve并传入value
		如果操作失败，调用reject并传入reason
	
})

try {
	module.exports = Promise
} catch (e) {}

function Promise(executor){
	var self = this;
	self.status = "pending" // Promise当前的状态
	// self.data = undefined // Promise的值
	self.onResolvedCallback = [] // Promise resolve时的回调函数集，因为在Promise结束之前可能有多个回调添加到它上面
	self.onRejectedCallback = [] // Promise reject时的回调函数集，因为在Promise结束之前有可能有多个回调添加到它上面

	//我们这里的实现并没有考虑隐藏this上的变量，这使得这个Promise的状态可以在executor函数外部
	//被改变，在一个靠谱的实现里，构造出的Promise对象的状态和最终结果应当是无法从外部更改的
	function resolve(value) {
		if (value instanceof Promise) {
			return value.then(resolve, reject);
		}
		// TODO
		setTimeout(function(){
			if (self.status === "pending") {
				self.status = "resolved"
				self.data = value
				for(var i = 0; i < self.onResolvedCallback.length;i++){
					self.onRejectedCallback[i](value);
				}
			}
		})
	}

	function reject(reason) {
		// TODO
		setTimeout(function(){
			if(self.status === "pending"){
				self.status = "rejected"
				self.data = reason
				for(var i = 0; i < self.onRejectedCallback.length; i++){
					self.onRejectedCallback[i](reason);
				}
			}
		})
	}

	try {
		//考虑到执行executor的过程中有可能出错，所以我们用try/catch块给包起来，并且在出错以后catch到的值reject掉这个Promise
		executor(resolve, reject) // 执行executor
	} catch(e) {
		reject(e)
	}
}

// then方法接收俩个参数，onResolved,onRejected，分别为Promise成功或失败后的回调
Promise.prototype.then = function(onResolved, onRejected) {
	var self = this;
	var promise2;

	//我们需要在then里面执行onResolved或者onRejected，并根据返回值来确定promise2的结果，并且，如果
	//onResolved/onRejected返回的是一个Promise,promise2将直接取这个Promise的结果：

	//Promise值的穿透，是then默认参数就是把值往后传或者抛
	onResolved = typeof onResolved === 'function' ? onResolved : function(value) { return value}
	onRejected = typeof onRejected === 'function' ? onRejected : function(reason) { return reason}

	if (self.status === 'resolved'){
		//如果promise1(此处即为this/self)的状态已经确定并且resolved,我们调用onResolved
		//因为考虑到有可能throw，所以我们将其包在try/catch里面
		return promise2 = new Promise(function(resolve, reject){
			try {
				var x = onResolved(self.data)
				//如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
				if (x instanceof Promise) {
					x.then(resolve, reject)
				}
				resolve(x) // 否则，以它的返回值作为promise2的结果
			} catch(e) {
				reject(e) // 如果出错，以捕获到的错误作为promise2的结果
			}
		})
	}

	//此处与前一个if块的逻辑几乎相同，区别在于所调用的是onRejected函数
	if(self.status === 'rejected') {
		return promise2 = new Promise(function(resolve, reject){
			try {
				var x = onRejected(self.data)
				if (x instanceof Promise) {
					x.then(resolve, reject)
				}
			} catch (e) {
				reject(e)
			}
		})
	}

	if (self.status === 'pending') {
		//如果当前的Promise还处于pending状态，我们并不能确定调用onResolved还是onRejected，
		//只能等到Promise的状态确定后，才能确实如何处理。
		//所以我们需要把我们的俩种情况的处理逻辑做为callback放入promise1(此处即this/self)的回调数组里
		//逻辑本身跟第一个if块内的几乎一致
		return promise2 = new Promise(function(resolve, reject){
			self.onResolvedCallback.push(function(value) {
				try {
					var x = onResolved(self.data)
					if (x instanceof Promise) {
						x.then(resolve, reject)
					}
				} catch (e) {
					reject(e)
				}
			})

			self.onRejectedCallback.push(function(reason) {
				try {
					var x = onRejected(self.data)
					if (x instanceof Promise) {
						x.then(resolve, reject)
					}
				} catch (e) {
					reject(e)
				}
			})
		})
	}
}

function resolvePromise(promise2, x, resolve, reject) {
	var then
	var thenCalledOrThrow = false

	if (promise2 === x) {
		return reject(new TypeError('Chaining cycle detected for promise!'))
	}

	if (x instanceof Promise) {
		if (x.status === 'pending') {
			//because x could resolved by a Promise Object
			x.then(function(v){
				resolvePromise(promise2, v, resolve, reject)
			}, reject)
		} else {
			//but if it is resolved, it will never resolved by a Promise Object but a static value
			x.then(resolve, reject)
		}
		return
	}

	if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
		try {
			// because x.then could be a getter
			then = x.then
			if (typeof then === 'function') {
				then.call(x, function rs(y) {
					if (thenCalledOrThrow) return
					thenCalledOrThrow = true
					return resolvePromise(promise2, y, resolve, reject);
				}, function rj(r) {
					if (thenCalledOrThrow) return
					thenCalledOrThrow = true
					return reject(r)
				})
			} else {
				resolve(x)
			}
		} catch (e) {
			if (thenCalledOrThrow) return
			thenCalledOrThrow = true
			return reject(e)
		}
	} else {
		resolve(x)
	}
}

// 为了下文方便，我们顺便实现一个catch方法
Promise.prototype.catch = function(onRejected) {
	return this.then(null, onRejected)
}

Promise.deferred = Promise.defer = function() {
	var dfd = {}
	dfd.promise = new Promise(function(resolve, reject) {
		dfd.resolve = resolve
		dfd.reject = reject
	})
	return dfd
}
```

### 目的：写一个包含异步链式调用的promise函数
 
  Promise函数的定义是什么？
       1.只有一个then方法，没有catch，all，race等方法，甚至没有构造函数
       2.then方法返回一个新的promise
       3.不同Promise的实现之间可以互相调用
       4.promise的初始状态为pending 可以转换为resolved或者rejected，一旦转化无法更改，过程被称为setter
 
  异步链式调用是什么意思？
       就是等待异步执行完成之后再执行下一个函数
```JavaScript
function Promise(excutor) {
    let self = this;
    self.onRejectedCallback = [];

    const resolve = (value) =>{
        setTimeout(()=>{
            self.data = value
            self.onRejectedCallback.forEach(callback => callback(value))
        })
    }
    excutor(resolve.bind(self))
    // var cbs = [];
    //
    // const resolve = (value) => {
    //     setTimeout(()=>{
    //         this.data = value
    //         this.cbs.forEach((cb) => cb(value))
    //     })
    // }
    // fn(resolve)
}

Promise.prototype.then = function(onResolved) {
    var self = this;
    return new Promise(resolve => {
        self.onRejectedCallback.push(function(){
            var result = onResolved(self.data)
            if(result instanceof  Promise) {
                result.then(resolve)
            } else {
                resolve(result)
            }
        })
    })
}

Promise.prototype.then = function(onResolved){
    return new Promise((resolve)=>{
        this.cbs.push(() => {
            const res = onResolved(this.data);

            if(res instanceof Promise) {
                res.then(resolve)
            } else {
                resolve(res)
            }
        })
    })
}
```

### 20行实现
```JavaScript
function Promise(fn) {
	// Promise resolve时的回调函数集
	this.cbs = [];

	//传递给Promise处理函数的resolve
	//这里直接往实例上挂个data
	//然后把onResolvedCallback数组里的函数依次执行一遍就可以了
	const resolve = (value) => {
		// 注意promise的then函数需要异步执行
		setTimeout(() => {
			this.data = value;
			this.cbs.forEach((cb) => cb(value))
		});
	}

	// 执行用户传入的函数
	// 并且把resolve方法叫个用户执行
	fn(resolve);
}

Promise.prototype.then = function (onResolved) {
	// 这里叫做Promise2
	return new Promise((resolve) => {
		this.cbs.push(() => {
			// onResolved就对应then传入的函数
			const res = onResolved(this.data);
			//例子中的情况 用户自己返回了一个user promise
			if (res instanceof Promise) {
				// resolve的权利被交给了user promise

				// user promise的情况
				// 用户会自己决定何时resolve promise2
				// 只有promise2被resolve以后
				// then下面的链式调用函数才会继续执行
				res.then(resolve)
			} else {
				// 如果是普通值 就直接resolve
				// 依次执行cbs里的函数 并且把值传递给cbs
				resolve(res)
			}
		})
	})
}
//promise1
new Promise((resolve) => {
	setTimeout(() => {
		// resolve1
		resolve(1);
	}, 500);
})

//promise2
//then1
.then((res) => {
	console.log(res);
	// user promise
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(2);
		}, 500);
	});
})
// then2
.then(console.log);
	//then1这一整块其实返回的是promis2，那么then其实本质上是promise2.then(console.log),
	//也就是说then2注册的回调函数，其实进入了promise2的cbs的回调数组里，又因为我们刚刚知道，resolve2调用了之后
	//user promise会被resolve，进而触发promise2被resolve，进而promise2里的cbs数组被依次触发。
	//这样就实现了用户自己写的resolve2执行完毕后，then2里的逻辑才会继续执行，也就是异步链式调用。
```