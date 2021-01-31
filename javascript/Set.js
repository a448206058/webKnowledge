/**
 * The Set object lets you store unique values of any type,whether primitive values or object reference.
 * Set对象允许你存储任何类型的唯一值，无论是原始值还是对象引用。
 *
 *  Description
 *  Set objects are collections of values.You can iterate through the elements of a set in insertion order.
 *  A value in the Set may only occur once;it is unique in the Set's collection.
 *  Set对象是值的集合。可以按插入顺序遍历集合的元素。一个值在集合中只能出现一次；它在集合中是唯一的。
 *
 *  Value equality
 *  Because each value in the Set has to be unique, the value equality will be checked.In an earlier version if ECMAScript specification,
 *  this was not based on the same algorithm as the one used in the === operator.Specifically, for Sets, +0(which is strictly equal to -0)
 *  and -0 were different values.However, this was changed in the ECMAScript 2015 specification.See "Key equlity for -0 and 0"
 *  in the browser compatibility table for details.
 *  因为集合中每个值都必须是唯一的，将检查值是否相等。在早期的ECMAScript版本中，这与===运算符中使用的算法不同。特别的，对于Sets来说+0和-0是不同的值。
 *  然而，它被ECMAScript2015规范改变。查看-0和+0的键相等有关详细信息，请参阅浏览器兼容性表。
 *
 *  NaN and undefined can also be stored in a Set.All NaN values are equated(i.e. NaN is considered the same as NaN, even though NaN !== NaN).
 *  NaN和undefined也可以被存储在一个Set中。所有的NaN值是相等的
 *
 *  Constructor
 *  Set()
 *  Creates a new Set object.
 *  创建一个新的set对象
 *
 *  Static properties
 *  静态属性
 *  get Set[[@@species]
 *  The constructor function that is used to create derived objects.
 *  构造函数用来创建衍生的对象。
 *
 *  Instance properties
 *  实例属性
 *  Set.prototype.size
 *  Returns the number of values in the Set object.
 *  返回Set对象的值的数量
 *
 *  Instance methods
 *  Set.prototype.add(value)
 *  Appends value to the Set object.Returns the Set object with added value.
 *  向Set对象添加值。返回具有附加值的Set对象
 *
 *  Set.prototype.clear()
 *  Removes all elements from the Set object.
 *  删除Set对象的所有元素
 *
 *  Set.prototype.delete(value)
 *  Removes the element associated to the value and returns a boolean asserting whether an element was successfully removed
 *  or not.Set.prototype.has(value) will return false afterwards.
 *  删除与值相关联的元素，并返回一个boolean是否已成功删除。
 *
 *  Set.prototype.has(value)
 *  Returns a boolean asserting whether an element is present with the given value in the Set object or not.
 *  返回一个boolean值判断一个集合对象是否有给定值的元素。
 *
 *  Iteration methods
 *  Set.prototype[@@iterator]()
 *  Returns a new Iterator object that yields the values for each element in the Set object in insertion order.
 *  返回一个新的迭代器对象，该对象按插入顺序生成Set对象中每个元素的值。
 *
 *  Set.prototype.keys()
 *  Returns a new Iterator object that yields the values for each element in the Set object in insertion order.(For Sets,
 *  this is the same as the values() methods.)
 *  返回一个新的迭代器对象，该对象按插入顺序生成Set对象中每个元素的值。（对于集合，这与values（）方法相同）。
 *
 *  Set.prototype.values()
 *  Return a new Iterator object that yields the values for each element in the Set object in insertion order.(For Sets,this
 *  is the same as the keys() method.)
 *  返回一个新的迭代器对象，该对象按插入顺序生成Set对象中每个元素的值。（对于集合，keys（）方法相同）。
 *
 *  Set.prototype.entries()
 *  Return a new Iterator object that contains an array of [value, value] for each element in the Set object, in insertion order.
 *  返回一个新的迭代器对象，该对象按插入顺序为Set对象中的每个元素包含一个[value, value]数组
 *
 *  This is similar to the Map object, so that each entry's key is the same as its value for a Set.
 *  这与Map对象类似，因此每个条目的键与其Set的值相同。
 *
 *  Set.prototype.forEach(callbackFn[, thisArg])
 *  Calls callbackFn once for each value present in the Set object,in insertion order.If a thisArg parameter is provided,
 *  it will be used as the this value for each invocation of callbackFn.
 *
 */

var _Set;
_Set = (function(){
    function Set () {
        this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
        return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
        this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
        this.set = Object.create(null);
    };
    return Set
}());
