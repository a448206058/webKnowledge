对于webpack每个文件就是一个module

import 最终为 __webpack__require__函数执行
```JavaScript
// main.js
import { A } from './a'
import B from './b'
console.log(A)
B()

// a.js
export const A = 'a'

// b.js
export default function () {
    console.log('b')
}

// bundle.js
(function(modules) {
    ...(webpack的函数)
// 开始主入口函数的执行
    return __webpack_require__(__webpack_require__.s = "./demo1/main.js")
})(
{
    "./demo01/a.js": (function(){...}),
    "./demo01/b.js": (function(){...}),
    "./demo01/main.js": (function(){...}),
}
)
```

对于webpack每个文件就是一个module
调用每一个module函数时，参数为module、module.exports、__webpack_require__。
module.exports用来收集module中所有的export
```JavaScript
(function(module, __webpack_exports__, __webpack_require__) {
    ...
    // 简单理解就是
    // __webpack_exports__.A = A
    __webpack_require__.d(__webpakc_exports__, "A", function() { return A;})
    const A = 'a'

/***/ })

__webpack_require__.d = function(exports, name, getter) {
    if(!__webpack_require__.o(exports, name)) {
        Object.defineProperty(exports, name, {
            configurable: false,
            enumerable: true,
            get: getter
        });
    }
};

// Object.prototype.hasOwnProperty.call
__webpack_require__.o = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
};
```

## 异步加载
```JavaScript
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0], {
"./demo/c.js": (function(module, __webpack_exports__, __webpack_require__){
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_exports__["default"] = ({
        key2: 'key2'
    });
})
}])

var t = window["webpackJsonp"] = window["webpackJsonp"] || [])
t.push([[0], {function(){...}}])

// main.js
var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
jsonpArray.push = webpackJsonpCallback;
```
