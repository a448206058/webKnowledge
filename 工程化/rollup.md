## 什么是rollup?
> Rollup是一个JavaScript模块打包器，可以将小块代码编译成大块复杂的代码，例如library或应用程序

与webpack偏向于应用打包的定位不同，rollup.js更专注于JavaScript类库打包

## rollup和webpack的区别？
webpack对于代码分割和静态资源导入有着“先天优势”，并且支持热模块替换（HMR），而rollup并不支持

当开发应用时可以优先选择webpack，但是rollup对于代码的Tree-shaking和ES6模块有着算法优势上的支持，打包一个简单的bundle包，并是基于ES6模块开发的，可以考虑使用rollup

### rollup 常用命令
```
rollup src/index.js -f umd -o dist/bundle.js

-f --format的缩写，它表示生成代码的格式
-o 指定了输出的路径
-c 指定rollup的配置文件
-w 监听源文件是否有改动，如果有改动，重新打包
```

### resolve插件
将我们编写的源码与依赖的第三方库进行合并，rollup.js为我们提供了resolve插件

### external属性
使某些库保持外部引用状态，使用external属性

### commonjs插件
使得rollup.js编译支持npm模块和CommonJS模块

### babel插件
转换ES6代码

### json插件
引入package.json

ES模块 tree-shaking机制，动态地清除没有被使用过的代码，使得代码更加精简，从而可以使得我们的类库获得更快的加载速度。