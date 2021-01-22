/**
 *  Proxy
 *  The Proxy object enables you to create a proxy for another object, which can intercept and redefine
 *  fundamental operations for that object.
 *  代理对象使你能够对另一个对象创建一个代理，它可以截取并重新定义该对象的基本操作。
 *
 *  Description
 *  A Proxy is created with two parameters:
 *  一个代理被创建需要俩个参数
 *      target: the original object which you want to proxy
 *      目标：你想去代理的原始类型对象
 *      handler: an object that defines which operations will be intercepted and how to redefine intercepted operations.
 *      处理：一个对象，定义了哪些操作会被拦截和如何重新定义被拦截的操作。
 *
 * For example, this code defines a simple target with just two properties, and an even simpler handler with no properties:
 * 举例说，这些代码定义了一个简单的目标只带有俩个属性，和一个非常简单的处理没有带任何属性
 */
 const target = {
     message1: 'Hello',
    message2: 'everyone'
 };

 const handler1 = {};
 const proxy1 = new Proxy(target, handler1);
/**
 * Because the handler is empty, this proxy behaves just like the original target:
 * 因为处理方法是空的，这个代理的行为仅仅和原始的目标一样
 */
console.log(proxy1.message1); // hello
console.log(proxy1.message2); // everyone

/**
 * To customise the proxy, we define functions on the handler object:
 * 为了定制代理，我们在handler对象上定义函数：
 */
const target = {
    message1: "hello",
    message2: "everyone"
};

const handler2 = {
    get: function(target, prop, receiver) {
        return "world"
    }
};

const proxy2 = new Proxy(target, handler2)
/**
 * Here we've provided an implementation of the get() handler, which intercepts attempts to access properties in the target.
 * 这里我们提供了get()处理程序的一个实现，它拦截访问目标中的属性的尝试。
 *
 * Handler functions are sometimes called traps, presumably because they trap calls to the target object.
 * The very simple trap in handler2 above redefines all property accessors:
 * 处理函数有时称为陷阱，可能是因为它们捕获了对目标对象的调用。
 * 上面handler2中非常简单的陷阱重新定义了所有属性访问其
 */
console.log(proxy2.message1); // world
console.log(proxy2.message2); // world

/**
 * With the helo of the Reflect class we can give some accessors the original behavior and redefine others:
 */
 const target = {
     message1: 'hello',
    message2: 'everyone'
};

 const handler3 = {
     get: function (target, prop, receiver) {
         if (prop === "message2") {
             return "world";
         }
         return Reflect.get(...arguments)
     },
 };

 const proxy3 = new Proxy(target, handler3);

 console.log(proxy3.message1); // hello
 console.log(proxy3.message2); // world

/**
 *  Constructor
 *  Proxy()
 *      Creates a new Proxy object.
 *      创建一个新的代理对象
 *
 *  Static methods
 *  Proxy.revocable()
 *      Creates a revocable Proxy object.
 *      创建可撤销的代理对象。
 *
 *  Examples
 *  Basic example
 *  In this simple example, the number 37 gets returned as the default value when the property name
 *  is not in the object.It is using the get handler.
 *  在这个简单的例子中，数字37作为默认值返回当属性名不在对象中时。它正在使用get处理程序。
 */
 const handler = {
    get: function(obj, prop) {
        return prop in obj ?
            obj[prop]:
            37;
    }
 };

 const p = new Proxy({}, handler);
 p.a = 1;
 p.b = undefined;

 console.log(p.a, p.b);
 // 1, undefined

 console.log('c' in p, p.c);
 // false, 37

/**
 * No-op forwarding proxy
 * 无操作转发代理
 *
 * In this example, we are using a native JavaScript object to which our proxy will forward all operations
 * that are applied to it.
 * 在这个例子中，我们使用的是一个原生的JavaScript对象，我们的代理将把应用于它的所有操作转发给它。
 */
 const target = {};
 const p = new Proxy(target, {});

 p.a = 37;
 console.log(target.a);
 // 37

/**
 * Note that while this "no-op" works for JavaScript objects, it does not work for native browser objects
 * like DOM Elements.
 * 注意，虽然这个"no op"适用于JavaScript对象，它不适用于像DOM元素这样的本机浏览器对象。
 *
 * Validation
 * 验证
 * With a Proxy, you can easily validate the passed value for an object.This example uses the set handler.
 * 使用代理，你可以轻松地验证为对象传递的值。这个例子使用set处理程序。
 */
 let validator = {
     set: function(obj, prop, value) {
         if (prop === 'age') {
             if (!Number.isInteger(value)) {
                 throw new TypeError('The age is not an integer');
             }
             if (value > 200) {
                 throw new RangeError('The age seems invalid');
             }
         }

         obj[prop] = value;

         return true;
     }
 };

 const person = new Proxy({}, validator);

 person.age = 100;
 console.log(person.age); // 100
 person.age = 'young'; // Throws an exception
 person.age = 300; // Throws an exception

/**
 * Extending constructor
 *
 */
