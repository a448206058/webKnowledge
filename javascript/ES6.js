/**
 * 为了加强对变量生命周期的控制，ECMAScript6引入了块级作用域。
 * 块级作用域存在于：
 * 		函数内部
 * 		块中
 * 
 * let 和 const 
 * 块级声明用于声明在指定块的作用域之外无法访问的变量。
 * let 和 const 都是块级声明的一种。
 * 特点：
 * 1.不会被提升
 * 2.重复声明报错
 * 3.不绑定全局作用域
 * 		当在全局作用域中使用var 声明的时候，会创建一个新的全局变量作为全局对象的属性
 * 
 * let 和 const的区别：
 * 	const 用于声明常量，其值一旦被设定不能再被修改，否则会报错。
 * 		const声明不允许修改绑定，但允许修改值。
 * 
 * 临时死区 TDZ
 * let和const声明的变量不会被提升到作用域顶部，如果在声明之前访问这些变量，会导致报错：
 * 这是因为JavaScript引擎在扫描代码发现变量声明时，要么将它们提升到作用域顶部（遇到var声明），要么将声明
 * 放在TDZ中（遇到let和const声明）。访问TDZ中的变量会触发运行时错误。只有执行过变量声明语句后，变量才会从
 * TDZ中移出，然后方可访问。
 * 
 * 在for(let i = 0; i < 3;i++)中，即圆括号之内建立一个隐藏的作用域
 * 然后每次迭代循环时都创建一个新变量，并以之前迭代中同名变量的值将其初始化。
 * 当执行函数的时候，根据词法作用域就可以找到正确的值，其实你也可以理解为let声明模仿了闭包的做法来简化循环过程。
 * 
 * const在for循环中会报错 在for in中不会 因为在for循环会尝试修改值
 * 
 * Babel
 * 	if(false) {
		let value = 1;
	}
	if(false) {
		var _value = 1;
	}
	
	var funcs = [];
	for (let i = 0; i < 10; i++) {
		funcs[i] = function () {
			console.log(i);
		};
	}
	funcs[0](); //0
	
	var funcs = [];
	var _loop = function _loop(i) {
		funcs[i] = function () {
			console.log(i)
		};
	};
	
	for (var i = 0; i < 10; i++) {
		_loop(i);
	}
	funcs[0]();
	最佳实践：
	在我们开发的时候，可能认为应该默认使用let而不是var,这种情况下，对于需要写保护的变量要使用const。然而另一种做法日益普及：默认使用const,
	只有当确实需要改变变量的值的时候才使用let。这是因为大部分变量的值在初始化后不应再改变，而预料之外的变量的改变是很多bug的源头。
 */

/**
 * 模板字符串
 * 	基础用法
 */
let message = `Hello World`;
/**
 * 嵌入变量
 * 模板字符串支持嵌入变量，只需要将变量名写在${}之中，其实不止变量，任意的JavaScript表达式都是可以的：
 * {}里面会被认为是字符串
 */
let arr = [{value: 1}, {value: 2}];
let message = `
		<ul>
			${arr.map((item) => {
				return `
					<li>${item.value}</li>
				`
			}).join('')}
		</ul>
`;
/**
 * 模板标签
 * 模板标签是一个非常重要的能力，模板字符串可以紧跟在一个函数名后面，该函数将被调用来处理这个模板字符串
 */
let x = 'Hi', y = 'Kevin';
var res = message`${x}, I am ${y}`;
console.log(res);
function message(literals, ...values){
	let result = literals.reduce((prev, next, i) => {
		let value = values[i - 1];
		return prev + value + next;
	})
	return result;
}

/**
 * 箭头函数
 * 基本语法：
 */
let func = value => value;
let func = function (value) {
	return value;
};
/**
 * 箭头函数与普通函数
 * 区别：
 * 1.没有this
 * 	箭头函数没有this,所以需要通过查找作用域链来确定this的值。
 * 	这就意味着如果箭头函数被非箭头函数包含，this绑定的就是最近一层非箭头函数的this。
 *  因为箭头函数没有this，所以也不能用call()、apply()、bind()这些方法改变this的指向
 * 2.没有arguments
 * 	箭头函数没有自己的arguments对象，可以访问外围函数的arguments对象：
 * 3.不能通过new关键词调用
 * 	JavaScript函数有俩个内部方法：[[Call]]和[[Construct]]
 * 	当通过new调用函数时，执行[[Construct]]方法，创建一个实例对象，然后再执行函数体，将this绑定到
 * 	实例上。
 * 	当直接调用的时候，执行[[Call]]方法，直接执行函数体。
 * 	箭头函数并没有[[Construct]]方法，不能被用作构造函数，如果通过new的方式调用，会报错。
 * 4.没有new.target
 * 	因为不能使用new调用，所以也没有new.target值
 * 5.没有原型
 * 	由于不能使用new调用箭头函数，所以也没有构建原型的需求，于是箭头函数也不存在prototype这个属性。
 * 6.没有super
 */

/**
 * Symbol类型
 * ES6引入了一种新的原始数据类型
 * 	1.Symbol值通过Symbol函数生成，使用typeof，结果为"symbol"
 * 	2.Symbol函数前不能使用new命令，否则会报错。这是因为生成的Symbol是一个原始类型的值，不是对象。
 * 	3.instanceof的结果为false
 * 	4.Symbol函数可以接受一个字符串作为参数，表示对Symbol实例的描述，只要是为了在控制台显示，或者转为字符串时，
 * 	比较容易区分。
 * 	5.如果Symbol的参数是一个对象，就会调用该对象的toString方法，将其转为字符串，然后才生成了一个Symbol值。
 * 	6.Symbol函数的参数只是表示对当前Symbol值的描述，相同参数的Symbol函数的返回值是不相等的。
 *	7.Symbol值不能与其他类型的值进行运算，会报错。
 * 	8.Symbol值可以显式转换为字符串。
 * 	9.Symbol值可以作为标识符，用于对象的属性名，可以保证不会出现同名的属性。
 * 	10.Symbol作为属性名，该属性不会出现在for...in、for...of循环中，也不会被Object.keys()、
 * 	Object.getOwnPropertyNames()、JSON.stringify()返回。但是，它也不是私有属性，有一个
 * 	Object.getOwnPropertySymbols方法，可以获取指定对象的所有Symbol属性名。
 * 	11.如果我们希望使用同一个Symbol值，可以使用Symbol.for。它接受一个字符串作为参数，然后搜索有没有该参数
 * 	作为名称的Symbol值。如果有，就返回这个Symbol值，否则就新建并返回一个以该字符串为名称的Symbol值
 * 	12.Symbol.keyFor方法返回一个已登记的Symbol类型值的key。
 */	

/**
 * 迭代器和for of
 * 为了消除for循环的复杂度以及减少循环中的错误（比如错误使用其他循环中的变量），ES6提供了迭代器和for of 循环共同解决这个问题。
 * 
 * 迭代器
 * 所谓迭代器，其实就是一个具有next()方法的对象，每次调用next()都会返回一个结果对象，该结果对象有俩个属性，value表示当前的值，done表示遍历是否结束。
 */
 function createIterator(items) {
	 var i = 0;
	 return {
		 next: function() {
			 var done = i >= items.length;
			 var value = !done ? items[i++] : undefined;
			 
			 return {
				 done: done,
				 value: value
			 }
		 }
	 }
 }
 // iterator 就是一个迭代器对象
 var iterator = createIterator([1, 2, 3]);
 console.log(iterator.next()); // {done: false, value: 1}
 console.log(iterator.next()); // {done: false, value: 2}
 console.log(iterator.next()); // {done: false, value: 3}
 console.log(iterator.next()); // {done: true, value: undefined}
 /**
  * for of
  * 除了迭代器之外，我们还需要一个可以遍历迭代器对象的方式，ES6提供了for of语句，
  */
 var iterator = createIterator([1, 2, 3]);
 for (let value of iterator){
	 console.log(value);
 }
 /**
  * 结果报错 TypeError:iterator is not iterable 表明我们生成的iterator对象并不是iterable(可遍历的)。
  * 其实一种数据结构只要部署了Iterator接口，我们就称这种数据结构是“可遍历的”（iterable)
  * ES6规定，默认的Iterator接口部署在数据结构的Symbol.iterator属性，或者说，一个数据结构只要具有Symbol.iterator
  * 属性，就可以认为是“可遍历的”(iterable)
  * 
  * 我们直接for of遍历一个对象会报错，然后如果我们给该对象添加Symbol.iterator属性
  */
 const obj = {
	 value: 1
 }
 obj[Symbol.iterator] = function(){
	 return createIterator([1, 2, 3])
 }
 for (value of obj) {
	 console.log(value)
 }
 //1
 //2
 //3
 /**
  * 可以发现for of 遍历的其实是对象的Symbol.iterator属性。
  * 默认可遍历对象
  * 	数组对象
  * 	Set
  * 	Map
  * 	类数组对象，如arguments对象、DOM NodeList对象
  * 	Generator对象
  * 	字符串
  * 
  * 模拟实现 for of
  * 通过Symbol.iterator属性获取迭代器对象，然后使用while遍历一下：
  */
 function forOf(obj, cb){
	let iterable, result;
	if (typeof obj[Symbol.iterator] !== "function")
		throw new TypeError(result + " is not iterable");
	if (typeof cb !== "function")
		throw new TypeError("cb must be callable");
	iterable = obj[Symbol.iterator]();
	result = iterable.next();
	while (!result.done){
		cb(result.value);
		result = iterable.next();
	}	
 }
 /**
  * 内建迭代器
  * ES6为数组、Map、Set集合内建了以下三种迭代器
  * 	entries()返回一个遍历器对象，用来遍历[键名,键值]组成的数组。对于数组，键名就是索引值。
  * 	keys()返回一个遍历器对象，用来遍历所有的键名
  * 	values()返回一个遍历器对象，用来遍历所有键值。
  * Set类型的keys()和values()返回的是相同的迭代器，这也意味着在Set这种数据结构中键名与键值相同。
  * 而且每个集合类型都有一个默认的迭代器，在for-of循环中，如果没有显示指定则使用默认的迭代器。数组和Set集合的默认
  * 迭代器是values()方法，Map集合的默认迭代器是entries()方法。
  */
 
 /**
  * Set数据结构
  * 	类似于数组，成员的值都是唯一的，没有重复的值。
  * 初始化
  * 	Set本身是一个构造函数，用来生成Set数据结构
  * 	Set函数可以接受一个数组（或者具有iterator接口的其他数据结构）作为参数，用来初始化。
  * 属性和方法
  * 	操作方法有：
  * 		1.add(value)：添加某个值，返回Set结构本身。
  * 		2.delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
  * 		3.has(value)：返回一个布尔值，表示该值是否为Set的成员。
  * 		4.clear()：清除所有成员，无返回值。
  * 	遍历方法有：
  * 		1.keys()：返回键名的遍历器
  * 		2.values()：返回键值的遍历器
  * 		3.entries()：返回键值对的遍历器
  * 		4.forEach()：返回回调函数遍历每个成员，无返回值
  * 		注意keys()、values()、entries()返回的是遍历器
  */
  let set = new Set(['a', 'b', 'c']);
  console.log(set.keys()); //SetIterator {"a", "b", "c"}
  console.log([...set.keys()]); // ["a", "b", "c"]
  
  let set = new Set(['a', 'b', 'c']);
  console.log(set.entries()); //SetIterator {"a", "b", "c"}
  console.log([...set.entries()]); // [["a", "a"], ["b", "b"], ["c", "c"]]
  /**
   * 	属性：
   * 		1.Set.prototype.constructor: 构造函数，默认就是Set函数。
   * 		2.Set.prototype.size：返回Set实例的成员总数
   */
  
  /*
   * WeakMap
   * 	特性：
   * 		1.WeakMap只接受对象作为键名
   * 		2.WeakMap的键名所引用的对象是弱引用
   * 		弱引用：
   * 			在计算机程序设计中，弱引用与强引用相对，是指不能确保其引用的对象不会被垃圾回收器回收的引用。
   * 			一个对象若只被弱引用所引用，则被认为是不可访问（或弱可访问）的，并因此可能在任何时刻被回收。
   * 		WeakMap内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，而垃圾回收
   * 		机制何时运行是不可预测的，因此ES6规定WeakMap不可遍历。
   * 		所以WeakMap不像Map，一是没有遍历操作（即没有keys()、values()和entries()方法），也没有size属性，也不支持
   * 		clear方法，所以WeakMap只有四个方法可用：get()、set()、has()、delete()
   * 	应用：
   * 		1.在DOM对象上保存相关数据
   * 		2.数据缓存
   * 		3.私有属性
   */
  
  /**
   *  Promise
   * 	回调：
   * 		1.回调嵌套
   * 		2.控制反转
   * 		3.回调地狱
   * 			难以复用
   * 			堆栈信息被断开
   * 			借助外层变量
   * 	1.嵌套问题
   * 	2.控制反转再反转
   * 	
   * 	promise的局限性
   * 		1.错误被吃掉
   * 		对于一个没有错误处理函数的Promise链，任何错误都会在链中被传播下去，直到你注册了错误处理函数。
   * 		2.单一值
   * 		3.无法取消
   * 		promise一旦新建它就会立即执行，无法中途取消
   * 		4.无法得知pending状态
   * 		当处于pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。	
   */
  
  /**
   * Generator的自动执行
   * 	单个异步任务
   */
	
