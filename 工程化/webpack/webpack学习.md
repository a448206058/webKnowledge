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

## 开发环境
    mode: 'development'

## 使用source map
    devtool: 'inline-source-map',
    可以将编译后的代码映射回原始源代码

## 自动编译代码：
    1.webpack's Watch Mode(观察模式)
    2.webpack-dev-server(实时重新加载)
    3.webpack-dev-middleware()
    
## 代码分离
    常用的代码分离方法有三种：
        入口起点：使用entry配置手动地分离代码。
        防止重复：使用Entry dependencies或者SplitChunksPlugin去重和分离chunk
            入口依赖
            SplitChunksPlugin插件可以将公共的依赖模块提取到已有的入口chunk中，或者提取到一个新生成的chunk。
        动态导入：通过模块的内联函数调用来分离代码
            第一种：import()语法实现动态导入
            第二种：webpack特定的require.ensure
        预获取/预加载模块(prefetch/preload module)
            prefetch(预获取): 将来某些导航下可能需要的资源
            preload(预加载)：当前导航下可能需要资源
            
        bundle分析
        
## 缓存
    通过必要的配置，以确保webpack编译生成的文件能够被客户端缓存，而在文件内容变化后，能够请求到新的文件。
###     输出文件的文件名
    webpack提供了一种使用称为substitution(可替换模板字符串）的方式
###     提取引导模板
    使用optimization.runtimeChunk选项将runtime代码拆分为一个单独的chunk。将其设置为single来为所有chunk创建一个runtime bundle:

## 创建library
    除了打包应用程序，webpack还可以用于打包JavaScript library。
    
## 构建性能
###     更新到最新版本
    loader 将loader应用于最小数量的必要模块，通过使用include字段，仅将loader应用在实际需要将
    其转换的模块：
    
###     引导
    每个额外的loader/plugin都有其启动时间。尽量少地使用工具。
    
###     解析
    减少 resolve.modules, resolve.extensions, resolve.mainFiles, resolve.descriptionFiles 中条目数量，因为他们会增加文件系统调用的次数。
    如果你不使用 symlinks（例如 npm link 或者 yarn link），可以设置 resolve.symlinks: false。
    如果你使用自定义 resolve plugin 规则，并且没有指定 context 上下文，可以设置 resolve.cacheWithContext: false。

###     dll
    使用 DllPlugin 为更改不频繁的代码生成单独的编译结果。这可以提高应用程序的编译速度，尽管它增加了构建过程的复杂度。
    
###     小即是快(smaller = faster)

###     worker 池(worker pool)
    thread-loader 可以将非常消耗资源的 loader 分流给一个 worker pool。
    
###     持久化缓存
    在 webpack 配置中使用 cache 选项。使用 package.json 中的 "postinstall" 清除缓存目录

###     自定义 plugin/loader
    对它们进行概要分析，以免在此处引入性能问题
    
###     Progress plugin 
    将 ProgressPlugin 从 webpack 中删除，可以缩短构建时间
    
## 开发环境
###     增量编译
    使用 webpack 的 watch mode(监听模式)
    
###     在内存中编译
    webpack-dev-server
    webpack-hot-middleware
    webpack-dev-middleware

###     stats.toJson 加速

###     Devtool
            
## 内容安全策略
启用 CSP

## 依赖管理
    ES6 modules
    commonjs
    amd

###     带表达式的require语句

##  Tree Shaking
    tree shaking 是一个术语，通常用于描述移除JavaScript上下文中的未引用代码。
    
    sideEffects更为有效是因为它允许跳过整个模块/文件和整个文件子树。
    usedExports依赖于terser去检测语句中的副作用。它是一个JavaScript任务而且没有像sideEffects一样简单直接。
    
    将函数调用标记为无副作用
    通过 /*#__PURE__*/
    
    压缩输出结果

##  懒加载


## 进阶篇

### 静态资源拷贝
npm install copy-webpack-plugin -D
```JavaScript
//webpack.config.js
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    //...
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'public/js/*.js',
                to: path.resolve(__dirname, 'dist', 'js'),
                flatten: true,
            },
            //还可以继续配置其它要拷贝的文件
        ])
    ]
}
```

### ProvidePlugin
全局遍历
```JavaScript
//webpack.config.js
const webpack = require('webpack')
module.exports = {
    plugins: [
        new webpack.ProvidePlugin({
            React: 'react',
            Component: ['react', 'Component'],
            Vue: ['vue/dist/vue.esm.js', 'default'],
            $: 'jquery',
            _map: ['lodash', 'map']
        })
    ]
}
```

### 抽离CSS
npm install mini-css-extract-plugin -D

mini-css-extract-plugin 和extract-text-webpack-plugin相比
1.异步加载
2.不会重复编译
3.更容易使用
4.只适用CSS

```JavaScript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(le|c)ss$/,
                use: [
                    MinCssExtractPlugin.loader,
                    'css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('autoprefixer')({
                                        "overrideBrowserslist": [
                                            "defaults"
                                        ]
                                    })      
                                ]
                            }
                        }   
                    }, 'less-loader'
                ],
                exclude: /node_modules/
            }
        ]
    }
}

```

.browserslistrc 文件，可以多个loader共享配置
```
last 2 version
> 0.25%
not dead
```
```JavaScript
// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(c|le)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function (){
                                return [
                                    require('autoprefixer')()
                                ]
                            }
                        }
                    }, 'less-loader'
                ],
                exclude: /node_modules/
            }
        ]
    }
}
```

### 将抽离出来的css文件进行压缩
配置optimization
npm install optimize-css-assets-webpack-plugin -D
```JavaScript
// webpack.config.js
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    plugins: [
        new OptimizeCssPlugin()
    ],
    rules: [
        {
            test: /\.(c|le)ss$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: isDev,
                        reloadAll: true
                    }
                },
            ],
            exclude: /node_modules/
        }
    ]
}
```

### 按需加载
import @babel/plugin-syntax-dynamic-import
@babel/preset-env 已经包含了 @babel/plugin-syntax-dynamic-import
webpack遇到Import(****)
    以****为入口新生成一个chunk
    当代码执行到import所在的语句时，才会加载该chunk所对应的文件

### 热更新
首先配置devServer的hot为true
并且在plugins中增加new webpack.HotModuleReplacementPlugin()
```JavaScript
// webpack.config.js
const webpack = require('webpack')
module.exports = {
    devServer: {
        hot: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin() // 热更新插件
    ]
}
```

### 多页应用打包
```JavaScript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: {
        index: './src/index.js',
        login: './src/login.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash:6].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html', // 打包后的文件名
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: './public/login.html',
            filename: 'login.html', // 打包后的文件名
            chunks: ['login']
        })
    ]
}
```

### resolve配置
resolve配置webpack如何寻找模块所对应的文件。
1.modules
```JavaScript
// webpack.config.js
module.exports = {
    resolve: {
        modules: ['./src/components', 'node_modules']
    }
}
```

2. alias
```JavaScript
// webpack.config.js
module.exports = {
    // ...
    resolve: {
        alias: {
            'react-native': '@my/react-native-web'
        }
    }
}
```

3.extensions
层层寻找
```JavaScript
// webpack.config.js
module.exports = {
    // ...
    resolve: {
        extensions: ['web.js', '.js']
    }
}
```

4.enforceExtension
如果配置了resolve.enforceExtension为true,那么导入语句不能缺省文件后缀

5.mainFields
```JavaScript
// webpack.config.js
module.exports = {
    // ...
    resolve: {
        mainFields: ['style', 'main']
    }
}

// 对应package.json
{
    "style": "dist/css/bootstrap.css",
    "sass": "scss/bootstrap.scss",
    "main": "dist/js/bootstrap",
}
```

## 区分不同的环境
webpack.base.js 定义公共的配置
webpack.dev.js 定义开发环境的配置
webpack.prop.js 定义生产环境的配置
webpack-merge 提供一个merge函数，用于连接数组，合并对象
npm install webpack-merge -D
```JavaScript
const merge = require('webpack-merge');
merge({
    devtool: 'cheap-module-eval-source-map',
    module: {
        rules: [
            {a: 1}
        ]
    },
    plugins: [1, 2, 3]
}, {
    devtool: 'none',
    mode: "production",
    module: {
        rules: [
            {a: 2},
            {b: 1}
        ]
    },
    plugins: [4, 5, 6]
});
// 合并后的结果为
{
    devtool: 'none',
    mode: "production",
    module: {
        rules: [
            {a: 1},
            {a: 2},
            {b: 1}
        ]
    },
    plugins: [1, 2, 3 ,4 ,5 ,6]
}
```

## 定义环境变量
使用webpack内置插件DefinePlugin来定义环境变量
```JavaScript
// webpack.config.js
module.exports = {
    // ...
    plugins: [
        new webpack.DefinePlugin({
            DEV: JSON.stringify('dev'), //字符串
            FLAG: 'true' // FLAG是个布尔类型
        })
    ]
}

// index.js
if(DEV === 'dev'){

} else{

}
```

## 利用webpack解决跨域问题
```JavaScript
// webpack.config.js
module.exports = {
    // ...
    devServer: {
        proxy: {
            "/api": {
                target: 'http://localhost:4000',
                pathRewrite: {
                    '/api': ''
                }
             }
        }
    }
}
```

### 前端模拟数据
1.npm install mocker-api -D
2.新建mock文件夹，新建mocker.js
```JavaScript
module.exports = {
    'GET /user': {name: ''},
    'POST /login/account': (req, res) => {
        const { password, username } = req.body
        if (password === '1' && username = '1') {
            return res.send({
            
            })
        } else {
            return res.send({ status: 'error', code: 403 })
        } 
    }
}
```
3.修改webpack.config.base.js
```JavaScript
const apiMocker = require('mocker-api')
module.export = {
    devServer: {
        before(app) {
            apiMocker(app, path.resolve('./mock/mocker.js'))
        }
    }
}
```

## 优化
## 量化
speed-measure-webpack-plugin 可以测量各个插件heloader所花费的时间
```JavaScript
// webpack.config.js
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const config = {
    //.. webpack 配置
}

module.exports = smp.wrap(config);
```

## exclude/include
exclude指定要排除的文件
include指定要包含的文件
exclude优先级高于include，在include和exclude中使用绝对路径数组，尽量避免exclude，更倾向于使用include
```JavaScript
// webpack.config.js
const path = require('path');
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                use: ['babel-loader'],
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    }
}
```

### cache-loader
在一些性能开销较大的loader之前添加cache-loader
默认保存在node_modules/.cache/cache-loader下
npm install cache-loader -D
```JavaScript
// webpack.config.js
const path = require('path');
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: ['cache-loader', 'babel-loader']
            }
        ]
    }
}
```

### happypack
HappyPack把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程
npm install happypack -D
```JavaScript
// webpack.config.js
const Happypack = require('happypack')
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                use: 'Happypack/loader?id=js',
                include: [path.resolve(__dirname, 'src')]
            },
            {
                test: /\.css$/,
                use: 'Happypack/loader?id=css',
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules', 'bootstrap', 'dist')
                ]
            }
        ]
    },
    plugins: [
        new Happypack({
            id: 'css', // 和rule中的id=css对应
            use: ['style-loader', 'css-loader', 'postcss-loader']
        })
    ]
}

// 当postcss-loader 配置在Happypack 必须在项目中创建postcss.config.js

// postcss.config.js
module.exports = {
    plugins: [
        require('autoprefixer')()
    ]
}
```

### thread-loader
把thread-loader放置在其它loader之前，那么放置在这个loader之后的loader就会在一个单独的worker池
中运行
在worker池中运行的loader是受到限制的
这些loader不能产生新的文件
这些loader不能使用定制的loader API
这些loader无法获取webpack的选项设置
npm install thread-loader -D
```JavaScript
module.exports = {
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: ['thread-loader', 'cache-loader', 'babel-loader']
            }
        ]
    }
}
```

### 开启JS多进程压缩
webpack默认使用的是TerserWebpackPlugin 默认开启了多进程和缓存，构建时
你的项目中可以看到terser的缓存文件 node_modules/.cache/terser-webpack-plugin

### HardSourceWebpackPlugin
为模块提供中间缓存
缓存的路径 node_modules/.cache/hard-source
npm install hard-source-webpack-plugin -D
```JavaScript
// webpack.config.js
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
module.exports =  {
    // ...
    plugins: [
        new HardSourceWebpackPlugin()
    ]
}
```

### noParse
没有AMD/CommonJs规范版本
```JavaScript
// webpack.config.js
module.exports = {
    // ...
    module: {
        noParse: /jquery|lodash|
    }
}
```

### resolve
```JavaScript
// webpack.config.js
module.exports = {
    // ...
    resolve: {
        modules: [path.resolve(__dirname, 'node_modules')]
    }
}
```

### IgnorePlugin
webpack的内置插件，作用是忽略第三方包指定目录。
```JavaScript
//webpack.config.js
module.exports = {
	//...
	plugins: [
		//忽略 moment 下的./locale目录
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
	]
}
```

### externals
将一些JS文件存储在CDN上（减少Webpack打包出来的js体积），在index.html中通过<script>标签引入
希望在使用时，仍然可以通过import的方式去引用，并且webpack不会对其进行打包，此时就可以配置externals
```JavaScript
//webpack.config.js
module.exports = {
	//...
	externals: {
		//jquery通过script引入之后，全局中即有了jQuery变量
		'jquery': 'jQuery'
	}
}
```

### DllPlugin
DllPlugin 和 DLLReferencePlugin 可以实现拆分bundles，并且可以大大提升构建速度，
DllPlugin和DLLReferencePlugin都是webpack的内置模块
新建一个webpack的配置文件，来专门用于编译动态链接库
webpack.config.dll.js 
```JavaScript
//webpack.config.dll.js
const webpack = require('webpack')
const path = require('path')

module.exports = {
	entry: {
		react: ['react', 'react-dom']
	},
	mode: 'production',
	output: {
		filename: '[name].dll.[hash:6],js',
		path: path.resolve(__dirname, 'dist', 'dll'),
		library: '[name]_dll' // 暴露给外部使用
		// libraryTarget 指定如何暴露内容，缺省时就是var
	}
	//...
	plugins: [
		new webpack.DllPlugin({
			//name和library一致
			name: '[name]_dll',
			path: path.resolve(__dirname, 'dist', 'dll', 'manifest.json')
		})
	]
}

// 在package.json
{
	"scripts": {
		"dev": "NODE_ENV=development webpack-dev-server",
		"build": "NODE_ENV=production webpack",
		"build:dll": "webpack --config webpack.config.dll.js"
	}
}
```

### 抽离公共代码
配置在optimization.splitChunks中
```JavaScript
//webpack.config.js
module.exports = {
	optimization: {
		splitChunks: { // 分割代码块
			cacheGroups: {
				vendor: {
					// 第三方依赖
					priority: 1, // 设置优先级，首先抽离第三方魔窟奥
					name: 'vendor',
					test: /node_modules/,
					chunks: 'initial',
					minSize: 0,
					minChunks: 1 // 最少引用1次
				},
				//缓存组
				common: {
					// 公共模块
					chunks: 'initial',
					name: 'common',
					minSize: 100, // 大小超过100个字节
					minChunks: 3 //最少引入3次
				}
			}
		}，
		// 将包含chunk映射关系的列表从main.js中抽离出来，在配置了splitChunk是，记得配置runtimeChunk
		runtimeChunk: {
			name: 'manifest'
		}
	}
}
```

### webpack自身的优化
tree-shaking
如果使用ES6的import语法，那么在生产环境下，会自动移除没有使用到的代码

scope hosting作用域提升

babel配置的优化
在.babelrc中增加@babel/plugin-transform-runtime的配置
```JavaScript
{
	"presets": [],
	"plugins": [
		[
			"@babel/plugin-transform-runtime"
		]
	]
}
```

## webpack5
1.编译缓存
提供了构建runtime，左右被webpack处理的模块都能得到有效的缓存，大大提高了缓存的覆盖率，因此性能比第三方更好。
```JavaScript
module.exports = {
    cache: {
       // 将缓存类型设置为文件系统
        type: "filesystem",
        buildDependencies: {
            // 将你的config 添加为buildDependency,以便在改变config时获得缓存无效
            config: [__filename],
            // 如果有其它的东西被构建依赖，你可以在这里添加它们
            // 注意，webpack.config,加载器和所有从你的配置中引用的模块都会被自动添加
        },
        // 默认情况下，更改配置文件都会导致重新开始缓存，也可通过主动设置version来控制花奴才能的更新
        version: '1.0'
    }
}
```

2.长效缓存
optimization.moduleIds = 'deteministic'
optimization.chunkIds = 'deterministic'

3.Node Polyfill脚本被移除

4.更优的tree-shaking
代码更简洁
!function(){"use stict"; console.log("hello")}();

5.Module Federation
共享代码

总结：
1.构建性能大幅度提升，依赖核心代码层面的持久缓存，覆盖率更高，配置更简单。
2.打包后的代码体积减少。
3.默认支持浏览器长期缓存，减低配置门槛。
4.令人激动的新特性Module Federation，蕴含极大的可能性。


参考资料：

https://mp.weixin.qq.com/s/P3foOrcu4StJDGdX9xavng
