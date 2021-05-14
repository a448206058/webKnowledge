## When to break up a component into multiple components
## 何时将一个组件分解为多个组件

At what point does it make sense to break a single component into multiple components?
在什么情况下，将单个组件分解为多个组件是有意义的？

Current Available Translations:
当前可用翻译：

Korean

Did you know that you could write any React Application as a single React Component?There's absolutely nothing technically stopping React from putting you entire application into one giant component.Your function would be HUGE.There'd be a TON of hooks for state and side-effects. but it's totally possible.
您知道可以将任何React应用程序作为单个React组件编写吗?从技术上讲，没有什么能阻止React将整个应用程序放到一个巨大的组件中.会有很多关于状态和副作用的问题。但这完全有可能。

If you tried this though you'd face a few problems:
如果你试着这样做，你会面临一些问题：

1. Performace would probably suffer:Every state change results in a re-render of the entire application.
1. 性能可能会产生问题：每个状态值的改变都会导致应用的重新渲染

2. Code sharing/reusability would be... not easy.At least if you made it a class component, which you might have to do if you wanted to use componentDidCatch to handle runtime errors.If you were allowed to use react-error-boundary so you could use hooks,then it would be considerably easier.But... I digress...
2. 代码的分享/可重用不是那么容易，至少如果您使它成为一个类组件，如果您想使用componentDidCatch来处理运行时错误，就必须这样做。如果允许您使用react error boundary以便可以使用钩子，那么这将非常容易。。。

3. State would be a challenge:Knowing which pieces of state and event handlers went with what parts of JSX would make your head hurt and lead to some hard to track down bugs (This is one benefit of the separation of concerns).
3. 状态值是一个改变的：知道一些状态和事件处理程序与JSX的哪些部分相关，这些部分会让您头痛，并导致一些难以追踪的bug。（这是分离关注点的一个好处）。

4. Testing would be 100% integration: Not necessarily an altogether bad thing,but it would be pretty tough to test edge cases and keep things isolated to the parts that you're trying to test,so you would suffer big-time from over-tesing (which is a common mistake in E2E testing).
4. 测试将是100%集成: 这不一定是坏事，但要测试边缘用例并将它们与您要测试的部分隔离开来是相当困难的，因此您将遭受过度测试（这是E2E测试中常见的错误）的巨大痛苦。

5. Working together on the codebase with multiple engineers would just be terrible.Can you imagine the git diffs and merge conflicts?!
5. 与多个工程师一起在代码库上工作会很槽糕。你能想象git的差异和合并冲突吗？！

6. Using third party component libraries would be... ummm... impossible?If we're writing everything as single component third party libraries is at odds with that goal! And even if we allowed using third party components,what about HOCs like react-emotion?Not allowed!(Besides, you should use the css prop anyway).
6. 使用第三方组件库将是。。。嗯。。。不可能的？如果我们把所有东西都写成单个组件，那么第三方库就与这个目标不符了！即使我们允许使用第三方组件，HOC像反应情绪呢？不允许(此外，您应该使用css道具）。

7. Encapsulating impreative abstractions/APIs in a more declarative component API wouldn't be allowed either meaning that the imperative API would be littered throughout the lifecycle hooks of our one giant component,leading to harder to follow code.(Again, unless you're using hooks,in which case you could group relevant hooks together, making it easier to manage,but still a bit of a nightmare).
7. 在一个更具声明性的组件API中封装抽象/API是不被允许的，这意味着命令式API将在我们的一个巨大组件的整个生命周期钩子中被丢弃，导致更难遵循的代码。（再说一次，除非您使用的是钩子，否则您可以将相关的钩子组合在一起，这样更易于管理，但仍然有点像噩梦）。

These are the reasons that we write custom components.It allows us to solve these problems.
这就是我们编写自定义组件的原因，它允许我们解决这些问题。

I've had a question on my AMA for a while:Best ways/patterns to split app into components.And this is my answer:"When you experience one of the problems above,that's when you break your component into multiple smaller components.NOT BEFORE."Breaking a sinle component into multiple components is what's called "abstraction." Abstraction is awesome,but every abstraction comes with a cost,and you have to be aware of that cost and the benefits before you take the plunge
我有一个关于我AMA的问题好长时间了：将应用拆分为组件的最好的方法。我的回答是：“当你遇到上述问题时，就是把你的组件分解成多个更小的组件，而不是以前。把一个单一的组件分解成多个组件就是所谓的“抽象”。抽象是很棒的，但是每一个抽象都有成本，你必须在冒险之前意识到成本和收益

> "Duplication is far cheaper than the wrong abstraction." — Sandi Metz.
> “复制比错误的抽象要便宜得多。”—Sandi Metz。

So I don't mind if the JSX I return in my component function gets really long.Remember that JSX is just a bunch of JavaScript expressions using the declarative APIs given by components.Not a whole lot can go wrong with code like that and it's much easier to keep that codes as it is than breaking out things into a bunch of smaller components and start Prop Drilling everywhere.
所以我不介意在我的组件函数中返回的JSX是否很长.请记住，JSX只是一堆JavaScript表达式，使用组件提供的声明性api.这样的代码并不是很多都会出错，保持代码的原样要比把东西分解成一堆更小的组件，然后到处钻钻来钻去容易得多。

### Conclusion
### 结论

So feel free to break up your components into smaller ones, but don't be afraid of a growing component until you start experiencing real problems.It's WAY easier to maintain it until it needs to be broken up than maintain a pre-mature abstraction.Good luck!
因此，可以随意将组件分解为更小的组件，但在遇到实际问题之前，不要害怕不断增长的组件。在需要分解之前维护它比维护一个预成熟的抽象要容易得多。祝你好运！


## State Colocation will make your React app faster
## 状态托管将使你的应用程序反应更快

How state colocation makes your app not only more maintainable but also faster.
状态托管如何使应用程序不仅更易于维护，而且速度更快。

Watch "Lifting and colocating React State" on egghead.io(part of The Beginner's Guide to ReactJS).
观看egghead.io（ReactJS初学者指南的一部分）上的“提升和定位React状态”。

Current Avaliable Translations:
当前可用翻译：
* Korean
* Russian

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
在这一点上玩一秒钟，当您与任何一个字段交互时，您都会注意到一个严重的性能问题。我们可以做很多事情来提高DogName和SlowComponent组件本身的性能。我们可以拉出像React.memo这样的渲染接口，并将其应用到我们的代码库中，在那里我们有缓慢的渲染。但我想提出一个替代方案。

If you haven't already read Colocation, then I suggest you give that a read. Knowing that colocation can improve the maintenance of our application, let's try colocating some state. Observe that the time state is used by every component in the App, which is why it was lifted to the App. However the dog state is only used by one component, so let's move that state to be colocated (updated lines are highlighted):
如果你还没有读过知道，那么我建议你读一读。知道了托管可以改进应用程序的维护，让我们尝试托管一些状态。请注意，时间状态由应用程序中的每个组件使用，这就是它被提升到应用程序的原因。但是，dog状态只由一个组件使用，所以让我们将该状态移到同一位置（突出显示更新的行）：
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
我听人说过，做得快的最好方法就是少做一些事情.这正是这里发生的事情.当我们管理React组件树中较高的状态时，对该状态的每次更新都会导致整个React树失效。React不知道发生了什么变化，所以它必须检查所有组件以确定它们是否需要DOM更新.这个过程不是免费的（特别是当你有任意慢的组件时）.但是，如果您将您的状态在React树中进一步向下移动，就像我们对dog状态和DogName组件所做的那样，那么React需要检查的内容就更少了.它甚至不需要调用我们的SlowComponent，因为它知道不可能更改输出，因为它无论如何都不能引用更改的状态。

In short, before, when we changed the dog name, every component had to be checked for changes (re-rendered). After, only the DogName component needed to be checked. This resulted in a big performance win! Sweet!
简而言之，在我们更改dog名称之前，必须检查每个组件的更改（重新呈现）.之后，只需要检查DogName组件。这导致了一场大的性能胜利！太好了！

### Real World
### 真实世界
Where I see this principle apply in real-world applications is when people put things into a global Redux store or in a global context that don't really need to be global. Inputs like the DogName in the example above are often the places where this perf issue manifests itself, but I've also seen it happen plenty on mouse interactions as well (like showing a tooltip over a graph or table of data).
我认为这一原则适用于现实世界的应用程序是当人们把东西放到一个全局Redux或一个不需要全局的全局上下文中时。像上面例子中的DogName这样的输入常常是这个perf问题表现出来的地方，但是我也看到它在鼠标交互上发生过很多次（比如在图形或数据表上显示工具提示）。

Often the solution that people try for this kind of problem is to "debounce" the user interaction (ie wait for the user to stop typing before applying the state update). This is sometimes the best we can do, but it definitely leads to a sub-optimal user experience (React's upcoming concurrent mode should make this less necessary in the future. Watch this demo from Dan about it).
通常，人们试图解决这类问题的方法是“解除”用户交互（即等待用户在应用状态更新之前停止键入）这有时是我们能做的最好的，但它肯定会导致一个次优化的用户体验（React即将到来的并发模式应该使这在未来变得不那么必要）。观看丹的演示）

Another solution people try is to apply one of React's rendering bailout escape hatches like React.memo. This works pretty well in our contrived example because it allows React to skip re-rendering our SlowComponent, but in a more practical scenario, you often suffer from "death by a thousand cuts" which means that there's not really a single place that's slow, so you wind up applying React.memo everywhere. And when you do that, you have to start using useMemo and useCallback everywhere as well (otherwise you undo all the work you put into React.memo). Each of these optimizations together may solve the problem, but it drastically increases the complexity of your application's code and it actually is less effective at solving the problem than colocating state because React does still need to run through every component from the top to determine whether it should re-render. You'll definitely be running more code with this approach, there's no way around that.
人们尝试的另一个解决方案是使用React的一个渲染缓存，如React.memo。在我们的设计示例中，这一点非常有效，因为它允许反应跳过重新呈现慢组件，但在更实际的场景中，您常常会遭受“千次削减死亡”，这意味着没有一个地方会很慢，所以您最后会到处应用React.memo。这些优化结合在一起可能会解决问题，但它会大大增加应用程序代码的复杂度，而且实际上它在解决问题方面不如合并状态有效，因为React仍然需要从顶部遍历每个组件以确定是否应该重新呈现。你肯定会用这种方法运行更多的代码，这是没有办法的。

If you'd like to play around with a slightly less contrived example, give this codesandbox a look.
如果你想玩一个稍微不那么做作的例子，看看这个代码。

### What is colocated state?
### 什么是并置状态？
The principle of colocation is:
合并的原理是：
> Place code as close to where it's relevant as possible
> 将代码放置在尽可能靠近其相关的位置

So, to accomplish this, we had our dog state inside the DogName component:
因此，为了实现这一点，我们在DogName组件中设置了dog状态:

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
但当我们分开的时候会发生什么？那个状态去哪了？答案是一样的：“尽可能接近相关的地方。”这将是最接近的共同父母。作为一个例子，让我们将DogName组件分解，使输入和p显示在不同的组件中：
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
在本例中，我们无法将状态移动到DogInput组件，因为dogFavoriteMounterDisplay需要访问该状态，因此我们在树上导航，直到找到这两个组件中最不常见的父级，并且这就是管理状态的地方。

And this applies just as well as if your state needs to be accessed in dozens of components on a specific screen of your application. You can even put it into context to avoid prop drilling if you want. But keep that context value provider as close to where it's relevant as possible and you'll still benefit from the performance (and maintenance) characteristics of colocation. By this I mean that while some of your context providers could be rendered at the top of your application's React tree, they don't all have to be there. You can put them wherever they make the most sense.
这同样适用于需要在应用程序特定屏幕上的几十个组件中访问您的状态的情况。如果你想的话，你甚至可以把它放到上下文中去避免。但是，让上下文值提供者尽可能接近它的相关位置，您仍然可以从托管的性能（和维护）特性中获益。我的意思是，虽然您的一些上下文提供者可以呈现在应用程序的React树的顶部，但它们不一定都在那里。你可以把它们放在最有意义的地方。

This is the essence of what my Application State Management with React blog post is all about. Keep your state as close to where it's used as possible, and you'll benefit from a maintenance perspective and a performance perspective. From there, the only performance concerns you should have is the occasional especially complex UI interaction.
这就是React博客文章的应用程序状态管理的精髓所在。使您的状态尽可能接近其使用位置，您将从维护角度和性能角度获益。从这里开始，您应该考虑的唯一性能问题就是偶尔出现的特别复杂的UI交互。

### What about context or Redux?
### 上下文或Redux呢？
If you read "One simple trick to optimize React re-renders," then you know that you can make it so only components that actually use the changing state will be updated. So that can side step this issue. While this is true, people do still have performance problems with Redux. If it's not React itself, what is it? The problem is that React-Redux expects you to follow guidelines to avoid unnecessary renders of connected components, and it can be easy to accidentally set up components that render too often when other global state changes. The impact of that becomes worse and worse as your app grows larger, especially if you're putting too much state into Redux.
如果您阅读了“优化React重新渲染的一个简单技巧”，那么您就知道您可以使其只更新实际使用更改状态的组件。这样就可以回避这个问题。虽然这是真的，但人们仍然存在Redux的性能问题。如果它自己没有反应，那是什么？问题是React-Redux希望您遵循指导原则，以避免对连接的组件进行不必要的渲染，并且在其他全局状态更改时，很容易意外地设置渲染过于频繁的组件。随着应用程序的规模越来越大，这一影响越来越严重，尤其是如果您将太多的状态放入Redux中。

Fortunately, there are things you can do to help reduce the impact of these performance issues, like using memoized Reselect selectors to optimize mapState functions, and the Redux docs have additional info on improving performance of Redux apps.
幸运的是，您可以做一些事情来帮助减少这些性能问题的影响，比如使用记忆的重选选择器来优化mapState函数，Redux文档提供了关于改进Redux应用程序性能的更多信息。

I also want to note that you can definitely apply colocation with Redux to get these benefits as well. Just limit what you store in Redux to be actual global state and colocate everything else and you're golden. The Redux FAQ has some rules of thumb to help decide whether state should go in Redux, or stay in a component.
我还想指出的是，您完全可以使用Redux来获得这些好处。只要把你在Redux中存储的东西限制为实际的全局状态，并将其他所有东西合并，你就是黄金。Redux FAQ有一些经验法则来帮助决定状态是应该放在Redux中，还是留在组件中。

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
1. 开始构建应用程序。转到2
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
如果你想了解更多关于组件组成步骤的知识，请阅读一个会让你慢下来的React错误。
### Conclusion
### 合并
In general, I think people are pretty good at "lifting state" as things change, but we don't often think to "colocate" state as things change in our codebase. So my challenge to you is to look through your codebase and look for opportunities to colocate state. Ask yourself "do I really need the modal's status (open/closed) state to be in Redux?" (the answer is probably "no"). Colocate your state and you'll find yourself with a faster, simpler codebase. Good luck!
一般来说，我认为人们很擅长随着事情的变化而“提升状态”，但我们并不经常认为随着代码库中的事情发生变化，会出现“冒号”状态。所以我对你的挑战是通过代码库来寻找机会来对colocate状态。问问自己“我真的需要模态的状态（打开/关闭）状态处于REUX中吗？”（答案可能是“否”）。用代码对状态进行编码，您会发现自己拥有更快、更简单的代码库。祝你好运！