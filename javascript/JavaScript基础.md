## JavaScript 实现

核心（ECMAScript）：由 ECMA-262 定义并提供核心功能
文档对象模型（DOM）：提供与网页内容交互的方法和接口
浏览器对象模型（BOM)：提供与浏览器交互的方法和接口

### ECMAScript

ECMA-262d 到底定义了什么？

- 语法
- 类型
- 语句
- 关键字
- 保留字
- 操作符
- 全局对象

### DOM

文档对象模型（DOM,Document Object Model）是一个应用编程接口（API）。用于在 HTML 中使用扩展的 xml。DOM 将真个页面抽象为一组分层节点。

DOM 通过创建表示文档的树，让开发者可以随心所欲地控制网页的内容和结构。使用 DOM API。可以轻松地删除、添加、替换、修改节点。

### DOM

IE3 和 Netscape Navigator3 提供了浏览器对象模型（BOM）API,用于支持访问和操作浏览器的窗口。

## HTML 中的 JavaScript

### script 元素

将 JavaScript 插入 HTML 的主要方法是使用<script>元素。
有以下 8 个属性

- async：可选。表示应该立即开始下载脚本，但不能阻止其它页面动作，比如下载资源或等待其他脚本加载。只对外部脚本文件有效。
- charset：可选。使用 src 属性指定的代码字符集。这个属性很少使用，因为大多数浏览器不在乎它的值。
- crossorigin：可选。配置相关请求的 CORS（跨域资源共享）设置。默认不实用 CORS。
- defer：可选。表示脚本可以延迟到文档完全被解析和显示之后再执行。只对外部脚本文件有效。
- integrity：可选。允许比对接收到的资源和指定的加密签名以验证子资源完整性(SRI， 12 Subresource Integrity)。如果接收到的资源的签名与这个属性指定的签名不匹配，则页面会报错，脚本不会执行。这个属性可以用于确保内容分发网络(CDN，Content Delivery Network)不会提供恶意内容
- language：废弃。
- src：可选。表示包含要执行的代码的外部文件。
- type：可选。代替 language，表示代码块中脚本语言的内容类型(也称 MIME 类型)。

### 行内代码与外部文件

最佳实践是尽可能将 JavaScript 代码放在外部文件中

- 可维护性
- 缓存
- 适应未来

### 文档模式

混杂模式
标准模式
准标准模式

### <noscript>元素

### 总结

JavaScript 是通过<script>元素插入到 HTML 页面中的。这个元素可用于把 JavaScript 代码嵌入到 HTML 页面中，跟其他标记混合在一起，也可用于引入保存在外部文件中的 JavaScript

- 要包含外部 JavaScript 文件，必须将 src 属性设置为要包含文件的 URL.
- 所有<script>元素会依照它们在网页中出现的次序被解释。在不使用 defer 和 async 属性的 情况下，包含在<script>元素中的代码必须严格按次序解释。
- 对不推迟执行的脚本，浏览器必须解释完位于<script>元素中的代码，然后才能继续渲染页面 的剩余部分。为此，通常应该把<script>元素放到页面末尾，介于主内容之后及</body>标签 之前。
- 可以使用 defer 属性把脚本推迟到文档渲染完毕后再执行。推迟的脚本原则上按照它们被列出 的次序执行。
- 可以使用 async 属性表示脚本不需要等待其他脚本，同时也不阻塞文档渲染，即异步加载。异 步脚本不能保证按照它们在页面中出现的次序执行。
- 通过使用<noscript>元素，可以指定在浏览器不支持脚本时显示的内容。如果浏览器支持并启 用脚本，则<noscript>元素中的任何内容都不会被渲染。

## 语言基础

### 语法

区分大小写
标识符
注释
严格模式
语句

### 关键词与保留字

关键字：
break do
case else
catch export
class extends
const finally
continue for
debugger function this
default if throw
delete import try
in typeof
instanceof var
new void
return while
super with
switch yield

保留字：将来用
enum
严格模式下保留:
implements package public
interface protected static
let private
模块代码中保留: await

### 变量

ECMAScript 变量是松散类型的，意思是变量可以用于保存任何类型的数据
var let const
优先使用 const let var

### 数据类型

6 种简单数据类型（也称为原始类型）：Undefined、Null、Boolean、Number、String 和 Symbol。还有一种复杂数据类型叫 Object

typeof undefined boolean string number (object 或 null） function sumbol
特殊值 null 被认为是一个对空对象的引用。

Number()、parseInt()和 parseFloat()

## 变量、作用域与内存

JavaScript 变量可以保存俩种类型的值：原始值和引用值。原始值：Undefined、Null、Boolean、Number、String 和 Symbol。

- 原始值大小固定，因此保存在栈内存上。
- 从一个变量到另一个变量复制原始值会创建该值的第二个副本。
- 引用值是对象，存储在堆内存上。
- 包含引用值的变量实际上只包含指向相应对象的一个指针，而不是对象本身。
- 从一个变量到另一个变量复制引用值只会复制指针，因此结果是俩个变量都指向同一个对象。
- typeof 操作符可以确定值的原始类型，而 instanceof 操作符用于确保值的引用类型。
- 任何变量都存在于某个执行上下文中（也称为作用域）。这个上下文（作用域）决定了变量的生命周期，以及它们可以访问代码的哪些部分，执行上下文可以总结如下：
- 执行上下文分全局上下文、函数上下文和块级上下文。
- 代码执行流每进入一个新上下文，都会创建一个作用域链，用于搜索变量和函数。
- 函数或块的局部上下文不仅可以访问自己作用域内的变量，而且也可以访问任何包含上下文乃至全局上下文中的变量
- 全局上下文只能访问全局上下文中的变量和函数，不能直接访问局部上下文中的任何数据。
- 变量的执行上下文用于确定什么时候释放内存。

JavaScript 是使用垃圾回收的编程语言，开发者不需要操心内存分配和回收。JavaScript 的垃圾回收程序总结：

- 离开作用域的值会被自动标记为可回收，然后再垃圾回收期间被删除。
- 主流的垃圾回收算法是标记清理，即先给当前不使用的值加上标记，再回来回收它们的内存。
- 引用计数是另一种垃圾回收策略，需要记录值被引用了多少次。
- 引用计数在代码中存在循环引用时会出现问题。
- 解除变量的引用不仅可以消除循环引用，而且对垃圾回收也有帮助。为促进内存回收，全局对象、全局对象的属性和循环引用都应该在不需要时解除引用。

## 基本引用类型

对象被认为是某个特定引用类型的实例。新对象通过使用 new 操作符后跟一个构造函数(constructor)来创建。构造函数就是用来创建新对象的函数

JavaScript 中的对象称为引用值，集中内置的引用类型可用于创建特定类型的对象。

- 引用值与传统面向对象编程语言中的类相似，但实现不同。
- Date 类型提供关于日期和时间的信息，包括当前日期、时间及相关计算。
- RegExp 类型是 ECMAScript 支持正则表达式的接口，提供了大多数基础的和部分高级的正则表达式功能。

函数实际上是 Function 类型，函数也是对象，有方法，可以用于增强其能力。
由于原始值包装类型的存在，JavaScript 中的原始值可以被当成对象来使用。有 3 种原始值包装类
型：Boolean、Number 和 String。

- 每种包装类型都映射到同名的原始类型。
- 以读模式访问原始值时，后台会实例化一个原始值包装类型的对象，借助这个对象可以操作相应的数据。
- 涉及原始值的语句执行完毕后，包装对象就会被销毁。

当代码开始执行时，全局上下文中会存在两个内置对象：Global 和 Math。其中，Global 对象在
大多数 ECMAScript 实现中无法直接访问。不过，浏览器将其实现为 window 对象。所有全局变量和函
数都是 Global 对象的属性。Math 对象包含辅助完成复杂计算的属性和方法。

## 集合引用类型

- 引用类型与传统面向对象编程语言中的类相似，但实现不同。
- Object 类型是一个基础类型，所有引用类型都从它继承了基本的行为。
- Array 类型表示一组有序的值，并提供了操作和转换值的能力。
- 定型数组包含一套不同的引用类型，用于管理数组在内存中的类型
- Date 类型提供了关于日期和时间的信息，包括当前日期和时间以及计算
- RegExp 类型是 ECMASScript 支持的正则表达式的接口，提供了大多数基本正则表达式以及一些高级正则表达式的能力。

函数其实是 Function 类型的实例，意味着函数也是对象。由于函数是对象，因此也就具有能够增强自身行为的方法。

## 迭代器与生成器

迭代是一种所有编程语言中都可以看到的模式。ECMAScript 6 正式支持迭代模式并引入了两个新的
语言特性：迭代器和生成器。
迭代器是一个可以由任意对象实现的接口，支持连续获取对象产出的每一个值。任何实现 Iterable
接口的对象都有一个 Symbol.iterator 属性，这个属性引用默认迭代器。默认迭代器就像一个迭代器
工厂，也就是一个函数，调用之后会产生一个实现 Iterator 接口的对象。
迭代器必须通过连续调用 next()方法才能连续取得值，这个方法返回一个 IteratorObject。这
个对象包含一个 done 属性和一个 value 属性。前者是一个布尔值，表示是否还有更多值可以访问；后
者包含迭代器返回的当前值。这个接口可以通过手动反复调用 next()方法来消费，也可以通过原生消
费者，比如 for-of 循环来自动消费。
生成器是一种特殊的函数，调用之后会返回一个生成器对象。生成器对象实现了 Iterable 接口，
因此可用在任何消费可迭代对象的地方。生成器的独特之处在于支持 yield 关键字，这个关键字能够
暂停执行生成器函数。使用 yield 关键字还可以通过 next()方法接收输入和产生输出。在加上星号之
后，yield 关键字可以将跟在它后面的可迭代对象序列化为一连串值。

## 对象、类与面向对象编程

ECMA-262 将对象定义

### 理解对象

属性的类型

1. 数据属性
   数据属性包含一个保存数据值的位置
   [[Configurable]]: 表示属性是否可以修改、删除
   [[Enumerable]]: 表示属性是否可以通过 for-in 循环
   [[Writable]]: 表示属性的值是否可以被修改。
   [[Value]]: 包含属性实际的值

2. 访问器属性
   [[Configurable]]:
   [[Enumerable]]
   [[Get]]: 获取函数，在读取属性时调用。默认值为 undefined
   [[Set]]: 设置函数，在写入属性时调用。
   不能直接定义，必须使用 Object.defineProperty()

读取属性的特性
Object.getOwnPropertyDescriptor()取得指定属性的属性描述符：属性所在的对象和要取得其描述符的属性名。

合并对象
把源对象所有的本地属性一起复制到目标对象上。有时候这种操作也称为“混如”(mixin)，因为目标对象通过混如源对象的属性得到了增强。
Object.assign() 浅复制

对象标识及相等判定
ES6 Object.is(a, b)

增强的对象语法

1. 属性值简写
   let Person = {
   name
   }

2. 可计算属性

```JavaScript
const nameKey = 'name';

function getUniqueKey(key) {
  return `${key}_${uniqueToken++}`;
}

let person = {
  [getUniqueKey(nameKey)]: 'Matt'
}

consoke.log(person); // {name_0: 'Matt'}
```

3. 简写方法名

```JavaScript
let person = {
  sayName(name) {
    console.log()
  }
}
```

对象解构
{a, b} = object

### 创建对象

ES6 开始正式支持类和继承。ES6 的类仅仅是封装了 ES5.1 构造函数加原型继承的语法糖而已。

工厂模式

构造函数模式
使用 new 就叫构造函数

原型模式
只要创建一个函数，就会按照特定的规则为这个函数创建一个 prototype 属性（指向原型对象）。所有原型对象自动获取一个名为 constructor 的属性,指回与之关联的构造函数。

**proto**属性，通过这个属性可以访问对象的原型。

构造函数有一个 prototype 属性引用其原型对象，而这个原型对象也有一个 constructor 属性，引用这个构造函数

Object.getPrototypeOf()取得一个对象的原型

Object.setPrototypeOf()可以向实例的私有特性[[Prototype]]写入一个新值

hawOwnProperty()方法用于确定某个属性是在实例上还是原型对象上。

对象迭代
Object.values()返回对象值的数组
Object.entries()返回键/值对的数组。

### 继承

接口继承和实现继承

原型链
ECMA-262 把原型链定义为 ECMAScript 的主要继承方式。其基本思想就是通过原型继承多个引用类型的属性和方法。每个构造函数都有一个原型对象，原型有一个属性指回构造函数，而实例有一个内部指针指向原型。如果原型是另一个类型的实例。就意味着这个原型本身有一个内部指针指向另一个原型，相应地另一个原型也有一个指针指向另一个构造函数。这样就在实例和原型之间构造了一条原型链。这就是原型链的基本构想。

1. 默认原型
   任何函数的默认原型都是一个 Object 的实例，这意味着这个实例有一个内部指针指向 Object.prototype.

2. 原型与继承关系
   instanceof isPrototypeOf()

3. 关于方法

4. 原型链的问题
   会在所有实例间共享
   子类型在实例化时不能给父类型的构造函数传参

- 工厂模式就是一个简单的函数，这个函数可以创建对象，为它添加属性和方法，然后返回这个对象。这个模式在构造函数模式出现后就很少用了。

- 使用构造函数模式可以自定义引用类型，可以使用 new 关键字像创建内置类型实例一样创建自定义类型的实例。不过，构造函数模式也有不足，主要是其成员无法重用，包括函数。

- 原型模式解决了成员共享的问题，只要是添加到构造函数 prototype 上的属性和方法就可以共享。而组合构造函数和原型模式通过构造函数定义实例属性，通过原型定义共享的属性和方法。

- 原型继承可以无须明确定义构造函数而实现继承，本质上是对给定对象执行浅复制

- 与原型式继承紧密相关的是寄生式继承，即先基于一个对象创建一个新对象，然后再增强这个新对象，最后返回新对象。这个模式也被用在组合继承中，用于避免重复调用父类构造函数导致的浪费。

- 寄生组合继承被认为是实现基于类型继承的最有效方式。

```JavaScript
function inheritPrototype(subType, superType) {
  let prototype = object(superType.prototype);
  prototype.constructor = subType;
  subType.prototype = prototype;
}
```

## 代理与反射

从宏观上看，代理是真实 JavaScript 对象的透明抽象层。代理可以定义包含捕获器的处理程序对象，
而这些捕获器可以拦截绝大部分 JavaScript 的基本操作和方法。在这个捕获器处理程序中，可以修改任
何基本操作的行为，当然前提是遵从捕获器不变式。

## 函数

函数实际上是对象。每个函数都是 Function 类型的实例，而 Function 也有属性和方法，而 Function 也有属性和方法，跟其他引用类型一样。

arguments.callee 就是一个指向正在执行的函数的指针，因此可以在函数内部递归调用

```JavaScript
function factorial(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * arguments.callee(num - 1);
  }
}
```

ES6 尾调用优化的关键：如果函数的逻辑允许基于尾调用将其销毁，则引擎就会那么做。

```JavaScript
function fib(n) {
  if (n < 2) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

// 优化
// 基础框架
function fib(n) {
  return fibImpl(0, 1, n);
}
// 执行递归
function fibImpl(a, b, n){
  if (n === 0) {
    return a;
  }
  return fibImpl(b, a + b, n - 1);
}
```

闭包指的是那些引用了另一个函数作用域中变量的函数，通常是在嵌套函数中实现的。

- 函数表达式与函数声明是不一样的。函数声明要求写出函数名称，而函数表达式并不需要。没有名称的函数表达式也被称为匿名函数。

- ES6 新增了类似于函数表达式的箭头函数语法，但俩者也有一些重要区别。

- JavaScript 中函数定义与调用时的参数极其灵活。arguments 对象，以及 ES6 新增的扩展操作符，可以实现函数定义和调用的完全动态化。

- 函数内部也暴露了很多对象和引用，涵盖了函数被谁调用、使用什么调用，以及调用时传入了什么参数等信息。

- JavaScript 引擎可以优化符合尾调用条件的函数，以节省栈空间

- 闭包的作用域链中包含自己的一个变量对象，然后是包含函数的变量对象，直到全局上下文的变量对象。

- 通常，函数作用域及其中的所有变量在函数执行完毕后都会被销毁

- 闭包在函数返回之后，其作用域会一直保存在内存中，直到闭包被销毁。

- 函数可以在创建之后立即调用，执行其中代码之后却不留下对函数的引用。

- 立即调用的函数表达式如果不在包含作用域中将返回值赋给一个变量，则其包含的所有变量都会被销毁

- 虽然 JavaScript 没有私有对象属性的概念，但可以使用闭包实现公共方法，访问位于包含作用域中定义的变量

- 可以访问私有变量的公共方法叫做特权方法

- 特权方法可以使用构造函数或原型模式通过自定义类型中实现，也可以使用模块模式或模块增强在单例对象上实现。

## 期约与异步函数

睡眠

```JavaScript
async function sleep(delay) {
 return new Promise((resolve) => setTimeout(resolve, delay));
}
async function foo() {
 const t0 = Date.now();
 await sleep(1500); // 暂停约 1500 毫秒
 console.log(Date.now() - t0);
}
foo();
```

## BOM

浏览器对象模型（BOM，Browser Object Model）是以 window 对象为基础的，这个对象代表了浏览器窗口和页面可见的区域。window 对象也被复用为 ECMAScript 的 Global 独享，因此所有全局变量和函数都是它的属性，而且所有原生类型的构造函数和普通函数也都从一开始就存在于这个对象之上。

- 要引用其他 window 对象，可以使用几个不同的窗口指针。
- 通过 location 对象可以以编程方式曹总浏览器的导航系统。通过设置这个对象上的属性，可以改变浏览器 URL 中的某一部分或全部。
- 使用 replace()方法可以替换浏览器历史记录中当前显示的页面，并导航到新 URL
- navigator 对象提供关于浏览器的信息。

## 客户端检测

获取坐标必须 https

```JavaScript
	navigator.geolocation.getCurrentPosition(
				() => { },
				(e) => {
					console.log(e.code); // 1
					console.log(e.message); // Only secure origins are allowed
				}
			);
```

## DOM

文档对象模型（DOM,Document Object Model）是语言中立的 HTML 和 XML 文档的 API。DOM Level 1 将 HTML 和 XML 文档定义为一个节点的多层次结构，并暴露出 JavaScript 接口以操作文档的底层结构和外观。

- Node 是基准节点类型，是文档一个部分的抽象表示，所有其他类型都继承 Node。
- Document 类型表示整个文档，对应树形结构的根节点。在 JavaScript 中，document 对象是 Document 的实例，拥有查询和获取节点的很多方法
- Element 节点表示文档中所有 HTML 或 XML 元素，可以用来操作它们的内容和属性
- 其他节点类型分别表示文本内容、注释、文档类型、CDATA 区块和文档片段

MutationObserver 是为代替性能不好的 MutationEvent 而问世。使用它可以有效精准地监控 DOM 变化，而且 API 也相对简单。

## DOM 扩展

- Selectors API 为基于 CSS 选择符获取 DOM 元素定义来几个方法：querySelector()、querySelectorAll()和 matches()

- Element Traversal 在 DOM 元素上定义了额外的属性，以方便对 DOM 元素进行遍历。这个需求上因浏览器处理元素间空格的差异而产生的。

MutationObserver是为代替性能不好的MutationEvent而问世。使用它可以有效精准地监控DOM变化，而且API也相对简单。

- HTML5 为标准 DOM 提供了大量扩展。其中包括对 innerHTML 属性等事实标准进行了标准化，还有焦点管理、字符集、滚动等特性。

## DOM2和DOM3
DOM2 Style模块定义了如何操作元素的样式信息
* 每个元素都有一个关联的style对象，可用于确定和修改元素特定的样式
* 要确定元素的计算样式，包括应用到元素身上的所有CSS规则，可以使用getComputedStyle()方法
* 通过document.styleSheets集合可以访问文档上所有的样式表
  DOM2 Traversal and Range模块定义了与DOM结构交互的不同方式
* NodeIterator和TreeWalker可以对DOM树执行深度优先的遍历
* NodeIterator支持在DOM结构的所有方向移动，包括父节点、同胞节点和子节点
* 范围是选择DOM结构中特定部分并进行操作的一种方式
* 通过范围的选择可以在保持文档结构完好的同时从文档中移除内容，也可复制文档中相应的部分。

## 事件
JavaScript与HTML的交互是通过事件实现的，事件代表文档或浏览器窗口中某个有意义的时刻。可以使用仅在事件发生时执行的监听器（也叫处理程序）订阅事件。

### 事件流
事件冒泡
IE事件流被称为事件冒泡，这是因为事件被定义为从最具体的元素开始触发，然后向上传播至没有那么具体的元素。

事件捕获
事件捕获的意思是最不具体的节点应该最先收到事件，而最具体的节点应该最后收到事件。

DOM事件流
DOM2Events规范规定事件流分为3个阶段：事件捕获、到达目标和事件冒泡。事件捕获最先发生，为提前拦截事件提供了可能。然后，实际的目标元素接收到事件。最后一个阶段是冒泡，最迟要在这个阶段响应事件。

内存与性能问题
* 最好限制一个页面中事件处理程序的数量，因为它们会占用过多内存，导致页面响应缓慢
* 利用事件冒泡，事件委托可以解决限制事件处理程序数量的问题
* 最好在页面卸载之前删除所有事件处理程序
