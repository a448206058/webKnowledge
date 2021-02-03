/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/***/ (function() {

eval("console.log(111)\n(function( global, factory ) {\n}(this, (function () {\nfunction dVue(option) {\r\n\tvar vue = Object.create(option);\n\t\r\n\tvue._data = option.data;\r\n\tdefineReactive(vue._data);\r\n\treturn vue;\r\n}\r\n\r\nfunction defineReactive(obj) {\r\n\tfor (var key in obj) {\r\n\t\tif (obj[key] instanceof Array) {\r\n\t\t\tdefineReactive(obj[key]);\r\n\t\t} else if (obj[key] instanceof Object) {\r\n\t\t\tdefineReactive(obj[key]);\r\n\t\t} else {\r\n\t\t\tdefineProperty(obj, key);\r\n\t\t}\r\n\t}\r\n}\r\n\r\nfunction defineProperty(object, key) {\r\n\tObject.defineProperty(object, key, {\r\n\t\tget() {},\r\n\t\tset(newValue) {}\r\n\t});\r\n}\r\n\r\nfunction updateDOM() {}\r\n\r\n// export default dVue;\n\nreturn dVue;\n})\n));\n\n\n//# sourceURL=webpack://dvue/./src/main.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_modules__["./src/main.js"]();
/******/ })()
;