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
    读写文件：通过fis.match读文件，release配置文件输出路径。
    资源定位：解析文件之间的依赖关系和文件位置
    文件指纹：通过useHash配置输出文件时给文件URL加上md5戳来优化浏览器缓存
    文件编译：通过parser配置文件解析器做文件转换
    压缩资源：通过optimizer配置代码压缩方法
    图片合并：通过spriter配置合并CSS里导入的图片到一个文件来减少HTTP请求数。
优点是集成了各种Web开发所需的构建功能，配置简单开箱即用。
缺点是不再更新

Webpack
Webpack是一个打包模块化JavaScript的工具，在Webpack里一切文件皆模块，通过Loader转换文件，通过Plugin注入钩子，最后输出由
多个模块组合成的文件。Webpack专注于构建模块化项目
```JavaScript
module.exports = {
    // 所有模块的入口，Webpack从入口开始递归解析出所有依赖的模块
    entry: './app.js',
    output: {
        // 把入口所依赖的所有模块打包成一个文件bundle.js输出
        filename: 'bundle.js'
    }
}



模块loader可以链式调用。链中的每个loader都将对资源进行转换。链会逆序执行。第一个loader将其结果（被转换后的资源）传递给下一个loader,
依次类推。最后，webpack期望链中的最后的loader返回JavaScript。
```
Webpack的优点是：
    专注于处理模块化的项目，能做到开箱即用一步到位；
    通过Plugin扩展，完整好用又不失灵活；
    使用场景不仅限于Web开发；
    社区活跃；
    良好的开发体验。
Webpack的缺点是只能用于采用模块化开发的项目。

###     Rollup
Rollup是一个和Webpack很类似但专注于ES6的模块打包工具。
    Rollup的亮点在于能针对ES6源码进行Tree Shaking以去除那些已被定义但没被使用的代码，以及Scope Hoisting以减少输出文件大小提升运行性能。
Rollup在用于打包JavaScript库时比Webpack更加有优势，因为其打包出来的代码更小更快。但功能不够完善。

##  使用Loader
要支持非JavaScript类型的文件，需要使用Webpack的Loader机制。
Loader可以看作具有文件转换功能的翻译员，配置里的module.rules数组配置了一组规则，告诉Webpack在遇到哪些文件时使用哪些Loader去加载和转换。
    use属性的值需要是一个由Loader名称组成的数组，Loader的执行顺序是由后到前的；
    每一个Loader都可以通过URL querystring的方式传入参数
    css-loader主页查找用法

##  使用Plugin
Plugin是用来扩展Webpack功能的，通过在构建流程里注入钩子实现，它给Webpack带来了很大的灵活性。
通过Plugin把注入到bundle.js文件里的CSS提取到单独的文件中

## 使用DevServer




    
