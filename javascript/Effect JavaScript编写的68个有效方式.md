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
JavaScript变量可以保存俩种类型的值：原始值和引用值。原始值：Undefined、Null、Boolean、Number、String和Symbol。
* 原始值大小固定，因此保存在栈内存上。
* 从一个变量到另一个变量复制原始值会创建该值的第二个副本。
* 引用值是对象，存储在堆内存上。
* 包含引用值的变量实际上只包含指向相应对象的一个指针，而不是对象本身。
* 从一个变量到另一个变量复制引用值只会复制指针，因此结果是俩个变量都指向同一个对象。
* typeof 操作符可以确定值的原始类型，而instanceof操作符用于确保值的引用类型。
* 任何变量都存在于某个执行上下文中（也称为作用域）。这个上下文（作用域）决定了变量的生命周期，以及它们可以访问代码的哪些部分，执行上下文可以总结如下：
* 执行上下文分全局上下文、函数上下文和块级上下文。
* 代码执行流每进入一个新上下文，都会创建一个作用域链，用于搜索变量和函数。
* 函数或块的局部上下文不仅可以访问自己作用域内的变量，而且也可以访问任何包含上下文乃至全局上下文中的变量
* 全局上下文只能访问全局上下文中的变量和函数，不能直接访问局部上下文中的任何数据。
* 变量的执行上下文用于确定什么时候释放内存。

JavaScript是使用垃圾回收的编程语言，开发者不需要操心内存分配和回收。JavaScript的垃圾回收程序总结：
* 离开作用域的值会被自动标记为可回收，然后再垃圾回收期间被删除。
* 主流的垃圾回收算法是标记清理，即先给当前不使用的值加上标记，再回来回收它们的内存。
* 引用计数是另一种垃圾回收策略，需要记录值被引用了多少次。
* 引用计数在代码中存在循环引用时会出现问题。
* 解除变量的引用不仅可以消除循环引用，而且对垃圾回收也有帮助。为促进内存回收，全局对象、全局对象的属性和循环引用都应该在不需要时解除引用。