### webpack的作用
1.代码转换
      2.文件优化
      3.代码分割
      4.模块合并
      5.自动刷新
      6.代码校验
      7.自动发布

### 打包原理
1.初始化参数：从配置文件和shell语句中读取与合并参数，得到最终的参数；
      2.开始编译：用上一步得到的参数初始化compiler对象，加载所有配置的插件，通过执行对象的run方法开始执行编译；
      3.确定入口：根据配置中的entry找出所有入口文件
      4.编译模块：从入口文件出发，调用所有配置的loader对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过来本步骤的处理；
      5.完成模块编译：在经过第4步使用loader翻译完所有模块后，得到来每个模块被翻译后的最终内容及它们之间的依赖关系；
      6.输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的chunk，再将每个chunk转换成一个单独的文件加入输出列表中，这是可以修改输出内容的最后机会。
      7.输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，将文件的内容写入文件系统中；

### loader与plugin的区别 
loader，它是一个转换器，文件内容进行翻译，比如将es6转换为es5，单纯的文件转换过程
      plugin是一个扩展器，它丰富了webpack本身，针对是loader结束后，webpack打包的整个过程，它并不是直接操作文件，而是基于事件机制工作，会监听webpack打包过程中的某些节点，
      并且执行相对应的任务

### happypack的原理
webpack中最耗时的就是loader的转换过程，转换的流程很长。happypack的原理就是把这部分的任务拆解成多个子进程去并行处理，减少构建事件
      通过new happypack()实例化，然后把任务交由实例统一调度分配。核心调度器会将一个个任务分配给空闲的子进程。处理完毕后发送给核心调度器。

### 如何优化webpack配置
缩小文件查找范围
        优化load
        优化resolve.modules
        优化resolve.mafinFields
        优化resolve.alias
        优化resolve.extensions
        优化module.noPaese
      使用DLLPlugin
        基础模块抽离，打包到动态链接库
        需要使用模块，直接去动态链接库查找
      使用happypack 单线程变多线程
      使用paralleIUglifyPlugin
        开启多进程压缩代码，并行执行
      使用CDN加速
        静态资源放到cdn服务器上面
      tree shaking
        删除无用的代码
      提取公共代码
        防止相同资源重复加载
        减少网络流量及服务器成本
      使用prepack
        编译代码时提前计算结果放到编译后的结果中，而不是在代码运行才求值

### 前端代码为何要进行构建和打包？

### module chunk bundle分别什么意思，有何区别？

### loader 和 plugin的区别？

### webpack如何实现懒加载？

### webpack常见性能优化

### babel-runtime 和 babel-polyfill的区别

### webpack基本配置
* 拆分配置和merge
* 启动本地服务
* 处理es6
* 处理样式

### webpack 高级配置
* 多入口
* 抽离CSS文件
* 抽离公共代码
* 懒加载
* 处理JSX
* 处理Vue

### module chunk bundle的区别
* module - 各个源码文件，webpack中一切皆模块
* chunk - 多模块合并成的，如entry import() splitChunk
* bundle - 最终的输出文件

### webpack 性能优化
* 优化打包构建速度 - 开发体验和效率
* 优化产出代码 - 产品性能

### 构建速度
* 优化 babel-loader
```JavaScript
{
  test: /\.js$/,
  use: ['babel-loader?cacheDirectory'], // 开启缓存
  include: path.resolve(__dirname, 'src'), // 明确范围
  // // 排除范围，include 和 exclude 俩者选一个即可
  // exclude: path.resolve(__dirname, 'node_modules')
}
```
* IgnorePlugin
* noParse 
* happyPack
* ParallelUglifyPlugin
* 自动刷新
* 热更新
* DllPlugin

### IgnorePlugin vs noParse
* IgnorePlugin直接不引入，代码中没有
* noParse引入，但不打包

### happyPack多进程打包
* JS单线程，开启多进程打包
* 提高构建速度（特别是多核CPU）

### ParallelUglifyPlugin多进程压缩js

### 关于开启多进程
* 项目较大，打包较慢，开启多进程能提高速度
* 项目较小，打包很快，开启多进程会降低速度（进程开销）

### 自动刷新

### 热更新
* 自动刷新：整个网页全部刷新，速度较慢
* 自动刷新：整个网页全部刷新，状态会丢失
* 热更新：新代码生效，网页不刷新，状态不丢失

