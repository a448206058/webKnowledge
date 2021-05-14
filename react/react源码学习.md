## React 理念

快速响应

### 制约快速响应的场景

- 当遇到大计算量的操作或者设备性能不足使页面掉帧，导致卡顿 -- CPU 的瓶颈
- 发送网络请求后，由于需要等待数据返回才能进一步操作导致不能快速响应 -- IO 的瓶颈

### CPU 的瓶颈

主流浏览器刷新频率为 60Hz，即每（1000ms/60Hz）16.6ms 浏览器刷新一次

JS 可以操作 DOM，GUI 渲染线程与 JS 线程是互斥的。所以 JS 脚本执行和浏览器布局、绘制不能同时执行。

在浏览器每一帧的事件中，预留一些事件给 JS 线程，React 利用这部分时间更新组件（预留的初始时间是 5ms）。当预留的时间不够用时，React 将线程控制权交还给浏览器使其有时间渲染 UI，React 则等待下一帧时间到来继续被中断的工作。

- 这种将长任务分拆到每一帧中，像蚂蚁搬家一样一次执行一小段任务的操作，被称为时间切片（time slice）

开启 Concurrent Mode

```JavaScript
// 通过使用ReactDOM.unstable_createRoot开启Concurrent Mode
// ReactDOM.render(<App/>, rootEl);
ReactDOM.unstable_createRoot(rootEl).render(<App/>);
```

解决 CPU 瓶颈的关键是实现时间切片，而时间切片的关键是：将同步的更新变为可中断的异步更新。

### IO 的瓶颈

网络延迟是前端开发者无法解决的。如何在网络延迟客观存在的情况下，减少用户对网络延迟的感知？

解决办法是先在当前页面停留一小段时间，这一小段时间被用来请求数据。当这一小段时间足够短时，用户是无感知的。如果请求时间超过一个范围，再显示 loading 的效果。

React 实现了 Suspense 功能及配套的 hook-useDeferredValue

而在源码内部，为了支持这些特性，同样需要将同步的更新变为可中断的异步更新

### React15 架构

可以分为俩层：
Reconciler（协调器）—— 负责找出变化的组件
Renderer（渲染器）—— 负责将变化的组件渲染到页面上

### Reconciler（协调器）

在 React 中可以通过 this.setState、this.forceUpdate、ReactDOM.render 等 API 触发更新。
每当有更新发生时，Reconciler 会做如下工作：

- 调用函数组件、或 class 组件的 render 方法，将返回的 JSX 转化为虚拟 DOM
- 将虚拟 DOM 和上次更新时的虚拟 DOM 对比
- 通知对比找出本次更新中变化的虚拟 DOM
- 通知 Renderer 将变化的虚拟 DOM 渲染到页面上

### Renderer（渲染器）

- ReactDOM 浏览器环境渲染的 Renderer
- ReactNative 渲染 App 原生组件
- ReactTest 渲染出纯 Js 对象用于测试
- ReactArt 渲染到 Canvas，SVG 或 VML

在每次更新发生时，Renderer 接到 Reconciler 通知，将变化的组件渲染在当前宿主环境

### React15 架构的缺点

在 Reconciler 中，mount 的组件会调用 mountComponent，update 的组件会调用 updateComponent。这俩个方法都会递归更新子组件。

由于递归执行，所以更新一旦开始，中途就无法中断。当层级很深时，递归更新时间超过了 16ms，用户交互就会卡顿。

React15 架构不能支持异步更新

### React16 架构

可以分为三层：
Scheduler（调度器）—— 调度任务的优先级，高优任务优先进入 Reconciler
Reconciler（协调器）—— 负责找出变化的组件
Renderer（渲染器） —— 负责将变化的组件渲染到页面上

### Scheduler（调度器）

既然我们以浏览器是否有剩余时间作为中断的标准，那么我们需要一种机制，当浏览器有剩余时间时通知我们。

React 实现了 requestIdleCallback polyfill，这就是 Scheduler。除了在空闲时触发回调的功能外，Scheduler 还提供了多种调度优先级供任务设置。

### Reconciler（协调器）

更新工作从递归变成了可以中断的循环过程。每次循环都会调用 shouldYield 判断当前是否有剩余时间。

```JavaScript
function workLoopConcurrent() {
  while (whorkInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

在 React16 中，Reconciler 与 Renderer 不再是交替工作。当 Scheduler 将任务交给 Reconciler 后，Reconciler 会为变化的虚拟 DOM 打上代表增/删/更新的标记。

```JavaScript
export const Placement = /* */ 0b0000000000010
export const Update = /* */ 0b0000000000100
export const PlacementAndUpdate  = /* */ 0b0000000000110
export const Deletion = /* */ 0b0000000001000
```

整个 Scheduler 与 Reconciler 的工作都在内存中进行。只有当所有组件都完成 Reconciler 的工作，才会统一交给 Renderer。

### Renderer（渲染器）

Renderer 根据 Reconciler 为虚拟 DOM 打的标记，同步执行对应的 DOM 操作。

所有的工作都在内存中进行，不会更新页面上的 DOM，所以即时反复中断，用户也不会看见更新不完全的 DOM

由于 Scheduler 和 Reconciler 都是平台无关的，所以 React 为他们单独发了一个包 react-Reconciler。你可以用这个包自己实现一个 ReactDOM

### 什么是代数效应

代数效应是函数式编程中的一个概念，用于将副作用从函数调用中分离。
try handle

从 React15 到 React16，协调器（Reconciler）重构的一大目的是：将老的同步更新的架构变为异步可中断更新。

异步可中断更新可以理解为：更新在执行过程中可能会被打断（浏览器时间分片用尽或有更高优任务插队），当可以继续执行时回复之前执行的中间状态。
这就是代数效应中 try...handle 的作用。

### 代数效应与 Fiber

Fiber 并不是计算机术语中的新名词，他的中文翻译叫做纤程，与进程（Process）、线程（Thread）、协程（Coroutine）同为程序执行过程。

很多文字中将纤程理解为协程的一种实现。在 JS 中，协程的实现便是 Generator。

可以将纤程（Fiber）、协程（Generator）理解为代数效应思想在 JS 中的体现

React Fiber 可以理解为：
React 内部实现的一套状态更新机制。支持任务不同优先级，可中断与恢复，并且恢复后可以复用之前的中间状态。

其中每个任务更新单元为 React Element 对应的 Fiber 节点。

### Fiber 的起源

虚拟 DOM 在 React16 中的称呼

### Fiber 的含义

Fiber 包含三层含义：

1. 作为架构来说，之前 React15 的 Reconciler 采用递归的方式执行，数据保存在递归调用栈中，所以被称为 stack Reconciler。React16 的 Reconciler 基于 Fiber 节点实现，被称为 Fiber Reconciler。
2. 作为静态的数据结构来说，每个 Fiber 节点对应一个 React element，保存了该组件的类型、对应的 DO 节点等信息
3. 作为动态的工作单元来说，每个 Fiber 节点保存了本次更新中该组件改变的状态、要执行的工作。

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

为什么父级指针叫做 return 而不是 Parent。因为作为一个工作单元，return 指节点执行完 completeWork 后会返回的下一个节点。子 Fiber 节点及其兄弟节点完成工作后会返回其父级节点，所以用 return 指代父级节点。

### Fiber 架构的工作原理

Fiber 节点可以保存对应的 DOM 节点
Fiber 节点构成的 Fiber 树就对应 DOM 树。

用双缓存更新 DOM

### 什么是双缓存

在内存中构建并直接替换的技术叫做双缓存
React 使用双缓存来完成 Fiber 树的构建与替换——对应着 DOM 树的创建与更新。

### 双缓存 Fiber 树

在 React 中最多会同时存在俩颗 Fiber 树。当前屏幕上显示内容对应的 Fiber 树称为 current Fiber 树，正在内存中构建的 Fiber 树称为 workInProgress Fiber 树

current Fiber 树中的 Fiber 节点被称为 current fiber，workInProgress Fiber 树中的 Fiber 节点被称为 workInProgress fiber，他们通过 alternate 属性连接。

```JavaScript
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

当 workInProgress Fiber 树构建完成交给 Renderer 渲染在页面上后，应用根节点的 current 执行指向 workInProgress Fiber 树，此时 workInProgress Fiber 树就变为 current Fiber 树。

每次状态更新都会产生新的 workInProgress Fiber 树，通过 current 与 workInProgress 的替换，完成 DOM 更新。

### mount 时

1. 首次执行 ReactDOM.render 会创建 fiberRootNode（源码中叫 fiberRoot）和 rootFiber。其中 fiberRootNode 是整个应用的根节点，rootFiber 是<App /> 所在组件树的根节点

之所以要区分 fiberRootNode 与 rootFiber，是因为在应用中我们可以多次调用 ReactDOM.render 渲染不同的组件树，他们会拥有不同的 rootFiber。但是整个应用的根节点只有一个，那就是 fiberRootNode

fiberRootNode 的 current 会指向当前页面上已渲染内容对应 Fiber 树，即 current Fiber 树。

2. 接下来进入 render 阶段，根据组件返回的 JSX 在内存中依次创建 Fiber 节点并连接在一起构建 Fiber 树，被称为 workInProgress Fiber 树

3. 图中右侧已构建完的 workInProgress Fiber 树在 commit 阶段渲染到页面。

### update

1. 开启一次新的 render 阶段并构建一颗新的 workInProgress Fiber 树
   和 mount 时一样，workInProgress fiber 的创建可以复用 current Fiber 树对应的节点数据（决定是否复用的过程就是 Diff 算法）

2. workInProgress Fiber 树在 render 阶段完成构建后进入 commit 阶段渲染到页面上。渲染完毕后，workInProgress Fiber 树变为 current Fiber 树

### 顶层目录

fixtures 包含一些给贡献者准备的小型 React 测试项目
packages 包含元数据和 React 仓库中所有 package 的源码
scripts 各种工具链的脚本，比如 git、jest、eslint 等

react 文件夹
React 的核心，包含所有全局 React API

- React.createElement
- React.Component
- React.Children

scheduler 文件夹
scheduler（调度器）的实现

shared 文件夹
源码中其它模块公用的方法和全局变量

renderer 相关的文件夹
react-art
react-dom
react-native-renderer
react-noop-renderer
react-test-renderer

试验性包的文件夹
react-server 创建自定义 SSR 流
react-client 创建自定义的流
react-fetch 用于数据请求
react-interactions 用于测试交互相关的内部特性，比如 React 的事件模型
react-reconciler Reconciler 的实现，你可以用他构建自己的 Renderer

辅助包的文件夹
react-is 用于测试组件是否是某类型
react-client 创建自定义的流
react-fetch 用于数据请求
react-refresh 热重载的 React 官方实现

react-reconciler 文件夹
实验性的包，内部的很多功能在正式版本中还未开放，但是他一边对接 scheduler，一边对接不同平台的 renderer，构成了整个 React16 的架构体系。

### 深入理解 JSX

JSX 作为描述组件内容的数据结构，为 JS 赋予了更多视觉表现力，是标签语法

JSX 在编译时会被 Babel 编译为 React.createElement 方法

JSX 并不只能被编译为 React.createElement 方法，你可以通过@babel/plugin-transform-react-jsx 插件显式告诉 Babel 编译时需要将 JSX 编译为什么函数的调用（默认为 React.createElement）

```JavaScript
export function createElement(type, config, children) {
  let propName;

  // Reserved names are extracted
  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  if (config != null) {
    // 将config 处理后赋值给 props
    if (hasValidRef(config)) {
      ref = config.ref;

      if (__DEV__) {
        warnIfStringRefCannotBeAutoConverted(config);
      }
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  // 处理children，会被赋值给props.children
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    if (__DEV__) {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  if (__DEV__) {
    if (key || ref) {
      const displayName =
      typeof type === 'function'
        ? type.displayName || type.name || 'Unknown'
        : type;
      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }
      if (ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }
  }
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}

// 返回一个包含组件数据的对象，该对象有个参数$$typeof: REACT_ELEMENT_TYPE 标记了该对象是个React Element
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };

  if (__DEV__) {
    element._store = {};

    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false,
    });
    // self and source are DEV only properties.
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    });
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source,
    });
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
}

```

验证合法 React Element 的全局 API React.isValidElement

```JavaScript
export function isValidElement(object) {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  )
}
```

在 React 中，所有 JSX 在运行时的返回结果（即 React.createElement()的返回值）都是 React Element。

### React Component

在 React 中，我们常使用 ClassComponent 与 FunctionComponent 构建组件

```JavaScript
class AppClass extends React.Component {
  render() {
    return <p>KaSong</p>
  }
}
```

React 通过 ClassComponent 实例原型上的 isReactComponent 变量判断是否是 ClassComponent

```JavaScript
ClassComponent.prototype.isReactComponent = {};
```

### JSX 与 Fiber 节点

JSX 是一种描述当前组件内容的数据结构，它不包含组件 schedule、reconcile、render 所需的相关信息

在组件 mount 时，Reconciler 根据 JSX 描述的组件内容生成组件对应的 Fiber 节点
在 update 时，Reconciler 将 JSX 与 Fiber 节点保存的数据对比，生成组件对应的 Fiber 节点，并根据对比结果为 Fiber 节点打上标记。

## render 阶段

### 流程概览

render 阶段开始于 performSyncWorkOnRoot 或 performConcurrentWorkOnRoot 方法的调用。这取决于本次更新是同步更新还是异步更新

```JavaScript
// performSyncWorkOnRoot会调用该方法
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

// performConcurrentWorkOnRoot会调用该方法
function workLoopConcurrent() {
  // 如果当前浏览器帧没有剩余时间，shouldYield会中止循环，直到浏览器有空闲时间后再继续遍历
  // workInProgress代表当前已创建的workInProgress fiber
  while (workInProgress !== null && !shouldYield()) {
    //performUnitOfWork方法会创建下一个Fiber节点并赋值给workInProgress，并将workInProgress与已创建的Fiber节点连接起来构成Fiber树。
    performUnitOfWork(workInProgress);
  }
}
```

performUnitOfWork 工作可以分为俩部分：递和归

```JavaScript
function performUnitOfWork(unitOfWork: Fiber): void {
  // The current, flushed, state of this fiber is the alternate.Ideally
  // nothing should rely on this, but relying on it here means that we don't
  // need an additional field on the work in progress.
  const current = unitOfWork.alternate;
  setCurrentDebugFiberInDEV(unitOfWork);

  let next;
  if (enableProfilerTimer && (unitOfWork.mode & ProfileMode) !== NoMode) {
    startProfilerTimer(unitOfWork);
    next = beginWork(current, unitOfWork, subtreeRenderLanes);
    stopProfilerTimerIfRunningAndRecordDelta(unitOfWork, true);
  } else {
    next = beginWork(current, unitOfWork, subtreeRenderLanes);
  }

  resetCurrentDebugFiberInDEV();
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }

  ReactCurrentOwner.current = null;
}
```

### 递阶段

首先从 rootFiber 开始向下深度优先遍历，为遍历到的每个 Fiber 节点，调用 beginWork 方法
该方法会根据传入的 Fiber 阶段创建子 Fiber 节点，并将这俩个 Fiber 节点连接起来
当遍历到叶子节点（即没有子组件的组件）时就会进入归阶段

```JavaScript
function beginWork(
  // 当前组件对应的Fiber节点 在上一次更新时的Fiber节点，即workInProgress.alternate
  current: Fiber | null,
  // 当前组件对应的Fiber节点
  workInProgress: Fiber,
  // 优先级相关
  renderLanes: Lanes,
): Fiber | null {
  const updateLanes = workInProgress.lanes;

  if (__DEV__) {
    if (workInProgress._debugNeedsRemount && current !== null) {
      // This will restart the begin phase with a new fiber.
      return remountFiber(
        current,
        workInProgress,
        createFiberFromTypeAndProps(
          workInProgress.type,
          workInProgress.key,
          workInProgress.pendingProps,
          workInProgress._debugOwner || null,
          workInProgress.mode,
          workInProgress.lanes,
        ),
      );
    }
  }

  // 除 rootFiber以外，组件mount时，由于是首次渲染，是不存在当前组件对应的Fiber节点在上一次更新时的fIBER节点，即mount时current === null
  // 组件update时，由于之前已经mount过，所以current !== null
  // update时：如果current存在可能存在优化路径，可以复用current(即上一次更新的Fiber节点)
   if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;

    if (
      oldProps !== newProps ||
      hasLegacyContextChanged() ||
      // Force a re-render if the implementation changed due to hot reload:
      (__DEV__ ? workInProgress.type !== current.type : false)
    ) {
      // If props or context changed, mark the fiber as having performed work.
      // This may be unset if the props are determined to be equal later (memo).
      didReceiveUpdate = true;
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
      didReceiveUpdate = false;
      // This fiber does not have any pending work. Bailout without entering
      // the begin phase. There's still some bookkeeping we that needs to be done
      // in this optimized path, mostly pushing stuff onto the stack.
      switch (workInProgress.tag) {
        case HostRoot:
          pushHostRootContext(workInProgress);
          resetHydrationState();
          break;
        case HostComponent:
          pushHostContext(workInProgress);
          break;
        case ClassComponent: {
          const Component = workInProgress.type;
          if (isLegacyContextProvider(Component)) {
            pushLegacyContextProvider(workInProgress);
          }
          break;
        }
        case HostPortal:
          pushHostContainer(
            workInProgress,
            workInProgress.stateNode.containerInfo,
          );
          break;
        case ContextProvider: {
          const newValue = workInProgress.memoizedProps.value;
          pushProvider(workInProgress, newValue);
          break;
        }
        case Profiler:
          if (enableProfilerTimer) {
            // Profiler should only call onRender when one of its descendants actually rendered.
            const hasChildWork = includesSomeLane(
              renderLanes,
              workInProgress.childLanes,
            );
            if (hasChildWork) {
              workInProgress.effectTag |= Update;
            }

            // Reset effect durations for the next eventual effect phase.
            // These are reset during render to allow the DevTools commit hook a chance to read them,
            const stateNode = workInProgress.stateNode;
            stateNode.effectDuration = 0;
            stateNode.passiveEffectDuration = 0;
          }
          break;
        case SuspenseComponent: {
          const state: SuspenseState | null = workInProgress.memoizedState;
          if (state !== null) {
            if (enableSuspenseServerRenderer) {
              if (state.dehydrated !== null) {
                pushSuspenseContext(
                  workInProgress,
                  setDefaultShallowSuspenseContext(suspenseStackCursor.current),
                );
                // We know that this component will suspend again because if it has
                // been unsuspended it has committed as a resolved Suspense component.
                // If it needs to be retried, it should have work scheduled on it.
                workInProgress.effectTag |= DidCapture;
                // We should never render the children of a dehydrated boundary until we
                // upgrade it. We return null instead of bailoutOnAlreadyFinishedWork.
                return null;
              }
            }

            // If this boundary is currently timed out, we need to decide
            // whether to retry the primary children, or to skip over it and
            // go straight to the fallback. Check the priority of the primary
            // child fragment.
            const primaryChildFragment: Fiber = (workInProgress.child: any);
            const primaryChildLanes = primaryChildFragment.childLanes;
            if (includesSomeLane(renderLanes, primaryChildLanes)) {
              // The primary children have pending work. Use the normal path
              // to attempt to render the primary children again.
              return updateSuspenseComponent(
                current,
                workInProgress,
                renderLanes,
              );
            } else {
              // The primary child fragment does not have pending work marked
              // on it
              pushSuspenseContext(
                workInProgress,
                setDefaultShallowSuspenseContext(suspenseStackCursor.current),
              );
              // The primary children do not have pending work with sufficient
              // priority. Bailout.
              const child = bailoutOnAlreadyFinishedWork(
                current,
                workInProgress,
                renderLanes,
              );
              if (child !== null) {
                // The fallback children have pending work. Skip over the
                // primary children and work on the fallback.
                return child.sibling;
              } else {
                return null;
              }
            }
          } else {
            pushSuspenseContext(
              workInProgress,
              setDefaultShallowSuspenseContext(suspenseStackCursor.current),
            );
          }
          break;
        }
        case SuspenseListComponent: {
          const didSuspendBefore =
            (current.effectTag & DidCapture) !== NoEffect;

          const hasChildWork = includesSomeLane(
            renderLanes,
            workInProgress.childLanes,
          );

          if (didSuspendBefore) {
            if (hasChildWork) {
              // If something was in fallback state last time, and we have all the
              // same children then we're still in progressive loading state.
              // Something might get unblocked by state updates or retries in the
              // tree which will affect the tail. So we need to use the normal
              // path to compute the correct tail.
              return updateSuspenseListComponent(
                current,
                workInProgress,
                renderLanes,
              );
            }
            // If none of the children had any work, that means that none of
            // them got retried so they'll still be blocked in the same way
            // as before. We can fast bail out.
            workInProgress.effectTag |= DidCapture;
          }

          // If nothing suspended before and we're rendering the same children,
          // then the tail doesn't matter. Anything new that suspends will work
          // in the "together" mode, so we can continue from the state we had.
          const renderState = workInProgress.memoizedState;
          if (renderState !== null) {
            // Reset to the "together" mode in case we've started a different
            // update in the past but didn't complete it.
            renderState.rendering = null;
            renderState.tail = null;
            renderState.lastEffect = null;
          }
          pushSuspenseContext(workInProgress, suspenseStackCursor.current);

          if (hasChildWork) {
            break;
          } else {
            // If none of the children had any work, that means that none of
            // them got retried so they'll still be blocked in the same way
            // as before. We can fast bail out.
            return null;
          }
        }
        case OffscreenComponent:
        case LegacyHiddenComponent: {
          // Need to check if the tree still needs to be deferred. This is
          // almost identical to the logic used in the normal update path,
          // so we'll just enter that. The only difference is we'll bail out
          // at the next level instead of this one, because the child props
          // have not changed. Which is fine.
          // TODO: Probably should refactor `beginWork` to split the bailout
          // path from the normal path. I'm tempted to do a labeled break here
          // but I won't :)
          workInProgress.lanes = NoLanes;
          return updateOffscreenComponent(current, workInProgress, renderLanes);
        }
      }
      // 复用current
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    } else {
      if ((current.effectTag & ForceUpdateForLegacySuspense) !== NoEffect) {
        // This is a special case that only exists for legacy mode.
        // See https://github.com/facebook/react/pull/19216.
        didReceiveUpdate = true;
      } else {
        // An update was scheduled on this fiber, but there are no new props
        // nor legacy context. Set this to false. If an update queue or context
        // consumer produces a changed value, it will set this to true. Otherwise,
        // the component will assume the children have not changed and bail out.
        didReceiveUpdate = false;
      }
    }
  } else {
    // mount
    didReceiveUpdate = false;
  }

  // Before entering the begin phase, clear pending update priority.
  // TODO: This assumes that we're about to evaluate the component and process
  // the update queue. However, there's an exception: SimpleMemoComponent
  // sometimes bails out later in the begin phase. This indicates that we should
  // move this assignment out of the common path and into each branch.
  workInProgress.lanes = NoLanes;

  // mount时：根据tag不同，创建不同的子Fiber节点
  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
        renderLanes,
      );
    }
    case LazyComponent: {
      const elementType = workInProgress.elementType;
      return mountLazyComponent(
        current,
        workInProgress,
        elementType,
        updateLanes,
        renderLanes,
      );
    }
    case FunctionComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    case ClassComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText:
      return updateHostText(current, workInProgress);
    case SuspenseComponent:
      return updateSuspenseComponent(current, workInProgress, renderLanes);
    case HostPortal:
      return updatePortalComponent(current, workInProgress, renderLanes);
    case ForwardRef: {
      const type = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === type
          ? unresolvedProps
          : resolveDefaultProps(type, unresolvedProps);
      return updateForwardRef(
        current,
        workInProgress,
        type,
        resolvedProps,
        renderLanes,
      );
    }
    case Fragment:
      return updateFragment(current, workInProgress, renderLanes);
    case Mode:
      return updateMode(current, workInProgress, renderLanes);
    case Profiler:
      return updateProfiler(current, workInProgress, renderLanes);
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderLanes);
    case ContextConsumer:
      return updateContextConsumer(current, workInProgress, renderLanes);
    case MemoComponent: {
      const type = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      // Resolve outer props first, then resolve inner props.
      let resolvedProps = resolveDefaultProps(type, unresolvedProps);
      if (__DEV__) {
        if (workInProgress.type !== workInProgress.elementType) {
          const outerPropTypes = type.propTypes;
          if (outerPropTypes) {
            checkPropTypes(
              outerPropTypes,
              resolvedProps, // Resolved for outer only
              'prop',
              getComponentName(type),
            );
          }
        }
      }
      resolvedProps = resolveDefaultProps(type.type, resolvedProps);
      return updateMemoComponent(
        current,
        workInProgress,
        type,
        resolvedProps,
        updateLanes,
        renderLanes,
      );
    }
    case SimpleMemoComponent: {
      return updateSimpleMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        updateLanes,
        renderLanes,
      );
    }
    case IncompleteClassComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return mountIncompleteClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    case SuspenseListComponent: {
      return updateSuspenseListComponent(current, workInProgress, renderLanes);
    }
    case FundamentalComponent: {
      if (enableFundamentalAPI) {
        return updateFundamentalComponent(current, workInProgress, renderLanes);
      }
      break;
    }
    case ScopeComponent: {
      if (enableScopeAPI) {
        return updateScopeComponent(current, workInProgress, renderLanes);
      }
      break;
    }
    case Block: {
      if (enableBlocksAPI) {
        const block = workInProgress.type;
        const props = workInProgress.pendingProps;
        return updateBlock(current, workInProgress, block, props, renderLanes);
      }
      break;
    }
    case OffscreenComponent: {
      return updateOffscreenComponent(current, workInProgress, renderLanes);
    }
    case LegacyHiddenComponent: {
      return updateLegacyHiddenComponent(current, workInProgress, renderLanes);
    }
  }

  invariant(
    false,
    'Unknown unit of work tag (%s). This error is likely caused by a bug in ' +
    'React. Please file an issue.',
    workInProgress.tag
  )
}
```

### reconcileChildren

- 对于 mount 的组件，他会创建新的子 Fiber 节点
- 对于 update 的组件，他会将当前组件与该组件在上次更新时对应的 Fiber 节点比较（也就是俗称的 Diff 算法），将比较的结果生成新 Fiber 节点

```JavaScript
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) {
  if (current === null) {
    // 对于mount的组件
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    // 对于update的组件
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      // 为生成的Fiber节点带上effectTag属性
      current.child,
      nextChildren,
      renderLanes
    );
  }
}
```

### effectTag

render 阶段的工作是在内存中进行，当工作结束后会通知 Renderer 需要执行的 DOM 操作。要执行 DOM 操作的具体类型就保存在 fiber.effectTag 中。

通过二进制表示 effectTag,可以方便的使用位操作为 fiber.effectTag 赋值多个 effect。

如果要通知 Render 将 Fiber 节点对应的 DOM 节点插入页面中，需要满足俩个条件：

1. fiber.stateNode 存在，即 Fiber 节点中保存了对应的 DOM 节点
   fiber.stateNode 会在 completeWork 中创建

2. (fiber.effectTag & Placement) !== 0, 即 Fiber 节点存在 Placement effectTag
   在 mount 时只有 rootFiber 会赋值 Placement effectTag,在 commit 阶段只会执行一次插入操作。

### 归阶段

在归阶段会调用 completeWork 处理 Fiber 节点

当某个 Fiber 节点执行完 completeWork，如果其存在兄弟 Fiber 节点（即 fiber.sibling !== null），会进入其兄弟 Fiber 的递阶段。

如果不存在兄弟 Fiber，会进入父级 Fiber 的归阶段
递和归阶段会交错执行直到归到 rootFiber。至此，render 阶段的工作就结束了

由于 completeWork 属于归阶段调用的函数，每次调用 appendAllChildren 时都会将已生成的子孙 DOM 节点插入当前生成的 DOM 节点下。那么当归到 rootFiber 时，我们已经有一个构建好的离屏 DOM 树

```JavaScript
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
      return null;
    case ClassComponent: {
      const Component = workInProgress.type;
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(workInProgress);
      }
      return null;
    }
    case HostRoot: {
      popHostContainer(workInProgress);
      popTopLevelLegacyContextObject(workInProgress);
      resetMutableSourceWorkInProgressVersions();
      const fiberRoot = (workInProgress.stateNode: FiberRoot);
      if (fiberRoot.pendingContext) {
        fiberRoot.context = fiberRoot.pendingContext;
        fiberRoot.pendingContext = null;
      }
      if (current === null || current.child === null) {
        // If we hydrated, pop so that we can delete any remaining children
        // that weren't hydrated.
        const wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          // If we hydrated, then we'll need to schedule an update for
          // the commit side-effects on the root.
          markUpdate(workInProgress);
        } else if (!fiberRoot.hydrate) {
          // Schedule an effect to clear this container at the start of the next commit.
          // This handles the case of React rendering into a container with previous children.
          // It's also safe to do for updates too, because current.child would only be null
          // if the previous render was null (so the the container would already be empty).
          workInProgress.effectTag |= Snapshot;
        }
      }
      updateHostContainer(workInProgress);
      return null;
    }
    case HostComponent: {
      popHostContext(workInProgress);
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      // 该Fiber节点是否存在对应DOM节点
      if (current !== null && workInProgress.stateNode != null) {
        // 不需要生成DOM节点
        // 处理props
        // onClick、onChange等回调函数的注册
        // 处理style prop
        // 处理 DANGEROUSLY_SET_INNER_HTML prop
        // 处理 children prop
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance,
        );

        if (enableDeprecatedFlareAPI) {
          const prevListeners = current.memoizedProps.DEPRECATED_flareListeners;
          const nextListeners = newProps.DEPRECATED_flareListeners;
          if (prevListeners !== nextListeners) {
            markUpdate(workInProgress);
          }
        }

        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress);
        }
      } else {
        if (!newProps) {
          invariant(
            workInProgress.stateNode !== null,
            'We must have new props for new mounts. This error is likely ' +
              'caused by a bug in React. Please file an issue.',
          );
          // This can happen when we abort work.
          return null;
        }

        const currentHostContext = getHostContext();
        // TODO: Move createInstance to beginWork and keep it on a context
        // "stack" as the parent. Then append children as we go in beginWork
        // or completeWork depending on whether we want to add them top->down or
        // bottom->up. Top->down is faster in IE11.
        const wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          // TODO: Move this and createInstance step into the beginPhase
          // to consolidate.
          if (
            prepareToHydrateHostInstance(
              workInProgress,
              rootContainerInstance,
              currentHostContext,
            )
          ) {
            // If changes to the hydrated node need to be applied at the
            // commit-phase we mark this as such.
            markUpdate(workInProgress);
          }
          if (enableDeprecatedFlareAPI) {
            const listeners = newProps.DEPRECATED_flareListeners;
            if (listeners != null) {
              updateDeprecatedEventListeners(
                listeners,
                workInProgress,
                rootContainerInstance,
              );
            }
          }
        } else {
          const instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
          // 将子孙DOM节点插入刚生成的DOM节点中
          appendAllChildren(instance, workInProgress, false, false);

          // This needs to be set before we mount Flare event listeners
          // DOM节点赋值给fiber.stateNode
          workInProgress.stateNode = instance;

          // 与update逻辑中的updateHostComponent类似的处理props的过程
          if (enableDeprecatedFlareAPI) {
            const listeners = newProps.DEPRECATED_flareListeners;
            if (listeners != null) {
              updateDeprecatedEventListeners(
                listeners,
                workInProgress,
                rootContainerInstance,
              );
            }
          }

          // Certain renderers require commit-time effects for initial mount.
          // (eg DOM renderer supports auto-focus for certain elements).
          // Make sure such renderers get scheduled for later work.
          if (
            finalizeInitialChildren(
              instance,
              type,
              newProps,
              rootContainerInstance,
              currentHostContext,
            )
          ) {
            markUpdate(workInProgress);
          }
        }

        if (workInProgress.ref !== null) {
          // If there is a ref on a host node we need to schedule a callback
          markRef(workInProgress);
        }
      }
      return null;
    }
    case HostText: {
      const newText = newProps;
      if (current && workInProgress.stateNode != null) {
        const oldText = current.memoizedProps;
        // If we have an alternate, that means this is an update and we need
        // to schedule a side-effect to do the updates.
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        if (typeof newText !== 'string') {
          invariant(
            workInProgress.stateNode !== null,
            'We must have new props for new mounts. This error is likely ' +
              'caused by a bug in React. Please file an issue.',
          );
          // This can happen when we abort work.
        }
        const rootContainerInstance = getRootHostContainer();
        const currentHostContext = getHostContext();
        const wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          if (prepareToHydrateHostTextInstance(workInProgress)) {
            markUpdate(workInProgress);
          }
        } else {
          workInProgress.stateNode = createTextInstance(
            newText,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
        }
      }
      return null;
    }
    case SuspenseComponent: {
      popSuspenseContext(workInProgress);
      const nextState: null | SuspenseState = workInProgress.memoizedState;

      if (enableSuspenseServerRenderer) {
        if (nextState !== null && nextState.dehydrated !== null) {
          if (current === null) {
            const wasHydrated = popHydrationState(workInProgress);
            invariant(
              wasHydrated,
              'A dehydrated suspense component was completed without a hydrated node. ' +
                'This is probably a bug in React.',
            );
            prepareToHydrateHostSuspenseInstance(workInProgress);
            if (enableSchedulerTracing) {
              markSpawnedWork(OffscreenLane);
            }
            return null;
          } else {
            // We should never have been in a hydration state if we didn't have a current.
            // However, in some of those paths, we might have reentered a hydration state
            // and then we might be inside a hydration state. In that case, we'll need to exit out of it.
            resetHydrationState();
            if ((workInProgress.effectTag & DidCapture) === NoEffect) {
              // This boundary did not suspend so it's now hydrated and unsuspended.
              workInProgress.memoizedState = null;
            }
            // If nothing suspended, we need to schedule an effect to mark this boundary
            // as having hydrated so events know that they're free to be invoked.
            // It's also a signal to replay events and the suspense callback.
            // If something suspended, schedule an effect to attach retry listeners.
            // So we might as well always mark this.
            workInProgress.effectTag |= Update;
            return null;
          }
        }
      }

      if ((workInProgress.effectTag & DidCapture) !== NoEffect) {
        // Something suspended. Re-render with the fallback children.
        workInProgress.lanes = renderLanes;
        // Do not reset the effect list.
        if (
          enableProfilerTimer &&
          (workInProgress.mode & ProfileMode) !== NoMode
        ) {
          transferActualDuration(workInProgress);
        }
        return workInProgress;
      }

      const nextDidTimeout = nextState !== null;
      let prevDidTimeout = false;
      if (current === null) {
        if (workInProgress.memoizedProps.fallback !== undefined) {
          popHydrationState(workInProgress);
        }
      } else {
        const prevState: null | SuspenseState = current.memoizedState;
        prevDidTimeout = prevState !== null;
      }

      if (nextDidTimeout && !prevDidTimeout) {
        // If this subtreee is running in blocking mode we can suspend,
        // otherwise we won't suspend.
        // TODO: This will still suspend a synchronous tree if anything
        // in the concurrent tree already suspended during this render.
        // This is a known bug.
        if ((workInProgress.mode & BlockingMode) !== NoMode) {
          // TODO: Move this back to throwException because this is too late
          // if this is a large tree which is common for initial loads. We
          // don't know if we should restart a render or not until we get
          // this marker, and this is too late.
          // If this render already had a ping or lower pri updates,
          // and this is the first time we know we're going to suspend we
          // should be able to immediately restart from within throwException.
          const hasInvisibleChildContext =
            current === null &&
            workInProgress.memoizedProps.unstable_avoidThisFallback !== true;
          if (
            hasInvisibleChildContext ||
            hasSuspenseContext(
              suspenseStackCursor.current,
              (InvisibleParentSuspenseContext: SuspenseContext),
            )
          ) {
            // If this was in an invisible tree or a new render, then showing
            // this boundary is ok.
            renderDidSuspend();
          } else {
            // Otherwise, we're going to have to hide content so we should
            // suspend for longer if possible.
            renderDidSuspendDelayIfPossible();
          }
        }
      }

      if (supportsPersistence) {
        // TODO: Only schedule updates if not prevDidTimeout.
        if (nextDidTimeout) {
          // If this boundary just timed out, schedule an effect to attach a
          // retry listener to the promise. This flag is also used to hide the
          // primary children.
          workInProgress.effectTag |= Update;
        }
      }
      if (supportsMutation) {
        // TODO: Only schedule updates if these values are non equal, i.e. it changed.
        if (nextDidTimeout || prevDidTimeout) {
          // If this boundary just timed out, schedule an effect to attach a
          // retry listener to the promise. This flag is also used to hide the
          // primary children. In mutation mode, we also need the flag to
          // *unhide* children that were previously hidden, so check if this
          // is currently timed out, too.
          workInProgress.effectTag |= Update;
        }
      }
      if (
        enableSuspenseCallback &&
        workInProgress.updateQueue !== null &&
        workInProgress.memoizedProps.suspenseCallback != null
      ) {
        // Always notify the callback
        workInProgress.effectTag |= Update;
      }
      return null;
    }
    case HostPortal:
      popHostContainer(workInProgress);
      updateHostContainer(workInProgress);
      if (current === null) {
        preparePortalMount(workInProgress.stateNode.containerInfo);
      }
      return null;
    case ContextProvider:
      // Pop provider fiber
      popProvider(workInProgress);
      return null;
    case IncompleteClassComponent: {
      // Same as class component case. I put it down here so that the tags are
      // sequential to ensure this switch is compiled to a jump table.
      const Component = workInProgress.type;
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(workInProgress);
      }
      return null;
    }
    case SuspenseListComponent: {
      popSuspenseContext(workInProgress);

      const renderState: null | SuspenseListRenderState =
        workInProgress.memoizedState;

      if (renderState === null) {
        // We're running in the default, "independent" mode.
        // We don't do anything in this mode.
        return null;
      }

      let didSuspendAlready =
        (workInProgress.effectTag & DidCapture) !== NoEffect;

      const renderedTail = renderState.rendering;
      if (renderedTail === null) {
        // We just rendered the head.
        if (!didSuspendAlready) {
          // This is the first pass. We need to figure out if anything is still
          // suspended in the rendered set.

          // If new content unsuspended, but there's still some content that
          // didn't. Then we need to do a second pass that forces everything
          // to keep showing their fallbacks.

          // We might be suspended if something in this render pass suspended, or
          // something in the previous committed pass suspended. Otherwise,
          // there's no chance so we can skip the expensive call to
          // findFirstSuspended.
          const cannotBeSuspended =
            renderHasNotSuspendedYet() &&
            (current === null || (current.effectTag & DidCapture) === NoEffect);
          if (!cannotBeSuspended) {
            let row = workInProgress.child;
            while (row !== null) {
              const suspended = findFirstSuspended(row);
              if (suspended !== null) {
                didSuspendAlready = true;
                workInProgress.effectTag |= DidCapture;
                cutOffTailIfNeeded(renderState, false);

                // If this is a newly suspended tree, it might not get committed as
                // part of the second pass. In that case nothing will subscribe to
                // its thennables. Instead, we'll transfer its thennables to the
                // SuspenseList so that it can retry if they resolve.
                // There might be multiple of these in the list but since we're
                // going to wait for all of them anyway, it doesn't really matter
                // which ones gets to ping. In theory we could get clever and keep
                // track of how many dependencies remain but it gets tricky because
                // in the meantime, we can add/remove/change items and dependencies.
                // We might bail out of the loop before finding any but that
                // doesn't matter since that means that the other boundaries that
                // we did find already has their listeners attached.
                const newThennables = suspended.updateQueue;
                if (newThennables !== null) {
                  workInProgress.updateQueue = newThennables;
                  workInProgress.effectTag |= Update;
                }

                // Rerender the whole list, but this time, we'll force fallbacks
                // to stay in place.
                // Reset the effect list before doing the second pass since that's now invalid.
                if (renderState.lastEffect === null) {
                  workInProgress.firstEffect = null;
                }
                workInProgress.lastEffect = renderState.lastEffect;
                // Reset the child fibers to their original state.
                resetChildFibers(workInProgress, renderLanes);

                // Set up the Suspense Context to force suspense and immediately
                // rerender the children.
                pushSuspenseContext(
                  workInProgress,
                  setShallowSuspenseContext(
                    suspenseStackCursor.current,
                    ForceSuspenseFallback,
                  ),
                );
                return workInProgress.child;
              }
              row = row.sibling;
            }
          }
        } else {
          cutOffTailIfNeeded(renderState, false);
        }
        // Next we're going to render the tail.
      } else {
        // Append the rendered row to the child list.
        if (!didSuspendAlready) {
          const suspended = findFirstSuspended(renderedTail);
          if (suspended !== null) {
            workInProgress.effectTag |= DidCapture;
            didSuspendAlready = true;

            // Ensure we transfer the update queue to the parent so that it doesn't
            // get lost if this row ends up dropped during a second pass.
            const newThennables = suspended.updateQueue;
            if (newThennables !== null) {
              workInProgress.updateQueue = newThennables;
              workInProgress.effectTag |= Update;
            }

            cutOffTailIfNeeded(renderState, true);
            // This might have been modified.
            if (
              renderState.tail === null &&
              renderState.tailMode === 'hidden' &&
              !renderedTail.alternate &&
              !getIsHydrating() // We don't cut it if we're hydrating.
            ) {
              // We need to delete the row we just rendered.
              // Reset the effect list to what it was before we rendered this
              // child. The nested children have already appended themselves.
              const lastEffect = (workInProgress.lastEffect =
                renderState.lastEffect);
              // Remove any effects that were appended after this point.
              if (lastEffect !== null) {
                lastEffect.nextEffect = null;
              }
              // We're done.
              return null;
            }
          } else if (
            // The time it took to render last row is greater than time until
            // the expiration.
            now() * 2 - renderState.renderingStartTime >
              renderState.tailExpiration &&
            renderLanes !== OffscreenLane
          ) {
            // We have now passed our CPU deadline and we'll just give up further
            // attempts to render the main content and only render fallbacks.
            // The assumption is that this is usually faster.
            workInProgress.effectTag |= DidCapture;
            didSuspendAlready = true;

            cutOffTailIfNeeded(renderState, false);

            // Since nothing actually suspended, there will nothing to ping this
            // to get it started back up to attempt the next item. If we can show
            // them, then they really have the same priority as this render.
            // So we'll pick it back up the very next render pass once we've had
            // an opportunity to yield for paint.
            workInProgress.lanes = renderLanes;
            if (enableSchedulerTracing) {
              markSpawnedWork(renderLanes);
            }
          }
        }
        if (renderState.isBackwards) {
          // The effect list of the backwards tail will have been added
          // to the end. This breaks the guarantee that life-cycles fire in
          // sibling order but that isn't a strong guarantee promised by React.
          // Especially since these might also just pop in during future commits.
          // Append to the beginning of the list.
          renderedTail.sibling = workInProgress.child;
          workInProgress.child = renderedTail;
        } else {
          const previousSibling = renderState.last;
          if (previousSibling !== null) {
            previousSibling.sibling = renderedTail;
          } else {
            workInProgress.child = renderedTail;
          }
          renderState.last = renderedTail;
        }
      }

      if (renderState.tail !== null) {
        // We still have tail rows to render.
        if (renderState.tailExpiration === 0) {
          // Heuristic for how long we're willing to spend rendering rows
          // until we just give up and show what we have so far.
          const TAIL_EXPIRATION_TIMEOUT_MS = 500;
          renderState.tailExpiration = now() + TAIL_EXPIRATION_TIMEOUT_MS;
          // TODO: This is meant to mimic the train model or JND but this
          // is a per component value. It should really be since the start
          // of the total render or last commit. Consider using something like
          // globalMostRecentFallbackTime. That doesn't account for being
          // suspended for part of the time or when it's a new render.
          // It should probably use a global start time value instead.
        }
        // Pop a row.
        const next = renderState.tail;
        renderState.rendering = next;
        renderState.tail = next.sibling;
        renderState.lastEffect = workInProgress.lastEffect;
        renderState.renderingStartTime = now();
        next.sibling = null;

        // Restore the context.
        // TODO: We can probably just avoid popping it instead and only
        // setting it the first time we go from not suspended to suspended.
        let suspenseContext = suspenseStackCursor.current;
        if (didSuspendAlready) {
          suspenseContext = setShallowSuspenseContext(
            suspenseContext,
            ForceSuspenseFallback,
          );
        } else {
          suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);
        }
        pushSuspenseContext(workInProgress, suspenseContext);
        // Do a pass over the next row.
        return next;
      }
      return null;
    }
    case FundamentalComponent: {
      if (enableFundamentalAPI) {
        const fundamentalImpl = workInProgress.type.impl;
        let fundamentalInstance: ReactFundamentalComponentInstance<
          any,
          any,
        > | null = workInProgress.stateNode;

        if (fundamentalInstance === null) {
          const getInitialState = fundamentalImpl.getInitialState;
          let fundamentalState;
          if (getInitialState !== undefined) {
            fundamentalState = getInitialState(newProps);
          }
          fundamentalInstance = workInProgress.stateNode = createFundamentalStateInstance(
            workInProgress,
            newProps,
            fundamentalImpl,
            fundamentalState || {},
          );
          const instance = ((getFundamentalComponentInstance(
            fundamentalInstance,
          ): any): Instance);
          fundamentalInstance.instance = instance;
          if (fundamentalImpl.reconcileChildren === false) {
            return null;
          }
          appendAllChildren(instance, workInProgress, false, false);
          mountFundamentalComponent(fundamentalInstance);
        } else {
          // We fire update in commit phase
          const prevProps = fundamentalInstance.props;
          fundamentalInstance.prevProps = prevProps;
          fundamentalInstance.props = newProps;
          fundamentalInstance.currentFiber = workInProgress;
          if (supportsPersistence) {
            const instance = cloneFundamentalInstance(fundamentalInstance);
            fundamentalInstance.instance = instance;
            appendAllChildren(instance, workInProgress, false, false);
          }
          const shouldUpdate = shouldUpdateFundamentalComponent(
            fundamentalInstance,
          );
          if (shouldUpdate) {
            markUpdate(workInProgress);
          }
        }
        return null;
      }
      break;
    }
    case ScopeComponent: {
      if (enableScopeAPI) {
        if (current === null) {
          const scopeInstance: ReactScopeInstance = createScopeInstance();
          workInProgress.stateNode = scopeInstance;
          if (enableDeprecatedFlareAPI) {
            const listeners = newProps.DEPRECATED_flareListeners;
            if (listeners != null) {
              const rootContainerInstance = getRootHostContainer();
              updateDeprecatedEventListeners(
                listeners,
                workInProgress,
                rootContainerInstance,
              );
            }
          }
          prepareScopeUpdate(scopeInstance, workInProgress);
          if (workInProgress.ref !== null) {
            markRef(workInProgress);
            markUpdate(workInProgress);
          }
        } else {
          if (enableDeprecatedFlareAPI) {
            const prevListeners =
              current.memoizedProps.DEPRECATED_flareListeners;
            const nextListeners = newProps.DEPRECATED_flareListeners;
            if (
              prevListeners !== nextListeners ||
              workInProgress.ref !== null
            ) {
              markUpdate(workInProgress);
            }
          } else {
            if (workInProgress.ref !== null) {
              markUpdate(workInProgress);
            }
          }
          if (current.ref !== workInProgress.ref) {
            markRef(workInProgress);
          }
        }
        return null;
      }
      break;
    }
    case Block:
      if (enableBlocksAPI) {
        return null;
      }
      break;
    case OffscreenComponent:
    case LegacyHiddenComponent: {
      popRenderLanes(workInProgress);
      if (current !== null) {
        const nextState: OffscreenState | null = workInProgress.memoizedState;
        const prevState: OffscreenState | null = current.memoizedState;

        const prevIsHidden = prevState !== null;
        const nextIsHidden = nextState !== null;
        if (
          prevIsHidden !== nextIsHidden &&
          newProps.mode !== 'unstable-defer-without-hiding'
        ) {
          workInProgress.effectTag |= Update;
        }
      }
      return null;
    }
  }
  invariant(
    false,
    'Unknown unit of work tag (%s). This error is likely caused by a bug in ' +
      'React. Please file an issue.',
    workInProgress.tag,
  );
}



updateHostComponent = function(
    current: Fiber,
    workInProgress: Fiber,
    type: Type,
    newProps: Props,
    rootContainerInstance: Container,
  ) {
    // If we have an alternate, that means this is an update and we need to
    // schedule a side-effect to do the updates.
    const oldProps = current.memoizedProps;
    if (oldProps === newProps) {
      // In mutation mode, this is sufficient for a bailout because
      // we won't touch this node even if children changed.
      return;
    }

    // If we get updated because one of our children updated, we don't
    // have newProps so we'll have to reuse them.
    // TODO: Split the update API as separate for the props vs. children.
    // Even better would be if children weren't special cased at all tho.
    const instance: Instance = workInProgress.stateNode;
    const currentHostContext = getHostContext();
    // TODO: Experiencing an error where oldProps is null. Suggests a host
    // component is hitting the resume path. Figure out why. Possibly
    // related to `hidden`.
    const updatePayload = prepareUpdate(
      instance,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
      currentHostContext,
    );
    // TODO: Type this specific to this type of component.

    // 在updateHostComponent内部，被处理完的props会被赋值给workInProgress.updateQueue，并最终会在commit阶段被渲染在页面上
    workInProgress.updateQueue = (updatePayload: any);
    // If the update payload indicates that there is a change or if there
    // is a new ref we mark this as an update. All the work is done in commitWork.
    // updatePayload为数组形式，他的偶数索引的值为变化的Prop key,奇数索引的值为变化的prop value
    if (updatePayload) {
      markUpdate(workInProgress);
    }
 };
```

### effectList

在 completeWork 的上层函数 completeUnitOfWork 中，每个执行完 completeWork 且存在 effectTag 的 Fiber 节点会被保存在一条被称为 effectList 的单向链表中

effectList 中第一个 Fiber 节点保存在 fiber.firstEffect,最后一个元素保存在 fiber.lastEffect

类似 appendAllChildren,在"归"阶段，所有有 effectTag 的 Fiber 节点都会被追加在 effectList 中，最终形成一条以 rootFiber.firstEffect 为起点的单向链表

这样，在 commit 阶段只需要遍历 effectList 就能执行所有 effect 了

在 performSyncWorkOnRoot 函数中 fiberRootNode 被传递给 commitRoot 方法，开启 commit 阶段工作流程。

```JavaScript
function completeUnitOfWork(unitOfWork: Fiber): void {
  // Attempt to complete the current unit of work, then move to the next
  // sibling. If there are no more siblings, return to the parent fiber.
  let completedWork = unitOfWork;
  do {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    // Check if the work completed or if something threw.
    if ((completedWork.effectTag & Incomplete) === NoEffect) {
      setCurrentDebugFiberInDEV(completedWork);
      let next;
      if (
        !enableProfilerTimer ||
        (completedWork.mode & ProfileMode) === NoMode
      ) {
        next = completeWork(current, completedWork, subtreeRenderLanes);
      } else {
        startProfilerTimer(completedWork);
        next = completeWork(current, completedWork, subtreeRenderLanes);
        // Update render duration assuming we didn't error.
        stopProfilerTimerIfRunningAndRecordDelta(completedWork, false);
      }
      resetCurrentDebugFiberInDEV();

      if (next !== null) {
        // Completing this fiber spawned new work. Work on that next.
        workInProgress = next;
        return;
      }

      resetChildLanes(completedWork);

      if (
        returnFiber !== null &&
        // Do not append effects to parents if a sibling failed to complete
        (returnFiber.effectTag & Incomplete) === NoEffect
      ) {
        // Append all the effects of the subtree and this fiber onto the effect
        // list of the parent. The completion order of the children affects the
        // side-effect order.
        if (returnFiber.firstEffect === null) {
          returnFiber.firstEffect = completedWork.firstEffect;
        }
        if (completedWork.lastEffect !== null) {
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
          }
          returnFiber.lastEffect = completedWork.lastEffect;
        }

        // If this fiber had side-effects, we append it AFTER the children's
        // side-effects. We can perform certain side-effects earlier if needed,
        // by doing multiple passes over the effect list. We don't want to
        // schedule our own side-effect on our own list because if end up
        // reusing children we'll schedule this effect onto itself since we're
        // at the end.
        const effectTag = completedWork.effectTag;

        // Skip both NoWork and PerformedWork tags when creating the effect
        // list. PerformedWork effect is read by React DevTools but shouldn't be
        // committed.
        if (effectTag > PerformedWork) {
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = completedWork;
          } else {
            returnFiber.firstEffect = completedWork;
          }
          returnFiber.lastEffect = completedWork;
        }
      }
    } else {
      // This fiber did not complete because something threw. Pop values off
      // the stack without entering the complete phase. If this is a boundary,
      // capture values if possible.
      const next = unwindWork(completedWork, subtreeRenderLanes);

      // Because this fiber did not complete, don't reset its expiration time.

      if (next !== null) {
        // If completing this work spawned new work, do that next. We'll come
        // back here again.
        // Since we're restarting, remove anything that is not a host effect
        // from the effect tag.
        next.effectTag &= HostEffectMask;
        workInProgress = next;
        return;
      }

      if (
        enableProfilerTimer &&
        (completedWork.mode & ProfileMode) !== NoMode
      ) {
        // Record the render duration for the fiber that errored.
        stopProfilerTimerIfRunningAndRecordDelta(completedWork, false);

        // Include the time spent working on failed children before continuing.
        let actualDuration = completedWork.actualDuration;
        let child = completedWork.child;
        while (child !== null) {
          actualDuration += child.actualDuration;
          child = child.sibling;
        }
        completedWork.actualDuration = actualDuration;
      }

      if (returnFiber !== null) {
        // Mark the parent fiber as incomplete and clear its effect list.
        returnFiber.firstEffect = returnFiber.lastEffect = null;
        returnFiber.effectTag |= Incomplete;
        returnFiber.subtreeTag = NoSubtreeTag;
        returnFiber.deletions = null;
      }
    }

    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      // If there is more work to do in this returnFiber, do that next.
      workInProgress = siblingFiber;
      return;
    }
    // Otherwise, return to the parent
    completedWork = returnFiber;
    // Update the next thing we're working on in case something throws.
    workInProgress = completedWork;
  } while (completedWork !== null);

  // We've reached the root.
  if (workInProgressRootExitStatus === RootIncomplete) {
    workInProgressRootExitStatus = RootCompleted;
  }
}
```

## commit

commitRoot 方法是 commit 阶段工作的起点。fiberRootNode 会作为传参。

```JavaScript
commitRoot(root);
```

rootFiber.firstEffect 上保存了一条需要执行副作用的 Fiber 节点的单向链表 effectList，这些 Fiber 节点的 updateQueue 中保存了变化的 props。

这些副作用对应的 DOM 操作在 commit 阶段执行

一些生命周期钩子（比如 componentDidXXX）、hook（比如 useEffect）需要在 commit 阶段执行

commit 阶段的主要工作（即 Renderer 的工作流程）分为三部分：

- before mutation 阶段（执行 DOM 操作前）
- mutation 阶段（执行 DOM 操作）
- layout 阶段（执行 DOM 操作后）

### before mutation 之前

```JavaScript
do {
  // 触发useEffect回调与其他同步任务。有这些任务可能触发新的渲染，所以这里要一直遍历执行直到没有任务
  flushPassiveEffects();
} while (rootWithPendingPassiveEffects !== null);

// root指 fiberRootNode
// root.finishedWork指当前应用的rootFiber
const finishedWork = root.finishedWork;

// 凡是变量名带lane的都是优先级相关
const lanes = root.finishedLanes;
if (finishedWork === null) {
  return null;
}
root.finishedWork = null;
root.finishedLanes = NoLanes;

let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
// 重置优先级相关变量
markRootFinished(root, remainingLanes);

// 清除已完成的discrete updates，例如：用户鼠标点击触发的更新。
if (rootsWithPendingDiscreteUpdates !== null) {
  if (
    !hasDiscreteLanes(remainingLanes) &&
    rootsWithPendingDiscreteUpdates.has(root)
  ) {
    rootsWithPendingDiscreteUpdates.delete(root)
  }
}

// 重置全局变量
if (root === workInProgressRoot) {
  workInProgressRoot = null;
  workInProgress = null;
  workInProgressRootRenderLanes = NoLanes;
} else {
}

// 将effectList赋值给firstEffect
// 由于每个fiber的effectList只包含他的子孙节点
// 所以根节点如果有effectTag则不会被包含进来
// 所以这里将有effectTag的根节点插入到effectList尾部
// 这样才能保证有effect的fiber都在effectList中
let firstEffect;
if (finishedWork.effectTag > PerformedWork) {
  if (finishedWork.lastEffect !== null) {
    finishedWork.lastEffect.nextEffect = finishedWork;
    firstEffect = finishedWork.firstEffect;
  } else {
    firstEffect = finishedWork;
  }
} else {
  // 根节点没有effectTag
  firstEffect = finishedWork.firstEffect;
}
```

### layout 之后

1. useEffect 相关的处理
2. 性能追踪相关
3. commit 阶段会触发一些生命周期钩子

```JavaScript
const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;

// useEffect相关
if (rootDoesHavePassiveEffects) {
  rootDoesHavePassiveEffects = false;
  rootWithPendingPassiveEffects = root;
  pendingPassiveEffectsLanes = lanes;
  pendingPassiveEffectsRenderPriority = renderPriorityLevel;
} else {}

// 性能优化相关
if (remainingLanes !== NoLanes) {
  if (enableSchedulerTracing) {
    // ...
  }
} else {
  // ...
}

// 性能优化相关
if (enableSchedulerTracing) {
  if (!rootDidHavePassiveEffects) {
    // ...
  }
}

// ...检测无限循环的同步任务
if (remainingLanes === SyncLane) {
  // ...
}

// 在离开commitRoot函数前调用，触发一次新的调度，确保任何附加的任务被调度
ensureRootIsScheduled(root, now());

// ...处理未捕获错误及老版本遗留的边界问题


// 执行同步任务，这样同步任务不需要等到下次事件循环再执行
// 比如在 componentDidMount 中执行 setState 创建的更新会在这里被同步执行
// 或useLayoutEffect
flushSyncCallbackQueue();

return null;
```

### before mutation

整个过程就是遍历 effectList 并调用 commitBeforeMutationEffects 函数处理

```JavaScript
// 保存之前的优先级，以同步优先级执行，执行完毕后恢复之前优先级
const previousLanePriority = getCurrentUpdateLanePriority();
setCurrentUpdateLanePriority(SyncLanePriority);

// 将当前上下文标记为CommitContext，作为commit阶段的标志
const prevExecutionContext = executionContext;
executionContext |= CommitContext;

// 处理focus状态
focusedInstanceHandle = prepareForCommit(root.containerInfo);
shouldFireAfterActiveInstanceBlur = false;

// beforeMutation阶段的主函数
commitBeforeMutationEffects(finishedWork);

focusedInstanceHandle = null;
```

### commitBeforeMutationEffects

1. 处理 DOM 节点渲染/删除后的 autoFocus、blur 逻辑
2. 调用 getSnapshotBeforeUpdate 生命周期钩子
3. 调度 useEffect

```JavaScript
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    const current = nextEffect.alternate;

    if (!shouldFireAfterActiveInstanceBlur && focusedInstanceHandle !== null) {
      // ...focus blur相关
    }

    const effectTag = nextEffect.effectTag;

    // 调用getSnapshotBeforeUpdate
    if ((effectTag & Snapshot) !== NoEffect) {
      commitBeforeMutationEffectOnFiber(current, nextEffect);
    }

    // 调度useEffect
    if ((effectTag & Passive) !== NoEffect) {
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true;
        scheduleCallback(NormalSchedulerPriority, () => {
          flushPassiveEffects();
          return null;
        });
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

### 调用 getSnapshotBeforeUpdate

getSnapshotBeforeUpdate 是在 commit 阶段内的 before mutation 阶段调用的，由于 commit 阶段是同步的，所以不会遇到多次调用的问题。

### 调度 useEffect

scheduleCallback 方法由 Scheduler 模块提供，用于以某个优先级异步调度一个回调函数

```JavaScript
// 调度useEffect
if ((effectTag & Passive) != NoEffect) {
  if (!rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = true;
    scheduleCallback(NormalSchedulerPriority, () => {
      // 触发useEffect
      flushPassiveEffects();
      return null;
    })
  }
}
```

### 如何异步调度

在 flushPassiveEffects 方法内部会从全局变量 rootWithPendingPassiveEffects 获取 effectList。
effectList 保存了需要执行副作用的 Fiber 节点。其中副作用

- 插入 DOM 节点
- 更新 DOM 节点
- 删除 DOM 节点
  除此外，当一个 FunctionComponent 含有 useEffect 或 useLayoutEffect，他对应的 Fiber 节点也会被赋值 effectTag

useEffect 异步调用分为三步：

1. before mutation 阶段在 scheduleCallback 中调度 flushPassiveEffects
2. layout 阶段之后将 effectList 赋值给 rootWithPendingPassiveEffects
3. scheduleCallback 触发 flushPassiveEffects, flushPassiveEffects 内部遍历 rootWithPendingPassiveEffects

### 为什么需要异步调用

与 componentDidMount、componentDidUpdate 不同的是，在浏览器完成布局与绘制之后，传给 useEffect 的函数会延迟调用。这使得它适用于许多常见的副作用场景，比如设置订阅和事件处理等情况，因此不应在函数中执行阻塞浏览器更新屏幕的操作。

useEffect 异步执行的原因主要是防止同步执行时阻塞浏览器渲染。

### 总结

在 before mutation 阶段，会遍历 effectList，依次执行：

1. 处理 DOM 节点渲染/删除后的 autoFocus、blur 逻辑
2. 调用 getSnapshotBeforeUpdate 生命周期钩子
3. 调度 useEffect

## mutation 阶段

mutation 阶段也是遍历 effectList 执行函数。执行的是 commitMutationEffects

```JavaScript
nextEffect = firstEffect;
do {
  try {
    commitMutationEffects(root, renderPriorityLevel);
  } catch (error) {
    invariant(nextEffect !== null, 'Should be working on an effect.')
    captureCommitPhaseError(nextEffect, error);
    nextEffect = nextEffect.nextEffect;
  }
} while (nextEffect !== null);


function commitMutationEffects(root: FiberRoot, renderPriorityLevel) {
  // 遍历effectList
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;

    // 根据 ContentReset effectTag重置文字节点
    if (effectTag & ContentReset) {
      commitResetTextContent(nextEffect);
    }

    // 更新ref
    if (effectTag & Ref) {
      const current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current)
      }
    }

    // 根据effectTag分别处理
    const primaryEffectTag =
      effectTag & (Placement | Update | Deletion | Hydrating);
    switch (primaryEffectTag) {
      // 插入DOM
      case Placement: {
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;
        break;
      }
      // 插入DOM并更新DOM
      case PlacementAndUpdate: {
        // 插入
        commitPlacement(nextEffect);

        nextEffect.effectTag &= ~Placement;

        // 更新
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      // SSR
      case Hydrating: {
        nextEffect.effectTag &= ~Hydrating;
        break;
      }
      // SSR
      case HydratingAndUpdate: {
        nextEffect.effectTag &= ~Hydrating;

        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      // 更新DOM
      case Update: {
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      // 删除DOM
      case Deletion: {
        commitDeletion(root, nextEffect, renderPriorityLevel);
        break;
      }
    }

    nextEffect = nextEffect.nextEffect;
  }
}
```

commitMutationEffects 会遍历 effectList,对每个 Fiber 节点执行以下三个操作：

1. 根据 ContentReset effectTag 重置文字节点
2. 更新 ref
3. 根据 effectTag 分别处理，其中 effectTag 包括（placement | Update | Deletion | Hydrating）

### Placement effect

当 Fiber 节点含有 Placement effectTag，意味着该 Fiber 节点对应的 DOM 节点需要插入到页面中
调用的方法为 commitPlacement

1. 获取父级 DOM 节点。其中 finishedWork 为传入的 Fiber 节点

```JavaScript
const parentFiber = getHostParentFiber(finishedWork);
//父级DOM节点
const parentStateNode = parentFiber.stateNode;
```

2. 获取 Fiber 节点的 DOM 兄弟节点

```JavaScript
const before = getHostSibling(finishedWork);
```

3. 根据 DOM 兄弟节点是否存在决定调用 parentNode.insertBefore 或 parentNode.appendChild 执行 DOM 插入操作。

```JavaScript
// parentStateNode是否是rootFiber
if (isContainer) {
  insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
} else {
  insertOrAppendPlacementNode(finishedWork, before, parent);
}
```

getHostSibling 很耗时，这是因为 Fiber 节点不只包括 HostComponent，所以 Fiber 树和渲染的 DOM 树节点并不是一一对应的。

### Update effect

当 Fiber 节点含有 Update effectTag，意味着该 Fiber 节点需要更新。调用的方法为 commitWork，他会根据 Fiber.tag 分别处理。

### FunctionComponent mutation

当 fiber.tag 为 FunctionComponent,会调用 commitHookEffectListUnmount。该方法会遍历 effectList，执行所有 useLayoutEffect hook 的销毁函数。

### HostComponent mutation

当 fiber.tag 为 HostComponent，会调用 commitUpdate

最终会在 updateDOMProperties 中将 render 阶段 completeWork 中为 Fiber 节点赋值的 updateQueue 中对应的内容渲染在页面上

```JavaScript
for (let i = 0; i < updatePayload.length; i += 2) {
  const propKey = updatePayload[i];
  const propValue = updatePayload[i + 1];

  // 处理 style
  if (propKey === STYLE) {
    setValueForStyles(domElement, propValue);
    // 处理 DANGEROUSLY_SET_INNER_HTML
  } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
    setInnerHTML(domElement, propValue);
    // 处理children
  } else if (propKey === CHILDREN) {
    setTextContent(domElement, propValue);
  } else {
    // 处理剩余 props
    setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
  }
}
```

### Deletion effect

当 Fiber 节点含有 Deletion effectTag，意味着该 Fiber 节点对应的 DOM 节点需要从页面中删除。调用的方法为 commitDeletion。
该方法会执行如下操作：

1. 递归调用 Fiber 节点及其子孙 Fiber 节点中 fiber.tag 为 ClassComponent 的 componentWillUnmount 生命周期钩子，从页面移除 Fiber 节点对应 DOM 节点
2. 解绑 ref
3. 调度 useEffect 的销毁函数

```JavaScript
function commitDeletion(
  finishedRoot: FiberRoot,
  current: Fiber,
  renderPriorityLevel: ReactPriorityLevel,
): void {
  if (supportsMutation) {
    // Recursively delete all host nodes from the parent.
    // Detach refs and call componentWillUnmount() on the whole subtree.
    unmountHostComponents(finishedRoot, current, renderPriorityLevel);
  } else {
    // Detach refs and call componentWillUnmount() on the whole subtree.
    commitNestedUnmounts(finishedRoot, current, renderPriorityLevel);
  }
  const alternate = current.alternate;
  detachFiberMutation(current);
  if (alternate !== null) {
    detachFiberMutation(alternate);
  }
}
```

### 总结

mutation 阶段会遍历 effectList，依次执行 commitMutationEffects。该方法的主要工作为"根据 effectTag 调用不同的处理函数处理 Fiber。

## Layout 阶段

该阶段的代码都是在 DOM 渲染完成（mutation 阶段完成）后执行的

该阶段触发的生命周期钩子和 hook 可以直接访问到已经改变后的 DOM，即该阶段是可以参与 DOM layout 的阶段

layout 阶段也是遍历 effectList 执行函数

```JavaScript
root.current = finishedWork;

nextEffect = firstEffect;
do {
  try {
    commitLayoutEffects(root, lanes);
  } catch (error) {
    invariant(nextEffect !== null, "Should be working on an effect.");
    captureCommitPhaseError(nextEffect, error);
    nextEffect = nextEffect.nextEffect;
  }
} while (nextEffect !== null);

nextEffect = null;
```

### commitLayoutEffects

```JavaScript
function commitLayoutEffects(root: FiberRoot, committedLanes: Lanes) {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;

    // 调用生命周期钩子和hook
    if (effectTag & (Update | Callback)) {
      const current = nextEffect.alternate;
      commitLayoutEffecOnFiber(root, current, nextEffect, committedLanes);
    }

    // 赋值ref
    if (effectTag & Ref) {
      commitAttachRef(nextEffect)
    }

    nextEffect = nextEffect.nextEffect;
  }
}
```

### commitLayoutEffectOnFiber

commitLayoutEffectOnFiber 方法会根据 fiber.tag 对不同类型的节点分别处理。

```JavaScript
function commitLifeCycles(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber,
  committedLanes: Lanes,
): void {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent:
    case Block: {
      // At this point layout effects have already been destroyed (during mutation phase).
      // This is done to prevent sibling component effects from interfering with each other,
      // e.g. a destroy function in one component should never override a ref set
      // by a create function in another component during the same commit.
      if (
        enableProfilerTimer &&
        enableProfilerCommitHooks &&
        finishedWork.mode & ProfileMode
      ) {
        try {
          startLayoutEffectTimer();
          commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
        } finally {
          recordLayoutEffectDuration(finishedWork);
        }
      } else {
        commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
      }

      schedulePassiveEffects(finishedWork);
      return;
    }
    case ClassComponent: {
      const instance = finishedWork.stateNode;
      if (finishedWork.effectTag & Update) {
        if (current === null) {
          // We could update instance props and state here,
          // but instead we rely on them being set during last render.
          // TODO: revisit this when we implement resuming.
          if (__DEV__) {
            if (
              finishedWork.type === finishedWork.elementType &&
              !didWarnAboutReassigningProps
            ) {
              if (instance.props !== finishedWork.memoizedProps) {
                console.error(
                  'Expected %s props to match memoized props before ' +
                    'componentDidMount. ' +
                    'This might either be because of a bug in React, or because ' +
                    'a component reassigns its own `this.props`. ' +
                    'Please file an issue.',
                  getComponentName(finishedWork.type) || 'instance',
                );
              }
              if (instance.state !== finishedWork.memoizedState) {
                console.error(
                  'Expected %s state to match memoized state before ' +
                    'componentDidMount. ' +
                    'This might either be because of a bug in React, or because ' +
                    'a component reassigns its own `this.state`. ' +
                    'Please file an issue.',
                  getComponentName(finishedWork.type) || 'instance',
                );
              }
            }
          }
          if (
            enableProfilerTimer &&
            enableProfilerCommitHooks &&
            finishedWork.mode & ProfileMode
          ) {
            try {
              startLayoutEffectTimer();
              instance.componentDidMount();
            } finally {
              recordLayoutEffectDuration(finishedWork);
            }
          } else {
            instance.componentDidMount();
          }
        } else {
          const prevProps =
            finishedWork.elementType === finishedWork.type
              ? current.memoizedProps
              : resolveDefaultProps(finishedWork.type, current.memoizedProps);
          const prevState = current.memoizedState;
          // We could update instance props and state here,
          // but instead we rely on them being set during last render.
          // TODO: revisit this when we implement resuming.
          if (__DEV__) {
            if (
              finishedWork.type === finishedWork.elementType &&
              !didWarnAboutReassigningProps
            ) {
              if (instance.props !== finishedWork.memoizedProps) {
                console.error(
                  'Expected %s props to match memoized props before ' +
                    'componentDidUpdate. ' +
                    'This might either be because of a bug in React, or because ' +
                    'a component reassigns its own `this.props`. ' +
                    'Please file an issue.',
                  getComponentName(finishedWork.type) || 'instance',
                );
              }
              if (instance.state !== finishedWork.memoizedState) {
                console.error(
                  'Expected %s state to match memoized state before ' +
                    'componentDidUpdate. ' +
                    'This might either be because of a bug in React, or because ' +
                    'a component reassigns its own `this.state`. ' +
                    'Please file an issue.',
                  getComponentName(finishedWork.type) || 'instance',
                );
              }
            }
          }
          if (
            enableProfilerTimer &&
            enableProfilerCommitHooks &&
            finishedWork.mode & ProfileMode
          ) {
            try {
              startLayoutEffectTimer();
              instance.componentDidUpdate(
                prevProps,
                prevState,
                instance.__reactInternalSnapshotBeforeUpdate,
              );
            } finally {
              recordLayoutEffectDuration(finishedWork);
            }
          } else {
            instance.componentDidUpdate(
              prevProps,
              prevState,
              instance.__reactInternalSnapshotBeforeUpdate,
            );
          }
        }
      }

      // TODO: I think this is now always non-null by the time it reaches the
      // commit phase. Consider removing the type check.
      const updateQueue: UpdateQueue<
        *,
      > | null = (finishedWork.updateQueue: any);
      if (updateQueue !== null) {
        if (__DEV__) {
          if (
            finishedWork.type === finishedWork.elementType &&
            !didWarnAboutReassigningProps
          ) {
            if (instance.props !== finishedWork.memoizedProps) {
              console.error(
                'Expected %s props to match memoized props before ' +
                  'processing the update queue. ' +
                  'This might either be because of a bug in React, or because ' +
                  'a component reassigns its own `this.props`. ' +
                  'Please file an issue.',
                getComponentName(finishedWork.type) || 'instance',
              );
            }
            if (instance.state !== finishedWork.memoizedState) {
              console.error(
                'Expected %s state to match memoized state before ' +
                  'processing the update queue. ' +
                  'This might either be because of a bug in React, or because ' +
                  'a component reassigns its own `this.state`. ' +
                  'Please file an issue.',
                getComponentName(finishedWork.type) || 'instance',
              );
            }
          }
        }
        // We could update instance props and state here,
        // but instead we rely on them being set during last render.
        // TODO: revisit this when we implement resuming.
        commitUpdateQueue(finishedWork, updateQueue, instance);
      }
      return;
    }
    case HostRoot: {
      // TODO: I think this is now always non-null by the time it reaches the
      // commit phase. Consider removing the type check.
      const updateQueue: UpdateQueue<
        *,
      > | null = (finishedWork.updateQueue: any);
      if (updateQueue !== null) {
        let instance = null;
        if (finishedWork.child !== null) {
          switch (finishedWork.child.tag) {
            case HostComponent:
              instance = getPublicInstance(finishedWork.child.stateNode);
              break;
            case ClassComponent:
              instance = finishedWork.child.stateNode;
              break;
          }
        }
        commitUpdateQueue(finishedWork, updateQueue, instance);
      }
      return;
    }
    case HostComponent: {
      const instance: Instance = finishedWork.stateNode;

      // Renderers may schedule work to be done after host components are mounted
      // (eg DOM renderer may schedule auto-focus for inputs and form controls).
      // These effects should only be committed when components are first mounted,
      // aka when there is no current/alternate.
      if (current === null && finishedWork.effectTag & Update) {
        const type = finishedWork.type;
        const props = finishedWork.memoizedProps;
        commitMount(instance, type, props, finishedWork);
      }

      return;
    }
    case HostText: {
      // We have no life-cycles associated with text.
      return;
    }
    case HostPortal: {
      // We have no life-cycles associated with portals.
      return;
    }
    case Profiler: {
      if (enableProfilerTimer) {
        const {onCommit, onRender} = finishedWork.memoizedProps;
        const {effectDuration} = finishedWork.stateNode;

        const commitTime = getCommitTime();

        if (typeof onRender === 'function') {
          if (enableSchedulerTracing) {
            onRender(
              finishedWork.memoizedProps.id,
              current === null ? 'mount' : 'update',
              finishedWork.actualDuration,
              finishedWork.treeBaseDuration,
              finishedWork.actualStartTime,
              commitTime,
              finishedRoot.memoizedInteractions,
            );
          } else {
            onRender(
              finishedWork.memoizedProps.id,
              current === null ? 'mount' : 'update',
              finishedWork.actualDuration,
              finishedWork.treeBaseDuration,
              finishedWork.actualStartTime,
              commitTime,
            );
          }
        }

        if (enableProfilerCommitHooks) {
          if (typeof onCommit === 'function') {
            if (enableSchedulerTracing) {
              onCommit(
                finishedWork.memoizedProps.id,
                current === null ? 'mount' : 'update',
                effectDuration,
                commitTime,
                finishedRoot.memoizedInteractions,
              );
            } else {
              onCommit(
                finishedWork.memoizedProps.id,
                current === null ? 'mount' : 'update',
                effectDuration,
                commitTime,
              );
            }
          }

          // Schedule a passive effect for this Profiler to call onPostCommit hooks.
          // This effect should be scheduled even if there is no onPostCommit callback for this Profiler,
          // because the effect is also where times bubble to parent Profilers.
          enqueuePendingPassiveProfilerEffect(finishedWork);

          // Propagate layout effect durations to the next nearest Profiler ancestor.
          // Do not reset these values until the next render so DevTools has a chance to read them first.
          let parentFiber = finishedWork.return;
          while (parentFiber !== null) {
            if (parentFiber.tag === Profiler) {
              const parentStateNode = parentFiber.stateNode;
              parentStateNode.effectDuration += effectDuration;
              break;
            }
            parentFiber = parentFiber.return;
          }
        }
      }
      return;
    }
    case SuspenseComponent: {
      commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
      return;
    }
    case SuspenseListComponent:
    case IncompleteClassComponent:
    case FundamentalComponent:
    case ScopeComponent:
    case OffscreenComponent:
    case LegacyHiddenComponent:
      return;
  }
  invariant(
    false,
    'This unit of work tag should not have side-effects. This error is ' +
      'likely caused by a bug in React. Please file an issue.',
  );
}
```

mutation 阶段会执行 useLayoutEffect hook 的销毁函数

useLayoutEffect hook 从上一次更新的销毁函数调用到本次更新的回调函数调用是同步执行的

而 useEffect 则需要先调度，在 Layout 阶段完成后再异步执行

## commitAttachRef

commitLayoutEffects 会做的第二件事是 commitAttachRef

获取 DOM 实例，更新 ref

```JavaScript
function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instance = finishedWork.stateNode;

    // 获取DOM实例
    let instanceToUse;
    switch (finishedWork.tag) {
      case HostComponent:
        instanceToUse = getPublicInstance(instance);
        break;
      default:
        instanceToUse = instance;
    }

    if (typeof ref === "function") {
      // 如果ref是函数形式，调用回调函数
      ref(instanceToUse);
    } else {
      // 如果ref是ref实例形式，赋值ref.current
      ref.current = instanceToUse;
    }
  }
}
```

### current Fiber 树切换

componentWillUnmount 会在 mutation 阶段执行。此时 current Fiber 树还指向前一次更新的 Fiber 树，在生命周期钩子内获取的 DOM 还是更新前的。

componentDidMount 和 componentDidUpdate 会在 layout 阶段执行。此时 current Fiber 树已经指向更新后的 Fiber 树，在生命周期钩子内获取的 DOM 就是更新后的。

### 总结

layout 阶段会遍历 effectList，依次执行 commitLayoutEffects。该方法的主要工作为“根据 effectTag 调用不同的处理函数处理 Fiber 并更新 ref。

## diff 算法

对于 update 的组件，它会将当前组件与该组件在上次更新时对应的 Fiber 节点比较（也就是俗称的 Diff 算法），将比较的结果生成新 Fiber 节点

1 个 DOM 节点在某一时刻最多会有 4 个节点和它相关

1. current Fiber。如果该 DOM 节点已在页面中,current Fiber 代表该 DOM 节点对应的 Fiber 节点
2. workInProgress Fiber。如果该 DOM 节点将在本次更新中渲染到页面中，workInProgress Fiber 代表该 DOM 节点对应的 Fiber 节点
3. DOM 节点本身
4. JSX 对象。即 ClassComponent 的 render 方法的返回结果，或 FuncionComponent 的调用结果。JSX 对象中包含描述 DOM 节点的信息。

diff 算法的本质是比较 current Fiber 和 JSX 对象生成 workInProgress Fiber

### diff 的瓶颈以及 React 如何应对

将前后俩棵树完全比对的算法的时间复杂度为 O(n3)
为了降低算法复杂度，React 的 diff 会预设三个限制：

1. 只对同级元素进行 Diff。如果一个 DOM 节点在前后俩次更新中跨越了层级，那么 React 不会尝试复用它。
2. 俩个不同类型的元素会产生出不同的树。如果元素由 div 变为 p，React 会销毁 div 及其子孙节点，并新建 p 及其子孙节点
3. 开发者可以通过 key prop 来暗示哪些子元素在不同的渲染下能保持稳定

### diff 是如何实现的

reconcileChildFibers 函数会根据 newChild(即 JSX 对象)类型调用不同的处理函数

```JavaScript
function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any
): Fiber | null {
  const isObject = typeof newChild === 'object' && newChild !== null;

  if (isObject) {
    // object类型，可能是 REACT_ELEMENT_TYPE 或 REACT_PORTAL_TYPE
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        // 调用 reconcileSingleElement 处理
    }
  }

  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // 调动 reconcileSingleTextNode 处理
  }

  if (isArray(newChild)) {
    // 调用 reconcileChildrenArray 处理
  }

  // 以下都没有命中，删除节点
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}
```

从同级的节点数量将 Diff 分为俩类：

1. 当 newChild 类型为 object、number、string，代表同级只有一个节点
2. 当 newChild 类型为 Array，同级有多个节点

### reconcileSingleElement

上次更新时的 Fiber 节点是否存在对应 DOM 节点 ——>是 DOM 节点是否可以复用 ——>是 将上次更新的 Fiber 节点的副本作为本次新生成的 Fiber 节点并返回
——>否 标记 DOM 需要被删除——> 新生成一个 Fiber 节点并返回

```JavaScript
function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement
): Fiber {
  const key = element.key;
  let child = currentFirstChild;

  // 首先判断是否存在对应DOM节点
  while (child !== null) {
    // 上一次更新存在DOM节点，接下来判断是否可复用

    // 首先比较key是否相同
    if (child.key === key) {
      // key 相同，接下来比较type是否相同

      switch (child.tag) {
        // ...省略case

        default: {
          if (child.elementType === element.type) {
            // type相同则表示可以复用
            // 返回复用的fiber
            return existing;
          }

          // type不同则跳出switch
          break;
        }
      }

      // 代码执行到这里代表：key相同但是type不同
      // 将该fiber及其兄弟fiber标记为删除
      deleteRemainingChildren(returnFiber, child);
      break;
    } else {
      /// key不同，将该fiber标记为删除
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }

  // 创建新Fiber，并返回 ...省略
}
```

### reconcileChildFibers

处理同级多个节点的 diff

更新组件发生的频率更高。所以 diff 会优先判断当前节点是否属于更新。

diff 算法的整体逻辑会经历俩轮遍历：
第一轮遍历： 处理更新的节点

第二轮遍历： 处理剩下的不属于更新的节点

### 第一轮遍历

1. let i = 0,遍历 newChildren，将 newChildren[i] 与 oldFiber 比较，判断 DOM 节点是否复用

2. 如果可复用，i++，继续比较 newChildren[i]与 oldFiber.sibling，可以复用则继续遍历。

3. 如果不可复用，分俩种情况：

- key 不同导致不可复用，立即跳出整个遍历，第一轮遍历结束。
- key 相同 type 不同导致不可复用，会将 oldFiber 标记为 DELETION，并继续遍历

4. 如果 newChildren 遍历完（即 i === newChildren.length - 1)或者 oldFiber 遍历完（即 oldFiber.sibling === null），跳出遍历，第一轮遍历结束。

```JavaScript
function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<*>,
    lanes: Lanes,
  ): Fiber | null {
    // This algorithm can't optimize by searching from both ends since we
    // don't have backpointers on fibers. I'm trying to see how far we can get
    // with that model. If it ends up not being worth the tradeoffs, we can
    // add it later.

    // Even with a two ended optimization, we'd want to optimize for the case
    // where there are few changes and brute force the comparison instead of
    // going for the Map. It'd like to explore hitting that path first in
    // forward-only mode and only go for the Map once we notice that we need
    // lots of look ahead. This doesn't handle reversal as well as two ended
    // search but that's unusual. Besides, for the two ended optimization to
    // work on Iterables, we'd need to copy the whole set.

    // In this first iteration, we'll just live with hitting the bad case
    // (adding everything to a Map) in for every insert/move.

    // If you change this code, also update reconcileChildrenIterator() which
    // uses the same algorithm.

    if (__DEV__) {
      // First, validate keys.
      let knownKeys = null;
      for (let i = 0; i < newChildren.length; i++) {
        const child = newChildren[i];
        knownKeys = warnOnInvalidKey(child, knownKeys, returnFiber);
      }
    }

    let resultingFirstChild: Fiber | null = null;
    let previousNewFiber: Fiber | null = null;

    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      const newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        lanes,
      );
      if (newFiber === null) {
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }
        break;
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    if (newIdx === newChildren.length) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    if (oldFiber === null) {
      // If we don't have any more existing children we can choose a fast path
      // since the rest will all be insertions.
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
        if (newFiber === null) {
          continue;
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          // TODO: Move out of the loop. This only happens for the first run.
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    }

    // Add all children to a key map for quick lookups.
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        lanes,
      );
      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          if (newFiber.alternate !== null) {
            // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            existingChildren.delete(
              newFiber.key === null ? newIdx : newFiber.key,
            );
          }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }

    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach(child => deleteChild(returnFiber, child));
    }

    return resultingFirstChild;
  }

```

### 第二轮遍历

newChildren 与 oldFiber 同时遍历完
只需在第一轮遍历进行组件更新

newChildren 没遍历完，oldFiber 遍历完
意味着本次更新有新节点插入，遍历剩下的 newChildren 为生成的 workInProgress fiber 依次标记 Placement

newChildren 遍历完，oldFiber 没遍历完
需要遍历剩下的 oldFiber，依次标记 Deletion

newChildren 与 oldFiber 都没遍历完
这意味着有节点在这次更新中改变了位置

### 处理移动的节点

为了快速的找到 key 对应的 oldFiber，我们将所有还未处理的 oldFiber 存入以 key 为 key，oldFiber 为 value 的 Map 中。

```JavaScript
const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
```

接下来遍历剩余的 newChildren，通过 newChildren[i].key 就能在 existingChildren 中找到 key 相同的 oldFiber

### 标记节点是否移动

节点是否移动以最后一个可复用的节点在 oldFiber 中的位置索引

我们用变量 oldIndex 表示遍历到的可复用节点在 oldFiber 中的位置索引。如果 oldIndex < lastPlacedIndex，代表本次更新该节点需要向右移动。

lastPlacedIndex 初始为 0，每遍历一个可复用的节点，如果 oldIndex >= lastPlacedIndex，则 lastPlacedIndex = oldIndex。

## 状态更新

### render 阶段的开始

render 阶段开始于 performSyncWorkOnRoot 或 performConcurrentWorkOnRoot 方法的调用。这取决于本次更新是同步更新还是异步更新。

### commmit 阶段的开始

commit 阶段开始于 commitRoot 方法的调用。其中 rootFiber 会作为传参。

补全从触发状态更新到 render 阶段的路径

```sh
触发状态更新 --> ? --> render阶段（`performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`） --> commit阶段(`commitRoot`)
```

### 创建 Update 对象

在 React 中，有如下方法可以触发状态更新

- ReactDOM.render
- this.setState
- this.forceUpdate
- useState
- useReducer
  他们是如何接入同一套状态更新机制
  每次状态更新都会创建一个保存更新状态相关内容的对象，叫 update。在 render 阶段的 beginWork 中会根据 Update 计算新的 state

### 从 fiber 到 root

现在触发状态更新的 fiber 上已经包含 Update 对象
render 阶段是从 rootFiber 开始向下遍历。那么如何从触发状态更新的 fiber 得到 rootFiber?
通过调用 markUpdateLaneFromFiberToRoot 方法

从触发状态更新的 fiber 一直向上遍历到 rootFiber，并返回 rootFiber

```JavaScript
function markUpdateLaneFromFiberToRoot(
  sourceFiber: Fiber,
  lane: Lane,
): FiberRoot | null {
  // Update the source fiber's lanes
  sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
  let alternate = sourceFiber.alternate;
  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }
  if (__DEV__) {
    if (
      alternate === null &&
      (sourceFiber.effectTag & (Placement | Hydrating)) !== NoEffect
    ) {
      warnAboutUpdateOnNotYetMountedFiberInDEV(sourceFiber);
    }
  }
  // Walk the parent path to the root and update the child expiration time.
  let node = sourceFiber;
  let parent = sourceFiber.return;
  while (parent !== null) {
     parent.childLanes = mergeLanes(parent.childLanes, lane);
    alternate = parent.alternate;
    if (alternate !== null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    } else {
      if (__DEV__) {
        if ((parent.effectTag & (Placement | Hydrating)) !== NoEffect) {
          warnAboutUpdateOnNotYetMountedFiberInDEV(sourceFiber);
        }
      }
    }
    node = parent;
    parent = parent.return;
  }
   if (node.tag === HostRoot) {
    const root: FiberRoot = node.stateNode;
    return root;
  } else {
    return null;
  }
}
```

### 调度更新

现在我们拥有一个 rootFiber，该 rootFiber 对应的 Fiber 树中某个 Fiber 节点包含一个 Update

接下来通知 Scheduler 根据更新的优先级，决定以同步还是异步的方式调度本次更新。

通过 ensureRootIsScheduled

```JavaScript
if (newCallbackPriority === SyncLanePriority) {
  // 任务已经过期，需要同步执行render阶段
  newCallbackNode = scheduleSyncCallback(
    performSyncWorkOnRoot.bind(null, root)
  )
} else {
  // 根据任务优先级异步执行render阶段
  var schedulerPriorityLevel = lanePriorityToSchedulerPriority(
    newCallbackPriority
  );
  newCallbackNode = scheduleCallback(
    schedulerPriorityLevel,
    performConcurrentWorkOnRoot.bind(null, root)
  )
}
```

performSyncWorkOnRoot 和 performConcurrentWorkOnRoot 即 render 阶段的入口函数
至此，状态更新就和 render 阶段连接上了

```sh
触发状态更新 --> 创建Update对象 --> 从fiber到root（`markUpdateLaneFromFiberToRoot`） --> 调度更新（`ensureRootIsScheduled`） --> render阶段（`performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`） --> commit阶段（`commitRoot`）
```

## 心智模型

### 同步更新的 React

更新机制类比代码版本控制

在 React 中，所有通过 ReactDOM.render 创建的应用都是通过类似的方式更新状态

即没有优先级概念，高优更新需要排在其他更新后面执行。

### 并发更新的 React

当有了代码版本控制，有紧急线上 bug 需要修复时，我们暂存当前分支的修改，在 master 分支修复 bug 并紧急上线。

bug 修复上线后通过 git rebase 命令和开发分支连接上。开发分支基于修复 bug 的版本继续开发

在 React 中，通过 ReactDOM.createBlockingRoot 和 ReactDOM.createRoot 创建的应用会采用并发的方式更新状态

高优更新中断正在进行中的低优更新，先完成 render-commit 流程

待高优更新完成后，低优更新基于高优更新的结果重新更新。

## update 的分类

状态更新流程开始后首先会创建 update 对象

可以将 update 类比心智模型中的一次 commit

### update 的分类

将可以触发更新的方法所隶属的组件分类：

- ReactDOM.render - HostRoot
- this.setState - ClassComponent
- this.forceUpdate - ClassComponent
- useState - FunctionComponent
- useReducer - FunctionComponent

一共三种组件（HostRoot | ClassComponent | FunctionComponent）可以触发更新

由于不同类型组件工作方法不同，所以存在俩种不同结构的 update，其中 classComponent 与 hostRoot 共用一套 update 结构。

虽然他们的结构不同，但是他们工作机制与工作流程大体相同

### update 的结构

ClassComponent 与 HostRoot 共用同一种 update 结构

```JavaScript
const update: Update<*> = {
  eventTime,
  lane,
  suspenseConfig,
  tag: UpdateState,
  payload: null,
  callback: null,

  next: null
}
```

- eventTime: 任务时间，通过 performance.now()获取的毫秒数
- lane：优先级相关字段
- suspenseConfig: suspense 相关
- tag：更新的类型，包括 UpdateState | ReplaceState | ForceUpdate | CaptureUpdate
- payload: 更新挂载的数据，不同类型组件挂载的数据不同。对于 ClassComponent,payload 为 this.setState 的第一个传参。对于 HostRoot，payload 为 ReactDOM.render 的第一个传参。
- callback：更新的回调函数。即在 commit 阶段的 layout 子阶段一节中提到的回调函数。
- next：与其他 update 连接形成链表

### Update 与 Fiber 的联系

update 存在一个连接其他 update 形成链表的字段 next。

Fiber 节点组成 Fiber 树，页面中最多同时存在俩颗 Fiber 树：

- 代表当前页面状态的 current Fiber 树
- 代表正在 render 阶段的 workInProgress Fiber 树
  类似 Fiber 节点组成 Fiber 树，Fiber 节点上的多个 Update 会组成链表并被包含在 fiber.

Fiber 节点最多同时存在俩个 updateQueue:

- current fiber 保存的 updateQueue 即 current updateQueue
- workInProgress fiber 保存的 updateQueue 即 workInProgress updateQueue
  在 commit 阶段完成页面渲染后，workInProgress Fiber 树变为 current Fiber 树，workInProgress Fiber 树内 Fiber 节点的 updateQueue 就变成 current updateQueue

### updateQueue

ClassComponent 与 HostRoot 使用的 updateQueue

```JavaScript
const queue: UpdateQueue<State> = {
  //  本次更新前该fiber节点的state，update基于该state计算更新后的state
  baseState: fiber.memoizedState,
  // 本次更新前该fiber节点已保存的update。以链表形式存在，链表头为firstBaseUpdate，链表尾为lastBaseUpdate。
  firstBaseUpdate: null,
  lastBaseUpdate: null,
  // 触发更新时，产生的update会保存在shared.pending中形成单向环状链表。当由update计算state时这个环会被剪开并连接在lastBaseUpdate后面
  shared: {
    pending: null
  },
  // 数组。保存update.callback !== null 的update
  effects: null
}
```

updateQueue 由 initializeUpdateQueue 方法返回

## 深入理解优先级
### 什么是优先级
状态更新由用户交互产生，用户心里对交互执行顺序有个预期。React根据人机交互研究的结果中用户对交互的预期顺序为交互产生的状态更新赋予不同优先级。

* 生命周期方法：同步执行
* 受控的用户输入：比如输入框输入文字，同步执行
* 交互事件：比如动画，高优先级执行
* 其他：比如数据请求，低优先级执行

### 如何调度优先级
react通过scheduler调度任务

每当需要调度任务时，React会调用Scheduler提供的方法runWithPriority

该方法接收一个优先级常量与一个回调函数作为参数。回调函数会以优先级高低为顺序排列在一个定时器中并在合适的时间触发

对于更新来讲，传递的回调函数一般为render的入口函数

优先级最终会反映到update.lane变量上。

### 如何保证状态正确
* render阶段可能被中断。如何保证updateQueue中保存的Update不丢失？
* 有时候当前状态需要依赖前一个状态。如何在支持跳过低优先级状态的同时保证状态依赖的连续性？

### 如何保证update不丢失
当render阶段被中断后重新开始时，会基于current updateQueue克隆出workInProgress updateQueue。由于current updateQueue.lastBaseUpdate已经保存了上一次的Update，所以不会丢失。

当commit阶段完成渲染，由于workInProgress updateQueue.lastBaseUpdate中保存了上一次的Update，所以 workInProgress Fiber树变成current Fiber树后也不会造成Update丢失。

### 如何保证状态依赖的连续性
当某个Update由于优先级低而被跳过时，保存在baseUpdate中的不仅是该Update，还包括链表中该Update之后的所有Update。

## ReactDOM.render

### 创建fiber
首次执行ReactDOM.render会创建fiberRootNode和rootFiber。其中fiberRootNode是整个应用的根节点，rootFiber是渲染组件所在组件树的根节点。

这一步发生在调用ReactDOM.render后进入的legacyRenderSubtreeIntoContainer方法中
```JavaScript
// container指ReactDOM.render的第二个参数
root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
  container,
  forceHydrate,
);
fiberRoot = root._internalRoot;
```

legacyCreateRootFromDOMContainer方法内部会调用createFiberRoot方法完成fiberRootNode和rootFiber的创建以及关联。并初始化updateQueue
```JavaScript
export function createFiberRoot(
  containerInfo: any,
  tag: RootTag,
  hydrate: boolean,
  hydrationCallbacks: null | SuspenseHydrationCallbacks
): FiberRoot {
  // 创建fiberRootNode
  const root: FiberRoot = (new FiberRootNode(containerInfo, tag, hydrate): any)

  // 创建rootFiber
  const uninitializedFiber = createHostRootFiber(tag);

  // 连接rootFiber与fiberRootNode
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  // 初始化updateQueue
  initializeUpdateQueue(uninitializedFiber);

  return root;
}
```

### 创建update
这一步发生在updateContainer方法中
```JavaScript
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): Lane {
  // 创建update
  const update = createUpdate(eventTime, lane, suspenseConfig)

  // update.payload为需要挂载在根节点的组件
  update.payload = {element};

  // callback为ReactDOM.render的第三个参数 - 回调函数
  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    update.callback = callback;
  }

  // 将生成的update加入updateQueue
  enqueueUpdate(current, update);

  // 调度更新
  scheduleUpdateOnFiber(current, lane, eventTime);
}
```

### 流程概览
```JavaScript
创建fiberRootNode、rootFiber、updateQueue（`legacyCreateRootFromDOMContainer`）
|
创建update对象（`updateContainer`）
|
从fiber到root（`markUpdateLaneFromFiberToRoot`）
|
调度更新（`ensureRootIsScheduled`）
|
render阶段（`performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`）
|
commit阶段（`commitRoot`）
```

### React的其他入口函数
当前React共有三种模式：
* legacy，这是当前React使用的方式
* blocking，开启部分concurrent模式特性的中间模式
* concurrent，面向未来的开发模式

## this.setState
this.setState内会调用this.updater.enqueueSetState
```JavaScript
Component.prototype.setState = function (partialState, callback) {
  if (!(typeof partialState === 'object') || typeof partialState === 'function' || partialState == null) {
    throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  }
}
this.updater.enqueueSetState(this, partialState, callback, 'setState');
```

enqueueSetState 就是从创建update到调度update的流程
```JavaScript
enqueueSetState(inst, payload, callback) {
  // 通过组件实例获取对应fiber
  const fiber = getInstance(inst);

  const eventTime = requestEventTime();
  const suspenseConfig = requestCurrentSuspenseConfig();

  // 获取优先级
  const lane = requestUpdateLane(fiber, suspenseConfig);

  // 创建update
  const update = createUpdate(eventTime, lane, suspenseConfig);

  update.payload = payload

  // 赋值回调函数
  if (callback !== undefined && callback !== null) {
    update.callback = callback;
  }

  // 将update插入updateQueue
  enqueueUpdate(fiber, update);
  // 调度update
  scheduleUpdateOnFiber(fiber, lane, eventTime);
}
```

### this.forceUpdate
在this.updater上，除了enqueueSetState外，还存在enqueueForceUpdate，当我们调用this.forceUpdate时会调用他
```JavaScript
enqueueForceUpdate(inst, callback) {
  const fiber = getInstance(inst);
  const eventTime = requestEventTime();
  const suspenseConfig = requestCurrentSuspenseConfig();
  const lane = requestUpdateLane(fiber, suspenseConfig);

  const update = createUpdate(eventTime, lane, suspenseConfig);

  // 赋值tag为ForceUpdate
  update.tag = ForceUpdate

  if (callback !== undefined && callback !== null) {
    update.callback = callback;
  }

  enqueueUpdate(fiber, update);
  scheduleUpdateOnFiber(fiber, lane, eventTime);
}
```

判断 classComponent是否需要更新时有俩个条件需要满足：
```JavaScript
const shouldUpdate =
  checkHasForceUpdateAfterProcessing() ||
  checkShouldComponentUpdate(
    workInProgress,
    ctor,
    oldProps,
    newProps,
    oldState,
    newState,
    nextContext
  )
```

* checkHasForceUpdateAfterProcessing：内部会判断本次更新的Update是否为ForceUpdate。如果本次更新的update中存在tag为forceUpdate，则返回true

* checkShouldComponentUpdate:内部会调用shouldComponentUpdate方法。以及当该classComponent为pureComponent时会浅比较state与props。

所以，当某次更新含有tag为ForceUpdate的Update，那么当前ClassComponent不会受其他性能优化手段（shouldComponentUpdate|PureComponent）影响，一定会更新。

## 极简Hooks实现
```JavaScript
function dispatchAction(queue, action) {
  // 创建update
  const update = {
    action,
    next: null
  }

  // 环状单向链表操作
  if (queue.pending === null) {
    update.next = update;
  } else {
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  queue.pending = update;

  // 模拟React开始调度更新
  schedule();
}
```
更新产生的update对象保存在queue中
FunctionComponent对应的fiber保存queue
```JavaScript
// App组件对应的fiber对象
const fiber = {
  // 保存该FunctionComponent对应的Hooks链表
  memoizedState: null,
  // 指向App函数
  stateNode: App
}
```

### hook 数据结构
hook与update类似，都通过链表连接。不过Hook是无环的单向链表
```JavaScript
hook = {
  // 保存update的queue,即上文介绍的queue
  queue: {
    pending: null
  },
  // 保存hook对应的state
  memoizedState: initialState,
  // 与下一个Hook连接形成单向无环链表
  next: null
}
```

### 模拟React调度更新流程
```JavaScript
// 首次render时是mount
isMount = true;

function schedule() {
  // 更新前将workInProgressHook重置为fiber保存的第一个Hook
  workInProgressHook = fiber.memoizedState;
  // 触发组件render
  fiber.stateNode();
  // 组件首次render为mount，以后再触发的更新为update
  isMount = false;
}
```

```JavaScript
function useState(initialState) {
  // 当前useState使用的hook会被赋值该变量
  let hook;

  if (isMount) {
    // ...mount时需要生成hook对象
    hook = {
      queue: {
        pending: null
      },
      memoizedState: initialState,
      next: null
    }

    // 将hook插入fiber.memoizedState链表末尾
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }
    // 移动workInProgressHook指针
    workInProgressHook = hook;
  } else {
    // update时从workInProgressHook中取出该useState对应的hook
    hook = workInProgressHook;
    // 移动workInProgressHook指针
    workInProgressHook = workInProgressHook.next
  }

  // update执行前的初始state
  let baseState = hook.memoizedState;
  if (hook.queue.pending) {
    // 根据queue.pending中保存的update更新state
    let firstUpdate = hook.queue.pending.next;

    do {
      // 执行update action
      const action = firstUpdate.action;
      baseState = action(baseState)
      firstUpdate = firstUpdate.next

      // 最后一个update执行完后跳出循环
    } while (firstUpdate !== hook.queue.pending)

    // 清空queue.pending
    hook.queue.pending = null
  }
  // 将update action 执行完后的state作为memoizedState
  hook.memoizedState = baseState;

  return [baseState, dispatchAction.bind(null, hook.queue)]
}
```

## Hooks数据结构
组件mount是的hook鱼update时的hook来源于不同的对象，这类对象在源码中被称为dispatcher。
```JavaScript
// mount时的dispatcher
const HooksDispatcherOnMount: Dispatcher = {
  useCallback: mountCallback,
  useContext: readContext,
  useEffect: mountEffect,
  useImperativeHandle: mountImperativeHandle,
  useLayoutEffect: mountLayoutEffect,
  useMemo: mountMemo,
  useReducer: mountReducer,
  useRef: mountRef,
  useState: mountState
}

// update时的dispatcher
const HooksDispatcherOnUpdate: Dispatcher = {
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState
}
```

在FunctionComponent render前，会根据FunctionComponent对应fiber的以下条件区分mount与update
```JavaScript
current === null || current.memoizedState === null
```
并将不同情况对应的dispatcher赋值给全局变量ReactCurrentDispatcher的current属性
```JavaScript
ReactCurrentDispatcher.current = 
  current === null || current.memoizedState === null
  ? HooksDispatcherOnMount
  : HooksDispatcherOnUpdate
```

在FuntionComponent render时，会从ReactCurrentDispatcher.current（即当前dispatcher）中寻找需要的hook。

不同的调用栈上下文为ReactCurrentDispatcher.current赋值不同的dispatcher,则FunctionComponent render时调用的hook也是不同的函数

### HooK的数据结构
```JavaScript
const hook: Hook = {
  memoizedState: null,
  baseState: null,
  baseQueue: null,
  queue: null,
  next: null
}
```

### memoizedState
fiber.memoizedState: FunctionComponent 对应fiber保存的Hooks链表
hook.memoizedState: Hooks链表中保存的单一hook对应的数据
不同类型hook的memoizedState保存不同类型数据
* useState: 对于const [state, updateState] = useState(initialState),memoizedState保存state的值
* useReducer：对于const [state, dispatch] = useReducer(reducer, {});,memoizedState保存state的值
* useRef: 对于useRef(1), memoizedState保存{current: 1}
* useMemo：对于useMemo(callback, [depA]), memoizedState保存[callback(), depA]
* useCallback: 对于useCallback(callback, [depA]),memoizedState保存[callback, depA]。与useMemo的区别是，useCallback保存的是callback函数本身，而useMemo保存的是callback函数的执行结果

## useState与useReducer
useState只是预置了reducer的useReducer
### 流程概览
将这俩个hook的工作流程分为声明阶段和调用阶段
```JavaScript
function App() {
  const [state, dispatch] = useReducer(reducer, {a: 1});

  const [num, updateNum] = useState(0);

  return (
    <div>
      <button onClick={() => dispatch({type: 'a'})}>{state.a}</button>
      <button onClick={() => updateNum(num => num + 1)}>{num}</button>
    </div>
  )
}
```
声明阶段 即 App调用时，会一次执行useReducer与useState方法
调用阶段 即 点击按钮后，dispatch或updateNum被调用时。

### 声明阶段
当FunctionComponent进入render阶段的beginWork时，会调用renderWithHooks方法
该方法内部会执行FunctionComponent对应函数
```JavaScript
function useState(initialState) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

function useReducer(reducer, initialArg, init) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}
```
* mount时
mount时，useReducer会调用mountReducer，useState会调用mountState
```JavaScript
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // 创建并返回当前的hook
  const hook = mountWorkInProgressHook();

  // ...赋值初始state
  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: reducer,
    lastRenderedState: (initialState: any),
  });

  // ...创建dispatch
  return [hook.memoizedState, dispatch];
}

function mountReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  // 创建并返回当前的hook
  const hook = mountWorkInProgressHook();

  // ...赋值初始state

  // 创建queue
  const queue = (hook.queue = {
    // 保存update对象
    pending: null,
    // 保存dispatchAction.bind()的值
    dispatch: null,
    // 上一次render时使用的reducer
    lastRenderedReducer: reducer,
    // 上一次render时的state
    lastRenderedState: (initialState: any)
  });

  // ... 创建dispatch
  return [hook.memoizedState, dispatch];
}
```

basicStateReducer
```JavaScript
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' ? action(state) : action;
}
```

### update
update时，useReduce与useState调用的是同一个updateReducer
```JavaScript
function updateReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  // 获取当前hook
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  queue.lastRenderedReducer = reducer;

  // ...同update与updateQueue类似的更新逻辑

  const dispatch: Dispatch<A> = (queue.dispatch: any);

  return [hook.memoizedState, dispatch]
}
```
找到对应的hook，根据update计算该hook的新state并返回

mount时获取当前hook使用的是mountWorkInProgressHook，而update时使用的是updateWorkInProgressHook
* mount时可以确定是调用ReactDOM.render或相关初始化API产生的更新，只会执行一次
* update可能是在事件回调或副作用中触发的更新或者是render阶段触发的更新，为了避免组件无限循环更新，后者需要区别对待。

### 调用阶段
调用阶段会执行dispatchAction，此时该FunctionComponent对应的fiber以及hook.queue已经通过bind方法预先作为参数传入

```JavaScript
function dispatchAction(fiber, queue, action) {
  // ... 创建update
  var update = {
    eventTime: eventTime,
    lane: lane,
    suspenseConfig: suspenseConfig,
    action: action,
    eagerReducer: null,
    eagerState: null,
    next: null
  };

  // ...将update加入queue.pending

  var alternate = fiber.alternate;

  if (fiber === currentlyRenderingFiber$1 || alternate !== null && alternate === currentlyRenderingFiber$1) {
    // render阶段触发的更新
    didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
  } else {
    // fiber.lanes保存fiber上存在的update的优先级
    // fiber.lanes === NoLanes 意味着fiber上不存在update
    if (fiber.lanes === NoLanes && (alternate === null || alternate.lanes === NoLanes)) {
      // ...fiber的updateQueue为空，优化路径
    }

    scheduleUpdateOnFiber(fiber, lane, eventTime)
  }
}
```

## useEffect
### flushPassiveEffectsImpl
flushPassiveEffects内部会设置优先级，并执行flushPassiveEffectsImpl
* 调用该useEffect在上一次render时的销毁函数
* 调用该useEffect在本次render时的回调函数
* 如果存在同步任务，不需要等待下次事件循环的宏任务，提前执行前俩步

useEffect的俩个阶段会在页面渲染后（layout阶段后）异步执行
### 阶段一：销毁函数的执行
useEffect的执行需要保证所有组件useEffect的销毁函数必须都执行完后才能执行任意一个组件的useEffect的回调函数

这是因为多个组件间可能共用同一个ref。

如果不是按照“全部销毁”再“全部执行”的顺序，那么在某个组件useEffect的销毁函数中修改的ref.current可能影响另一个组件useEffect的回调函数中的同一个ref的current属性。

在useLayoutEffect中也有同样的问题，所以他们都遵循“全部销毁”再“全部执行”的顺序。

在阶段一，会遍历并执行所有useEffect的销毁函数。
```JavaScript
// pendingPassiveHookEffectsUnmount中保存了所有需要执行销毁的useEffect
const unmountEffects = pendingPassiveHookEffectsUnmount;
pendingPassiveHookEffectsUnmount = [];
for (let i = 0; i < unmountEffects.length; i += 2) {
  const effect = ((unmountEffect[i]: any): HookEffect);
  const fiber = ((unmountEffects[i + 1]: any): Fiber);
  const destroy = effect.destroy;
  effect.destroy = undefined;

  if (typeof destroy === 'function') {
    // 销魂函数存在则执行
    try {
      destroy()
    } catch (error) {
      captureCommitPhaseError(fiber, error);
    }
  }
}
```
其中pendingPassiveHookEffectsUnmount数组的索引i保存需要销毁的effect，i+1保存该effects对应的fiber。

向pendingPassiveHookEffectsUnmount数组内push数据的操作发生在layout阶段commitLayoutEffectOnFiber方法内部的schedulePassiveEffects方法中
```JavaScirpt
function schedulePassiveEffects(finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect: null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      const {next, tag} = effect;
      if (
        (tag & HookPassive) !== NoHookEffect &&
        (tag & HookHasEffect) !== NoHookEffect
      ) {
        // 向`pendingPassiveHookEffectsUnmount`数组内`push`要销毁的effect
        enqueuePendingPassiveHookEffectUnmount(finishedWork, effect);
        // 向`pendingPassiveHookEffectsMount`数组内`push`要执行回调的effect
        enqueuePendingPassiveHookEffectMount(finishedWork, effect);
      }
      effect = next;
    } while (effect !== firstEffect);
  }
}
```

### 回调函数的执行
同样遍历数组，执行对应effect的回调函数

其中向pendingPassiveHookEffectsMount中push数据的操作同样发生在schedulePassiveEffects中。
```JavaScript
// pendingPassiveHookEffectsMount中保存了所有需要执行回调的useEffect
const mountEffects = pendingPassiveHookEffectsMount;
pendingPassiveHookEffectsMount = [];
for (let i = 0; i < mountEffects.length; i+=2) {
  const effect = ((mountEffects[i]: any): HookEffect);
  const fiber = ((mountEffects[i + 1]: any): Fiber);

  try {
    const create = effect.create
    effect.destroy = create();
  } catch (error) {
    captureCommitPhaseError(fiber, error);
  }
}
```

## useRef
ref是reference的缩写。在React中，我们习惯用ref保存DOM。

对于mount和update useRef对应俩个不同的dispatcher
```JavaScript
function mountRef<T>(initialValue: T): {|current: T|} {
  // 获取当前useRef hook
  const hook = mountWorkInProgressHook()
  // 创建ref
  const ref = {current: initialValue};
  hook.memoizedState = ref;
  return ref;
}

function updateRef<T>(initialValue: T): {|current: T|} {
  // 获取当前useRef hook
  const hook = updateWorkInProgressHook();
  // 返回保存的数据
  return hook.memoizedState;
}
```

useRef仅仅是返回一个包含current属性的对象
```JavaScript
export function createRef(): RefObject {
  const refObject = {
    current: null
  };
  return refObject;
}
```

### ref的工作流程
* render阶段为含有ref属性的fiber添加 Ref effectTag
* commit阶段 为包含Ref effectTag的fiber执行对应操作

### render阶段
在render阶段的beginWork与completeWork中有个同名方法markRef用于为含有ref属性的fiber增加Ref effectTag
```JavaScript
// beginWork的markRef
function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||
    (current |== null && current.ref !== ref)
  ) {
    // Schedule a Ref effect
    workInProgress.effectTag |= Ref;
  }
}
// completeWork的markRef
function markRef(workInProgress: Fiber) {
  workInProgress.effectTag |= Ref;
}
```
在beginWork中，以下俩处调用了markRef：
* updateClassComponent内的finishClassComponent，对应ClassComponent
* updateHostComponent，对应HostComponent

在completeWork中，以下俩处调用了markRef：
* completeWork中的HostComponent类型
* completeWork中的ScopeComponent类型

* fiber类型为HostComponent、ClassComponent、ScopeComponent
* 对于mount，workInProgress.ref !== null，即存在ref属性
* 对于update，current.ref !== workInProgress.ref，即ref属性改变

### commit阶段
在commit阶段的mutation阶段中，对于ref属性改变的情况，需要先移除之前的ref
```JavaScript
function commitMutationEffects(root: FiberRoot, renderPriorityLevel) {
  while (nextEffect !== null) {
    
    const effectTag = nextEffect.effectTag;

    // ...
    if (effectTag & Ref) {
      const current = nextEffect.alternate;
      if (current !== null) {
        // 移除之前的ref
        commitDetachRef(current);
      }
    }
    // ...
  }
  // ...
}

function commitDetachRef(current: Fiber) {
  const currentRef = current.ref;
  if (currentRef !== null){
    if (typeof currentRef === 'function') {
      // function类型ref，调用他，传参为null
      currentRef(null);
    } else {
      // 对象类型ref，current赋值为null
      currentRef.current = null;
    }
  }
}
```

```JavaScript
function safelyDetachRef(current: Fiber) {
  const ref = current.ref;
  if (ref !== null) {
    if (typeof ref === 'function') {
      try {
        ref(null);
      } catch (refError) {
        captureCommitPhaseError(current, refError);
      }
    } else {
      ref.current = null;
    }
  }
}
```
commitLayoutEffect会执行commitAttachRef（赋值ref）
```JavaScript
function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    // 获取ref属性对应的component实例
    const instance = finishedWork.stateNode;
    let instanceToUse;
    switch (finishedWork.tag) {
      case HostComponent:
        instanceToUse = getPublicInstance(instance);
        break;
      default:
        instanceToUse = instance;
    }

    // 赋值ref
    if (typeof ref === 'function') {
      ref(instanceToUse);
    } else {
      ref.current = instanceToUse;
    }
  }
}
```
### 总结
* 对于FunctionComponent， useRef负责创建并返回对应的ref。
* 对于赋值了ref属性的HostComponent与ClassComponent，会在render阶段经历赋值Ref effectTag，在commit阶段执行对应ref操作。