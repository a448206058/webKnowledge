JavaScript深入之从原型到原型链

作用域
作用域是指程序源代码中定义变量的区域。
    作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。
    JavaScript采用词法作用域，也就是静态作用域。

    静态作用域与动态作用域
因为JavaScript采用的是词法作用域，函数的作用域在函数定义的时候就决定了。
    而与词法作用域相对的是动态作用域，函数的作用域是在函数调用的时候才决定的。

    动态作用域

JavaScript深入之执行上下文栈
可执行代码
全局代码、函数代码、eval代码。

    所以 JavaScript 引擎创建了执行上下文栈（Execution context stack，ECS）来管理执行上下文
试想当 JavaScript 开始要解释执行代码的时候，最先遇到的就是全局代码，所以初始化的时候首先就会向执行上下文栈压入一个全局执行上下文，我们用 globalContext 表示它，并且只有当整个应用程序结束的时候，ECStack 才会被清空，所以程序结束之前， ECStack 最底部永远有个 globalContext：
    ECStack = [
        globalContext
    ];

function fun3() {
    console.log('fun3')
}

function fun2() {
    fun3();
}

function fun1() {
    fun2();
}

fun1();

当执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出。知道了这样的工作原理，让我们来看看如何处理上面这段代码：
// 伪代码

// fun1()
ECStack.push(<fun1> functionContext);

// fun1中竟然调用了fun2，还要创建fun2的执行上下文
ECStack.push(<fun2> functionContext);

// 擦，fun2还调用了fun3！
ECStack.push(<fun3> functionContext);

// fun3执行完毕
ECStack.pop();

// fun2执行完毕
ECStack.pop();

// fun1执行完毕
ECStack.pop();

// javascript接着执行下面的代码，但是ECStack底层永远有个globalContext

JavaScript深入之变量对象
当 JavaScript 代码执行一段可执行代码(executable code)时，会创建对应的执行上下文(execution context)。
    对于每个执行上下文，都有三个重要属性：
    变量对象(Variable object，VO)
作用域链(Scope chain)
this

变量对象
变量对象是与执行上下文相关的数据作用域，存储了在上下文中定义的变量和函数声明。
    因为不同执行上下文下的变量对象稍有不同，所以我们来聊聊全局上下文下的变量对象和函数上下文下的变量对象。

    全局上下文
全局对象是预定义的对象，作为 JavaScript 的全局函数和全局属性的占位符。通过使用全局对象，可以访问所有其他所有预定义的对象、函数和属性。
    在顶层 JavaScript 代码中，可以用关键字 this 引用全局对象。因为全局对象是作用域链的头，这意味着所有非限定性的变量和函数名都会作为该对象的属性来查询。
    例如，当JavaScript 代码引用 parseInt() 函数时，它引用的是全局对象的 parseInt 属性。全局对象是作用域链的头，还意味着在顶层 JavaScript 代码中声明的所有变量都将成为全局对象的属性。

    1.可以通过 this 引用，在客户端 JavaScript 中，全局对象就是 Window 对象。
    console.log(this);
2.全局对象是由 Object 构造函数实例化的一个对象。
    console.log(this instanceof Object);
3.预定义了一堆函数和属性
console.log(Math.random());
console.log(this.Math.random());
4.作为全局变量的宿主
var a = 1;
console.log(this.a);
5.客户端JavaScript中，全局对象有window属性指向自身。
    var a = 1;
console.log(window.a);
this.window.b = 2;
console.log(this.b);

函数上下文
在函数上下文中，我们用活动对象(activation object, AO)来表示变量对象。
    活动对象和变量对象其实是一个东西，只是变量对象是规范上的或者说是引擎实现上的，不可在 JavaScript 环境中访问，只有到当进入一个执行上下文中，这个执行上下文的变量对象才会被激活，所以才叫 activation object 呐，而只有被激活的变量对象，也就是活动对象上的各种属性才能被访问。
    活动对象是在进入函数上下文时刻被创建的，它通过函数的 arguments 属性初始化。arguments 属性值是 Arguments 对象。

    执行过程
执行上下文的代码会分成两个阶段进行处理：分析和执行，我们也可以叫做：
    1.进入执行上下文
2.代码执行

进入执行上下文
变量对象会包括：
    函数的所有形参 (如果是函数上下文)
由名称和对应值组成的一个变量对象的属性被创建
没有实参，属性值设为 undefined
函数声明
由名称和对应值（函数对象(function-object)）组成一个变量对象的属性被创建
如果变量对象已经存在相同名称的属性，则完全替换这个属性
变量声明
由名称和对应值（undefined）组成一个变量对象的属性被创建；
        如果变量名称跟已经声明的形式参数或函数相同，则变量声明不会干扰已经存在的这类属性

全局上下文的变量对象初始化是全局对象
函数上下文的变量对象初始化只包括 Arguments 对象
在进入执行上下文时会给变量对象添加形参、函数声明、变量声明等初始的属性值
在代码执行阶段，会再次修改变量对象的属性值

JavaScript深入之作用域链
作用域链

函数创建
这是因为函数有一个内部属性 [[scope]]，当函数创建的时候，就会保存所有父变量对象到其中，你可以理解 [[scope]] 就是所有父变量对象的层级链，但是注意：[[scope]] 并不代表完整的作用域链！

    函数激活
当函数激活时，进入函数上下文，创建 VO/AO 后，就会将活动对象添加到作用链的前端。
    这时候执行上下文的作用域链，我们命名为 Scope：
    Scope = [AO].concat([[Scope]]);

JavaScript深入之从ECMAScript规范解读this
ECMAScript分为语言类型和规范类型
语言类型是开发者直接使用ECMAScript可以操作的  Undefined,Null,Boolean,String,Number和Object
规范类型相当于meta-values，是用来用算法描述ECMAScript语言结构和ECMAScript语言类型的。规范类型包括：Reference,
    List,Completion,Property Descriptor, Property Identifier,Lexical Environment,和 Environment Record.

    reference 由三个组成部分
base value
referenced name
strict reference

reference
1.GetBase 返回reference的base value
2.IsPropertyReference 如果base value 是一个对象，就返回true.
    GetValue 调用GetValue，返回的将是具体的值，而不再是一个Reference

如何确定this的值
1.计算MemberExpression的结果赋值给ref
2.判断ref是不是一个Reference类型
2.1 如果ref是Reference，并且IsPropertyReference(ref)是true,那么this的值为GetBase(ref)
2.2 如果ref是Reference，并且 base value 值是Environment Record,那么this的值为ImplicitThisValue(ref)
2.3 如果ref不是Reference，那么this的值为undefined

MemberExpression:
    PrimaryExpression //原始表达式
FunctionExpression //函数定义表达式
MemberExpression[Expression] //属性访问表达式
MemberExpression .IdentifierName //属性访问表达式
new MemberExpression Arguments // 对象创建表达式

简单理解 MemberExpression 其实就是()左边的部分。

    2.判断ref是不是一个Reference类型
关键就在于看规范是如何处理各种MemberExpression，返回的结果是不是一个Reference类型。

    javascript深入执行上下文
var scope = "global scope";
function checkscope() {
    var scope = "local scope";
    function f() {
        return scope;
    }
    return f();
}
checkscope();

执行过程如下：
    1.执行全局代码，创建全局执行上下文，全局上下文被压入执行上下文栈
ECStack = [
    globalContext
];
2.全局上下文初始化
globalContext = {
    VO: [global],
    Scope: [globalContext.VO],
    this: globalContext.VO
}
2.初始化的同时，checkscope函数被创建，保存作用域链到函数的内部属性[[scope]]
checkscope.[[scope]] = [
    globalContext.VO
];
3.执行checkscope函数，创建checkscope函数执行上下文，checkscope函数执行上下文被压入执行上下文栈
ECStack = [
    checkscopeContext,
    globalContext
]
4.checkscope函数执行上下文初始化：
        1.复制函数[[scope]]属性创建作用域链，
        2.用arguments创建活动对象
3.初始化活动对象，即加入形参、函数声明、变量声明
4.将活动对象压入checkscope作用域链顶端
同时f函数被创建，保存作用域链到f函数的内部属性[[scope]]
checkscopeContext = {
    AO: {
        arguments: {
            length: 0
        },
        scope: undefined,
        f: reference to function f(){}
    },
    Scope: [AO, globalContext.VO],
    this: undefined
}
5.执行f函数，创建f函数执行上下文，f函数执行上下文被压入执行上下文栈
ECStack = [
    fContext,
    checkscopeContext,
    globalContext
]
6.f函数执行上下文初始化，以下跟第4步相同：
        1.复制函数[[scope]]属性创建作用域链
2.用arguments创建活动对象
3.初始化活动对象，即加入形参、函数声明、变量声明
4.将活动对象压入f作用域链顶端
fContext = {
    AO: {
        arguments: {
            length: 0
        }
    },
    Scope: [AO, checkscopeContext.AO, globalContext.VO],
    this: undefined
}
7.f函数执行，沿着作用域链查找scope值，返回scope值
8.f函数执行完毕，f函数上下文从执行上下文栈中弹出
ECStack = [
    checkscopeContext,
    globalContext
]
9.checkscope函数执行完毕，checkscope执行上下文从执行栈上下文栈中弹出
ECStack = [
    globalContext
];

JavaScript深入之闭包
MDN对闭包的定义为：
    闭包是值哪些能够访问自由变量的函数。
    自由变量是指在函数中使用的，但即不是函数参数也不是函数的局部变量的变量。
    闭包 = 函数 + 函数能够访问的自由变量
ECMAScript中，闭包指的是：
    1.从理论角度：所有的函数。因为它们都在创建的时候就将上层上下文的数据保存起来了。哪怕是简单的全局变量也是如此，因为函数中访问
全局变量就相当于是在访问自由变量，这个时候使用最外层的作用域。
    2.从实践角度：以下函数才算是闭包：
        1.即使创建它的上下文已经销毁，它仍然存在
2.在代码中引入了自由变量

var scope = "global scope";
function checkscope() {
    var scope = "local scope";
    function f() {
        return scope;
    }
    return f;
}
var foo = checkscope();
foo();
1.进入全局代码，创建全局执行上下文，全局执行上下文压入执行上下文栈
2.全局执行上下文初始化
3.执行checkscope函数，创建checkscope函数执行上下文，checkscope执行上下文被压入执行上下文栈
4.checkscope执行上下文初始化，创建变量对象、作用域链、this等
5.checkscope函数执行完毕，checkscope执行上下文从执行上下文栈中弹出
6.执行f函数，创建f函数执行上下文，f执行上下文被压入执行上下文栈
7.f执行上下文初始化，创建变量对象、作用域链、this等
8.f函数执行完毕，f函数上下文从执行上下文栈中弹出

f执行上下文维护了一个作用域链：
    fContext = {
        Scope: [AO, checkscopeContext.AO, globalContext.VO]
    }

var data = [];
for (var i = 0; i < 3; i++){
    data[i] = function () {
        console.log(i)
    };
}

data[0]();
data[1]();
data[2]();

答案都是3
当执行到data[0]函数之前，此时全局上下文的VO为：
    globalContext = {
        VO: {
            data: [...],
            i: 3
        }
    }
当执行data[0]函数的时候，data[0]函数的作用域链为：
    data[0]Context = {
    Scope: [AO, globalContext.VO]
}
data[0]Context的AO并没有i值，所以会从globalContext.VO中查找,i为3，所以打印的结果就是3。
    data[1]和data[2]是一样的道理
改成闭包
var data = [];
for (var i = 0; i < 3;i++){
    data[i] = (function(i){
        return function (){
            console.log(i);
        }
    })(i);
}
data[0]();
data[1]();
data[2]();
当执行到data[0]函数之前，此时全局上下文的VO为：
    globalContext = {
        VO: {
            data: [...],
            i: 3
        }
    }
当执行data[0]函数的时候，data[0]函数的作用域链发生了改变：
    data[0]Context = {
    Scope: [AO, 匿名函数Context.AO globalContext.VO]
}
匿名函数执行上下文的AO微：
    匿名函数Context = {
        AO: {
            arguments: {
                0: 0,
                length: 1
            },
            i: 0
        }
    }
data[0]Context 的 AO 并没有 i 值，所以会沿着作用域链从匿名函数 Context.AO 中查找，这时候就会找 i 为 0，找到了就不会往 globalContext.VO 中查找了，即使 globalContext.VO 也有 i 的值(值为3)，所以打印的结果就是0。
    data[1] 和 data[2] 是一样的道理。

    JavaScript深入之参数按值传递
var value = 1;
function foo(v) {
    v = 2;
    console.log(v); //2
}
foo(value);
console.log(value); //1
当传递value到函数foo中，相当于拷贝了一份value,假设拷贝的这份叫_value,函数中修改的都是_value的值，而不会影响原来的value值。

    引用传递
拷贝虽然很好理解，但是当值是一个复杂的数据结构的时候，拷贝就会产生性能上的问题。
    所以还有另一种传递方式叫做按引用传递。
    所谓按引用传递，就是传递对象的引用，函数内部对参数的任何改变都会影响该对象的值，因为俩者引用的是同一个对象。
    var obj = {
        value: 1
    }
function foo(o){
    o.value = 2;
    console.log(o.value); //2
}
foo(obj);
console.log(obj.value) //2

第三种传递方式
var obj = {
    value: 1
};
function foo(o) {
    o = 2;
    console.log(o); //2
}
foo(obj);
console.log(obj.value) //1
共享传递  在传递对象的时候，传递对象的引用的副本。
    注意：按引用传递是传递对象的引用，而按共享传递是传递对象的引用的副本！
    所以修改o.value，可以通过引用找到原值，但是直接修改o，并不会修改原值。所以第二个和第三个例子其实都是按共享传递。
    参数如果是基本类型是按值传递，如果是引用类型按共享传递。
    但是因为拷贝副本也是一种值的拷贝，所以在高程中也直接认为是按值传递了。

    JavaScript深入之call和apply的模拟实现
call call()方法在使用一个指定的this值和若干个指定的参数值的前提下调用函数或方法
var foo = {
    value: 1
};

function bar() {
    console.log(this.value);
}

bar.call(foo); // 1
1.call 改变了this 的指向，指向到foo
2.bar函数执行了
模拟实现第一步
var foo = {
    value: 1,
    bar: function() {
        console.log(this.value)
    }
};
foo.bar(); //1
1.将函数设为对选哪个的属性
2.执行该函数
3.删除该函数
foo.fn = bar
foo.fn()
delete foo.fn
//第一版
Function.prototype.call2 = function(context) {
    // 首先要获取调用call的函数，用this可以获取
    context.fn = this;
    context.fn();
    delete context.fn;
}

模拟实现第二步
call参数还能给定参数执行函数。
    var foo = {
        value: 1
    };
function bar(name, age) {
    console.log(name)
    console.log(age)
    console.log(this.value)
}
bar.call(foo, 'kevin', 18);
// kevin
// 18
// 1

// 因为arguments是类数组对象，所以可以用for循环
var args = [];
for (var i = 1, len = arguments.length; i < len;i++){
    args.push('arguments['+i+']');
}
//第二版
Function.prototype.call2 = function(context) {
    context.fn = this;
    var args = [];
    for (var i = 1, len = arguments.length; i < len;i++){
        args.push('arguments['+i+']');
    }
    eval('context.fn('+args+')');
    delete context.fn;
}
模拟实现第三步
1.this参数可以传null,当为null的时候，视为指向window
2.函数是可以有返回值的
//第三版
Function.prototype.call2 = function(context) {
    var context = context || window;
    context.fn = this;

    var args = [];
    for (var i = 1, len = arguments.length;i < len;i++) {
        args.push('arguments['+i+']');
    }

    var result = eval('context.fn('+args+')');

    delete context.fn
    return result;
}

apply的模拟实现
Function.prototype.apply = function (context, arr) {
    var context = Object(context) || window;
    context.fn = this;

    var result;
    if (!arr) {
        result = context.fn();
    } else {
        var args = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            args.push('arr['+i+']');
        }
        result = eval('context.fn('+args+')')
    }
    delete context.fn
    return result
}

bind
bind()方法会创建一个新函数。当这个新函数被调用时，bind()的第一个参数将作为它运行时的this,之后一系列参数将会在传递的
实参前传入作为它的参数。
    俩个特点：
    1.返回一个函数
2.可以传入参数
var foo = {
    value: 1
}
function bar() {
    console.log(this.value)
}
//返回了一个函数
var bindFoo = bar.bind(foo);
bindFoo(); //1

//第一版
Function.prototype.bind2 = function (context) {
    var self = this;
    return function() {
        return self.apply(context);
    }
}
//第二版
Function.prototype.bind2 = function (context) {
    var self = this;
    //获取bind2函数从第二个参数到最后一个参数
    var args = Array.prototype.slice.call(arguments, 1);

    return function () {
        // 这个时候的arguments是指bind返回的函数传入的参数
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(context, args.concat(bindArgs));
    }
}
//第三版
Function.prototype.bind2 = function (context) {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        //当作为构造函数时，this指向实例，此时结果为true,将绑定函数的this指向该实例，可以让实例获得来自绑定函数的值
        // 以上面的是 demo 为例，如果改成 `this instanceof fBound ? null : context`，实例只是一个空对象，将 null 改成 this ，实例会具有 habit 属性
        // 当作为普通函数时，this 指向 window，此时结果为 false，将绑定函数的 this 指向 context
        return self.apply(this instanceof fBound ? this : context, args.concat(bindArgs))
    }
    // 修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
    fBound.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
}
//第四版
Function.prototype.bind2 = function(context) {
    if(typeof this !== "function") {
        throw new Error("Function.prototype.bind - what is trying to be bound is not callable")
    }

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    var fBound = function() {
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
    }

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
}

Function.prototype.bind2 = function(context) {
    if(typeof this !== 'function'){
        throw new Error('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function() {};
    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
    }

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
}

new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象类型之一
实例的__proto__属性会指向构造函数的prototype,实例可以访问原型上的属性。
// 第一版代码
function objectFactory() {
    var obj = new Object(), Constructor = [].shift.call(arguments);
    obj.__proto__ = Constructor.prototype;
    Constructor.apply(obj, arguments);
    return obj;
}
1.用new Object()的方式新建了一个对象obj
2.取出第一个参数，就是我们要传入的构造函数。此外因为shift会修改原数组，所以arguments会被去除第一个参数
3.将obj的原型指向构造函数，这样obj就可以访问到构造函数原型中的属性
4.使用apply，改变构造函数this的指向到新建的对象，这样obj就可以访问到构造函数中的属性
5.返回obj

//第二版
function objectFactory() {
    var obj = new Object(), Constructor = [].shift.call(arguments);
    obj.__proto__ = Constructor.prototype;
    var ret = Constructor.apply(obj, arguments);
    return typeof ret === 'object' ? ret : obj;
}

JavaScript深入之类数组对象与arguments
类数组对象
拥有一个length属性和若干索引属性的对象
读写
长度
遍历
调用数组方法
既然无法直接调用，我们可以用Function.call间接调用：
    var arrayLike = {0: 'name',1: 'age', 2: 'sex', length : 3};
Array.prototype.join.call(arrayLike, '&'); // name&age&sex
Array.prototype.slice.call(arrayLike, 0); //["name", "age", "sex"];
Array.prototype.map.call(arrayLike, function(item){
    return item.toUpperCase();
});
["NAME", "AGE", "SEX"]

类数组转数组
var arrayLike = {0: 'name', 1: 'age', 2: 'sex', length: 3};
// 1. slice
Array.prototype.slice.call(arrayLike); //["name", "age", "sex"]
// 2. splice
Array.protoype.splice.call(arrayLike, 0); //["name", "age", "sex"]
// 3. ES6 Array.from
Array.from(arrayLike); //["name", "age", "sex"]
// 4. apply
Array.prototype.concat.apply([], arrayLike)

Arguments对象
Arguments对象只定义在函数体中，包括了函数的参数和其它属性。在函数体中，arguments指代该函数的Arguments对象。
    length属性
Arguments对象的length属性，表示实参的长度
function foo(b, c, d){
    console.log("实参的长度为：" + arguments.length)
}

console.log("形参的长度为：" + foo.length);

foo(1)
// 形参的长度为：3
// 实参的长度为：1

callee属性
Arguments对象的callee属性，通过它可以调用函数自身。
    var data = [];
for (var i = 0; i < 3;i++) {
    (data[i] = function() {
        console.log(arguments.callee.i)
    }).i = i;
}
data[0]();
data[1]();
data[2]();

// 0
// 1
// 2

arguments和对应参数的绑定
function foo(name, age, sex, hobbit) {
    console.log(name, arguments[0]); //name name

    // 改变形参
    name = 'new name';

    console.log(name, arguments[0]); // new name new name

    // 改变arguments
    arguments[1] = 'new age';

    console.log(age, arguments[1]); // new age new age

    //测试未传入的是否会绑定
    console.log(sex); // undefined

    sex = 'new sex';

    console.log(sex, arguments[2]); // new sex undefined

    arguments[3] = 'new hobbit';

    console.log(hobbit, arguments[3]); // undefined new hobbit
}
foo('name', 'age')
传入的参数，实参和arguments的值会共享，当没有传入时，实参与arguments值不会共享
除此之外，以上是在非严格模式下，如果是在严格模式下，实参和arguments是不会共享的。

    传递参数
将参数从一个函数传递到另一个函数
//使用apply将foo的参数传递给bar
function foo() {
    bar.apply(this, arguments);
}
function bar(a, b, c){
    console.log(a, b, c);
}

foo(1, 2, 3);
强大的ES6
使用ES6的...运算符，我们可以轻松转成数组。
    function func(...arguments) {
        console.log(arguments); //[1, 2, 3]
    }
func(1, 2, 3);

应用
1.参数不定长
2.函数柯里化
3.递归调用
4.函数重载

JavaScript深入之创建对象的多种方式以及优缺点
1.工厂模式
function createPerson(name) {
    var o = new Object();
    o.name = name;
    o.getName = function () {
        console.log(this.name);
    };
    return o;
}
var person1 = createPerson('kevin');
缺点：对象无法识别，因为所有的实例都指向一个原型

2.构造函数模式
function Person(name) {
    this.name = name;
    this.getName = function () {
        console.log(this.name)
    };
}
var person1 = new Person('kevin');
优点：实例可以识别为一个特定的类型
缺点：每次创建实例时，每个方法都要被创建一次

2.1构造函数模式优化
function Person(name) {
    this.name = name;
    this.getName = getName;
}

function getName() {
    console.log(this.name);
}

var person1 = new Person('kevin');
优点：解决了每个方法都要被重新创建的问题
缺点：封装...

3.原型模式
function Person(name) {

}
Person.prototype.name = 'kevin';
Person.prototype.getName = function() {
    console.log(this.name);
};
var person1 = new Person();
优点：方法不会重新创建
缺点：1.所有的属性和方法都共享 2.不能初始化参数

3.1原型模式优化
function Person(name) {

}

Person.prototype = {
    name: 'kevin',
    getName: function() {
        console.log(this.name)
    }
};

var person1 = new Person();
优点：封装性好了一点
缺点：重写了原型，丢失了constructor属性

3.2原型模式优化
function Person(name) {

}

Person.prototype = {
    constructor: Person,
    name: 'kevin',
    getName: function () {
        console.log(this.name)
    }
};

var person1 = new Person();
优点：实例可以通过constructor属性找到所属构造函数
缺点：原型模式改有的缺点还是有

4.组合模式
构造函数模式与原型模式双剑合璧
function Person(name) {
    this.name = name;
}
Person.prototype = {
    constructor: Person,
    getName: function() {
        console.log(this.name);
    }
};
var person1 = new Person();
优点：该共享的共享，该私有的私有，使用最广泛的方式
缺点：有的人就是希望全部都写在一起，即更好的封装性

4.1动态原型模式
function Person(name) {
    this.name = name;
    if (typeof this.getName != "function") {
        Person.prototype.getName = function () {
            console.log(this.name);
        }
    }
}
var person1 = new Person();
注意：使用动态原型模式时，不能用对象字面量重写原型
function Person(name) {
    this.name = name;
    if (typeof this.getName != "function") {
        Person.prototype = {
            constructor: Person,
            getName: function() {
                console.log(this.name);
            }
        }
    }
}
var person1 = new Person('kevin');
var person2 = new Person('daisy');

//报错，并没有该方法
person1.getName();

//注释掉上面的代码，这句是可以执行的。
person2.getName();

为了解释这个问题，假设开始执行var person1 = new Person('kevin');

5.1寄生构造函数模式
function Person(name) {
    var o = new Object();
    o.name = name;
    o.getName = function () {
        console.log(this.name)
    };
    return o;
}
var person1 = new Person('kevin');
console.log(person1 instanceof Person) //false
console.log(person1 instanceof Object) // true

5.2稳妥构造函数模式
function person(name) {
    var o = new Object();
    o.sayName = function() {
        console.log(name)
    };
    return o;
}
var person1 = person('kevin');
person1.sayName(); // kevin
person1.name = 'daisy';
person1.sayName(); //kevin
console.log(person1.name) // daisy
所谓稳妥对象，指的是没有公共属性，而且其方法也不引用this的对象。
    与寄生构造函数模式有俩点不同：
    1.新创建的实例方法不引用this
2.不使用new操作符调用构造函数
稳妥对象最适合在一些安全的环境中。
    稳妥构造函数模式也跟工厂模式一样，无法识别对象所属类型。

    JavaScript深入之继承的多种方式
1.原型链继承
function Parent() {
    this.name ='kevin';
}

Parent.prototype.getName = function () {
    console.log(this.name)
}
function Child() {
}

Child.prototype = new Parent();
var child1 = new Child();
console.log(child1.getName());
缺点:
    1.引用类型的属性被所有实例共享
2.在创建Child的实例时，不能向Parent传参

2.借用构造函数（经典继承）
    function Parent () {
        this.names = ['kevin', 'daisy'];
    }
function Child () {
    Parent.call(this);
}
var child1 = new Child();
child1.names.push('yayu');
console.log(child1.names);
var child2 = new Child();
console.log(child2.names);
优点：
    1.避免了引用类型的属性被所有实例共享
2.可以在Child中向Parent传参
举个例子：
    function Parent (name) {
        this.name = name;
    }
function Child (name) {
    Parent.call(this, name);
}
var child1 = new Child('kevin');
console.log(child1.name); // kevin
var child2 = new Child('daisy');
console.log(child2.name); // daisy
缺点：
    方法都在构造函数中定义，每次创建实例都会创建一遍方法。

    3.组合继承
原型链继承和景丹继承双剑合璧
function Parent (name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.getName = function() {
    console.log(this.name);
}

function Child(name, age) {
    Parent.call(this, name);
    this.age = age;
}

Child.protoype = new Parent();
Child.protoype.constructor = Child;

var child1 = new Child('kevin','18');

child1.colors.push('black');

console.log(child1.name); // kevin
console.log(child1.age); // 18
console.log(child1.colors); // ["red", "blue", "green", "black"]

var child2 = new Child('daisy', '20');

console.log(child2.name); // daisy
console.log(child2.age); // 20
console.log(child2.colors); // ["red", "blue", "green"]
优点：融合原型链继承和构造函数的优点，是JavaScript中最常用的继承模式。

    4.原型式继承
function createObj(o) {
    function F(){}
    F.prototype = o;
    return new F();
}
就是ES5 Object.create的模拟实现，将传入的对象作为创建的对象的原型。
    缺点：
    包含引用类型的属性值始终都会共享相应的值，这点跟原型链继承一样。
    var person = {
        name: 'kevin',
        friends: ['daisy', 'kelly']
    }
var person1 = createObj(person);
var person2 = createObj(person);

person1.name = 'person1';
console.log(person2.name); // kevin

person1.friends.push('taylor');
console.log(person2.friends); // ["daisy", "kelly", "taylor"]

5.寄生式继承
创建一个仅用于封装继承过程的函数，该函数在内部以某种形式来做增强对象，最后返回对象。
    function createObj (o) {
        var clone = Object.create(o);
        clone.sayName = function () {
            console.log('hi');
        }
        return clone;
    }
缺点：跟借用构造函数模式一样，每次创建对象都会创建一遍方法。

    6.寄生组合式继承
function Parent (name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.getName = function () {
    console.log(this.name)
}

function Child (name, age) {
    Parent.call(this, name);
    this.age = age;
}

Child.prototype = new Parent();

var child1 = new Child('kevin', '18');

console.log(child1)

组合继承最大的缺点是会调用俩次父构造函数
一次是设置子类型实例的原型的时候
Child.prototype = new Parent();
一次在创建子类型实例的时候：
    var child1 = new Child('kevin', '18');

function Parent (name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.getName = function () {
    console.log(this.name)
}

function Child(name, age) {
    Parent.call(this, name);
    this.age = age;
}

var F = function () {};
F.prototype = Parent.prototype;
Child.prototype = new F();
var child1 = new Child('kevin', '18');
console.log(child1);

function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

function prototype(child, parent) {
    var prototype = object(parent.prototype);
    prototype.constructor = child;
    child.prototype = prototype;
}

prototype(Child, Parent);

JavaScript深入之浮点数精度
数字类型
规定了四种浮点数值的方式：
    单精确度、双精确度、延伸单精确度、与延伸双精确度

浮点数转二进制
浮点数的存储
浮点数的运算

JavaScript深入之头疼的类型转换
将值从一种类型转换为另一种类型通常称为类型转换。
    JavaScript共有六种数据类型：Null String Object undefined Boolean Number

原始值转布尔
我们使用Boolean函数将类型转换成布尔类型，在JavaScript中，只有6种值可以被转换成false,其他都会被转换成true。
    console.log(Boolean()) // false
console.log(Boolean(false)) // false
console.log(Boolean(undefined)) // false
console.log(Boolean(null)) // false
console.log(Boolean(+0)) // false
console.log(Boolean(-0)) // false
console.log(Boolean(NaN)) // false
console.log(Boolean("")) // false

原始值转数字
我们可以使用Number函数将类型转换成数字类型，如果参数无法被转换为数字，则返回NaN
ToNumber
Undefined NaN
Null +0
Boolean 如果参数是true，返回1.参数为false，返回+0
Number 返回与之相等的值

原始值转字符
使用String函数将类型转换成字符串类型
ToString
Undefined "undefined"
Null "null"
Boolean 如果参数是true，返回"true"。参数为false,返回"false"
Number 又是比较复杂，可以看例子
String 返回与之相等的值

原始值转对象
原始值到对象的转换非常简单，原始值通过调用String()、Number()或者Boolean()构造函数，转换为它们各自的包装对象。
    var a = 1;
console.log(typeof a); // number
var b = new Number(a);
console.log(typeof b); // object

对象转布尔值
对象到布尔值的转换非常简单：所有对象（包括数组和函数）都转换为true。
    console.log(Boolean(new Boolean(false))) // true

对象转字符串和数字
对象到字符串和对象到数字的转换都是通过调用待转换对象的一个方法来完成的。而JavaScript对象有俩个不同的方法来执行转换，
    一个是toString，一个是valueOf。这个和ToString和ToNumber是不同的，这俩个方法是真实暴露出来的方法。

    所有的对象除了null和undefined之外的任何值都具有toString方法
1.数组的toString方法将每个数组元素转换成一个字符串，并在元素之间添加逗号后合并成结果字符串。
    2.函数的toString方法返回源代码字符串。
    3.日期的toString方法返回一个可读的日期和时间字符串
4.RegExp的toString方法返回一个表示正则表达式

而另一个转换对象的函数是valueOf，表示对象的原始值。默认的valueOf方法返回这个对象本身，数组、函数、正则简单的继承了这个默认方法
var date = new Date(2017, 4, 21);
console.log(date.valueOf()) // 1495296000000

对象接着转字符串和数字
Object
1.primValue = ToPrimitive(input, String)
2.返回ToString(primValue)

ToPrimitive(input[, PreferredType])
第一个参数是input，表示要处理的输入值
第二个参数是PreferredType，非必填，表示希望转换成的类型，有俩个值可以选，Number或者String

当不传入PreferredType时，如果input是日期类型，相当于传入String，否则，相当于传入Number

如果传入的input是Undefined、Null、Boolean、Number、String类型，直接返回该值

如果是ToPrimitive(obj, Number)，处理步骤如下：
    1.如果obj为基本类型，直接返回
2.否则，调用valueOf方法，如果返回一个原始值，则JavaScript将其返回。
    3.否则，调用toString方法，如果返回一个原始值，则JavaScript将其返回。
    4.否则，JavaScript抛出一个类型错误异常。

    如果是ToPrimitive(obj, String)，处理步骤如下：
    1.如果obj为基本类型，直接返回
2.否则，调用toString方法，如果返回一个原始值，则JavaScript将其返回
3.否则，调用valueOf方法，如果返回一个原始值，则JavaScript将其返回
4.否则，JavaScript抛出一个类型错误异常。

    对象转字符串
1.如果对象具有toString方法，则调用这个方法。如果他返回一个原始值，JavaScript将这个值转换为字符串，并返回这个字符串结果。
    2.如果对象没有toString方法，或者这个方法并不返回一个原始值，那么JavaScript会调用valueOf方法。如果存在这个方法，则
JavaScript调用它。如果返回值是原始值，JavaScript将这个值转换为字符串，并返回这个字符串的结果。
    3.否则，JavaScript无法从toString或者valueOf获得一个原始值，这时它将抛出一个类型错误异常。

    对象转数字
对象转数字的过程中,JavaScript做了同样的事情，只是它会首先尝试valueOf方法
1.如果对象具有valueOf方法，且返回一个原始值，则JavaScript将这个原始值转换为数字并返回这个数字
2.否则，如果对象具有toString方法，且返回一个原始值，则JavaScript将其转换并返回
3.否则，JavaScript抛出一个类型错误异常

console.log(Number({})) // NaN
console.log(Number({a: 1})) // NaN

console.log(Number([])) // 0
console.log(Number([0])) // 0
console.log(Number([1, 2, 3])) // NaN
console.log(Number(function(){var a = 1;})) // NaN
console.log(Number(/\d+/g)) // NaN
console.log(Number(new Date(2010, 0, 1))) // 1262275200000
console.log(Number(new Error('a'))) // NaN

当我们Number([])的时候，先调用[]的valueOf方法，此时返回[]，因为返回了一个对象而不是原始值，所以又调用了
toString方法，此时返回一个空字符串，接下来调用ToNumber这个规范上的方法，参照对应表，转换为0，所以最后的结果为0。

    而当我们Number([1, 2, 3])的时候，先调用[1,2,3]的valueOf方法，此时返回[1,2,3],再调用toString方法，此时返回1,2,3，
    接下来调用ToNumber，参照对应表，因为无法转换为数字，所以最后的结果为NaN

JSON.stringify
值得一提的是：JSON.stringify()方法可以将一个JavaScript值转换为一个JSON字符串，实现上也是调用了toString方法，也算是一种
类型转换的方法。注意要点：
    1.处理基本类型时，与使用toString基本相同，结果都是字符串，除了undefined
console.log(JSON.stringify(null)) // null
console.log(JSON.stringify(undefined)) // undefined，注意这个undefined不是字符串的undefined
console.log(JSON.stringify(true)) // true
console.log(JSON.stringify(42)) // 42
console.log(JSON.stringify("42")) // "42"
2.布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。
    JSON.stringify([new Number(1), new String("false"), new Boolean(false)]); // "[1, "false", false]"
3.undefined、任意的函数以及symbol值，在序列化过程中会被忽略（出现在非数组对象的属性值中时）或者被转换成null（出现在数组中时）。
    JSON.stringify({x: undefined, y: Object,z: Symbol("")});
//  "{}"
JSON.stringify([undefined, Object, Symbol("")]);
// "[null, null, null]"
4.JSON.stringify有第二个参数replacer，它可以是数组或者函数，用来指定对象序列化过程中哪些属性应该被处理，哪些应该被排除。
    function replacer(key, value) {
        if (typeof value === "string"){
            return undefined;
        }
        return value;
    }

var foo = {foundation: "Mozilla", model: "box", week: 45, transport: "car", month: 7};
var jsonString = JSON.stringify(foo, replacer);

console.log(jsonString);
// {"week": 45, "month": 7}

var foo = {foundation: "Mozilla", model: "box",week: 45,transport: "car", month: 7};
console.log(JSON.stringify(foo, ['week', 'month']));
// {"week":45, "month":7}

5.如果一个被序列化的对象拥有toJSON方法，那么该toJSON方法就会覆盖该对象默认的序列化行为：不是那个对象被序列化，而是
调用toJSON方法后的返回值会被序列化，
    var obj = {
        foo: 'foo',
        toJSON: function() {
            return 'bar';
        }
    };
JSON.stringify(obj); // '"bar"'
JSON.stringify({x: obj}); // '{"x": "bar"}'

隐式转换
一元操作符 +
console.log(+'1');
当 + 运算符作为一元操作符的时候，会调用ToNumber处理该值，相当于Number('1')，最终结果返回数字1。
    console.log(+[]);  // 0
console.log(+['1']); // 1
console.log(+['1', '2', '3']);  // NaN
console.log(+{});  // NaN
先调用ToPrimitive(input, Number)方法，执行的步骤是：
    1.如果obj为基本类型，直接返回
2.否则，调用valueOf方法，如果返回一个原始值，则JavaScript将其返回。
    3.否则，调用toString方法，如果返回一个原始值，则JavaScript将其返回
4.否则，JavaScript抛出一个类型错误异常
以+[]为例，[]调用valueOf方法，返回一个空数组，因为不是原始值，调用toString方法，返回""。
    得到返回值后，然后再调用ToNumber方法，""对应的返回值是0，所以最终返回0。

    二元操作符 +
    1.lprim = ToPrimitive(value1);
2.rprim = ToPrimitive(value2);
3.如果lprim是字符串或者rprim是字符串，那么返回ToString(lprim)和ToString(rprim)的拼接结果
4.返回ToNumber(lprim)和ToNumber(rprim)的运算结果
console.log(null + 1); 1
console.log([] + []); ""
console.log([] + {}); "[object Object]"

== 相等
"=="用于比较俩个值是否相等，当要比较的俩个值类型不一样的时候，就会发生类型的转换。
    当执行x==y时：
    1.如果x与y是同一类型：
        i.x是Undefined，返回true
ii.x是Null，返回true
iii.x是数字：
            a.x是NaN，返回false
b.y是NaN，返回false
c.x与y相等，返回false
d.x是+0，y是-0，返回true
e.x是-0，y是+0，返回true
f.返回false
iv.x是字符串，完全相等返回true，否则返回false
v.x是布尔值，x和y都是true或者false，返回true，否则返回false
vi.x和y指向同一个对象，返回true，否则返回false
2.x是null并且y是undefined，返回true
3.x是undefined并且y是null，返回true
4.x是数字，y是字符串，判断x==ToNumber(y)
5.x是字符串，y是数字，判断ToNumber(x) == y
6.x是布尔值，判断ToNumber(x) == y
7.y是布尔值，判断x == ToNumber(y)
8.x不是字符串或者数字，y是对象，判断x == ToPrimitive(y)
9.x是对象，y不是字符串或者数字，判断ToPrimitive(x) == y
10.返回false

其他
除了这俩种情形之外，其实还有很多情形会发生隐式类型转换，比如if、?:、&&
