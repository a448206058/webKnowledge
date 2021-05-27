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