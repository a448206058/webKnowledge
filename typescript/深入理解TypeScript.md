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

### 类型断言
TypeScript允许你覆盖它的推断，并且能以你任何你想要的方式分析它，这种机制被称为【类型断言】。
```JavaScript
interface Foo {
  bar: number;
  bas: string;
}

const foo = {} as Foo;
foo.bar = 123;
foo.bas = 'hello';
```

* 类型断言被认为是有害的
* 双重断言
```JavaScript
function handler(event: Event) {
  const element = (event as any) as HTMLElement; // ok
}
```
当S类型是T类型的子集，或者T类型是S类型的子集时，S能被成功断言成T。这是为了在进行类型断言时提供额外的安全性，完全毫无根据的断言是危险的，如果你想这么做，你可以使用any。

### Freshness
被称为更严格的对象字面量检查用来确保对象字面量在结构上类型兼容
```JavaScript
function logName(something: { name: string }) {
  console.log(something.name);
}

const person = {name: 'matt', job: 'being awesome' };
const randow = {not: '1'}

logName(person) // ok
log(randow) // error
```

### 类型保护
类型保护允许你使用更小范围下的对象类型

* typeof
```JavaScript
function doSome(x: number | string) {
  if (typeof x === 'string') {
    // 在这个块中，TypeScript知道 `x` 的类型必须是 `string`
    console.log(x.subtr(1)); // Error
    console.log(x.substr(1)); // ok
  }

  x.substr(1); // Error: 无法保证 `x` 是 `string` 类型
}
```

* instanceof 
```JavaScript
class Foo {
  foo = 123;
  common = '123';
}

class Bar {
  bar = 123;
  common = '123';
}

function doStuff(arg: Foo | Bar) {
  if (arg instanceof Foo) {
    console.log(arg.foo); // ok
    console.log(arg.bar); // Error
  } else {
    // 这个块中，一定是 'Bar'
    console.log(arg.foo); // Error
    console.log(arg.bar); // ok
  }
  if (arg instanceof Bar) {
    console.log(arg.foo); // Error
    console.log(arg.bar); // ok
  }
}

doStuff(new Foo());
doStuff(new Bar());
```

* in
in 操作符可以安全的检查一个对象上是否存在一个属性，它通常也被作为类型保护使用
```JavaScript
interface A {
  x: number;
}

interface B {
  y: string;
}

function doStuff(q: A | B) {
  if ('x' in q) {
    // q: A
  } else {
    // q: B
  }
}
```

* 字面量类型保护
```JavaScript
type Foo = {
  kind: 'foo'; // 字面量类型
  foo: number;
}
```

* 使用定义的类型保护

### 字面量类型
字面量是JavaScript本身提供的一个准确变量
* 字符串字面量
```JavaScript
// 仅接收一个字面量为Hello的变量
let foo: 'Hello';

```

### readonly
TypeScript 类型系统允许你在一个接口里使用readonly来标记属性。它能让你以一种更安全的方式工作
```JavaScript
function foo(config: {readonly bar: number, readonly bars: number}) {
  
}
```

### 泛型
设计泛型的关键目的是在成员之间提供有意义的约束

* 动机和示例

### Never

### 索引签名
可以用字符串访问JavaScript中的对象（TypeScript中也一样），用来保存对其他对象的引用。

### 流动的类型
* 复制类型和值
使用import关键字，如果你在使用namespace或者modules，使用import是你唯一能用的方式
* 捕获变量的类型
你可以通过typeof操作符在类型注解中使用的变量。这允许你告诉编译器，一个变量的类型与其他类型相同
```JavaScript
let foo = 123;
let bar: typeof foo;
```
* 捕获类成员的类型
与捕获变量的类型相似，你仅仅是需要声明一个变量用来捕获到的类型：

### 异常处理
JavaScript有一个Error类，用来处理异常。你可以通过throw关键字来抛出一个错误。然后通过try/catch块来捕获此错误:

* 错误子类型
RangeError 当数字类型变量或者参数超出其有效范围时，出现RangeError
ReferenceError 当引用无效时，会出现ReferenceError的错误提示
SyntaxError 当解析无效JavaScript代码时，会出现SyntaxError的错误提示
TypeError 变量或者参数不是有效类型时，会出现TypeError的错误提示
URIError 当传入无效参数至encodeURI() 和 decodeURI() 时，会出现URIError的错误提示

* 使用Error
除非你想用以非常通用（try/catch）的方式处理错误，否则不要抛出错误

### 混合
TypeScript（和JavaScript）类只能严格的单继承

从可重用组件构建类的另一种方式是通过基类来构建它们，这种方式称为混合。

采用函数B接受一个类A，并且返回一个带有新功能的类的方式来替代A类扩展B来获取B上的功能，前者中的B即是混合。

* 创建一个构造函数
混合接受一个类，并且使用新功能扩展它
```JavaScript
type Constructor<T = {}> = new (...args: any[]) => T;
```

* 扩展一个类并且返回它
```JavaScript
// 添加属性的混合例子
function TimesTamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now()
  }
}
```

### ThisType
通过ThisType我们可以在对象字面量中键入this，并提供通过上下文类型控制this类型的便捷方式。它只有在-- noImplicitThis的选项下才有效

* 如果这个方法显式指定了this参数，那么this具有该参数的类型
* 否则，如果方法由带this参数的签名进行上下文键入，那么this具有该参数的类型
* 否则，如果 -- noImplicitThis 选项已经启用，并且对象字面量中包含由 ThisType<T> 键入的上下文类型，那么this的类型为T
* 否则，如果 -- noImplicitThis选项已经启用，并且对象字面量中不包含由ThisType<T> 键入的上下文类型，那么this的类型为该上下文类型
* 否则，如果 -- noImplicitThis选项已经启用，this具有该对象字面量的类型
* 否则，this的类型为any

### 支持JSX
TypeScript支持JSX转换和代码分析

* React JSX
React不但能渲染HTML标签（strings）也能渲染React组件（classes）。
JavaScript触发这些的原理是不同的，确定使用哪一种方式取决于首字母的大小写，foo被认为是HTML标签，Foo被认为是一个组件。

* HTML标签
```JavaScript
declare namespace JSX {
  interface IntrinsicElements {
    a: React.HTMLAttributes;
    abbr: React.HTMLAttributes;
    div: React.HTMLAttributes;
    span: React.HTMLAttributes;

    // 其他
  }
}
```

* 函数式组件
你可以使用React.FunctionComponent 接口定义函数组件
```JavaScript
type Props = {
  foo: string;
}

const MyComponent: React.FunctionComponent<Props> = props => {
  return <span>{props.foo}</span>
}

<MyComponent foo="bar" />;
```

* 类组件
根据组件的props属性对组件进行类型检查。

* React JSX Tip:接受组件的实例
react类型声明文件提供了React.ReactElement<T>，它可以让你通过传入<T/>，来注解类组件的实例化结果。
```JavaScript
class MyAwesomeComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}

const foo: React.ReactElement<MyAwesomeComponent> = <MyAwesomeComponent />;
```

* React JSX Tip:接受一个可以在Props起作用，并使用JSX渲染的组件
类型React.Component<Props> 是 React.ComponentClass<P>与React.StatelessComponent<P>的组合，所以你可以接受一些可以用作Props类型和使用JSX渲染的组件
```JavaScript
const X: React.Component<Props> = foo;

<X {...props} />

```

* React JSX Tip: 可渲染的接口
React可以渲染一些像JSX或者是string的内容，这些被合并到类型React.ReactNode中，因此，当你接收可渲染的内容时，你可以使用它：
```JavaScript
type Props = {
  header: React.ReactNode;
  body: React.ReactNode;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return (
      <div>
        {this.props.header}
        {this.props.body}
      </div>
    )
  }
}

<MyComponent header={<h1>Header</h1>} body={<i>body</i>} />
```

* React JSX tip: 接收组件的接口
React声明文件提供React.ReactElement<T>的接口，可以让你注解一个类组件实例化的返回值<T />
```JavaScript
class MyAwesomeComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}

const foo: React.ReactElement<MyAwesomeComponent> = <MyAwesomeComponent />;
```

* React JSX tip: 接收可以作为props的组件，并且使用JSX渲染它
类型 React.Component<Props> 合并了 React.ComponentClass<P> 和 React.statelessComponent<P>，因此，你可以接收一些使用Prop类型的组件
```JavaScript
const X: React.Component<Props> = foo

<X {...props} />
```

* React JSX tip: 泛型组件
```JavaScript
// 一个泛型组件
type SelectProps<T> = {items: T[] };
class Select<T> extends React.Component<SelectProps<T>, any> {}

// 使用
const Form = () => <Select<string> items={['a', 'b']} />

```

* 泛型函数
```JavaScript
function foo<T>(x: T): T {
  return x;
}
```

* React Tip: 强类型的Refs
基本上你在初始化一个变量时，使用ref和null的联合类型，并且在回调函数中初始化
```JavaScript
class Example extends React.Component {
  example() {

  }

  render() {
    return <div>Foo</div>;
  }
}

class Use {
  exampleRef: Example | null = null;

  render() {
    return <Example ref={exampleRef => (this.exampleRef = exampleRef)} />;
  }
}
```



参考资料：https://jkchao.github.io/typescript-book-chinese/typings/discrominatedUnion.html#redux