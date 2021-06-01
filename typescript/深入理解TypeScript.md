## 深入理解TypeScript

### 编译上下文
tsconfig.json

### 声明空间
类型声明空间 与 变量声明空间

类型声明空间
```JavaScript
class Foo {}
interface Bar {}
type Bas = {}

let foo: Foo;
let bar: Bar;
let bas: Bas;
```

变量声明空间
class 可以当做变量进行声明

### 全局模块
当你开始在一个新的TypeScript文件中写下代码时，它处于全局命名空间

* 文件模块
文件模块也被称为外部模块。
如果在你的TypeScript文件的根级别位置含有import或者export，那么它会在这个文件中创建一个本地的作用域。

### 命名空间
namespace
```JavaScript
namespace Utility {
  export function log(msg) {
    console.log(msg);
  }
  export function error(msg) {
    console.log(msg);
  }
}

```

### 动态导入表达式
```JavaScript
import(/* webpackChunkName: "momentjs" */ 'moment')
  .then(moment => {
    // 懒加载的模块拥有所有的类型，并且能够按期工作
    // 类型检查会工作，代码引用也会工作
    const time = moment().format();
  })
  .catch(err => {
    console.log('Failed to load moment', err)
  })

```
tsconfig
```JavaScript
{
  "compilerOptions": {
    "target": "es5",
    "module": "esnext",
    "lib": [
      "dom",
      "es5",
      "scripthost",
      "es2015.promise"
    ],
    "jsx": "react",
    "declaration": false,
    "sourceMap": true,
    "outDir": "./dist/js",
    "strict": true,
    "moduleResolution": "node",
    "typeRoots": [
      "./node_modules/@types"
    ],
    "types": [
      "node",
      "react",
      "react-dom"
    ]
  }
}
```

### TypeScript类型系统
* 基本注解
在类型声明空间中可用的任何内容都可以用作类型注解

* 原始类型
string、number、boolean

* 数组

* 接口
接口是TypeScript的一个核心知识，它能合并众多类型声明至一个类型声明：
```JavaScript
interface Name {
  first: string;
  second: string;
}

let name: Name;
name = {
  first: 'John',
  second: 'Doe'
};

name = {
  first: 'John'
};

name = {
  first: 'John',
  second: 1337
}
```

* 内联类型注解
与创建一个接口不同，你可以使用内联语法注解任何内容：
```JavaScript
let name: {
  first: string;
  second: string;
}
```

* 特殊类型
any、null、undefined和void

void标注一个函数没有返回值

* 泛型
```JavaScript
function reverse<T>(items: T[]): T[] {
  const toreturn = [];
  for (let i = items.length - 1; i >= 0; i--){
    toreturn.push(items[i]);
  }
  return toreturn;
}

const sample = [1, 2, 3];
let reversed = reverse(sample);

console.log(reversed); // 3, 2, 1

// Safety
reversed[0] = '1'; // Error
reversed = ['1', '2']; // Error

reversed[0] = 1; // ok
reversed = [1, 2]; // ok
```

.reverse
```JavaScript
interface Array<T> {
  reverse(): T[];
}
```

* 联合类型
|

* 交叉类型
extend 获取所有
```JavaScript
function extend<T extends object, U extends object>(first: T, second: U): T & U {
  const result = <T & U>{};
  for (let id in first) {
    (<T>result)[id] = first[id];
  }
  for (let id in second) {
    if (!result.hasOwnProperty(id)) {
      (<U>result)[id] = second[id];
    }
  }

  return result;
}

const x = extend({a: 'hello'}, {b: 42});
```

* 元组类型
[string, number]

* 类型别名
```JavaScript
type Text = string | {text: string};
type Coordinates = [number, number];
type Callback = (data: string) => void;

```

### 接口
```JavaScript
declare const myPoint: {x: number; y: number};

interface Point {
  x: number;
  y: number;
}

declare const myPoint: Point;
```

* 类可以实现接口
使用implements关键字来确保兼容性：
```JavaScript
interface Point {
  x: number;
  y: number;
}

class MyPoint implements Point {
  x: number;
  y: number;
}
```

### 枚举
枚举是组织收集有关联变量的一种方式
```JavaScript
enum CardSuit {
  Clubs,
  Diamonds,
  Hearts,
  Spades
}

// 简单的使用枚举类型
let Card = CardSuit.Clubs;

```

### 函数
函数类型在TypeScript类型系统中扮演着非常重要的角色，它们是可组合系统的核心构建块。

* 参数注解
```JavaScript
interface Foo {
  foo: string;
}

function foo(sample: Foo): Foo {
  return sample;
}
```

* 函数声明
```JavaScript
type LongHandAllowsOverloadDeclarations = {
  (a: number): number;
  (a: string): string;
}
```

### 可调用的
```JavaScript
interface ReturnString {
  (): string;
}
```
