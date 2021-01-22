#### 原型模式——prototype

原型模式不仅是一种设计模式，还是一种**编程范式**（programming paradigm），是JavaScript面向对象系统实现的根基。

在原型模式下，当创建一个对象时，=》先找到一个对象作为原型=》然后通过**克隆原型**的方式来创建出一个与原型一样（共享一套数据/方法）的对象。

在JavaScript中，`Object.create`方法就是原型模式的天然实现——只要还在借助`Prototype`来实现对象的创建和原型的继承，那么就是在应用原型模式。

在Java中，确实存在原型模式相关的克隆接口规范。但在JavaScript中，使用原型模式并不是为了得到一个副本，而是为了得到与构造函数（类）相对应的类型的实例、实现数据/方法的共享。克隆是实现这个目的的方法，但克隆本身并不是目的。



##### ~以类为中心的语言和以原型为中心的语言

JavaScript里还有除了`Prototype`以外的选择？

**Java中的类**

作为JavaScript开发者，确实没有别的选择——毕竟原型模式是JavaScript这门语言面向对象系统的根本。

在Java中，可以选择不使用原型模式——这样所有的实例都必须要从类中来。当希望创建两个一模一样的实例时，就只能这么做:

```java
Dog dog = new Dog('旺财', 'male', 3, '柴犬')

Dog dog_copy = new Dog('旺财', 'male', 3, '柴犬')
```

而原型模式允许通过调用克隆方法的方式达到同样的目的。所以Java专门针对原型模式设计了一套接口和方法，针对特定的场景。

**JavaScript中的”类“**

ES6的类其实是原型继承的语法糖

```javascript
class Dog {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  eat() {
    console.log('肉骨头真好吃');
  }
}
```

这个等价于

```javascript
function Dog(name, age) {
  this.name = name;
  this.age = age;
}

Dog.prototype.eat = function () {
  console.log('肉骨头真好吃');
}
```

在Java等强类型语言中，原型模式的出现是为了实现类型之间的解耦。在JavaScript中作为一种编程范式来讨论更合适。



##### ~谈原型模式，其实是谈原型范式

原型编程范式的核心思想就是：**利用实例来描述对象，用实例作为定义对象和继承的基础**。

在JavaScript中，原型编程范式的体现就是**基于原型链的继承**。

**原型：**

在JavaScript中，每个构造函数都拥有一个`prototype`属性，它指向构造函数的原型对象，这个原型对象中有一个constructor属性指回构造函数；每个实例都有一个`__proto__`属性，当我们使用构造函数去创建实例时，实例的`__proto__`属性就会指向构造函数的原型对象。

```javascript
const dog = new Dog('汪汪', 3)
```

几个实体之间的关系：

![image](<../images/prototype1.png>)

**原型链：**

当试图去访问一个JavaScript实例的属性/方法时，它首先搜索这个实例本身；当发现实例没有定义对应的属性/方法时，它会去搜索实例的原型对象；如果原型对象中也搜索不到，就去搜索原型对象的原型对象，这个搜索的轨迹，就叫做原型链。

```javascript
dog.eat();

dog.toString();
```

彼此相连的`prototype`组成了一个原型链。**注：**几乎所有JavaScript中的对象都是位于原型链顶端的Object的实例，除了`Object.prototype`（如果手动用`Object.create(null)`创建一个没有任何原型的对象，那它也不是Object的实例）。



##### ~对象的深拷贝

发问方式”模拟java中的克隆接口“、”JavaScript实现原型模式“，更常见友好的发问方式”请实现JS中的深拷贝“。

有一种非常取巧的方式——JSON.stringify

```javascript
const lilei = {
  name: 'lilei',
  age: 28,
  habits: ['coding', 'hiking', 'running']
};

const lileiStr = JSON.stringify(lilei);
const lileiCopy = JSON.parse(lileiStr);
```

局限性：无法处理function、无法处理正则等，除非要处理的对象是一个严格的JSON对象。

深拷贝没有完美方案，每一种方案都有它的边界case。多数情况下，是考查对**递归**的熟练程度。

递归实现深拷贝的核心思路：

```javascript
function deepClone(obj) {
  // 如果是 值类型或者null，直接return
  if(typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  // 定义结果对象
  let copy = {}
  
  // 如果对象是数组，则定义结果数组
  if(obj.constructor === Array) {
    copy = [];
  }
  
  // 遍历对象的key
  for(let key in obj) {
    // 如果key是对象的自有属性
    if(obj.hasOwnProperty(key)) {
      // 递归调用深拷贝方法
      copy[key] = deepClone(obj[key]);
    }
  }
  
  return copy;
}
```

调用深拷贝方法，若属性为值类型，则直接返回；若属性为引用类型，则递归遍历。



##### ~拓展阅读

深拷贝在命题时，可发挥的空间主要在于针对不同数据结构的处理，如Array、Object，还有一些其他的数据结构（Map、Set等）；此外还有一些极端case（循环引用等）的处理，等等。

深拷贝的实现细节，两个阅读材料：

* [jQuery中的extend方法源码](https://github.com/jquery/jquery/blob/1472290917f17af05e98007136096784f9051fab/src/core.js#L121)
* [深拷贝的终极探索](https://segmentfault.com/a/1190000016672263)

