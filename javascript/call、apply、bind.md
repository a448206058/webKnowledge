## call、apply、bind
### bind定义
Function.prototype.Bind
The bind() method creates a new function that, when called, has its this keyword set to the provided value, with a given sequence of arguments preceding any provided when the new function is called.
bind()方法创造了一个新的函数，当被调用时，将其this关键字设置为提供的值，并在调用新函数时提供的任何参数之前提供一个给定的参数序列。
let boundFunc = func.bind(thisArg[,arg1[,arg2[,...argN]]])

* Parameters
thisArg
The value to be passed as the this parameter to the target function func when the bound function is called.The value
is ignored if the bound function is constructed using the new operator.When using bind to create a function (supplied as
a callback) inside a setTimeout, any primitive value passed as thisArg is converted to object.If no arguments are provided
to bind, or if the thisArg is null or undefined,the this of the executing scope is treated as the thisArg for the new function.
这个值会被作为this参数传递给目标函数当bound函数被调用的时候。如果使用new运算符构造bound函数，则忽略该值。使用bind在setTimeout内创建函数（作为回调函数提供）时，作为thisArg传递的任何原始值都将转换为object.如果没有参数提供给bind，或者thisArg是null或者undefined则执行范围的
this将被视为新函数的this参数

arg1, arg2,...argN | Optional
Arguments to prepend to arguments provided to the bound function when invoking func.
在调用func时为提供给绑定函数的参数加上前缀的参数

* Return value
A copy of the given function with the specified this value, and initial arguments(if provided).
具有指定此值和初始参数（如果提供）的给定函数的副本。

* Description
The bind() function creates a new bound function, which is an exotic function object(a term from ECMAScript 2015)that wraps
the original function object.Calling the bound function generally results in the execution of its wrapped function.
这bind()函数创建了一个新的bound函数，它是一个特殊的函数对象（ECMAScript 2015中的一个术语），它包装了原始函数对象。
调用绑定函数通常会导致其包装函数的执行。

A bound function has the following internal properties:
一个绑定函数包含以下内部属性：
[[BoundTargetFunction]]
The wrapped function object
封装的函数对象

[[BoundThis]]
The value that is always passed as this value when calling the wrapped function.
调用封装函数时始终作为this值传递值

[[BoundArguments]]
A list of values whose elements are used as the first arguments to any call to the wrapped function.
值的列表，其元素用作封装函数的任何调用的第一个参数

[[Call]]
Executes code associated with this object.Invoked via a function call expression.The arguments to the internal
method are a this value and a list containing the arguments passed to the function by a call expression.
执行与此对象关联的代码。通过函数调用表达式调用。内部方法的参数是this值和包含由调用表达式传递给函数的参数的列表。

When a bound function is called,it calls internal method [[Call]] on [[BoundTargetFunction]],with following arguments
Call(boundThis, ...args).Where boundThis is [[BoundThis]], args is [[BoundArguments]], followed by the arguments passed
by the function call.
当一个函数被调用，它调用内部方法[[Call]]在[[BoundTargetFunction]]目标绑定函数上，跟随一些参数Call(boundThis, ...args).当boundThis 是[[BoundThis]],
args 是[[BoundArguments]],后面是函数调用传递的参数。

A bound function may also be constructed using the new operator.Doing so acts as though the target function had instead been
constructed.The provided this value is ignored,while prepended arguments are provided to the emulated function.
一个绑定函数也可以构造一个新的边界函数。做这些操作就可以认为函数已经被构造好了。将忽略提供的this值，为模拟函数提供了前置参数。

### 手写bind
```JavaScript
Function.prototype.bind2 = function(context){
 if (typeof this !== 'function'){
     throw new Error('Function.prototype.bind - what is trying to be called a bound');
 }
 var self = this;
 var args = [].slice.call(arguments, 1);

 var fNOP = function(){};
 var fBound = function(){
     var bindArgs = [].slice.call(arguments);
     return (fNOP instanceof this ? this : context, args.concat(bindArgs));
 }
 fNOP.prototype = self.prototype;
 fBound.prototype = new fNOP();
 return fBound;
}
```

### call定义
* Function.prototype.call
The call() method calls a function with a given this value and arguments provided individually.
call()方法使用给定的this值和单独提供的参数调用函数
func.call([thisArg[, arg1, arg2, ...argN])

* Parameters
thisArg | Optional
The value to use as this when calling func.
调用功能时这个值被当做this

arg1, arg2, ...argN | Optional
Arguments for the function.
函数的参数

* Return value
The result of calling the function with the specified this value and arguments.
使用指定的this值和参数调用函数的结果。

* Description
The call() allows for a function/method belonging to one object to be assigned and called for a different object.
call()允许为另一个对象分配和调用属于某个对象的函数/方法。

call() provides a new value of this to the function/method.With call(), you can write a method once
and then inherit it in another object, without having to rewrite the method for the new object.
call()提供了一个新的值为函数/方法。使用call(),你可以编写一个方法，然后再另一个对象中继承它，而不必为新
对象重写方法。

### 手写call
```JavaScript
Function.prototype.call2 = function(context){
 var context = context || window;
 context.fn = this;
 var args = [];
 for(var i = 1; i < arguments.length; i++){
     args.push('arguments['+i+']');
 }
 var result = eval('context.fn('+args+')')
 delete context.fn;
 return result;
};
```

### apply定义
* Function.prototype.apply
The apply() method calls a function with a given this value, and arguments provided as an array
(or an array-like object).
apply()方法调用一个给定值的函数，数组作为参数提供（或者一个类似数组对象）
func.apply(thisArg, [argsArray])

* Parameters
thisArg
The value of this provided for the call to func.
这个值作为this提供给调用函数

Note that this may not be the actual value seen by the method:if the method is a function in non-strict
mode code,null and undefined will be replaced with the global object, and primitive values will be boxed.
This argument is required.
请注意，这可能不是实际值在这个方法中看到的：如果方法是一个函数在非严格模式下，null和undefined会被替换成全局对象，原始值将会被包装。
这个参数是必须的

argsArray | Optional
An array-like object, specifying the arguments with which func should be called, or null or undefined if
no arguments should be provided to the function.
参数数组
一个类似数组对象，指定调用func所用的参数，如果没有参数被提供给函数则返回null或者undefined;

* Return value
The result of calling the function with the specified this value and arguments.
使用this值和参数调用函数的结果

You can assign a different this object when calling an existing function. this refers to the current object
(the calling object).With apply, you can write a method once,and then inherit it in another object, without
having to rewrite the method for the new object.
调用现有函数时，可以为此对象分配不同的this.this指当前对象（调用对象）。使用apply,可以编写一次方法，然后在另一个对象继承它，
不必重写新对象的方法。

You can also use arguments for the argsArray parameter. arguments is a local variable of a function.
It can be used for all unspecified arguments of the called object.Thus,you do not have to know the
arguments of the called object when you use the apply method.You can use arguments to pass all the
arguments to the called object.The called object is then responsible for handling the arguments.
也可以使用argsArray参数的参数。arguments是一个函数的本地变量.它能被用在呗调用对象的所有未指定参数中，因此，
你不必知道使用apply方法时被调用对象的参数。可以使用arguments传递所有被调用对象的参数。然后呗调用的对象负责处理参数。

Since ECMAScript 5th Edition,you can also use any kind of object which is array-like.In practice, this
means it's going to have a length property, and integer ("index") properties in the range (0...length - 1).
For example, you could use a NodeList, or a custom object like { 'length': 2, '0': 'eat', '1': 'bananas'}.

从ECMAScript第5版开始，你可以使用任何一种类似数组的对象。实际上，这意味着它将有一个长度数据，以及范围(0... 长度-1)内的
整数("索引")属性。举例说明，你可以使用NodeList,或自定义对象如{ 'length': 2, '0': 'eat', '1': 'bananas'}.

### 手写apply
```JavaScript
Function.prototype.apply2 = function(context, arr){
 var context = Object(context) || window;
 context.fn = this;
 var args = [];
 var result;
 if (!arr){
     result = context.fn();
 } else{
     for(var i = 0; i < arr.length; i++){
         args.push('arguments['+i+']');
     }
     result = eval('context.fn('+args+')')
 }
 delete context.fn;
 return result;
}
```