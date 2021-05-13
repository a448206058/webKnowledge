## Writing Type-Safe Polymorphic React Components(Without Crashing TypeScript)
## 编写类型安全的多态react组件（不会导致typescript崩溃）

When designing a react component for reusability,you often need to be able to pass different DOM attributes to the component's container in different situations.Let's say you're building a <Button />.At first, you just need to allow a custom className to be merged in,but later, you need to support a wide range of attributes and event handlers that aren't related to the component itself,but rather the context in which it's used——say, aria-describedby when composed with a Tooltip component,or tabIndex and onKeyDown when contained in a component that manages focus with arrow keys.
在设计React组件以实现可重用性时，您通常需要能够在不同情况下将不同的DOM属性传递给组件的容器。假设您正在构建<Button />。刚开始时，您只需要允许className合并一个自定义项，但是随后，您需要支持与该组件本身无关，而是与它所使用的上下文无关的各种属性和事件处理程序。aria-describedby当与工具提示部件组成，或tabIndex与onKeyDown包含在管理焦点与箭头键的组分时。

It's impossible for Button to predict and to handle every special context where it might be used,so there's a reasonable argument for allowing arbitrary extra props to be passed to Button, and letting it pass extra ones it doesn't understand through.
Button无法预测和处理可能使用它的每个特殊上下文，因此有一个合理的论据允许将任意额外组件传递给Button，并让它传递它无法理解的额外组件。

```JavaScript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ColorName;
  icon?: IconName;
}

function Button({color, icon, className, children, ...props}: ButtonProps) {
  return (
    <button
      {...props}
      className={getClassName(color, className)}
    >
      <FlexContainer>
        {icon && <Icon name={icon} />}
        <div>{children}</div>
      </FlexContainer>
    </button>
  )
}
```

Awesome: we can now pass extra props to the underlying<button>element, and it's perfectly type-checked too.Since the props type extends React.ButtonHTMLAttributes,we can pass only props that are actually valid to end up on a <button>:
太棒了：我们现在可以将额外的props传递给基础<button>元素，并且它也经过了完美的类型检查.由于props类型可以扩展React.ButtonHTMLAttributes，因此我们只能传递实际上有效的props才能终止于a <button>：

```JavaScript
<Button onKeyDown={({currentTarget}) => { /* do something */ }}>
<Button foo="bar" /> // Correctly errors
```

### When passthrough isn't enough
### 当传值还不够时

Half an hour after you send Button v1 to the product engineering team, they come back to you with a question: how do we use Button as a react-router Link? How about as an HTMLAnchorElement, a link to an external site?The component you sent them only renders as an HTMLButtonElement.
在您将Button v1发送给产品工程团队后的半小时，他们会问您一个问题：我们如何将Button用作反应路由器链接？作为HTMLAnchorElement，如何链接到外部网站呢？您发送给他们的组件仅呈现为HTMLButtonElement。

If we weren't concerned about type safety, we could write this pretty easily in plain JavaScript:
如果我们不关心类型安全，则可以使用普通的JavaScript轻松编写此代码：
```JavaScript
function Button({
  color,
  icon,
  className,
  childre,
  tagName: TagName,
  ...props
}) {
  return (
    <TagName
      {...props}
      className={getClassName(color, className)}
    >
      <FlexContainer>
        {icon && <Icon name={icon} />}
        <div>{children}</div>
      </FlexContainer>
    </TagName>
  )
}
Button.defaultProps = {tagName: 'button'};
```
This makes it trivial for a consumer to use whatever tag or component they like as the container:
对于消费者来说，使用他们喜欢的标签或组件作为容器很简单：
```JavaScript
<Button tagName="a" href="https://github.com">GitHub</Button>
<Button tagName={Link} to="/about">About</Button>
```
But,how do we type this correctly?Button's props can no longer unconditionally extend React.ButtonHTMLAttributes, because the extra props might not be passed to a <button>.
但是，我们如何正确的处理类型？按钮的参数不能再无条件扩展React.ButtonHTMLAttributes，因为多余的参数可能不会传递给<button>

Fair warning: I’m going to go down a serious rabbit hole to explain several reasons why this doesn’t work well. If you’d rather just take my word for it, feel free to jump ahead to a better solution.
公平的警告：我将深入解释为什么这种方法无法正常工作的几个原因。如果你宁愿只相信我的话，随意向前跳转到一个更好的解决方案。

Let's start with a slightly simpler case where we only need to allow tagName to be 'a' or 'button'.(I'll also remove props and elements that aren't relevant to the point for brevity.)This would be a reasonable attempt:
让我们从一个稍微简单的情况开始（我还将删除与简洁性无关的props和元素）。这是一种合理的尝试：
```JavaScript
interface ButtonProps {
  tagName: 'a' | 'button';
}

function Button<P extends ButtonProps>({tagName: TagName, ...props}: P & JSX.IntrinsicElements[P['tagName']]){
  return <TagName {...props} />;
}

<Button tagName="a" href="/" />
```

N.B. To make sense of this, a basic knowledge of JSX.IntrinsicElements is required. Here’s a great deep dive on JSX in TypeScript by one of the maintainers of the React type definitions.
注意：要理解这一年，需要具备JSX.IntrinsicElements的基本知识。这是React类型定义的维护者之一深入探讨TypeScript中的JSX。

The two immediate observations that arise are
出现的俩个直接的观察结果是

1. It doesn’t compile—it tells us, in so many words, that the type of props.ref is not correct for the type of TagName.
1. 它不会编译，用很多字告诉我们的类型props.ref不正确TagName。

2. Despite that, it does kind of produce the results we want when tagName is inferred as a string literal type. We even get completions from AnchorHTMLAttributes:
2. 尽管如此，当将其推断为字符串文字类型时，它确实会产生我们想要的结果tagName。

However, a little more experimentation reveals that we’ve also effectively disabled excess property checking:
但是，更多的实验表明了我们还有效的禁用了多余的属性检查：
```JavaScript
<button href="/" fakeProp={1} /> // correct errors 👍
<Button tagName="button" href="/" fakeProp={1} /> // no errors 👎
```

Every prop you put on Button will be inferred as a property of the type parameter P, which in turn becomes part of the props that are allowed. In other words, the set of allowed props always includes all the props you pass. The moment you add a prop, it becomes part of the very definition of what Button’s props should be. (In fact, you can witness this by hovering Button in the example above.) This is decidedly the opposite of how you intend to define React components.
您放在Button上的每个prop都将被推断为type参数的属性，而type参数P又称为允许的prop的一部分。换句话说，允许的props始终包括您传入的所有props。添加prop后，它就称为button prop应该定义的一部分。（事实上，您可以通过Button在上面的实例中进行悬停来见证这一点。）这与您打算定义React组件的方式显然相反。

### what’s the problem with ref?
### 对于ref有什么问题吗？
If you’re not yet convinced to abandon this approach, or if you’re just curious why the above snippet doesn’t compile cleanly, let’s go deeper down the rabbit hole. And before you implement a clever workaround with Omit<typeof props, 'ref'>, spoiler alert: ref isn’t the only problem; it’s just the first problem. The rest of the problems are every event handler prop.1
如果您还没有被说服放弃这种想法，或者您只是好奇为什么上面的代码片段编译的不好，那就让我们深入研究一下。在您通过实施聪明的解决办法之前Omit<typeof props, 'ref'>，扰流板警告：ref不是唯一的问题；它不是唯一的问题。这知识第一个问题。其余的问题是每个事件处理程序的prop.

So what do ref and onCopy have in common? They both have the general form (param: T) => void where T mentions the instance type of the DOM element rendered: HTMLButtonElement for buttons and HTMLAnchorElement for anchors, for example. If you want to call a union of call signatures, you have to pass the intersection of their parameter types to ensure that regardless of which function gets called at runtime, it receives a subtype of what it expects for its parameter.2 Easier shown than said:
那么ref,onCopy有什么共同点呢？他们都具有通用形式（param: T）=> void,其中T提到了所呈现的DOM元素的实例类型：例如，用于HTMLButtonElement按钮和HTMLAnchorElement锚点。如果要调用签名的并集，则必须传递他们的参数类型的交际，以确保无论在运行时调用哪个函数，该函数都将接收对其参数期望的子类型。比说的容易：

```JavaScript
function addOneToA(obj: { a: number }) {
  obj.a++;
}
﻿
function addOneToB(obj: { b: number }) {
  obj.b++;
}
﻿
// Let’s say we have a function that could be either
// of the ones declared above
declare var fn: typeof addOneToA | typeof addOneToB;
﻿
// The function might access a property 'a' or 'b'
// of whatever we pass, so intuitively, the object
// needs to define both those properties.
fn({ a: 0 });
fn({ b: 0 });
fn({ a: 0, b: 0 });
```

In this example, it should be easy to recognize that we have to pass fn an object with the type { a: number, b: number }, which is the intersection of { a: number } and { b: number }. The same thing is happening with ref and all the event handlers:
在这个例子中，它应该很容易认识到，我们必须通过fn一个对象与该类型{ a: number, b: number }，也就是交点的{ a: number }和{ b: number }。ref所有事件处理程序都发生了相同的事情：

```JavaScript
type Props1 = JSX.IntrinsicElements['a' | 'button'];
﻿
// Simplifies to...
type Props2 =
  | JSX.IntrinsicElements['a']
  | JSX.IntrinsicElements['button'];
﻿
// Which means ref is...
type Ref =
  | JSX.IntrinsicElements['a']['ref']
  | JSX.IntrinsicElements['button']['ref'];
﻿
// Which is a union of functions!
declare var ref: Ref;
// (Let’s ignore string refs)
if (typeof ref === 'function') {
  // So it wants `HTMLButtonElement & HTMLAnchorElement`
  ref(new HTMLButtonElement());
  ref(new HTMLAnchorElement());
}
```

So now we can see why, rather than requiring the union of the parameter types, HTMLAnchorElement | HTMLButtonElement, ref requires the intersection: HTMLAnchorElement & HTMLButtonElement—a theoretically possible type, but not one that will occur in the wild of the DOM. And we know intuitively that if we have a React element that’s either an anchor or a button, the value passed to ref will be either be an HTMLAnchorElement or an HTMLButtonElement, so the function we provide for ref should accept an HTMLAnchorElement | HTMLButtonElement. Ergo, back to our original component, we can see that JSX.IntrinsicElements[P['tagName']] legitimately allows unsafe types for callbacks when P['tagName'] is a union, and that’s what the compiler is complaining about. The manifest example of an unsafe operation that could occur by ignoring this type error:
所以，现在我们可以看到，为什么，而不需要合并的参数类型，HTMLAnchorElement | HTMLButtonElement,ref需要交集：HTMLAnchorElement & HTMLButtonElement-a理论上是可能的类型，而不是一个会发生在DOM的处理。而且我们很直观地知道，如果我们有一个react元素，它是一个锚点或一个按钮，则传递给它的值ref将是一个HTMLAnchorElement或者HTMLButtonElement,因此我们提供的函数ref应该接受一个HTMLAnchorElement | HTMLButtonElement。Ergo，回到我们的原始组件，我们可以看到，JSX.IntrinsicElements[P['tagName']]当P['tagName']是一个并集时，合法地允许使用不安全的回调类型，而这正是编译器所抱怨的。通过忽略此类型错误可能发生的不安全操作的清单示例：
```JavaScript
<Button
  tagName={'button' as 'a' | 'button'}
  ref={(x: HTMLAnchorElement) => x.href.toLowerCase()}
/>
```

### writing a better type for props
### 写一个更好的类型 props
I think what makes this problem unintuitive is that you always expect tagName to instantiate as exactly one string literal type, not a union. And in that case, JSX.IntrinsicElements[P['tagName']] is sound. Nevertheless, inside the component function, TagName looks like a union, so the props need to be typed as an intersection. As it turns out, it this is possible, but it’s a bit of a hack. So much so, I’m not going even going to put UnionToIntersection down in writing here. Don’t try this at home:
我我认为导致此问题不直观的原因是，您始终希望tagName实例化为仅一种字符串文字类型，而不是实例化。在那种情况下，JSX.IntrinsicElements[P['tagName']]就是声音。不过，在组件函数内部，它TagName看起来像一个联合，因此需要将prop键入为相交。事实证明，这是有可能的，但这有点难。如此之多，我甚至不打算unionToIntersection在这里写下来。不要在家尝试：
```JavaScript
interface ButtonProps {
  tagName: 'a' | 'button';
}
﻿
function Button<P extends ButtonProps>({
  tagName: TagName,
  ...props
}: P & UnionToIntersection<JSX.IntrinsicElements[P['tagName']]>) {
  return <TagName {...props} />;
}
﻿
<Button tagName="button" type="foo" /> // Correct error! 🎉
```

How about when tagName is a union?
tagName联合类型。
```JavaScript
<Button
  tagName={'button' as 'a' | 'button'}
  ref={(x: HTMLAnchorElement) => x.href.toLowerCase()}
/>
```
Let’s not celebrate prematurely, though: we haven’t solved our effective lack of excess property checking, which is an unacceptable tradeoff.
但是，让我们不要过早地庆祝，我们还没有解决我们实际上没有进行过剩检查的问题，这是不可接收的折中方案。

getting excess property checking back
取回多余的类型检查

As we discovered earlier, the problem with excess property checking is that all of our props become part of the type parameter P. We need a type parameter in order to infer tagName as a string literal unit type instead of a large union, but maybe the rest of our props don’t need to be generic at all:
正如我们之前发现的那样，多余的属性检查的问题在于我们所有的prop都成为type参数的一部分。我们需要一个类型参数，以便将其推断tagName为字符串单位类型，而不是一个大的并集，但是也许我们的其它prop根本不需要泛型：

```JavaScript
interface ButtonProps<T extends 'a' | 'button'> {
  tagName: T;
}
﻿
function Button<T extends 'a' | 'button'>({
  tagName: TagName,
  ...props
}: ButtonProps<T> & UnionToIntersection<JSX.IntrinsicElements[T]>) {
  return <TagName {...props} />;
}
```

Uh-oh. What is this new and unusual error?
什么是新的异常错误？

It comes from the combination of the generic TagName and React’s definition for JSX.LibraryManagedAttributes as a distributive conditional type. TypeScript currently doesn’t allow anything to be assigned to conditional type whose “checked type” (the bit before the ?) is generic:
它来自通用TagName和React的JSX.LibraryManagedAttributes定义的组合。TypeScript当前不允许将任何东西分配给其“检查类型”是通用的条件类型：

```JavaScript
type AlwaysNumber<T> = T extends unknown ? number : number;
﻿
function fn<T>() {
  let x: AlwaysNumber<T> = 3;
}
```

Clearly, the declared type of x will always be number, and yet 3 isn’t assignable to it. What you’re seeing is a conservative simplification guarding against cases where distributivity might change the resulting type:
显然，声明类型x将始终为number,但3不能分配给它。您所看到的是一种保守的简化，可以防止分配可能更改结果类型的情况：

```JavaScript
// These types appear the same, since all `T` extend `unknown`...
type Keys<T> = keyof T;
type KeysConditional<T> = T extends unknown ? keyof T : never;
﻿
// They’re the same here...
type X1 = Keys<{ x: any, y: any }>;
type X2 = KeysConditional<{ x: any, y: any }>;
﻿
// But not here!
type Y1 = Keys<{ x: any } | { y: any }>;
type Y2 = KeysConditional<{ x: any } | { y: any }>;
```

Because of the distributivity demonstrated here, it’s often unsafe to assume anything about a generic conditional type before it’s instantiated.
由于此处演示了分布性，因此在实例化通用条件类型之前假设任何信息通常都是不安全的。

distributivity schmistributivity, i’m gonna make it work
分配schmistributivity，我要使它起作用

Ok, fine. Let’s say you work out a way around that assignability error, and you’re ready to replace 'a' | 'button' with all keyof JSX.IntrinsicElements.
好的。假设您想出一种解决该可分配性错误的方法，并且准备好用'a' | 'button'all替换它keyof JSX.IntrinsicElements。

```JavaScript
interface ButtonProps<T extends keyof JSX.IntrinsicElements> {
  tagName: T;
}

function Button<T extends keyof JSX.IntrinsicElements>){
  tagName: TagName,
  ...props
}: ButtonProps<T> & UnionToInTersection<JSX.IntrinsicElements[T]>) {
  // @ts-ignore
  return <TagName {...props}>
}

<Button tagName="a" href="/">
```

…and, congratulations, you’ve crashed TypeScript 3.4! The constraint type keyof JSX.IntrinsicElements is a union type of 173 keys, and the type checker will instantiate generics with their constraints to ensure all possible instantiations are safe. So that means ButtonProps<T> is a union of 173 object types, and, suffice it to say that UnionToIntersection<...> is one conditional type wrapped in another, one of which distributes into another union of 173 types upon which type inference is invoked. Long story short, you’ve just invented a button that cannot be reasoned about within Node’s default heap size. And we never even got around to supporting <Button tagName={Link} />!
恭喜，您使TypeScript 3.4崩溃了！约束类型keyof JSX.IntrinsicElements是173个键的并集类型，类型检查器将实例化泛型及其约束，以确保所有可能的实例化都是安全的。因此，这意味着ButtonProps<T>是173个对象类型的并集，足以说这UnionToIntersection<...>是一个包装在另一个条件类型中的条件类型，其中一个条件类型分布到另一种173个类型的并集上，在此类型并被调用。简而言之，您刚刚发明了一个按钮，无法在Node的默认堆大小范围内进行推理。而且我们甚至从来没有得到支持<Button tagName={Link} />！

TypeScript 3.5 does handle this without crashing by deferring a lot of the work that was happening to simplify conditional types, but do you really want to write components that are just waiting for the right moment to explode?
TypeScript 3.5确实通过延迟为简化条件类型而进行的大量工作来确保不会发生崩溃，但是您是否真的想编写只在等待正确时刻爆发的组件？

If you followed me this far down the rabbit hole, I’m duly impressed. I spent weeks getting here, and it only took you ten minutes!
如果您跟随我走到兔子洞的深处，我一定会留下深刻的印象。我花了数周时间来到这里，只花了十分钟！

### An alternative approach
### 另一种方法

As we go back to the drawing board, let’s refresh on what we’re actually trying to accomplish. Our Button component should:
回到绘图板上，让我们刷新一下我们实际要完成的工作。我们的Button组件应：

* be able to accept arbitrary props like onKeyDown and aria-describedby
* 能够接受任意prop，例如onKeyDown和aria-describedby
* be able to render as a button, an a with an href prop, or a Link with a to prop
* 能够渲染为button，a带有href道具或Link带有to prop
* ensure that the root element has all the props it requires, and none that it doesn’t support
* 确保根元素具有它需要的所有道具，并且没有它不支持的道具
* not crash TypeScript or bring your favorite code editor to a screeching halt
* 不会使TypeScript崩溃或使您喜欢的代码编辑器停顿下来

It turns out that we can accomplish all of these with a render prop. I propose naming it renderContainer and giving it a sensible default:
事实证明，我们可以使用渲染prop来完成所有这些工作。我建议命名它，renderContainer并给它一个明智的默认值：

```JavaScript
interface ButtonInjectedProps {
  className: string;
  children: JSX.Element;
}

interface ButtonProps {
  color?: ColorName;
  icon?: IconName;
  className?: string;
  renderContainer: (props: ButtonInjectedProps) => JSX.Element;
  children?: React.ReactChildren;
}

function Button({ color, icon, children, className, renderContainer }: ButtonProps) {
  return renderContainer({
    children: (
      <FlexContainer>
        {icon && <Icon name={icon} />}
        <div>{children}</div>
      </FlexContainer>
    ),
  });
}

const defaultProps: Pick<ButtonProps, 'renderContainer'> = {
  renderContainer: props => <button {...props} />
};

Button.defaultProps = defaultProps;
```

Let's try it out:
让我们尝试一下：
```JavaScript
// Basy defaults
// 简单的默认设置
<Button />

// Renders a Link, enforces `to` prop set
// 渲染链接，强制使用“ to”prop
<Button
  renderContainer={props => <Link {...props} to="/" />}
/>

// Renders an anchor, accepts `href` prop
// 渲染锚点，接受`href`道具
<Button
  renderContainer={props => <a {...props} href="/" />}
/>

// Renders a button with `aria-describedby`
// 渲染一个带有`aria- describeby`的按钮
<Button
  renderContainer={props =>
    <button {...props} aria-describedby="tooltip-1" />}
/>
```

We completely defused the type bomb by getting rid of the 173-constituent union keyof JSX.IntrinisicElements while simulataneously allowing even more flexibility,and it's perfectly type-safe.Mission accomplished.
我们通过消除173个组成部分的联合keyof JSX.IntrinsicElements而彻底消除了类型炸弹，同时还提供了更大的灵活性，并且它是完全类型安全的。任务完成

### The overwritten prop caveat
### 覆盖的prop警告
There’s a small cost to an API design like this. It’s fairly easy to make a mistake like this:
这样的API设计花费很少。犯这样的错误是很容易的：
```JavaScript
<Button
  color={ColorName.Blue}
  renderContainer={props =>
  <button {...props} calssName="my-custom-button" />}
/>
```

Oops.{...props} already included a className,which was needed to make the Button look nice and be blue,and here we've completely overwritten that class with my-custom-button.
哎呀。{...props}已经包含一个 className，它需要使Button看起来更漂亮并且呈蓝色，并且在这里我们已经用完全覆盖了该类my-custom-button。

On one hand, this provides the ultimate degree of customizability-the consumer has total control over what does and doesn't go onto the container,allowing for fine-grained customizations that weren't possible before.But on the other hand, you probably wanted to merge those classes 99% of the time,and it might not be obvious why it appears visually broken in this case.
一方面，这提供了最大程度的可定制性-消费者可以完全控制容器上的内容和不进行内容，从而可以实现以前不可能的细粒度定制。但是，另一方面，您可能希望99％的时间合并这些类，并且在这种情况下为什么看起来看起来很破损可能并不明显。

Depending on the complexity of the component, who your consumers are, and how solid your documentation is, this may or may not be a serious problem. When I started using patterns like this in my own work, I wrote a small utility to help with the ergonomics of merging injected and additional props:
根据组件的复杂性，您的使用者是谁以及文档的可靠性，这可能是严重的问题，也可能不是严重的问题。当我开始在自己的工作中使用这种模式时，我写了一个小实用程序来帮助人体工学结合注射和其他道具：

```JavaScript
<Button
  color={ColorName.Blue}
  renderContainer={props => 
    <button {...mergeProps(props,{
      className: 'my-custom-button',
      onKeyDown: () => console.log('keydown')
    })}>
  }
>
```

This ensures the class names are merged correctly, and if ButtonInjectedProps ever expands its definition to inject its own onKeyDown, both the injected one and the console-logging one provided here will be run.
这样可以确保正确地合并了类名，并且如果ButtonInjectedProps扩展了其定义以注入自己的类名，onKeyDown则将运行此处提供的注入类和控制台记录类。

1. You can discover this, if you want, by going into the React typings and commenting out the ref property. The compiler error will remain, substituting onCopy where it previously said ref.
1. 你可以发现这一点，如果你想，通过进入阵营分型和注释掉的ref属性。编译器错误将保留，替换onCopy为先前所说的地方ref。

2. I attempt to explain this relationship intuitively, but it arises from the fact that parameters are contravariant positions within function signatures. There are several good explanations of this topic.
2. 我试图解释直观这种关系，但它产生于一个事实，即参数是逆变函数签名中的位置。关于此主题有一些很好的 解释

参考资料：https://blog.andrewbran.ch/polymorphic-react-components/