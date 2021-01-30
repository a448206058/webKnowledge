##  模块化
模块化是指把一个复杂的系统分解到多个模块以方便编码。

###     CommonJS
CommonJS是一种使用广泛的JavaScript模块化规范，核心思想是通过require方法来同步地加载依赖的其他模块，
通过module.exports导出需要暴露的接口。
```JavaScript
//导入
const moduleA = require('./moduleA');

//导出
module.exports = moduleA.someFunc;
```
优点是：
    代码可复用于Node.js环境下并运行
    通过NPM发布的很多第三方模块都采用了CommonJS规范
缺点：
    无法直接运行在浏览器环境下，必须通过工具转换成标准的ES5
    
###     AMD
与CommonJS最大的不同在于它采用异步的方式去加载依赖的模块。
AMD规范主要是为了解决针对浏览器环境的模块化问题，最具代表性的实现是requirejs
```JavaScript
//定义一个模块
define('module', ['dep'], function(dep){
    return exports;
});

//导入和使用
require(['module'], function(module) {
});
```
优点：
    可在不转换代码的情况下直接在浏览器中运行；
    可异步加载依赖；
    可并行加载多个依赖；
    代码可运行在浏览器环境和Node.js环境下。
缺点：
    在JavaScript中需要先导入实现AMD的库才能正常使用。
    
###     ES6模块化
逐渐取代CommonJS和AMD规范

```JavaScript
// 导入
import { readFile } from 'fs';
import React from 'react';
// 导出
export function hello() {};
export default {
    // ...
};
```
缺点：
    需要转换成标准的ES5才能正常运行

###     样式文件中的模块化
把一些常用的样式片段放进一个通用的文件里，再在另一个文件里通过@import语句去导入和使用这些片段
```JavaScript
// util.scss 文件

// 定义样式片段
@mixin center {

}

// main.scss 文件
@import "util";
#box {
    @include center;
}
```

###     新框架
React
引入JSX语法到JavaScript语言层面中，以更灵活地控制视图的渲染逻辑。

Vue
Vue框架把一个组件相关的HTML模板、JavaScript逻辑代码、CSS样式代码都写在一个文件里，这非常直观。

Angular2
Angular2推崇采用TypeScript语言去开发应用，并且可以通过注解的语法去描述组件的各种属性。

###     新语言
ES6
    规范模块化
    Class语法
    用let声明变量，const声明常量；
    箭头函数
    async函数
    Set和Map

TypeScript
    TypeScript是JavaScript的一个超集，除了支持ES6的所有功能，还提供了静态类型检查。采用TypeScript编写的代码可以
    被编写成符合ES5、ES6标准的JavaScript.
    缺点是相对于JavaScript更加啰嗦，并且无法直接运行在浏览器或Node.js环境下

Flow
    Flow也是JavaScript的一个超集，它的主要特点是为JavaScript提供静态类型检查，和TypeScript相似但更灵活，可以让你在
    需要的地方加上类型检查。
    

##  常见的构建工具及对比
    构建就是把源代码转换成发布到线上的可执行JavaScript、CSS、HTML代码
        代码转换：TypeScript变异成JavaScript、SCSS编译成CSS等。
        文件优化：压缩JavaScript、CSS、HTML代码，压缩合并图片等。
        代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。
        模块合并：在采用模块化的项目里会有很多个模块和文件，需要构建功能把模块分类合并成一个文件。
        自动刷新：监听本地源代码的变化，自动重新构建、刷新浏览器。
        代码校验：在代码被提交到仓库前需要校验代码是否符合规范，以及单元测试是否通过。
        自动发布：更新完代码后，自动构建出线上发布代码并传输给发布系统。
    构建其实是工程化、自动化思想在前端开发中的体现，把一系列流程用代码去实现，让代码自动化地执行这一系列复杂的流程。
    由于前端工程师都很熟悉JavaScript,Node.js又可以胜任所有构建需求，所以大多数构建工具都是用Node.js开发的。
    
###     Npm Script
    Npm Script是一个任务执行者。
    Npm是在安装Node.js时附带的包管理器，Npm Script则是Npm内置的一个功能，允许在package.json文件里使用scripts字段定义任务：
```JavaScript
    {
        "scripts": {
            "dev": "node dev.js",
            "pub": "node build.js"
        }
    }
```    
底层实现原理是通过调用Shell去运行脚本命令    
npm script的优点是内置，无须安装其他依赖。
缺点是功能太简单，索然提供了pre和post俩个钩子，但不能方便地管理多个任务之间的依赖。

###     Grunt
Grunt和Npm Script类似，也是一个任务执行者。
Grunt的优点是：
    灵活，它只负责执行你定义的任务
    大量的可复用插件封装好了常见的构建任务。
Grunt的缺点是集成度不高，要写很多配置后才可以用，无法做到开箱即用。
grunt相当于进化版的Npm Script，它的诞生其实是为了弥补Npm Script的不足。

###     Gulp
Gulp是一个基于流的自动化构建工具。除了可以管理和执行任务，还支持监听文件、读写文件。
    通过gulp.task 注册一个任务；
    通过gulp.run执行任务；
    通过gulp.watch监听文件变化；
    通过gulp.src读取文件；
    通过gulp.dest写文件；
Gulp的最大特点是引入了流的概念，同时提供了一系列常用的插件去处理流，流可以在插件之间传递
Gulp的优点是好用又不失灵活，即可以单独完成构建也可以和其它工具搭配使用。其缺点是和Grunt类似，集成度不高，要写很多配置后才可以用，无法开箱即用。
Gulp相当于Grunt的加强版。相对于Grunt，Gulp增加了监听文件、读写文件、流式处理的功能。

Fis3
Fis3集成了Web开发中的常用构建功能
    读写文件：
    资源定位：
    文件指纹：
    文件编译：1
    压缩资源：
    图片合并：
    
