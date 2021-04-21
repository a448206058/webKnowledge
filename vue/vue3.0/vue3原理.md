参考资料：https://vue3js.cn/es6/dataStructure.html#%E6%80%BB%E7%BB%93
## vue3.0
### 响应式

### patch算法的优化
使用block做标记 /**/
进行标记 不需要比较的直接省略

### 为什么要用Proxy重构
Vue3.0之前的双向绑定是由defineProperty实现，在3.0重构为Proxy

Object.defineProperty()方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象
对对象上的属性做操作，而非对象本身，就是在Observer data时，新增属性并不存在，自然就不会有getter，setter，
也就解释了为什么新增视图不更新。

* Proxy 作为新标准将受到浏览器厂商重点持续的性能优化
* Proxy能观察的类型比defineProperty更丰富
* Proxy不兼容IE,也没有polyfill,defineProperty能支持到IE9
* Object.definePropert是劫持对象的属性，新增元素需要再次defineProperty。而Proxy劫持的是整个读喜庆，不需要做特殊处理
* 使用defineProperty，我们修改原来的obj对象就可以触发拦截，而使用proxy，就必须修改代理对象，即Proxy的实例才可以触发拦截

### Set、Map、WeakSet、WeakMap
Set是一种叫做集合的数据结构，Map是一种叫做字典的数据结构

* 集合：是由一堆无序的、相关联的，且不重复的内存结构组成的组合
* 字典：是一些元素的集合。每个元素有一个称作key的域，不同元素的key各不相同

共同点：集合、字典都可以存储不重复的值
不同点：集合是以【值，值】的形式存储元素，字典是以【键，值】的形式存储

在es6之前，我们通常使用内置的Object模拟Map
但是这样模拟出来的map会有一些缺陷
1. Object的属性键是String或Symbol，这限制了它们作为不同数据类型的键/值对集合的能力
2. Object不是设计来作为一种数据集合，因此没有直接有效的方法来确定对象具有多少属性

### Set
定义：Set对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用，Set对象是值的集合，你可以按照插入的顺序迭代它的元素。Set中的元素只会出现一次，即Set中的元素是唯一的
Set本身是一个构造函数，用来生成Set数据结构

### WeakSet
WeakSet对象是一些对象值的集合，并且其中的每个对象值都只能出现一次。在WeakSet的集合中是唯一的

WeakSet的出现主要解决弱引用对象存储的场景，其结构与Set类似

弱引用是指不能确保其引用的对象不会被垃圾回收器回收的引用，换句话说就是可能在任意时间被回收

* 与Set相比，WeakSet只能是对象的集合，而不能是任何类型的任意值
* WeakSet集合中对象的引用为弱引用。如果没有其他的对WeakSet中对象的引用，那么这些对象会被当成垃圾回收掉。这也意味着WeakSet中没有存储当前对象的列表。

### Map
Map对象保存键值对，并且能够记住键的原始插入顺序。任何值（对象或者原始值）都可以作为一个键或一个值。一个Map对象在迭代时会根据对象中元素的插入顺序来进行-一个for...of循环在每次迭代后会返回一个形式为[key, value]的数组

### WeakMap
WeakMap对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的

与Map的区别
* Map的键可以是任意类型，WeakMap的键只能是对象类型
* WeakMap键名所指向的对象，不计入垃圾回收机制

* Set、Map、WeakSet、WeakMap都是一种集合的数据结构
* Set、WeakSet是【值，值】的集合，且具有唯一性
* Map和WeakMap是一种【键，值】的集合，Map的键可以是任意类型，WeakMap的只能是对象类型
* Set和Map有遍历方法，WeakSet和WeakMap属于弱引用不可遍历