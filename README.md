etypescript number —1— 20201207 09:54  —2— 10:30
	number对象是原始数值的包装对象。
	对象属性
		MAX_VALUE
		MIN_VALUE
		NaN
		NEGATIVE_INFINITY 负无穷大
		POSITIVE_INFINITY 正无穷大
		prototype 静态属性。
		constructor 返回对创建此对象的Number函数的引用

	对象方法
		toExponential() 把对象的值转换为指数计数法
		toFixed()
		toLocalString() 把数字转换为字符串
		toPrecision() 把数字格式化为指定的长度
		toString()
		valueOf()

Typescript string 20201207 10:09 —1—  —2— 10:30
	string 对象用于处理文本
	对象属性
		constructor 对创建该对象的函数的引用
		length 返回字符串的长度
		prototype 允许您向对象添加属性和方法

	string 方法
		charAt() 返回在指定位置的字符。
		charCodeAt() 返回在指定的位置的字符的Unicode编码
		concat() 
		indexOf()
		lastIndexOf() 
		localeCompare()
		match() 
		replace()
		search()
		slice()
		split()
		substr() 从起始索引号提取字符串中指定数目的字符
		substring() 提取字符串中俩个指定的索引号之间的字符。
		toLocaleLowerCase()
		toLocaleUpperCase()
		toLowerCase()  把字符串转换为小写
		toString() 返回字符串
		toUpperCase() 把字符串转换为大写
		valueOf() 返回指定字符串对象的原始值

typescript array —1—20201207 10:30 —2— 11:00
	数组对象是使用单独的变量名来存储一系列的值
	var sites: string[];
	var nums: number[]
	如果数组声明时未设置类型，则会被认为是any类型，在初始化时根据第一个元素的类型来推断数组的类型。
	Array对象
		我们也可以使用Array对象创建数组
		Array对象的构造函数接受以下俩种值：
			表示数组大小的数组
			初始化的数组列表，元素使用逗号分隔值
	数组解构
		var arr:number[] = [12, 13]
		var [x, y] = arr
	数组迭代
		用for
	多维数组
		一个数组的元素可以是另一个数组，这样就构成了多维数组
		var multi: number[][] = [[1, 2, 3], [23, 24, 25]]
	数组在函数中的使用
		作为参数传递给函数
		作为函数的返回值
	数组方法
		concat() 连接俩个或更多的数组
		every() 循环每个元素
		filter()
		forEach()
		indexOf()
		join()
		lastIndexOf()
		map() 
		pop() 删除数组中最后一个元素并返回删除的元素
		push() 向数组的末尾添加一个或更多元素，并返回新的长度
		reduce() 将数组元素计算为一个值
		reduceRight() 将数组元素计算为一个值（从右到左）
		reverse() 反转数组的元素顺序
		shift() 删除并返回数组的第一个元素
		slice() 选取数组的一部分，并返回一个新数组。
		some() 检测数组元素中是否有元素符合指定条件。
		sort() 对数组的元素进行排序。
		splice() 从数组中添加或删除元素
		toString() 把数组转换为字符串，并返回结果。
		unshift() 向数组的开头添加一个或更多元素，并返回新的长度。

typescript map对象 —1— 20201207 10:47  —2— 11:18
	Map 对象保存键值对，并且能够记住键的原始插入顺序。
	任何值（对象或者原始值）都可以作为一个键或一个值
	Map是ES6中引入的一种新的数据结构
	typescript使用map类型和new 关键词来创建map
		Let map = new Map()
	map相关的函数与属性：
		Map.clear() - 移除map对象的所有键/值对。
		Map.set() - 设置键值对，返回该map对象
		Map.get() - 返回键对应的值，如果不存在，则返回undefined
		Map.has() - 返回一个布尔值，用于判断map中是否包含键对应的值
		Map.delete() - 删除map中的元素，删除成功返回true,失败返回false
		map.size - 返回map对象键/值对的数量
		Map.keys() - 返回一个iterator对象，包含了map对象中每个元素的键
		Map.values() - 返回一个新的iterator对象，包含了map对象中每个元素的值
	迭代map
		map对象中元素是按顺序插入的，我们可以迭代map对象，每一次迭代返回[key, value]数组
		typescript使用for of来实现迭代

Typescript 元组. 20201207 10:54 —1—  —2— 11:20
	我们知道数组中元素的数据类型一般都是相同的（any[]类型的数组可以不同），如果存储的元素数据类型不同，则需要使用元组
	元组中允许存储不同类型的元素，元组可以作为参数传递给函数
	var tuple_name = [value1, value2, value3, …value n]
	var my tuple = [10, “runoff”]
	元组运算
		push()
		pop() 
	更新元组
		元组是可变的，这意味着我们可以对元组进行更新操作。
	解构元组
		var a = [10, “Runoob”]
		var [b, c] = a

typescript联合类型. —1— 20201207 11:18. —2— 11:41
	联合类型（union types）可以通过管道将变量设置多种类型，赋值时可以根据设置的类型来赋值。
	注意：只能赋值指定的类型，如果赋值其它类型就会报错
	type1|type2|type3
	var val:string|number
	val = 12
	console.log(“数字为” + val)
	也可以将联合类型作为函数参数使用
	function disp(name: string | string[]){
	}
	联合类型数组
	我们也可以将数组声明为联合类型：
	var arr:number[] | string[]

Typescript接口. —1— 20201207 11:41 
	接口是一系列抽象方法的声明，是一些方法特征的集合，这些方法都应该是抽象的，需要由具体的类去实现，然后第三方就可以通过这组抽象方法调用，让具体的类执行具体的方法。

	interface interface_name {
	}

	需要注意接口不能转换为javascript。它只是typesript的一部分
	interface Iperson {
		firstName: string,
		lastName: string,
		sayHi: ()=> string
     }

	var customer:IPerson = {
	}
	
	联合类型和接口. 
	接口和数组
		接口中我们可以将数组的索引值和元素设置为不同类型，索引值可以是数字或字符串。
		interface nameList {
			[index: number]: string
		}
	接口继承
		接口结成就是说接口可以通过其他接口来扩展自己
		typescript允许接口继承多个接口
		继承使用关键词extends
		单接口继承语法格式：
			Child_interface_name extends super_interface_name
		多接口继承语法格式：
			Child_interface_name extends super_interface1_name, super_interface2_name,super_interfaceN_name
	单继承实例
		interface Person {
			age: number
		}
		interface Musician extends Person {
			instrument:v string
		}
		var drummer = <Musician>{};
	多继承实例
		interface IParent1 {
			v1:	number
		}
		interface IParent2 {
			v2: number
		}
		interface	Child extends IParent1, IParent2 {}

typescript类
	typescript是面向对象的javascript
	类描述了所创建的对象共同的属性和方法。
	typescript支持面向对象的所有特性，比如类、接口等。
	typescript类定义方式如下：
		class class_name {
			//类作用域
		}
	定义类的关键词为class，后面紧跟类名，类可以包含以下几个模块
		字段-字段是类里面声明的变量。字段表示对象的有关数据。
		构造函数-类实例化时调用，可以为类的对象分配内存。
		方法-方法为对象要执行的操作。
	创建类的数据成员
		this关键字表示当前类实例化的对象。注意构造函数的参数名与字段名相同
		class Car {
			// 字段
			engine: string;

			// 构造函数
			constructor(engine: string) {
				this.engine = engine
			}

			disp(): void {
			}
		}
	创建实例化对象
		我们使用new关键字来实例化类的对象
		var object_name = new class_name([arguments])
		类实例化时会调用构造函数
		var obj = new Car(“Engine 1”)
		类中的字段属性和方法可以使用.号来访问
		//访问属性
		obj.field_name
		//访问方法
		obj.function_name()
	类的继承
		# webKnowledge
