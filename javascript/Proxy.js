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
 * 扩展构造函数
 *
 * A function proxy could easily extend a constructor with a new constructor.This example uses the construct
 * and apply handlers.
 * 函数代理可以很容易地用新的构造函数扩展构造函数。这个例子使用构造和应用处理程序。
 */
 function extend(sup, base) {
     var descriptor = Object.getOwnPropertyDescriptor(
         base.prototype, 'constructor'
     );
     base.prototype = Object.create(sup.prototype);
     var handler =  {
         construct: function(target, args) {
             var obj = Object.create(base.prototype);
             this.apply(target, obj, args);
             return obj;
         },
         apply: function(target, that, args) {
             sup.apply(that, args);
             base.apply(that, args);
         }
     };
     var proxy = new Proxy(base, handler);
     descriptor.value = proxy;
     Object.defineProperty(base.prototype, 'constructor', descriptor);
     return proxy;
}

var Person = function(name) {
     this.name = name;
};

 var Boy = extend(Person, function(name, age) {
     this.age = age;
});

 Boy.prototype.gender = 'M';

 var Peter = new Boy('Peter', 13);
 console.log(Peter.gender); // "M"
 console.log(Peter.name); // "Peter"
 console.log(Peter.age); // 13

/**
 * Manipulating DOM nodes
 * 操作DOM节点
 *
 * Sometimes you want to toggle the attribute or class name of two different element.Here's how using the
 * set handler.
 * 有时需要切换俩个不同元素的属性或类名。下面是如何使用set处理程序。
 */
let view = new Proxy({
    selected: null
},
    {
        set: function(obj, prop, newval) {
            let oldval = obj[prop];

            if (prop === 'selected') {
                if (oldval) {
                    oldval.setAttribute('aria-selected', 'false');
                }
                if (newval) {
                    newval.setAttribute('aria-selected', 'true');
                }
            }
            // The default behavior to store the value
            obj[prop] = newval;

            // Indicate success
            return true;
        }
    });
    let i1 = view.selected = document.getElementById('item-1');

/**
 * Value correction and an extra property
 * 修改正确的值和一个额外的属性
 *
 * The products proxy object evaluates the passed value and converts it to an array if needed.
 * The object also supports an extra property called latestBrowser both as a getter and a setter.
 * 产品代理对象计算传递的值，并在需要的时候转换成数组。该对象还支持一个名为latestBrowser的额外属性作为getter和setter。
 */

 let products = new Proxy({
    browsers: ['Internet Explorer', 'Netscape']
 },
    {
        get: function(obj, prop) {
            // An extra property
            if (prop === 'latestBrowser') {
                return obj.browsers[obj.browsers.length - 1];
            }

            // The default behavior to return the value
            return obj[prop];
        },
        set: function(obj, prop, value) {
            // An extra property
            if (prop === 'latestBrowser') {
                obj.browsers.push(value);
                return true;
            }

            // Convert the value if it is not an array
            if (typeof value === 'string') {
                value = [value];
            }

            // The default behavior to store the value
            obj[prop] = value;

            // Indicate success
            return true;
        }
    }
)

/**
 * Finding an array item object by its property
 * 通过属性查找数组项对象
 *
 * This proxy extends an array with some utillity features.As you see, you can flexibly "define" properties
 * without using Object.defineProperties.This example can be adapted to find a table row by its cell.In that case,
 * the target will be table.rows.
 * 此代理使用一些实用功能扩展数组。如你所见，你可以灵活地定义属性而不用使用Object.defineProperties属性。
 * 这个例子可以通过单元格来查找表行。在这种情况下，目标将是表.rows.
 */

/**
 * A complete traps list example
 * 完整的陷阱列表示例
 *
 * Now in order to create a complete sample traps list, for didactic purposes, we will try to proxify a
 * non-native object that is particularly suited to this type of operation: the docCookies global object created
 * by the "little framework" published on the document.cookie page.
 * 现在为了创建一个完整的示例陷阱表，处于说教的目的，我们将尝试代理一个特别适合这种操作的非本机对象：docCookies全局对象由
 * 发布在文档.cookie中
 */
 var docCookies = new Proxy(docCookies, {
     get: function(oTarget, sKey) {
         return oTarget[sKey] || oTarget.getItem(sKey) || undefined;
     },
    set: function (oTarget, sKey, vValue) {
         if (sKey in oTarget) { return false;}
         return oTarget.setItem(sKey, vValue);
    },
    deleteProperty: function(oTarget, sKey) {
        if (!sKey in oTarget) { return false;}
        return oTarget.removeItem(sKey);
     },
    enumerate: function (oTarget, sKey) {
         return oTarget.keys();
    },
    ownKeys: function (oTarget, sKey) {
         return oTarget.keys();
    },
    has: function (oTarget, sKey) {
         return sKey in oTarget || oTarget.hasItem(sKey);
    },
    defineProperty: function(oTarget, sKey, oDesc){
         if (oDesc && 'value' in oDesc) { oTarget.setItem(sKey, oDesc.value );}
         return oTarget;
    },
    getOwnPropertyDescriptor: function (oTarget, sKey){
         var vValue = oTarget.getItem(sKey);
         return vValue ? {
             value: vValue,
             writable: true,
             enumerable: true,
             configurable: false
         }: undefined;
    }

})

