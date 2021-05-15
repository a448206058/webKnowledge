20210512 20:20
typeof 能判断哪些类型？
object number string symbol null undefined

何时使用===何时使用==？
===严格判断 == 判断

window.onload 和 DOMContentLoaded 的区别？
都是载入时调用
window 是页面渲染完成之后
DOMContentLoaded dom 元素挂载之后

JS 创建 10 个<a>标签，点击的时候弹出对应的序号？

手写节流、防抖？

Promise 解决了什么问题？
异步的问题

### 什么是知识体系？

- 高效学习三部曲：找准知识体系；刻意训练；及时反馈；

* 知识体系： 结构化的知识范围

* 涵盖所有知识点；结构化、有组织、易扩展

### 知识体系

- CSS 基础知识
  -- 布局
  ---- 盒模型
  ---- BFC
  ---- float
  ---- flex
  -- 定位
  -- 图文样式
  -- 移动端响应式
  ---- rem
  ---- meia query
  ---- vw/vh
  -- 动画/渐变

- JS 基础语法
  -- 变量类型和计算
  ---- 值类型和引用类型
  ---- 类型判断
  ---- 逻辑运算
  -- 原型和原型链
  ---- class
  ---- 继承
  ---- 原型
  ---- 原型链
  ---- instanceof
  -- 作用域和闭包
  ---- 作用域
  ---- 自由变量
  ---- 闭包
  ---- this
  -- 异步
  ---- 单线程
  ---- callback
  ---- 应用场景
  ---- Promise
  ---- event-loop
  ---- async/await
  ---- 微任务/宏任务
  -- 模块化
  ---- ES6 Module
- JS-Web-API
  -- DOM
  ---- 树形结构
  ---- 节点操作
  ---- 属性
  ---- 树结构操作
  ---- 性能
  -- BOM
  ---- navigator
  ---- screen
  ---- location
  ---- history
  -- 事件
  ---- 绑定
  ---- 冒泡
  ---- 代理
  -- ajax
  ---- XMLHttpRequest
  ---- 状态码
  ---- 跨域
  -- 存储
  ---- cookie
  ---- localStorage
  ---- sessionStorage
- 开发环境
  -- git
  -- 调试
  -- webpack 和 babel
  -- linux 命令
- 运行环境
  -- 页面加载
  ---- 加载
  ---- 渲染
  -- 性能优化
  ---- 加载资源优化
  ---- 渲染优化
  -- 安全
  ---- xss
  ---- CSRF
- HTTP 协议
  -- 状态码
  -- method
  -- Restful API
  -- headers
  -- 缓存策略

### 如何理解 HTML 语义化？

增加代码可读性
更利于 SEO

### 块状元素 & 内联元素？

display: block/table;有 div h1 h2 table ul ol p 等
display: inline/inline-block;有 span img input button 等

### 盒模型宽度计算

- offsetWidth = (内容宽度 + 内边距 + 边框)，无外边距
  box-sizing: border-box;

### margin 纵向重叠问题

- 相邻元素的 maring-top 和 maring-bottom 会发生重叠
- 空白内容也会重叠

### margin 负值问题

- marigin-top 和 margin-left 负值，元素向上、向左移动
- margin-right 负值，右侧元素左移，自身不受影响
- margin-bottom 负值，下方元素上移，自身不受影响

### BFC 理解与应用

- Block format context 块级格式化上下文
- 一块独立渲染区域，内部元素的渲染不会影响边界以外的元素

形成 BFC 的常见条件

- float 不是 none
- position 是 absolute 或 fixed
- overflow 不是 visible
- display 是 flec inline-block 等

BFC 的常见应用

- 清除浮动

### float 布局

- 如何实现圣杯布局和双飞翼布局
  圣杯布局和双飞翼布局的目的
- 三栏布局，中间一栏最先加载和渲染（内容最重要）
- 俩侧内容固定，中间内容随着宽度自适应
- 一般用于 PC 网页

圣杯布局和双飞翼布局的技术总结

- 使用 float 布局
- 俩侧使用 margin 负值，以便和中间内容横向重叠
- 防止中间内容被俩侧覆盖，一个用 padding 一个用 margin

- 手写 clearfix
  .clearfix:after {
  content: '';
  display: table;
  clear: both;
  }

  .clearfix {
  \*zoom: 1;
  }

### absolute 和 relative 定位

- relative 依据自身定位
- absolute 依据最近一层的定位元素定位
  定位元素

* absulte fixed relative

### 水平居中

- inline 元素： text-align: center
- block 元素：margin: auto
- absolute 元素： left: 50% + margin-left 负值

### 垂直居中

- inline 元素：line-height 的值等于 height 值
- absolute 元素： top 50% + margin-top 负值
- absolute 元素：transform(-50%, -50%)
- absolute 元素：top, left, bottom, right = 0 + margin: auto
