## React理念
快速响应

### 制约快速响应的场景
* 当遇到大计算量的操作或者设备性能不足使页面掉帧，导致卡顿  -- CPU的瓶颈
* 发送网络请求后，由于需要等待数据返回才能进一步操作导致不能快速响应 -- IO的瓶颈

### CPU的瓶颈
主流浏览器刷新频率为60Hz，即每（1000ms/60Hz）16.6ms浏览器刷新一次

JS可以操作DOM，GUI渲染线程与JS线程是互斥的。所以JS脚本执行和浏览器布局、绘制不能同时执行。

在浏览器每一帧的事件中，预留一些事件给JS线程，React利用这部分时间更新组件（预留的初始时间是5ms）。当预留的时间不够用时，React将线程控制权交还给浏览器使其有时间渲染UI，React则等待下一帧时间到来继续被中断的工作。

* 这种将长任务分拆到每一帧中，像蚂蚁搬家一样一次执行一小段任务的操作，被称为时间切片（time slice）

开启Concurrent Mode
```JavaScript
// 通过使用ReactDOM.unstable_createRoot开启Concurrent Mode
// ReactDOM.render(<App/>, rootEl);
ReactDOM.unstable_createRoot(rootEl).render(<App/>);
```

解决CPU瓶颈的关键是实现时间切片，而时间切片的关键是：将同步的更新变为可中断的异步更新。

### IO的瓶颈
网络延迟是前端开发者无法解决的。如何在网络延迟客观存在的情况下，减少用户对网络延迟的感知？

解决办法是先在当前页面停留一小段时间，这一小段时间被用来请求数据。当这一小段时间足够短时，用户是无感知的。如果请求时间超过一个范围，再显示loading的效果。

React实现了Suspense功能及配套的hook-useDeferredValue

而在源码内部，为了支持这些特性，同样需要将同步的更新变为可中断的异步更新

### React15架构
可以分为俩层：
Reconciler（协调器）—— 负责找出变化的组件
Renderer（渲染器）—— 负责将变化的组件渲染到页面上

### Reconciler（协调器）
在React中可以通过this.setState、this.forceUpdate、ReactDOM.render等API触发更新。
每当有更新发生时，Reconciler会做如下工作：
* 调用函数组件、或class组件的render方法，将返回的JSX转化为虚拟DOM
* 将虚拟DOM和上次更新时的虚拟DOM对比
* 通知对比找出本次更新中变化的虚拟DOM
* 通知Renderer将变化的虚拟DOM渲染到页面上

### Renderer（渲染器）
* ReactDOM 浏览器环境渲染的Renderer
* ReactNative 渲染App原生组件
* ReactTest 渲染出纯Js对象用于测试
* ReactArt 渲染到Canvas，SVG或VML

在每次更新发生时，Renderer接到Reconciler通知，将变化的组件渲染在当前宿主环境

### React15架构的缺点
在Reconciler中，mount的组件会调用mountComponent，update的组件会调用updateComponent。这俩个方法都会递归更新子组件。

由于递归执行，所以更新一旦开始，中途就无法中断。当层级很深时，递归更新时间超过了16ms，用户交互就会卡顿。

React15架构不能支持异步更新

### React16架构
可以分为三层：
Scheduler（调度器）—— 调度任务的优先级，高优任务优先进入Reconciler
Reconciler（协调器）—— 负责找出变化的组件
Renderer（渲染器） —— 负责将变化的组件渲染到页面上

### Scheduler（调度器）
既然我们以浏览器是否有剩余时间作为中断的标准，那么我们需要一种机制，当浏览器有剩余时间时通知我们。

React实现了requestIdleCallback polyfill，这就是Scheduler。除了在空闲时触发回调的功能外，Scheduler还提供了多种调度优先级供任务设置。

### Reconciler（协调器）
更新工作从递归变成了可以中断的循环过程。每次循环都会调用shouldYield判断当前是否有剩余时间。
```JavaScript
function workLoopConcurrent() {
  while (whorkInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

在React16中，Reconciler与Renderer不再是交替工作。当Scheduler将任务交给Reconciler后，Reconciler会为变化的虚拟DOM打上代表增/删/更新的标记。
```JavaScript
export const Placement = /* */ 0b0000000000010
export const Update = /* */ 0b0000000000100
export const PlacementAndUpdate  = /* */ 0b0000000000110
export const Deletion = /* */ 0b0000000001000
```

整个Scheduler与Reconciler的工作都在内存中进行。只有当所有组件都完成Reconciler的工作，才会统一交给Renderer。

### Renderer（渲染器）
Renderer根据Reconciler为虚拟DOM打的标记，同步执行对应的DOM操作。

所有的工作都在内存中进行，不会更新页面上的DOM，所以即时反复中断，用户也不会看见更新不完全的DOM

由于Scheduler和Reconciler都是平台无关的，所以React为他们单独发了一个包react-Reconciler。你可以用这个包自己实现一个ReactDOM

### 什么是代数效应
代数效应是函数式编程中的一个概念，用于将副作用从函数调用中分离。
try handle

从React15到React16，协调器（Reconciler）重构的一大目的是：将老的同步更新的架构变为异步可中断更新。

异步可中断更新可以理解为：更新在执行过程中可能会被打断（浏览器时间分片用尽或有更高优任务插队），当可以继续执行时回复之前执行的中间状态。
这就是代数效应中try...handle的作用。

### 代数效应与Fiber
Fiber并不是计算机术语中的新名词，他的中文翻译叫做纤程，与进程（Process）、线程（Thread）、协程（Coroutine）同为程序执行过程。

很多文字中将纤程理解为协程的一种实现。在JS中，协程的实现便是Generator。

可以将纤程（Fiber）、协程（Generator）理解为代数效应思想在JS中的体现

React Fiber可以理解为：
React内部实现的一套状态更新机制。支持任务不同优先级，可中断与恢复，并且恢复后可以复用之前的中间状态。

其中每个任务更新单元为React Element对应的Fiber节点。

### Fiber的起源
虚拟DOM在React16中的称呼

### Fiber的含义
Fiber包含三层含义：
1. 作为架构来说，之前React15的Reconciler采用递归的方式执行，数据保存在递归调用栈中，所以被称为stack Reconciler。React16的Reconciler基于Fiber节点实现，被称为Fiber Reconciler。
2. 作为静态的数据结构来说，每个Fiber节点对应一个React element，保存了该组件的类型、对应的DO节点等信息
3. 作为动态的工作单元来说，每个Fiber节点保存了本次更新中该组件改变的状态、要执行的工作。
```JavaScript
function FiberNode(
  tag; WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
) {
  // 作为静态数据结构的属性
  // Fiber对应组件的类型 Function/Class/Host...
  this.tag = tag;
  // key属性
  this.key = key;
  // 大部分情况同type,某些情况不同，比如FunctionComponent使用React.memo包裹
  this.elementType = null;
  // 对于FunctionComponent,指函数本身，对于ClassComponent,指class，对于HostComponent,指DOM节点tagName
  this.type = null;
  // Fiber对应的真实DOM节点
  this.stateNode = null;

  // 用于连接其他Fiber节点形成Fiber树
  // 指向父级Fiber节点
  this.return = null;
  // 指向子Fiber节点
  this.child = null;
  // 指向右边第一个兄弟Fiber节点
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  // 作为动态的工作单元的属性
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // 保存本次更新会造成的DOM操作
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  // 调度优先级相关
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null;
}
```
为什么父级指针叫做return而不是Parent。因为作为一个工作单元，return指节点执行完completeWork后会返回的下一个节点。子Fiber节点及其兄弟节点完成工作后会返回其父级节点，所以用return指代父级节点。

### Fiber架构的工作原理
Fiber节点可以保存对应的DOM节点
Fiber节点构成的Fiber树就对应DOM树。

用双缓存更新DOM

### 什么是双缓存
在内存中构建并直接替换的技术叫做双缓存
React使用双缓存来完成Fiber树的构建与替换——对应着DOM树的创建与更新。

### 双缓存Fiber树
在React中最多会同时存在俩颗Fiber树。当前屏幕上显示内容对应的Fiber树称为current Fiber树，正在内存中构建的Fiber树称为workInProgress Fiber树

current Fiber树中的Fiber节点被称为current fiber，workInProgress Fiber树中的Fiber节点被称为workInProgress fiber，他们通过alternate属性连接。
```JavaScript
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

当workInProgress Fiber树构建完成交给Renderer渲染在页面上后，应用根节点的current执行指向workInProgress Fiber树，此时workInProgress Fiber树就变为current Fiber树。

每次状态更新都会产生新的workInProgress Fiber树，通过current与workInProgress的替换，完成DOM更新。

### mount时
1. 首次执行ReactDOM.render会创建fiberRootNode（源码中叫fiberRoot）和rootFiber。其中fiberRootNode是整个应用的根节点，rootFiber是<App /> 所在组件树的根节点

之所以要区分fiberRootNode与rootFiber，是因为在应用中我们可以多次调用ReactDOM.render渲染不同的组件树，他们会拥有不同的rootFiber。但是整个应用的根节点只有一个，那就是fiberRootNode

fiberRootNode的current会指向当前页面上已渲染内容对应Fiber树，即current Fiber树。

2. 接下来进入render阶段，根据组件返回的JSX在内存中依次创建Fiber节点并连接在一起构建Fiber树，被称为workInProgress Fiber树

3. 图中右侧已构建完的workInProgress Fiber树在commit阶段渲染到页面。

### update
1. 开启一次新的render阶段并构建一颗新的workInProgress Fiber树
和mount时一样，workInProgress fiber的创建可以复用current Fiber树对应的节点数据（决定是否复用的过程就是Diff算法）

2. workInProgress Fiber树在render阶段完成构建后进入commit阶段渲染到页面上。渲染完毕后，workInProgress Fiber树变为current Fiber树
