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