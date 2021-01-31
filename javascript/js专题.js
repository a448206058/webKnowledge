/*
    防抖
    防抖的原理：在事件触发n秒后才执行，如果在事件触发的n秒内又触发了，就重新计算
 */


//第六版 取消防抖
function debounce(func, wait, immediate) {
    var timeout, result;

    var debounced = function () {
        var context = this;
        var args = arguments;

        if (timeout) clearTimeout(timeout);
        if (immediate) {
            //如果已经执行过，不再执行
            var callNow = !timeout;
            timeout = setTimeout(function () {
                timeout = null;
            }, wait)
            if (callNow) result = func.apply(context, args);
        } else {
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, wait);
        }
        return result;
    }

    debounced.cancel = function () {
        clearTimeout(timeout);
        timeout = null;
    }

    return debounced;
}


function debounce(func, wait, immediate){
    var timeout, result;

    var debounced = function(){
        var context = this;
        var args = arguments;

        if(!timeout) clearTimeout(timeout);

        if(immediate){
            var callNow = !timeout;
            setTimeout(function(){
                timeout = null;
            },wait)
            if(callNow) result = func.apply(context, args);
        }else{
            setTimeout(function(){
                func.apply(context, args);
            },wait)
        }
    };

    debounced.oncancel = function(){
        clearTimeout(timeout);
        timeout = null;
    }
}

/*
    节流
    如果你持续触发事件，每隔一段时间，只执行一次事件

    关于节流的实现，有俩种主流的实现方式，一种是使用时间戳，一种是设置定时器

    使用时间戳，当触发事件的时候，我们取出当前的时间戳，然后减去之前的时间戳，如果大于设置的时间周期，
    就执行函数，然后更新时间戳为当前的时间戳，如果小于，就不执行

        使用定时器
        当触发事件的时候，我们设置一个定时器，再触发事件的时候，如果定时器存在，就不执行，直到定时器执行，
        然后执行函数，清空定时器，这样就可以设置下个定时器
 */

    // 第四版

    function throttle(func, wait, options) {
        var timeout, context, args, result;
        var previous = 0;
        if (!options) options = {};

        var later = function() {
            previous = options.leading === false ? 0 : new Date()
            timeout = null;
            func.apply(context, args);
            if (!timeout) context = args = null;
        };

        var throttled = function() {
            var now = new Date().getTime();
            if (!previous && options.leading === false) previous
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
        };

        throttled.cancel = function() {
            clearTimeout(timeout);
            previous = 0;
            timeout = null;
        }

        return throttled;
    }

    数组去重
    es6提供了新的数据结构Set。它类似于数组，但是成员的值都是唯一的，没有重复的值
    var unique = (a) => [...new Set(a)]

// 扁平化
const flattenDeep = (array) => array.flat(Infinity)

// 去重
const unique = (array) => Array.from(new Set(array))

// 排序
const sort = (array) => array.sort((a, b) => a-b)

// 函数组合
const compose = (...fns) => (initValue) => fns.reduceRight((y, fn) => fn(y), initValue)

// 组合后函数
const flatten_unique_sort = compose( sort, unique, flattenDeep)

// 测试
var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ] ] ], 10]
console.log(flatten_unique_sort(arr))

const removeSameItem = (originList = [], selectList = [], filterParam) => {
        let data = {};
        selectList.forEach(item=>{
            data[item[filterParam]] = item[filterParam];
        });
        let newList = [];
        originList.forEach(item=>{
            if(!data[item[filterParam]]){
                newList.push(item);
            }
        });
        return new List;
}

const originList = [
    {subject: '数学', score: 99},
    {subject: '语文', score: 95},
    {subject: '物理', score: 80},
    {subject: '英文', score: 80}
];

const selectList = [
    {subject: '英文', score: 80}
];

const newArray = removeSameItem(originList, selectList, 'subject')
console.log(newArray)

JavaScript专题之类型判断
typeof 能判断 null、object、number、string、undefined、Boolean
Object.prototype.toString
当toString方法被调用的时候，下面的步骤会被执行：
1.如果this值是undefined，就返回[object Undefined]
2.如果this值是null，就返回[object Null]
3.让O成为toObject(this)的结果
4.让class成为O的内部属性[[Class]]的值
5.最后返回由"[object" 和class和"]"三个部分组成的字符串
console.log(Object.prototype.toString.call(undefined)) //[object Undefined]
console.log(Object.prototype.toString.call(null)) //[object Null]
var class2Type = {};

"Boolean Number String Function Array Date RegExp Object Error".split(" ").map(function(item, index) {
    class2type["[object " + item + "]"] = item.toLowerCase();
})

function type(obj) {
    if (obj == null){
        return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function" ?
        class2type[Object.prototype.toString.call(obj)] || "object" :
        typeof obj;
}
