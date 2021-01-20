/**
 *  Callback Promise Generator Async-Await 和异常处理的演进
 *
 *  演进
 *      1.回调
 *          直接在回调函数中处理异常
 *          缺点：是最不明智的选择，因为业务方完全失去了对异常的控制能力
 *
 *      2.回调，无法捕获的异常
 *          回调函数有同步和异步之分，区别在于对方执行回调函数的时机，异常一般出现在请求、数据库连接等操作中，这些操作大多数异步的。
 *          异步回调中，回调函数的执行栈与原函数分离开，导致外部无法抓住异常。
 *
 *      3.回调，不可控的异常
 *
 *      4.Promise异常处理
 *          不仅是reject,抛出的异常也会被作为拒绝状态被Promise捕获
 */
 function fetch(callback) {
    return new Promise((resolve, reject) => {
        throw Error('用户不存在')
    })
 }

 fetch().then(result => {
     console.log('请求处理', result) // 永远不会执行
 }).catch(error => {
     console.log('请求处理异常', error) // 请求处理异常 用户不存在
 })
/**
 *      5.Promise 无法捕获的异常
 *          永远不要在macrotask队列中抛出异常，因为macrotask队列脱离了运行上下文环境，异常无法被当前作用域捕获
 *          microtask中抛出的异常可以被捕获，说明microtask队列并没有离开当前作用域
 */
 function fetch(callback) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            throw Error('用户不存在')
        })
    })
 }

 fetch().then(result => {
     console.log('请求处理', result) // 永远不会执行
 }).catch(error => {
     console.log('请求处理异常', error) // 永远不会执行
 })

/**
 *      6.Promise异常追问
 *          如果第三方在macrotask回调中以throw Error的方式抛出异常？
 */
 function thirdFunction() {
    setTimeout(()=>{
        throw Error('就是任性')
    })
 }

 Promise.resolve(true).then((resolve, reject) =>{
     thirdFunction()
 }).catch(error => {
     console.log('捕获异常', error)
 })

/**
 *          一定要再macrotask抛出异常的话，请改为reject的方式
 *          如果return thirdFunction()这行缺少了return 的话，依然无法抓住这个错误，这是因为没有将对方返回的Promise传递下去，错误也
 *          不会继续传递。
 */
function thirdFunction() {
    return new Promise((resolve, reject) =>{
        setTimeout(() => {
            reject('收敛一些')
        })
    })
}

Promise.resolve(true).then((resolve, reject) => {
    return thirdFunction()
}).catch(error => {
    console.log('捕获异常', error) // 捕获异常 收敛一些
})

/**
 *      7.Async Await 异常
 *              async await 是generator的语法糖
 *              不论是同步、异步的异常 await都不会自动捕获，但好处是可以自动中断函数，我们大可放心编写业务逻辑，而不用担心
 *              异步异常后会被执行引发雪崩
 */
 function fetch(callback) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject()
        })
    })
 }

 async function main() {
     const result = await fetch()
     console.log('请求处理', result) // 永远不会执行
 }

 main()

/**
 *      8.Async Await 捕获异常
 *          try catch捕获异常
 *              为什么此时的异步的异常可以通过try catch来捕获？
 *                  因为此时的异步其实在一个作用域中，通过generator控制执行顺序，所以可以将异步看做同步的代码去编写，包括
 *                  使用try catch 捕获异常
 */
 function fetch(callback) {
     return new Promise((resolve, reject) =>{
         setTimeout(() => {
             reject('no')
         })
     })
 }

 async function main() {
     try {
         const result = await fetch()
         console.log('请求处理', result) // 永远不会执行
     } catch(error) {
         console.log('异常', error);
     }
 }

/**
 *      9.Async Await 无法捕获的异常
 *          永远不要在macrotask队列中抛出异常
 *          解决：reject()
 */
 function thirdFunction() {
    return new Promise((resolve, reject) =>{
        setTimeout(() => {
            reject('收敛一些')
        })
    })
 }

 async function main() {
     try {
         const result = await thirdFunction()
         console.log('请求处理', result) // 永远不会执行
     } catch(error) {
         console.log('异常', error) // 异常 收敛一些
     }
 }
 main()

/**
 *      10.业务场景
 *          需要一种机制捕获action最顶层的错误进行统一处理
 *          Decorator
 *              装饰器
 *              核心功能是可以通过外部包装的方式，直接修改类的内部属性
 *              装饰器按照装饰的位置，分为class decorator method decorator 以及 property decorator(目前标准尚未支持，通过
 *              get set 模拟实现）。
 *
 *          Class Decorator
 *              类级别装饰器，修饰整个类，可以读取、修改类中任何属性和方法。
 */

 const classDecorator = (target: any) => {
     const keys = Object.getOwnPropertyNames(target.prototype)
     console.log('classA keys,', keys) // classA keys ["constructor, "sayName"]
}

@classDecorator
class A {
     sayName() {
         console.log('classA ascoders')
     }
}
const a = new A();
 a.sayName() // classA ascoders

/**
 *          Method Decorator
 *              方法级别装饰器，修饰某个方法，和类装饰器功能相同，但是能额外获取当前修饰的方法名
 */
const methodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    return {
        get() {
            return () => {
                console.log('classC method override')
            }
        }
    }
}

class C {
    @methodDecorator
    sayName() {
        console.log('classC ascoders')
    }
}
const c = new C()
c.sayName() // classC method override

/**
 *          Property Decorator
 *              属性级别装饰器，修饰某个属性，和类装饰器功能相同，但是能额外获取当前修饰的属性名
 */
const propertyDecorator = (target: any, propertyKey: string | symbol) => {
    Object.defineProperty(target, propertyKey, {
        get() {
            return 'github'
        },
        set(value: any) {
            return value
        }
    })
}

class B {
    @propertyDecorator
    private name ='ascoders'

    sayName() {
        console.log(`classB ${this.name}`)
    }
}
const b = new B()
b.sayName() // classB githuub

/**
 *      11.业务场景 统一异常捕获
 *          编写类级别装饰器，专门捕获async函数抛出的异常：
 */
const asyncClass = (errorHandler?: (error?: Error) => void) => (target: any) => {
    Object.getOwnPropertyNames(target.prototype).forEach(key => {
        const func = target.prototype[key]
        target.prototype[key] = async (...args: any[]) => {
            try {
                await func.apply(this, args)
            } catch (error) {
                errorHandler && errorHandler(error)
            }
        }
    })
    return target
}

 const successRequest = () => Promise.resolve('a')
 const failRequest = () => Promise.reject('b')

 const iAsyncClass = asyncClass(error => {
     console.log('统一异常处理', error)
 })

@iAsyncClass
 class Action {
     async successRequest() {
         const result = await successRequest()
     }
 }

 const action = new Action()

/**
 *          方法级别的异常处理
 */
 const asyncMethod = (errorHandler?: (error?: Error) => void) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const func = descriptor.value
    return {
        get() {
            return (...args: any[]) => {
                return Promise.resolve(func.apply(this, args)).catch(error => {
                    errorHandler && errorHandler(error)
                })
            }
        },
        set(newValue: any) {
            return newValue
        }
    }
}

const successRequest = () => Promise.resolve('a')
const failRequest = () => Promise.reject('b')

const asyncAction = asyncMethod(error => {
    console.log('统一异常处理', error)
})

class Action {
     @asyncAction async successRequest() {
         const result = await successRequest()
     }
}

/**
 *  在Nodejs端，监听全局错误
 */
 process.on('uncaughException', (error: any) => {
     logger.error('uncaughtException', error)
 })

process.on('unhandledRejection', (error: any) => {
    logger.error('unhandledRejection', error)
})

/**
 * 浏览器端， 监听window全局错误
 */
window.addEventListener('unhandledrejection', (event: any) => {
    logger.error('unhandledrejection', event)
})
window.addEventListener('onrejectionhandled', (event: any) => {
    logger.error('onjectionhandled', event)
})
