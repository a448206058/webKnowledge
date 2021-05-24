## Node.js 从零开发

- Nodejs, 一个 javascript 的运行环境
- 运行在服务器，作为 web server
- 运行在本地，作为打包、构建工具

### nodejs 和 js 的区别

ECMAScript 是语法规范

- 定义了语法，写 javascript 和 nodejs 都必须遵守
- 不能操作 DOM,不能监听 click 事件，不能发送 ajx 请求
- 不能处理 http 请求，不能操作文件

javascript

- 使用 ECMAScript 语法规范，外加 Web API，缺一不可
- DOM 操作，BOM 操作，事件绑定，Ajax 等
- 俩者结合，即可完成浏览器端的任何操作

nodejs

- 使用 ECMAScript 语法规范，外加 nodejs API,缺一不可
- 处理 http，处理文件等
- 俩者结合，即可完成 server 端的任何操作

### server 开发和前端开发的区别

- 服务稳定性

  server 端可能会遭受各种恶意攻击和误操作
  单个客户端可以意外挂掉，但是服务端不能
  使用 PM2 进程守候

- 考虑内存和 CPU（优化，扩展）

  客户端独占一个浏览器，内存和 CPU 都不是问题
  server 端要承载很多请求，CPU 和内存都是稀缺资源
  使用 stream 写日志，使用 redis 存 session

- 日志记录

  前端也会参与写日志，但只是日志的发起方，不关心后续
  server 端要记录日志、存储日志、分析日志、前端不关心

- 安全

  server 端要随时准备接收各种恶意攻击，前端则少很多
  如：越权操作，数据库攻击等
  登录验证，预防 xss 攻击和 sql 注入

- 集群和服务拆分

  产品发展速度快，流量可能会迅速增加
  如何通过扩展机器和服务拆分来承载大流量
