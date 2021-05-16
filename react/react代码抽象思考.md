## When to break up a component into multiple components

## 何时将一个组件分解为多个组件

At what point does it make sense to break a single component into multiple components?
在什么情况下，将单个组件分解为多个组件是有意义的？

Current Available Translations:
当前可用翻译：

Korean

Did you know that you could write any React Application as a single React Component?There's absolutely nothing technically stopping React from putting you entire application into one giant component.Your function would be HUGE.There'd be a TON of hooks for state and side-effects. but it's totally possible.
您知道可以将任何 React 应用程序作为单个 React 组件编写吗?从技术上讲，没有什么能阻止 React 将整个应用程序放到一个巨大的组件中.会有很多关于状态和副作用的问题。但这完全有可能。

If you tried this though you'd face a few problems:
如果你试着这样做，你会面临一些问题：

1. Performace would probably suffer:Every state change results in a re-render of the entire application.
1. 性能可能会产生问题：每个状态值的改变都会导致应用的重新渲染

1. Code sharing/reusability would be... not easy.At least if you made it a class component, which you might have to do if you wanted to use componentDidCatch to handle runtime errors.If you were allowed to use react-error-boundary so you could use hooks,then it would be considerably easier.But... I digress...
1. 代码的分享/可重用不是那么容易，至少如果您使它成为一个类组件，如果您想使用 componentDidCatch 来处理运行时错误，就必须这样做。如果允许您使用 react error boundary 以便可以使用钩子，那么这将非常容易。。。

1. State would be a challenge:Knowing which pieces of state and event handlers went with what parts of JSX would make your head hurt and lead to some hard to track down bugs (This is one benefit of the separation of concerns).
1. 状态值是一个改变的：知道一些状态和事件处理程序与 JSX 的哪些部分相关，这些部分会让您头痛，并导致一些难以追踪的 bug。（这是分离关注点的一个好处）。

1. Testing would be 100% integration: Not necessarily an altogether bad thing,but it would be pretty tough to test edge cases and keep things isolated to the parts that you're trying to test,so you would suffer big-time from over-tesing (which is a common mistake in E2E testing).
1. 测试将是 100%集成: 这不一定是坏事，但要测试边缘用例并将它们与您要测试的部分隔离开来是相当困难的，因此您将遭受过度测试（这是 E2E 测试中常见的错误）的巨大痛苦。

1. Working together on the codebase with multiple engineers would just be terrible.Can you imagine the git diffs and merge conflicts?!
1. 与多个工程师一起在代码库上工作会很槽糕。你能想象 git 的差异和合并冲突吗？！

1. Using third party component libraries would be... ummm... impossible?If we're writing everything as single component third party libraries is at odds with that goal! And even if we allowed using third party components,what about HOCs like react-emotion?Not allowed!(Besides, you should use the css prop anyway).
1. 使用第三方组件库将是。。。嗯。。。不可能的？如果我们把所有东西都写成单个组件，那么第三方库就与这个目标不符了！即使我们允许使用第三方组件，HOC 像反应情绪呢？不允许(此外，您应该使用 css 道具）。

1. Encapsulating impreative abstractions/APIs in a more declarative component API wouldn't be allowed either meaning that the imperative API would be littered throughout the lifecycle hooks of our one giant component,leading to harder to follow code.(Again, unless you're using hooks,in which case you could group relevant hooks together, making it easier to manage,but still a bit of a nightmare).
1. 在一个更具声明性的组件 API 中封装抽象/API 是不被允许的，这意味着命令式 API 将在我们的一个巨大组件的整个生命周期钩子中被丢弃，导致更难遵循的代码。（再说一次，除非您使用的是钩子，否则您可以将相关的钩子组合在一起，这样更易于管理，但仍然有点像噩梦）。

These are the reasons that we write custom components.It allows us to solve these problems.
这就是我们编写自定义组件的原因，它允许我们解决这些问题。

I've had a question on my AMA for a while:Best ways/patterns to split app into components.And this is my answer:"When you experience one of the problems above,that's when you break your component into multiple smaller components.NOT BEFORE."Breaking a sinle component into multiple components is what's called "abstraction." Abstraction is awesome,but every abstraction comes with a cost,and you have to be aware of that cost and the benefits before you take the plunge
我有一个关于我 AMA 的问题好长时间了：将应用拆分为组件的最好的方法。我的回答是：“当你遇到上述问题时，就是把你的组件分解成多个更小的组件，而不是以前。把一个单一的组件分解成多个组件就是所谓的“抽象”。抽象是很棒的，但是每一个抽象都有成本，你必须在冒险之前意识到成本和收益

> "Duplication is far cheaper than the wrong abstraction." — Sandi Metz.
> “复制比错误的抽象要便宜得多。”—Sandi Metz。

So I don't mind if the JSX I return in my component function gets really long.Remember that JSX is just a bunch of JavaScript expressions using the declarative APIs given by components.Not a whole lot can go wrong with code like that and it's much easier to keep that codes as it is than breaking out things into a bunch of smaller components and start Prop Drilling everywhere.
所以我不介意在我的组件函数中返回的 JSX 是否很长.请记住，JSX 只是一堆 JavaScript 表达式，使用组件提供的声明性 api.这样的代码并不是很多都会出错，保持代码的原样要比把东西分解成一堆更小的组件，然后到处钻钻来钻去容易得多。

### Conclusion

### 结论

So feel free to break up your components into smaller ones, but don't be afraid of a growing component until you start experiencing real problems.It's WAY easier to maintain it until it needs to be broken up than maintain a pre-mature abstraction.Good luck!
因此，可以随意将组件分解为更小的组件，但在遇到实际问题之前，不要害怕不断增长的组件。在需要分解之前维护它比维护一个预成熟的抽象要容易得多。祝你好运！

## State Colocation will make your React app faster

## 状态托管将使你的应用程序反应更快

How state colocation makes your app not only more maintainable but also faster.
状态托管如何使应用程序不仅更易于维护，而且速度更快。

Watch "Lifting and colocating React State" on egghead.io(part of The Beginner's Guide to ReactJS).
观看 egghead.io（ReactJS 初学者指南的一部分）上的“提升和定位 React 状态”。

Current Avaliable Translations:
当前可用翻译：

- Korean
- Russian

One of the leading causes to slow React applications is global state,especially the rapidly changing variety.Allow me to illustrate my point with a super contrived example,then I'll give you a slightly more realistic example so you can determine how it can be more practically applicable in your own app.
导致应用程序反应缓慢的主要原因之一是全局状态，特别是快速变化的多样性。让我用一个超级设计的例子来说明我的观点，然后我将给你一个稍微更现实的例子，这样你就可以确定它如何更实际地应用于你自己的应用程序。

Here's the code for that
这就是代码

```JavaScript
function sleep(time) {
  const done = Date.now() + time
  while (done > Date.now()) {
    // sleep ...
  }
}

// imagine that this slow component is actually slow because it's rendering a
// lot of data (for example).
function SlowComponent({time, onChange}) {
  sleep(time)
  return (
    <div>
      Wow, that was{' '}
      <input
        value={time}
        type="number"
        onChange={e => onChange(Number(e.target.value))} />
        ms slow
    </div>
  )
}

function DogName({time, dog, onChange}) {
  return (
    <div>
      <label htmlFor="dog">Dog Name</label>
      <br />
      <input id="dog" value={dog} onChange={e => onChange(e.target.value)} />
      <p>{dog ? `${dog}'s favorite number is ${time}.` : 'enter a dog name'}</p>
    </div>
  )
}

function App() {
  // this is "global state"
  const [dog, setDog] = React.useState('')
  const [time, setTime] = React.useState(200)
  return (
    <div>
      <DogName time={time} dog={dog} onChange={setDog} />
      <SlowComponent time={time} onChange={setTime} />
    </div>
  )
}
```

Play around that for a second and you'll notice a significant performance problem when you interact with either field. There are various things that we can do to improve the performance of both the DogName and SlowComponent components on their own. We could pull out the rendering bailout escape hatches like React.memo and apply that all over our codebase where we have slow renders. But I'd like to propose an alternative solution.
在这一点上玩一秒钟，当您与任何一个字段交互时，您都会注意到一个严重的性能问题。我们可以做很多事情来提高 DogName 和 SlowComponent 组件本身的性能。我们可以拉出像 React.memo 这样的渲染接口，并将其应用到我们的代码库中，在那里我们有缓慢的渲染。但我想提出一个替代方案。

If you haven't already read Colocation, then I suggest you give that a read. Knowing that colocation can improve the maintenance of our application, let's try colocating some state. Observe that the time state is used by every component in the App, which is why it was lifted to the App. However the dog state is only used by one component, so let's move that state to be colocated (updated lines are highlighted):
如果你还没有读过知道，那么我建议你读一读。知道了托管可以改进应用程序的维护，让我们尝试托管一些状态。请注意，时间状态由应用程序中的每个组件使用，这就是它被提升到应用程序的原因。但是，dog 状态只由一个组件使用，所以让我们将该状态移到同一位置（突出显示更新的行）：

```JavaScript
function DogName({time}) {
  const [dog, setDog] = React.useState('')
  return (
    <div>
      <label htmlFor="dog">Dog Name</label>
      <br />
      <input id="dog" value={dog} onChange={e => setDog(e.target.value)} />
      <p>{dog ? `${dog}'s favorite number is ${time}.` : 'enter a dog name'}</p>
    </div>
  )
}

function App() {
  // this is "global state"
  const [time, setTime] = React.useState(200)
  return (
    <div>
      <DogName time={time} />
      <SlowComponent time={time} onChange={setTime} />
    </div>
  )
}
```

And here's the result:
结果如下：

Wow! Typing in the dog name input is WAY better now. And what's more, the component's easier to maintain thanks to colocation. But how did it get faster?
哇！现在输入狗名更好了.更重要的是，组件更容易维护多亏了共定位。但是它是怎么变得更快的呢？

I've heard it said that the best way to make something fast is to do less stuff. That's exactly what's going on here. When we manage the state higher up in the React component tree, every update to that state results in an invalidation of the entire React tree. React doesn't know what's changed, so it has to go and check all the components to determine whether they need DOM updates. That process is not free (especially when you have arbitrarily slow components). But if you move your state further down the React tree as we did with the dog state and the DogName component, then React has less to check. It doesn't even bother calling our SlowComponent because it knows that there's no way that could have changed output because it can't reference the changed state anyway.
我听人说过，做得快的最好方法就是少做一些事情.这正是这里发生的事情.当我们管理 React 组件树中较高的状态时，对该状态的每次更新都会导致整个 React 树失效。React 不知道发生了什么变化，所以它必须检查所有组件以确定它们是否需要 DOM 更新.这个过程不是免费的（特别是当你有任意慢的组件时）.但是，如果您将您的状态在 React 树中进一步向下移动，就像我们对 dog 状态和 DogName 组件所做的那样，那么 React 需要检查的内容就更少了.它甚至不需要调用我们的 SlowComponent，因为它知道不可能更改输出，因为它无论如何都不能引用更改的状态。

In short, before, when we changed the dog name, every component had to be checked for changes (re-rendered). After, only the DogName component needed to be checked. This resulted in a big performance win! Sweet!
简而言之，在我们更改 dog 名称之前，必须检查每个组件的更改（重新呈现）.之后，只需要检查 DogName 组件。这导致了一场大的性能胜利！太好了！

### Real World

### 真实世界

Where I see this principle apply in real-world applications is when people put things into a global Redux store or in a global context that don't really need to be global. Inputs like the DogName in the example above are often the places where this perf issue manifests itself, but I've also seen it happen plenty on mouse interactions as well (like showing a tooltip over a graph or table of data).
我认为这一原则适用于现实世界的应用程序是当人们把东西放到一个全局 Redux 或一个不需要全局的全局上下文中时。像上面例子中的 DogName 这样的输入常常是这个 perf 问题表现出来的地方，但是我也看到它在鼠标交互上发生过很多次（比如在图形或数据表上显示工具提示）。

Often the solution that people try for this kind of problem is to "debounce" the user interaction (ie wait for the user to stop typing before applying the state update). This is sometimes the best we can do, but it definitely leads to a sub-optimal user experience (React's upcoming concurrent mode should make this less necessary in the future. Watch this demo from Dan about it).
通常，人们试图解决这类问题的方法是“解除”用户交互（即等待用户在应用状态更新之前停止键入）这有时是我们能做的最好的，但它肯定会导致一个次优化的用户体验（React 即将到来的并发模式应该使这在未来变得不那么必要）。观看丹的演示）

Another solution people try is to apply one of React's rendering bailout escape hatches like React.memo. This works pretty well in our contrived example because it allows React to skip re-rendering our SlowComponent, but in a more practical scenario, you often suffer from "death by a thousand cuts" which means that there's not really a single place that's slow, so you wind up applying React.memo everywhere. And when you do that, you have to start using useMemo and useCallback everywhere as well (otherwise you undo all the work you put into React.memo). Each of these optimizations together may solve the problem, but it drastically increases the complexity of your application's code and it actually is less effective at solving the problem than colocating state because React does still need to run through every component from the top to determine whether it should re-render. You'll definitely be running more code with this approach, there's no way around that.
人们尝试的另一个解决方案是使用 React 的一个渲染缓存，如 React.memo。在我们的设计示例中，这一点非常有效，因为它允许反应跳过重新呈现慢组件，但在更实际的场景中，您常常会遭受“千次削减死亡”，这意味着没有一个地方会很慢，所以您最后会到处应用 React.memo。这些优化结合在一起可能会解决问题，但它会大大增加应用程序代码的复杂度，而且实际上它在解决问题方面不如合并状态有效，因为 React 仍然需要从顶部遍历每个组件以确定是否应该重新呈现。你肯定会用这种方法运行更多的代码，这是没有办法的。

If you'd like to play around with a slightly less contrived example, give this codesandbox a look.
如果你想玩一个稍微不那么做作的例子，看看这个代码。

### What is colocated state?

### 什么是并置状态？

The principle of colocation is:
合并的原理是：

> Place code as close to where it's relevant as possible
> 将代码放置在尽可能靠近其相关的位置

So, to accomplish this, we had our dog state inside the DogName component:
因此，为了实现这一点，我们在 DogName 组件中设置了 dog 状态:

```JavaScript
function DogName({time}) {
  const [dog, setDog] = React.useState('')
  return (
    <div>
      <label htmlFor="dog">Dog Name</label>
      <br />
      <input id="dog" value={dog} onChange={e => setDog(e.target.value)} />
      <p>{dog ? `${dog}'s favorite number is ${time}.` : 'enter a dog name'}</p>
    </div>
  )
}
```

But what happens when we break that up? Where does that state go? The answer is the same: "as close to where it's relevant as possible." That would be the closest common parent. As an example, let's break the DogName component up so the input and the p show up in different components:
但当我们分开的时候会发生什么？那个状态去哪了？答案是一样的：“尽可能接近相关的地方。”这将是最接近的共同父母。作为一个例子，让我们将 DogName 组件分解，使输入和 p 显示在不同的组件中：

```JavaScript
function DogName({time}) {
  const [dog, setDog] = React.useState('')
  return (
    <div>
      <DogInput dog={dog} onChange={setDog} />
      <DogFavoriteNumberDisplay time={time} dog={dog} />
    </div>
  )
}
function DogInput({dog, onChange}) {
  return (
    <>
      <label htmlFor="dog">Dog Name</label>
      <br />
      <input id="dog" value={dog} onChange={e => onChange(e.target.value)} />
    </>
  )
}
function DogFavoriteNumberDisplay({time, dog}) {
  return (
    <p>{dog ? `${dog}'s favorite number is ${time}.` : 'enter a dog name'}</p>
  )
}
```

In this case we can't move the state to the DogInput component, because the DogFavoriteNumberDisplay needs access to that state, so we navigate up the tree until we find the least common parent of these two components and that's where the state is managed.
在本例中，我们无法将状态移动到 DogInput 组件，因为 dogFavoriteMounterDisplay 需要访问该状态，因此我们在树上导航，直到找到这两个组件中最不常见的父级，并且这就是管理状态的地方。

And this applies just as well as if your state needs to be accessed in dozens of components on a specific screen of your application. You can even put it into context to avoid prop drilling if you want. But keep that context value provider as close to where it's relevant as possible and you'll still benefit from the performance (and maintenance) characteristics of colocation. By this I mean that while some of your context providers could be rendered at the top of your application's React tree, they don't all have to be there. You can put them wherever they make the most sense.
这同样适用于需要在应用程序特定屏幕上的几十个组件中访问您的状态的情况。如果你想的话，你甚至可以把它放到上下文中去避免。但是，让上下文值提供者尽可能接近它的相关位置，您仍然可以从托管的性能（和维护）特性中获益。我的意思是，虽然您的一些上下文提供者可以呈现在应用程序的 React 树的顶部，但它们不一定都在那里。你可以把它们放在最有意义的地方。

This is the essence of what my Application State Management with React blog post is all about. Keep your state as close to where it's used as possible, and you'll benefit from a maintenance perspective and a performance perspective. From there, the only performance concerns you should have is the occasional especially complex UI interaction.
这就是 React 博客文章的应用程序状态管理的精髓所在。使您的状态尽可能接近其使用位置，您将从维护角度和性能角度获益。从这里开始，您应该考虑的唯一性能问题就是偶尔出现的特别复杂的 UI 交互。

### What about context or Redux?

### 上下文或 Redux 呢？

If you read "One simple trick to optimize React re-renders," then you know that you can make it so only components that actually use the changing state will be updated. So that can side step this issue. While this is true, people do still have performance problems with Redux. If it's not React itself, what is it? The problem is that React-Redux expects you to follow guidelines to avoid unnecessary renders of connected components, and it can be easy to accidentally set up components that render too often when other global state changes. The impact of that becomes worse and worse as your app grows larger, especially if you're putting too much state into Redux.
如果您阅读了“优化 React 重新渲染的一个简单技巧”，那么您就知道您可以使其只更新实际使用更改状态的组件。这样就可以回避这个问题。虽然这是真的，但人们仍然存在 Redux 的性能问题。如果它自己没有反应，那是什么？问题是 React-Redux 希望您遵循指导原则，以避免对连接的组件进行不必要的渲染，并且在其他全局状态更改时，很容易意外地设置渲染过于频繁的组件。随着应用程序的规模越来越大，这一影响越来越严重，尤其是如果您将太多的状态放入 Redux 中。

Fortunately, there are things you can do to help reduce the impact of these performance issues, like using memoized Reselect selectors to optimize mapState functions, and the Redux docs have additional info on improving performance of Redux apps.
幸运的是，您可以做一些事情来帮助减少这些性能问题的影响，比如使用记忆的重选选择器来优化 mapState 函数，Redux 文档提供了关于改进 Redux 应用程序性能的更多信息。

I also want to note that you can definitely apply colocation with Redux to get these benefits as well. Just limit what you store in Redux to be actual global state and colocate everything else and you're golden. The Redux FAQ has some rules of thumb to help decide whether state should go in Redux, or stay in a component.
我还想指出的是，您完全可以使用 Redux 来获得这些好处。只要把你在 Redux 中存储的东西限制为实际的全局状态，并将其他所有东西合并，你就是黄金。Redux FAQ 有一些经验法则来帮助决定状态是应该放在 Redux 中，还是留在组件中。

In addition, if you separate your state by domain (by having multiple domain-specific contexts), then the problem is less pronounced as well.
此外，如果您按域（通过具有多个特定于域的上下文）分隔状态，那么问题也就不那么明显了。

But the fact remains that if you colocate your state, you don't have these problems and maintenance is improved.
但事实上，如果你将你的状态合并，你就不会有这些问题，维护也会得到改善。

### So how do you decide where to put state?

### 那你怎么决定把状态放在哪里呢？

Chart perfected by Stephan Meijer
Here's that written out (for screen readers and friends):
以下是写出来的（给屏幕读者和朋友）：

1 Start building an app. Go to 2

1. 开始构建应用程序。转到 2
   2 useState. Go to 3
2. useState 3
   3 used by only this component?
   3 仅由此组件使用？
   Yes: Go to 4
   No: used by only one child?
   Yes: Colocate state. Go to 3
   No: used by a sibling/parent?
   Yes: Lift state. Go to 3
   No: Go to 4
   4 Leave it. Go to 5
   5 having a "prop drilling" problem?
   Yes: Can child function outside of parent?
   Yes: Move State to Context Provider. Go to 6
   No: Use Component Composition. Go to 6
   No: Go to 6
   6 Ship the app. As requirements change, Go to 1
   It's important that this is something you do as part of your regular refactoring/app maintenance process. This is because lifting state up is a requirement of getting this working so it happens naturally, but your app will "work" whether you colocate your state or not, so being intentional about thinking through this is important to keep your app manageable and fast.
   重要的是，这是作为常规重构/应用程序维护过程的一部分所做的事情。这是因为提升状态是让它正常工作的一个要求，所以它自然发生，但是你的应用程序将“工作”无论你是否与你的状态保持一致，所以有意识地思考这一点对于保持你的应用程序的可管理性和快速性是很重要的。

If you want to learn a bit more about that component composition step, read about that in One React mistake that's slowing you down.
如果你想了解更多关于组件组成步骤的知识，请阅读一个会让你慢下来的 React 错误。

### Conclusion

### 合并

In general, I think people are pretty good at "lifting state" as things change, but we don't often think to "colocate" state as things change in our codebase. So my challenge to you is to look through your codebase and look for opportunities to colocate state. Ask yourself "do I really need the modal's status (open/closed) state to be in Redux?" (the answer is probably "no"). Colocate your state and you'll find yourself with a faster, simpler codebase. Good luck!
一般来说，我认为人们很擅长随着事情的变化而“提升状态”，但我们并不经常认为随着代码库中的事情发生变化，会出现“冒号”状态。所以我对你的挑战是通过代码库来寻找机会来对 colocate 状态。问问自己“我真的需要模态的状态（打开/关闭）状态处于 REUX 中吗？”（答案可能是“否”）。用代码对状态进行编码，您会发现自己拥有更快、更简单的代码库。祝你好运!

## Don't Sync State. Derive It!

## 不同步状态。推导出来！

How to avoid state synchronization bugs and complexity with derived state.
如何使用派生状态避免状态同步错误和复杂性。

In my Learn React Hooks workshop material, we have an exercise where we build a tic-tac-toe game using React's useState hook (based on the official React tutorial). Here's the finished version of that exercise:
在我的学习 React Hooks 工作坊材料中，我们有一个练习，我们使用 React 的 useState hook（基于官方 React 教程）构建了一个 tic-tac-toe 游戏。以下是该练习的完成版本：

We have a few variables of state. There's a squares state variable via React.useState. There's also nextValue, winner, and status are each determined by calling the functions calculateNextValue, calculateWinner, and calculateStatus. squares is regular component state, but nextValue, winner, and status are what are called "derived state." That means that their value can be derived (or calculated) based on other values rather than managed on their own.
我们有一些状态变量。通过 React.useState 有一个状态变量。还有 nextValue、winner 和 status，它们都是通过调用 calculateNextValue、calculateWinner 和 calculateStatus 函数来确定的。方块是规则的组件状态，但 nextValue、winner 和 status 是所谓的“派生状态”。这意味着它们的值基于其他值而不是自己管理。

There's a good reason that I wrote it the way I did. Let's find out the benefits of derived state over state synchronization by reimplementing this with a more naive approach. The fact is that all four variables are technically state so you may automatically think that you need to use useState or useReducer for them.
我这样写是有充分理由的。让我们用一种更简单的方法重新实现派生状态，从而找出派生状态优于状态同步的好处。事实上，这四个变量在技术上都是 state，因此您可能会自动认为需要使用 useState 或 useReducer 来实现它们。

Let's start with useState:
让我们从 useState 开始：

```JavaScript
function Board() {
  const [squares, setSquares] = React.useState(Array(9).fill(null))
  const [nextValue, setNextValue] = React.useState(calculateNextValue(squares))
  const [winner, setWinner] = React.useState(calculateNextValue(squares))
  const [status, setStatus] = React.useState(calculateStatus(squares))

  function selectSquare(square) {
    if (winner || squares[square]) {
      return
    }
    const squaresCopy = [...squares]
    squaresCopy[square] = nextValue
    const newNextValue = calculateNextValue(squaresCopy)
    const newWinner = calculateWinner(squaresCopy)
    const newStatus = calculateStatus(newWinner, squaresCopy, newNextValue)
    setSquares(squaresCopy)
    setNextValue(newNextValue)
    setWinner(newWinner)
    setStatus(newStatus)
  }
}
```

So that's not all that bad.Where it becomes a real problem is what if we added a feature to our tic-tac-toe game where you could select two squares at once?What would we have to do to make that happen?
所以也没那么糟。真正的问题是，如果我们在 tic-tac-toe 游戏中添加了一个功能，你可以一次选择两个方块，我们要怎么做才能实现呢？

```JavaScript
function Board() {
  const [squares, setSquares] = React.useState(Array(9).fill(null))
  const [nextValue, setNextValue] = React.useState(calculateNextValue(squares))
  const [winner, setWinner] = React.useState(calculateWinner(squares))
  const [status, setStatus] = React.useState(calculateStatus(squares))

  function selectSquare(square) {
    if (winner || squares[square]) {
      return
    }
    const squaresCopy = [...squares]
    squaresCopu[square] = nextValue

    const newNextValue = calculateNextValue(squaresCopy)
    const newWinner = calculateWinner(squaresCopy)
    const newStatus = calculateStatus(newWinner, squaresCopy, newNextValue)
    setSquares(squaresCopy)
    setNextValue(newNextValue)
    setWinner(newWinner)
    setStatus(newStatus)
  }

  function selectTwoSquares(square1, square2) {
    if (winner || squares[square1] || squares[square2]) {
      return
    }
    const squaresCopy = [...squares]
    squaresCopy[square1] = nextValue
    squaresCopy[square2] = nextValue

    const newNextValue = calculateNextValue(squaresCopy)
    const newWinner = calculateWinner(squaresCopy)
    const newStatus = calculateStatus(newWinner, squaresCopy, newNextValue)
    setSquares(squaresCopy)
    setNextValue(newNextValue)
    setWinner(newWinner)
    setStatus(newStatus)
  }

  // return beautiful JSX
}
```

The biggest problem with this is some of that state may fall out of sync with the true component state (squares). It could fall out of sync because we forget to update it for a complex sequence of interactions for example. If you've been building React apps for a while, you know what I'm talking about. It's no fun to have things fall out of sync.
最大的问题是一些状态可能与真实的组件状态不同步（正方形）。它可能会失去同步，因为我们忘记了为一系列复杂的交互更新它。如果你已经开发 React 应用程序一段时间了，你知道我在说什么。事情不同步是没有意思的。

One thing that can help is to reduce duplication so that all relevant state updates happen in one place:
有一件事可以帮助您减少重复，以便所有相关的状态更新都发生在一个地方：

```JavaScript
function Board() {
  const [squares, setSquares] = React.useState(Array(9).fill(null))
  const [nextValue, setNextValue] = React.useState(calculateNextValue(squares))
  const [winner, setWinner] = React.useState(calculateWinner(squares))
  const [status, setStatus] = React.useState(calculateStatus(squares))
  function setNewState(newSquares) {
    const newNextValue = calculateNextValue(newSquares)
    const newWinner = calculateWinner(newSquares)
    const newStatus = calculateStatus(newWinner, newSquares, newNextValue)
    setSquares(newSquares)
    setNextValue(newNextValue)
    setWinner(newWinner)
    setStatus(newStatus)
  }
  function selectSquare(square) {
    if (winner || squares[square]) {
      return
    }
    const squaresCopy = [...squares]
    squaresCopy[square] = nextValue
    setNewState(squaresCopy)
  }
  function selectTwoSquares(square1, square2) {
    if (winner || squares[square1] || squares[square2]) {
      return
    }
    const squaresCopy = [...squares]
    squaresCopy[square1] = nextValue
    squaresCopy[square2] = nextValue
    setNewState(squaresCopy)
  }
  // return beautiful JSX
}

```

That's really improved our code duplication, and it wasn't that big of a deal honestly. But this is a pretty simple example. Sometimes the derived state is based on multiple variables of state that are updated in different situations and we need to make sure that all our state is updated whenever the source state is updated.
这确实改善了我们的代码复制，说实话也没什么大不了的。但这是一个非常简单的例子。有时，派生状态基于在不同情况下更新的多个状态变量，我们需要确保在源状态更新时更新所有状态。

### The solution

### 解决方案

What if I told you there's something better? If you've already read through the codesandbox implementation above, you know what that solution is, but let's put it right here now:
如果我告诉你有更好的？如果您已经阅读了上面的 codesandbox 实现，您就知道该解决方案是什么，但现在我们就把它放在这里：

```JavaScript
function Board() {
  const [squares, setSquares] = React.useState(Array(9).fill(null))
  const nextValue = calculateNextValue(squares)
  const winner = calculateWinner(squares)
  const status = calculateStatus(winner, squares, nextValue)
  function selectSquare(square) {
    if (winner || squares[square]) {
      return
    }
    const squaresCopy = [...squares]
    squaresCopy[square] = nextValue
    setSquares(squaresCopy)
  }
  // return beautiful JSX
}
```

Nice! We don't need to worry about updating the derived state values because they're simply calculated every render. Cool. Let's add that two squares at a time feature:
很好！我们不需要担心更新派生的状态值，因为它们只是在每次渲染时计算出来的。很酷。让我们一次加上两个正方形：

```JavaScript
function Board() {
  const [squares, setSquares] = React.useState(Array(9).fill(null))
  const nextValue = calculateNextValue(squares)
  const winner = calculateWinner(squares)
  const status = calculateStatus(winner, squares, nextValue)
  function selectSquare(square) {
    if (winner || squares[square]) {
      return
    }
    const squaresCopy = [...squares]
    squaresCopy[square] = nextValue
    setSquares(squaresCopy)
  }
  function selectTwoSquares(square1, square2) {
    if (winner || squares[square1] || squares[square2]) {
      return
    }
    const squaresCopy = [...squares]
    squaresCopy[square1] = nextValue
    squaresCopy[square2] = nextValue
    setSquares(squaresCopy)
  }
  // return beautiful JSX
}
```

Sweet! Before we had to concern ourselves with every single time we updated the squares state to ensure we updated all of the other state properly as well. But now we don't need to worry about it at all. It just works. No need for a fancy function to handle updating all the derived state. We just calculate it on the fly.
太好了！在此之前，我们必须关注每一次更新方块状态，以确保我们也正确地更新了所有其他状态。但现在我们完全不用担心了。它只是工作。不需要一个花哨的函数来处理所有派生状态的更新。我们只是快速计算。

### What about useReducer?

### useReducer 呢？

useReducer doesn't suffer as badly from these problems. Here's how I might implement this using useReducer:
useReducer 不会因为这些问题而受到严重的影响。下面是我如何使用 useReducer 实现这一点：

```JavaScript
function calculateDerivedState(squares) {
  const winner = calculateWinner(squares)
  const nextValue = calculateNextValue(squares)
  const status = calculateStatus(winner, squares, nextValue)
  return {squares, nextValue, winner, status}
}
function ticTacToeReducer(state, square) {
  if (state.winner || state.squares[square]) {
    // no state change needed.
    // (returning the same object allows React to bail out of a re-render)
    return state
  }
  const squaresCopy = [...state.squares]
  squaresCopy[square] = state.nextValue
  return {...calculateDerivedState(squaresCopy), squares: squaresCopy}
}
function Board() {
  const [{squares, status}, selectSquare] = React.useReducer(
    ticTacToeReducer,
    Array(9).fill(null),
    calculateDerivedState,
  )
  // return beautiful JSX
}
```

This isn't the only way to do this, but the point here is that while we do still "derive" state for winner, nextValue, and status, we're managing all of that within the reducer which is the only place state updates can happen, so falling out of sync is less likely.
这不是唯一的方法，但这里的重点是，虽然我们仍然“派生”winner、nextValue 和 status 的状态，但我们在 reducer 中管理所有这些，reducer 是唯一可以进行状态更新的地方，因此不同步的可能性较小。

That said, I find this to be a little more complex than our other solution (especially if we want to add that "two squares at a time" feature). So if I were building and shipping this in a production app, I'd go with what I've got in that codesandbox.
也就是说，我发现这比我们的其他解决方案要复杂一些（特别是如果我们想添加“一次两个正方形”的特性）。所以，如果我在生产应用程序中构建和发布这个，我会使用代码沙盒中的内容。

### Derived state via props

### 通过 prop 导出的状态

State doesn't have to be managed internally to suffer from the state synchronization problems. What if we had the squares state coming from a parent component? How would we synchronize that state?
状态不必在内部进行管理，否则会出现状态同步问题。如果正方形的状态来自父组件呢？我们如何同步那个状态？

```JavaScript
function Board({squares, onSelectSquare}) {
  const [nextValue, setNextValue] = React.useState(calculateNextValue(squares))
  const [winner, setWinner] = React.useState(calculateWinner(squares))
  const [status, setStatus] = React.useState(calculateStatus(squares))
  // ... hmmm... we're no longer managing updating the squares state, so how
  // do we keep these variables up to date? useEffect? useLayoutEffect?
  // React.useEffect(() => {
  //   setNextValue... etc... eh...
  // }, [squares])
  //
  // Just call the state updaters when squares change
  // right in the render method?
  // if (prevSquares !== squares) {
  //   setNextValue... etc... ugh...
  // }
  //
  // I've seen people do all of these things... And none of them are great.
  // return beautiful JSX
}
```

The better way to do this is just to calculate it on the fly:
更好的方法是动态计算：

```JavaScript
function Board({squares, onSelectSquare}) {
  const nextValue = calculateNextValue(squares)
  const winner = calculateWinner(squares)
  const status = calculateStatus(squares)
  // return beautiful JSX
}
```

It's way simpler, and it works really well.
简单多了，而且效果很好。

P.S. Remember getDerivedStateFromProps? Well you probably don't need it but if you do and you want to do so with hooks, then calling the state updater function during render is actually the correct way to do it. Learn more from the React Hooks FAQ.
另外，还记得从 prop 中获得的状态吗？你可能不需要它，但是如果你需要并且你想用钩子，那么在渲染过程中调用 state updater 函数实际上是正确的方法。从 React Hooks FAQ 了解更多信息。

### What about performance?

### 表现如何？

I know you've been waiting for me to address this... Here's the deal. JavaScript is really fast. I ran a benchmark on the calculateWinner function and this resulted in 15 MILLION operations per second. So unless your tic-tac-toe players are extremely fast at clicking around, there's no way this is going to be a performance problem (and even if they could play that fast, I assure you that you'll have other performance problems that will be lower hanging fruit for you).
我知道你一直在等我解决这个问题。。。就这么定了。JavaScript 非常快。我在 calculateWinner 函数上运行了一个基准测试，结果是每秒有 1500 万次操作。所以除非你的 tic-tac-toe 玩家的点击速度非常快，否则这不可能是一个性能问题（即使他们玩得那么快，我向你保证，你也会有其他性能问题，这些问题对你来说是比较棘手的）

> Ok ok, I tried it on my phone and only got 4.3 million operations per second. And then I tried with a CPU 6x slowdown on my laptop and only got 2 million... I think we're still good.
> 好吧，我在手机上试过了，每秒只有 430 万次。然后我试着在我的笔记本电脑上用 6 倍的 CPU 减速，只得到了 200 万。。。我觉得我们还不错。

That said, if you do happen to have a function which is computationally expensive, then that's what useMemo is for!
这就是说，如果你碰巧有一个函数是计算昂贵的，那么这就是 usemememo 的用途！

```JavaScript
function Board() {
  const [squares, setSquares] = React.useState(Array(9).fill(null))
  const nextValue = React.useMemo(() => calculateNextValue(squares), [squares])
  const winner = React.useMemo(() => calculateWinner(squares), [squares])
  const status = React.useMemo(
    () => calculateStatus(winner, squares, nextValue),
    [winner, squares, nextValue],
  )
  // return beautiful JSX
}

```

So there you go. An escape hatch for you to use once you've determined that some code is actually computationally expensive for your users to run. Note that this doesn't magically make those functions run faster. All it does is ensure that they're not called unnecessarily. If this were our whole app, the only way for the app to re-render is if squares changes in which case all of those functions will be run anyway, so we've actually not accomplished much with this "optimization." That's why I say: "Measure first!"
好了，就这样。一旦您确定某些代码对于您的用户来说在计算上是非常昂贵的，您就可以使用一个转义舱口。请注意，这并不能神奇地使这些函数运行得更快。它所做的就是确保它们不会被不必要地调用。如果这是我们的整个应用程序，应用程序重新呈现的唯一方法是如果方块发生变化，那么所有这些函数都将运行，所以我们实际上没有完成太多的“优化”。这就是为什么我说：“首先测量！”

> Learn more about useMemo and useCallback
> 了解有关 useMemo 和 useCallback 的更多信息

Oh, and I'd like to mention that derived state can sometimes be even faster than state synchronization because it will result in fewer unnecessary re-renders, which can be a problem sometimes.
哦，我想提一下，派生状态有时甚至比状态同步更快，因为它会减少不必要的重新呈现，这有时可能是个问题。

### What about MobX/Reselect?

### MobX/Reselect 呢？

Reselect (which you should absolutely be using if you're using Redux) has memoization built-in which is cool. MobX has this as well, but they also take it a step further with "computed values" which is basically an API to give you memoized and optimized derived state values. What makes it even better than what we already have is that the computation is only processed when it's accessed.
Reselect（如果您使用 Redux，那么您绝对应该使用它）具有内置的 memorization，这很酷。MobX 也有这一点，但是他们还进一步使用了“计算值”，这基本上是一个 API，可以为您提供记忆和优化的派生状态值。使它比我们已有的更好的是，只有在访问时才处理计算。

For (contrived) example:
例如（人为的）：

```JavaScript
function FavoriteNumber() {
  const [name, setName] = React.useState('')
  const [number, setNumber] = React.useState(0)
  const numberWarning = getNumberWarning(number)
  return (
    <div>
      <label>
        Your name: <input onChange={e => setName(e.target.value)} />
      </label>
      <label>
        Your favorite number:{' '}
        <input
          type="number"
          onChange={e => setNumber(Number(e.target.value))}
        />
      </label>
      <div>
        {name
          ? `${name}'s favorite number is ${number}`
          : 'Please type your name'}
      </div>
      <div>{number > 10 ? numberWarning : null}</div>
      <div>{number < 0 ? numberWarning : null}</div>
    </div>
  )
}

```

Notice that we're calling getNumberWarning, but we're only using the result if the number is too high or too low, so we may not actually need to call that function at all. Now, it's unlikely this is problematic, but let's say for the sake of argument that calling getNumberWarning is an application bottleneck. This is where the computed values feature comes in handy.
注意，我们调用的是 getNumberWarning，但我们只在数字过高或过低时才使用结果，因此实际上可能根本不需要调用该函数。现在，这不太可能有问题，但是为了论证调用 getNumberWarning 是一个应用程序瓶颈。这就是计算值功能派上用场的地方。

If you're experiencing this a lot in your app, then I suggest you just jump into using MobX (MobX folks will tell you there are a lot of other reasons to use it as well), but we can solve this specific situation pretty easily ourselves:
如果你在应用程序中经常遇到这种情况，那么我建议你直接使用 MobX（MobX 的人会告诉你使用它还有很多其他原因），但是我们自己可以很容易地解决这种情况：

```JavaScript
function FavoriteNumber() {
  const [name, setName] = React.useState('')
  const [number, setNumber] = React.useState(0)
  const numberIsTooHigh = number > 10
  const numberIsTooLow = number < 0
  const numberWarning =
    numberIsTooHigh || numberIsTooLow ? getNumberWarning(number) : null
  return (
    <div>
      <label>
        Your name: <input onChange={e => setName(e.target.value)} />
      </label>
      <label>
        Your favorite number:{' '}
        <input
          type="number"
          onChange={e => setNumber(Number(e.target.value))}
        />
      </label>
      <div>
        {name
          ? `${name}'s favorite number is ${number}`
          : 'Please type your name'}
      </div>
      <div>{numberIsTooHigh ? numberWarning : null}</div>
      <div>{numberIsTooLow ? numberWarning : null}</div>
    </div>
  )
}
```

Great! Now we don't need to worry about calling numberWarning when it's not needed. But if that doesn't work well for your situation, then we could make a custom hook do this magic for us. It's not exactly simple and it's a bit of a hack (there's probably a better way to do it honestly), so I'm just going to put this in a codesandbox and let you explore it if you want:
太好了！现在我们不必担心在不需要的时候打电话给 numberWarning。但如果这对你的情况不起作用，那么我们可以做一个定制的钩子为我们做这个魔术。这并不简单，而且有点像黑客（可能有更好的方法诚实地做到这一点），所以我将把它放在一个代码沙盒中，让你探索它，如果你想：

It's sufficient to say that the custom hook allows us to do this:
可以说定制挂钩允许我们这样做：

```JavaScript
function FavoriteNumber() {
  const [name, setName] = React.useState('')
  const [number, setNumber] = React.useState(0)
  const numberWarning = useComputedValue(() => getNumberWarning(number), [
    number,
  ])
  return (
    <div>
      <label>
        Your name: <input onChange={e => setName(e.target.value)} />
      </label>
      <label>
        Your favorite number:{' '}
        <input
          type="number"
          onChange={e => setNumber(Number(e.target.value))}
        />
      </label>
      <div>
        {name
          ? `${name}'s favorite number is ${number}`
          : 'Please type your name'}
      </div>
      <div>{number > 10 ? numberWarning.result : null}</div>
      <div>{number < 0 ? numberWarning.result : null}</div>
    </div>
  )
}

```

And our getNumberWarning function is only called when the result is actually used. Think of it like a useMemo that only runs the callback when the return value is rendered.
我们的 getNumberWarning 函数只有在实际使用结果时才被调用。把它想象成只在呈现返回值时运行回调的 usemememo。

I think there may be room to perfect and open source that. Feel free to do so and then make a PR to this blog post to add a link to your published package 😉
我认为可能还有完善和开源的空间。请随意这样做，然后做一个公关这篇博客文章添加一个链接到您发布的软件包 😉

Again, there's really not much reason to worry yourself over this kind of thing in a normal scenario. But if you do have perf bottlenecks around and useMemo isn't enough for you, then consider doing something like this or use MobX.
再说一次，在正常情况下，你真的没有太多理由为这种事情担心。但是如果您确实存在性能瓶颈，并且 useMemo 对您来说还不够，那么可以考虑这样做或使用 MobX。

### Conclusion

### 结论

Ok, so we got a little distracted overthinking performance for a second there. The fact is that you can really simplify your app's state by considering whether the state needs to be managed by itself or if it can be derived. We learned that derived state can be the result of a single variable of state, or it can be derived from multiple variables of state (some of which can also be derived state itself).
好吧，我们有点分心过度思考的表现。事实上，通过考虑应用程序的状态是否需要自己管理或是否可以派生，您可以真正简化应用程序的状态。我们了解到，派生状态可以是单个状态变量的结果，也可以是多个状态变量的结果（其中一些也可以是派生状态本身）。

So next time you're maintaining the state of your app and trying to figure out a synchronization bug, think about how you could make it derived on the fly instead. And in the few instances you bump into performance issues you can reach to a few optimization strategies to help alleviate some of that pain. Good luck!
所以，下次当你维护应用程序的状态并试图找出一个同步错误时，想想如何让它在运行中派生出来。在少数情况下，您会遇到性能问题，您可以使用一些优化策略来帮助减轻这些痛苦。祝你好运！

## The State Reducer Pattern with React Hooks

## 带 React 钩子的状态还原模式

A pattern for you to use in custom hooks to enhance the power and flexibility of your hooks.
供您在自定义钩子中使用的模式，以增强钩子的能力和灵活性。

### Some History

### 一些历史

A while ago, I developed a new pattern for enhancing your React components called the state reducer pattern. I used it in downshift to enable an awesome API for people who wanted to make changes to how downshift updates state internally.
不久前，我开发了一个新的模式来增强 React 组件，称为 state reducer 模式。我在 downshift 中使用了它，为那些想要改变 downshift 内部更新状态的人提供了一个很棒的 API。

> If you're unfamiliar with downshift, just know that it's an "enhanced input" component that allows you to build things like accessible autocomplete/typeahead/dropdown components. It's important to know that it manages the following items of state: isOpen, selectedItem, highlightedIndex, and inputValue.
> 如果您不熟悉降档，只需知道它是一个“增强的输入”组件，允许您构建诸如可访问的自动完成/typeahead/dropdown 组件之类的东西.重要的是要知道它管理以下状态项：isOpen、selectedItem、highlightedIndex 和 inputValue。

Downshift is currently implemented as a render prop component, because at the time, render props was the best way to make a "Headless UI Component" (typically implemented via a "render prop" API) which made it possible for you to share logic without being opinionated about the UI. This is the major reason that downshift is so successful.
Downshift 目前是作为 render prop 组件实现的，因为在当时，render props 是制作“Headless UI 组件”（通常通过“render prop”API 实现）的最佳方式，这使得您可以共享逻辑而不必对 UI 固执己见。这是降档如此成功的主要原因。

Today however, we have React Hooks and hooks are way better at doing this than render props. So I thought I'd give you all an update of how this pattern transfers over to this new API the React team has given us. (Note: Downshift has plans to implement a hook)
然而，今天我们有了 React 钩子，钩子比渲染 prop 做得更好。所以我想我应该给大家一个关于这个模式如何转换到 React 团队给我们的这个新 API 的更新。（注：降档计划使用挂钩）

As a reminder, the benefit of the state reducer pattern is in the fact that it allows "inversion of control" which is basically a mechanism for the author of the API to allow the user of the API to control how things work internally. For an example-based talk about this, I strongly recommend you give my React Rally 2018 talk a watch:
提醒一下，state reducer 模式的好处在于它允许“控制反转”，这基本上是 API 作者允许 API 用户控制内部工作方式的一种机制。关于这一点，我强烈建议您给我的 React Rally 2018 演讲看一看：

> Read also on my blog: "Inversion of Control"
> 在我的博客上也读到：“控制反转”

So in the downshift example, I had made the decision that when an end user selects an item, the isOpen should be set to false (and the menu should be closed). Someone was building a multi-select with downshift and wanted to keep the menu open after the user selects an item in the menu (so they can continue to select more).
因此，在降档示例中，我决定当最终用户选择一个项目时，应将 isOpen 设置为 false（并且应关闭菜单）。有人正在构建一个带有降档的多选择菜单，并希望在用户选择菜单中的某个项目后保持菜单打开（以便他们可以继续选择更多）。

By inverting control of state updates with the state reducer pattern, I was able to enable their use case as well as any other use case people could possibly want when they want to change how downshift operates internally. Inversion of control is an enabling computer science principle and the state reducer pattern is an awesome implementation of that idea that translates even better to hooks than it did to regular components.
通过使用 state reducer 模式反转状态更新的控制，我能够启用他们的用例，以及当他们想要改变降档操作的内部方式时人们可能想要的任何其他用例。控制反转是一个使能的计算机科学原理，状态约简模式是这个思想的一个令人敬畏的实现，它对钩子的转化甚至比对常规组件的转化更好。

### Using a State Reducer with Hooks

### 用一个 state reducer 钩子

Ok, so the concept goes like this:
好吧，这个概念是这样的：

1. End user does an action
1. 最终用户执行操作
1. Dev calls dispatch
1. 开发人员呼叫调度
1. Hook determines the necessary changes
1. 钩子决定了必要的改变
1. Hook calls dev's code for further changes 👈 this is the inversion of control part
1. Hook 调用 dev 的代码进行进一步的更改 👈 这是控制部分的反转
1. Hook makes the state changes
   WARNING: Contrived example ahead: To keep things simple, I'm going to use a simple useToggle hook and component as a starting point. It'll feel contrived, but I don't want you to get distracted by a complicated example as I teach you how to use this pattern with hooks. Just know that this pattern works best when it's applied to complex hooks and components (like downshift).
1. 钩子使状态改变。警告：前面的人为示例：为了保持简单，我将使用一个简单的 usetokle 钩子和组件作为起点。这会让人觉得做作，但我不想让你被一个复杂的例子分心，因为我教你如何使用这个模式与钩子。只需知道，这种模式适用于复杂的挂钩和组件（如降档）时效果最佳。

```JavaScript
function useToggle() {
  const [on, setOnState] = React.useState(false)

  const toggle = () => setOnState(o => !o)
  const setOn = () => setOnState(true)
  const setOff = () => setOnState(false)

  return {on, toggle, setOn, setOff}
}

function Toggle() {
  const {on, toggle, setOn, setOff} = useToggle()

  return (
    <div>
      <button onClick={setOff}>Switch Off</button>
      <button onClick={setOn}>Switch On</button>
      <Switch on={on} onClick={toggle} />
    </div>
  )
}

function App() {
  return <Toggle />
}

ReactDOM.render(<App />, document.getElementById('root'))
```

Now, let's say we wanted to adjust the <Toggle /> component so the user couldn't click the <Switch /> more than 4 times in a row unless they click a "Reset" button:
现在，假设我们想调整<Toggle/>组件，以便用户不能连续单击<Switch/>超过 4 次，除非他们单击“Reset”按钮：

```JavaScript
function Toggle() {
  const [clicksSinceReset, setClicksSinceReset] = React.useStata(0)
  const tooManyClicks = clicksSinceReset >= 4

  const {on, toggle, setOn, setOff} = useToggle()

  function handleClick() {
    toggle()
    setClicksSinceReset(count => count + 1)
  }

  return (
    <div>
      <button onClick={setOff}>Switch Off</button>
      <button onClick={setOn}>Switch On</button>
      <Switch on={on} onClick={handleClick} />
      {tooManyClicks ? (
        <button onClick={() => setClicksSinceReset(0)}>Reset</button>
      ): null}
    </div>
  )
}
```

Cool, so an easy solution to this problem would be to add an if statement in the handleClick function and not call toggle if tooManyClicks is true, but let's keep going for the purposes of this example.
很酷，所以解决这个问题的一个简单方法是在 handleClick 函数中添加一个 if 语句，如果 tooManyClicks 为 true，则不调用 toggle，但是为了这个示例的目的，让我们继续。

How could we change the useToggle hook, to invert control in this situation? Let's think about the API first, then the implementation second. As a user, it'd be cool if I could hook into every state update before it actually happens and modify it, like so:
在这种情况下，我们如何改变 usetokle 钩子来反转控件？让我们先考虑 API，然后再考虑实现。作为一个用户，如果我能在每一个状态更新真正发生之前就将其挂接并进行修改，那就太酷了，就像这样：

```JavaScript
function Toggle() {
  const [clicksSinceReset, setClicksSinceReset] = React.useState(0)
  const tooManyClicks = clicksSinceReset >= 4

  const {on, toggle, setOn, setOff} = useToggle({
    modifyStateChange(currentState, changes) {
      if (tooManyClicks) {
        // other changes are fine, but on needs to be unchanged
        return {...changes, on: currentState.on}
      } else {
        // the changes are fine
        return changes
      }
    },
  })

  function handleClick() {
    toggle()
    setClicksSinceReset(count => count + 1)
  }

  return (
    <div>
      <button onClick={setOff}>Switch Off</button>
      <button onClick={setOn}>Switch On</button>
      <Switch on={on} onClick={handleClick} />
      {tooManyClicks ? (
        <button onClick={() => setClicksSinceReset(0)}>Reset</button>
      ): null}
    </div>
  )
}

```

So that's great, except it prevents changes from happening when people click the "Switch Off" or "Switch On" buttons, and we only want to prevent the <Switch /> from toggling the state.
所以这很好，除了它可以防止人们点击“关闭”或“打开”按钮时发生变化，我们只想防止<Switch/>切换状态。

Hmmm... What if we change modifyStateChange to be called reducer and it accepts an action as the second argument? Then the action could have a type that determines what type of change is happening, and we could get the changes from the toggleReducer which would be exported by our useToggle hook. We'll just say that the type for clicking the switch is TOGGLE.
如果我们将 modifyStateChange 改为 reducer，并且它接受一个操作作为第二个参数呢？然后动作可以有一个类型来确定发生了什么类型的更改，我们可以从 toggleReducer 中获取更改，该更改将由 usetokle 钩子导出。我们只能说点击开关的类型是 TOGGLE。

```JavaScript
function Toggle() {
  const [clicksSinceReset, setClicksSinceReset] = React.useState(0)
  const tooManyClicks = clicksSinceReset >= 4
  const {on, toggle, setOn, setOff} = useToggle({
    reducer(currentState, action) {
      const changes = toggleReducer(currentState, action)
      if (tooManyClicks && action.type === 'TOGGLE') {
        // other changes are fine, but on needs to be unchanged
        return {...changes, on: currentState.on}
      } else {
        // the changes are fine
        return changes
      }
    },
  })
  function handleClick() {
    toggle()
    setClicksSinceReset(count => count + 1)
  }
  return (
    <div>
      <button onClick={setOff}>Switch Off</button>
      <button onClick={setOn}>Switch On</button>
      <Switch on={on} onClick={handleClick} />
      {tooManyClicks ? (
        <button onClick={() => setClicksSinceReset(0)}>Reset</button>
      ) : null}
    </div>
  )
}
```

Nice! This gives us all kinds of control. One last thing, let's not bother with the string 'TOGGLE' for the type. Instead we'll have an object of all the change types that people can reference instead. This'll help avoid typos and improve editor autocompletion (for folks not using TypeScript):
很好！这给了我们各种各样的控制。最后一件事，让我们不用为类型的字符串'TOGGLE'操心。取而代之的是，我们将有一个对象，它包含了人们可以引用的所有更改类型。这将有助于避免打字错误并改进编辑器的自动完成（对于不使用 TypeScript 的用户）：

```JavaScript
function Toggle() {
  const [clicksSinceReset, setClicksSinceReset] = React.useState(0)
  const tooManyClicks = clicksSinceReset >= 4
  const {on, toggle, setOn, setOff} = useToggle({
    reducer(currentState, action) {
      const changes = toggleReducer(currenState, action)
      if (tooManyClicks && action.type === actionTypes.toggle) {
        // other changes are fine, but on needs to be unchanged
        return {...changes, on: currentState.on}
      } else {
        // the changes are fine
        return changes
      }
    },
  })
  function handleClick() {
    toggle()
    setClicksSinceReset(count => count + 1)
  }
  return (
    <div>
      <button onClick={setOff}>Switch Off</button>
      <button onClick={setOn}>Switch On</button>
      <Switch on={on} onClick={handleClick} />
      {tooManyClicks ? (
        <button onClick={() => setClicksSinceReset(0)}>Reset</button>
      ) : null}
    </div>
  )
}

```

### Implementing a State Reducer with Hooks

### 用钩子实现状态约简

Alright, I'm happy with the API we're exposing here. Let's take a look at how we could implement this with our useToggle hook. In case you forgot, here's the code for that:
好吧，我对我们在这里展示的 API 很满意。让我们看看如何用 useToggle 钩子实现这个功能。万一你忘了，下面是代码：

```JavaScript
function useToggle() {
  const [on, setOnState] = React.useState(false)
  const toggle = () => setOnState(o => !o)
  const setOn = () => setOnState(true)
  const setOff = () => setOnState(false)
  return {on, toggle, setOn, setOff}
}
```

We could add logic to every one of these helper functions, but I'm just going to skip ahead and tell you that this would be really annoying, even in this simple hook. Instead, we're going to rewrite this from useState to useReducer and that'll make our implementation a LOT easier:
我们可以为每一个 helper 函数添加逻辑，但我只想跳到前面，告诉您，即使在这个简单的钩子中，这也会非常烦人。相反，我们将把它从 useState 重写为 useReducer，这将使我们的实现更加容易：

```JavaScript
function toggleReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE': {
      return {on: !state.on}
    }
    case 'ON': {
      return {on: true}
    }
    case 'OFF': {
      return {on: false}
    }
    default: {
      throw new Error(`Unhandled type: ${action.type}`)
    }
  }
}
function useToggle() {
  const [{on}, dispatch] = React.useReducer(toggleReducer, {on: false})
  const toggle = () => dispatch({type: 'TOGGLE'})
  const setOn = () => dispatch({type: 'ON'})
  const setOff = () => dispatch({type: 'OFF'})
  return {on, toggle, setOn, setOff}
}
```

Ok, cool. Really quick, let's add that types property to our useToggle to avoid the strings thing. And we'll export that so users of our hook can reference them:
很酷。很快，让我们将 types 属性添加到 usethoggle 中，以避免使用字符串。我们将导出它，以便钩子的用户可以引用它们：

```JavaScript
const actionTypes = {
  toggle: 'TOGGLE',
  on: 'ON',
  off: 'OFF',
}
function toggleReducer(state, action) {
  switch (action.type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.on: {
      return {on: true}
    }
    case actionTypes.off: {
      return {on: false}
    }
    default: {
      throw new Error(`Unhandled type: ${action.type}`)
    }
  }
}
function useToggle() {
  const [{on}, dispatch] = React.useReducer(toggleReducer, {on: false})
  const toggle = () => dispatch({type: actionTypes.toggle})
  const setOn = () => dispatch({type: actionTypes.on})
  const setOff = () => dispatch({type: actionTypes.off})
  return {on, toggle, setOn, setOff}
}
export {useToggle, actionTypes}

```

Cool, so now, users are going to pass reducer as a configuration object to our useToggle function, so let's accept that:
很酷，所以现在，用户将把 reducer 作为配置对象传递给我们的 useTokle 函数，所以让我们接受以下事实：

```JavaScript
function useToggle({reducer}) {
  const [{on}, dispatch] = React.useReducer(toggleReducer, {on: false})
  const toggle = () => dispatch({type: actionTypes.toggle})
  const setOn = () => dispatch({type: actionTypes.on})
  const setOff = () => dispatch({type: actionTypes.off})
  return {on, toggle, setOn, setOff}
}
```

Great, so now that we have the developer's reducer, how do we combine that with our reducer? Well, if we're truly going to invert control for the user of our hook, we don't want to call our own reducer. Instead, let's expose our own reducer and they can use it themselves if they want to, so let's export it, and then we'll use the reducer they give us instead of our own:
太好了，既然我们有了开发者的 reducer，我们如何将它与 reducer 结合起来呢？好吧，如果我们真的要反转钩子用户的控制，我们不想调用我们自己的 reducer。相反，让我们展示我们自己的 reducer，如果他们愿意，他们可以自己使用，所以让我们导出它，然后我们将使用他们给我们的 reducer，而不是我们自己的 reducer：

```JavaScript
function useToggle({reducer}) {
  const [{on}, dispatch] = React.useReducer(reducer, {on: false})
  const toggle = () => dispatch({type: actionTypes.toggle})
  const setOn = () => dispatch({type: actionTypes.on})
  const setOff = () => dispatch({type: actionTypes.off})
  return {on, toggle, setOn, setOff}
}
export {useToggle, actionTypes, toggleReducer}
```

Great, but now everyone using our component has to provide a reducer which is not really what we want. We want to enable inversion of control for people who do want control, but for the more common case, they shouldn't have to do anything special, so let's add some defaults:
太好了，但是现在每个使用我们组件的人都必须提供一个不是我们真正想要的 recuer。我们希望为确实需要控制的人启用控制反转，但对于更常见的情况，他们不必做任何特殊的操作，因此让我们添加一些默认值：

```JavaScript
function useToggle({reducer = toggleReducer} = {}) {
  const [{on}, dispatch] = React.useReducer(reducer, {on: false})
  const toggle = () => dispatch({type: actionTypes.toggle})
  const setOn = () => dispatch({type: actionTypes.on})
  const setOff = () => dispatch({type: actionTypes.off})
  return {on, toggle, setOn, setOff}
}
export {useToggle, actionTypes, toggleReducer}
```

Sweet, so now people can use our useToggle hook with their own reducer or they can use it with the built-in one. Either way works just as well.
甜蜜，所以现在人们可以使用我们的 UseTokle 钩与他们自己的 reducer 或他们可以使用它与内置的一个。任何一种方法都同样有效。

### Conclusion

### 结论

Here's the final version:
这是最终的版本：

```JavaScript
import * as React from 'react'
import ReactDOM from 'react-dom'
import Switch from './switch'
const actionTypes = {
  toggle: 'TOGGLE',
  on: 'ON',
  off: 'OFF',
}
function toggleReducer(state, action) {
  switch (action.type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.on: {
      return {on: true}
    }
    case actionTypes.off: {
      return {on: false}
    }
    default: {
      throw new Error(`Unhandled type: ${action.type}`)
    }
  }
}
function useToggle({reducer = toggleReducer} = {}) {
  const [{on}, dispatch] = React.useReducer(reducer, {on: false})
  const toggle = () => dispatch({type: actionTypes.toggle})
  const setOn = () => dispatch({type: actionTypes.on})
  const setOff = () => dispatch({type: actionTypes.off})
  return {on, toggle, setOn, setOff}
}
// export {useToggle, actionTypes, toggleReducer}
function Toggle() {
  const [clicksSinceReset, setClicksSinceReset] = React.useState(0)
  const tooManyClicks = clicksSinceReset >= 4
  const {on, toggle, setOn, setOff} = useToggle({
    reducer(currentState, action) {
      const changes = toggleReducer(currentState, action)
      if (tooManyClicks && action.type === actionTypes.toggle) {
        // other changes are fine, but on needs to be unchanged
        return {...changes, on: currentState.on}
      } else {
        // the changes are fine
        return changes
      }
    },
  })
  return (
    <div>
      <button onClick={setOff}>Switch Off</button>
      <button onClick={setOn}>Switch On</button>
      <Switch
        onClick={() => {
          toggle()
          setClicksSinceReset(count => count + 1)
        }}
        on={on}
      />
      {tooManyClicks ? (
        <button onClick={() => setClicksSinceReset(0)}>Reset</button>
      ) : null}
    </div>
  )
}
function App() {
  return <Toggle />
}
ReactDOM.render(<App />, document.getElementById('root'))
```

And here it is running in a codesandbox:
Remember, what we've done here is enable users to hook into every state update of our reducer to make changes to it. This makes our hook WAY more flexible, but it also means that the way we update state is now part of the API and if we make changes to how that happens, then it could be a breaking change for users. It's totally worth the trade-off for complex hooks/components, but it's just good to keep that in mind.
它在一个代码沙盒中运行：
请记住，我们在这里所做的是使用户能够挂接到我们的 reducer 的每个状态更新中对其进行更改。这使得我们的钩子方式更加灵活，但这也意味着我们更新状态的方式现在是 API 的一部分，如果我们对如何进行更改，那么对用户来说可能是一个突破性的更改。对于复杂的钩子/组件来说，这是完全值得权衡的，但是记住这一点是很好的。

I hope you find patterns like this useful. Thanks to useReducer, this pattern just kinda falls out (thank you React!). So give it a try on your codebase!
我希望你觉得这样的模式很有用。多亏了 useReducer，这种模式才有点过时（谢谢你！）。所以在你的代码库上试试吧！

Good luck!
好运！
