## 什么是Typescript
* JavaScirpt的超集
* 静态类型风格的类型系统
* 从es6到es10甚至是esnext的语法支持
* 兼容各种浏览器，各种系统，各种服务器，完全开源

## 为什么要使用Typescript
### 程序更容易理解
* 问题：函数或者方法输入输出的参数类型，外部条件等

### 效率更高
* 在不同的代码块和定义中进行跳转
* 代码自动补全
* 丰富的接口提示

### 更少的错误
* 编译期间能够发现大部分错误
* 杜绝一些比较常见错误

### 非常好的包容性
* 完全兼容Javascript
* 第三方库可以单独编写类型文件
* 流行项目都支持

### 缺点
* 增加了一些学习成本
* 短期内增加了一些开发成本

### ts 命令行
tsc 编译js
ts-node 运行

### Interface 接口
* 对对象的形状（shape）进行描述
* 对类（class）进行抽象
* Duck Typing（鸭子类型）

可选属性 ?
只读属性 readonly

### 类 Class
* 类（class）：定义类一切事务的抽象特点
* 对象（Object）：类的实例
* 面向对象（OOP）三大特性：封装、继承、多态

### 修饰符
public、private、protected（可以被子类访问）、readonly

### interface
功能提取、验证

### enums枚举
常量枚举才能使用常量

### generics 泛型
<>
传入extends进行约束泛型