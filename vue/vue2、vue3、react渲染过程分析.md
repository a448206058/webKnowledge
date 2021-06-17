## vue2、vue3、react渲染过程Render

### 前言

    本文是对vue2、vue3、react的渲染过程进行一个理解和对比，希望能帮助自己和大家更深入的了解框架背后的实现。
    知识点：JS 执行机制、事件循环、同步、异步

### 概念解析

* JS 执行机制

  JS 是单线程语言，即指某一时间内只能干一件事

- 同步 在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务
  
- 异步 不进入主线程、而进入“任务队列”（task queue）的任务，只有“任务队列”通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行

* 事件循环执行机制：
  
  循环首先从宏任务开始，遇到script，生成执行上下文，开始进入执行栈，可执行代码入栈，依次执行代码，调用完成出栈。
  执行过程中遇到调度者，会同步执行调度者，由调度者将其负责得任务（回调函数）放到对应得任务队列中，直到主执行栈清空，然后开始执行微任务的任务队列。微任务也清空后，再次从宏任务开始，一直循环这一过程。

* scheduler
  
  任务管理


* nextTick

  完全是基于语言执行机制实现，直接创建一个异步任务，那么 nextTick 自然就达到在同步任务后执行的目的


### vue2.x render
![avatar](https://ibb.co/GVpWVfk)
渲染过程就是通过render函数生成虚拟节点,然后通过$mount函数通过patch算法生成真实节点
```JavaScript
// src/core/observe/watcher.js
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
```

* queueWatcher
```JavaScript
/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 * 
 * 将观察者推入观察者队列。
 * 具有重复ID的作业将被跳过，除非在刷新队列时推送。
 * 
 * 引入了队列的概念，它不会每次数据改变都触发watcher的回调，而是把这些watcher先添加到一个队列里，
 * 然后在nextTick后执行flushSchedulerQueue
 */
let has: { [key: number]: ?true } = {}

export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // 如果已经刷新，请根据其id拼接观察程序
      // 如果已经超过了id，那么下一步将立即运行。
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    // 排队更新
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}

/**
 * Flush both queues and run the watchers.
 * 刷新两个队列并运行观察程序。
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  // 刷新前对队列排序。
  // 这可确保：
  // 1. 组件从父级更新到子级(因为父级始终在子对象之前创建）
  // 2. 组件的用户观察程序在其呈现观察程序之前运行（因为用户观察程序在呈现观察程序之前创建）
  // 3. 如果某个组件在父组件的观察程序运行期间被销毁，则可以跳过其观察程序。
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // 不要缓存长度，因为在运行现有的观察程序时可能会推送更多的观察程序
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    // 在dev build中，检查并停止循环更新。
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  // 在重置状态之前保留post队列的副本
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  resetSchedulerState()

  // call component updated and activated hooks
  // 调用组件更新并激活挂钩
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}
```

* resetSchedulerState
* 状态恢复
```JavaScript
// src/core/observer/scheduler.js
const queue: Array<Watcher> = []
const activatedChildren: Array<Component> = []
let has: { [key: number]: ?true } = {}
let circular: { [key: number]: number } = {}
let waiting = false
let flushing = false
let index = 0

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}
```

* nextTick
```JavaScript
// src/core/util/next-Tick
const callbacks = []
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

	/*
	*	把传入的回调函数cb俨如callbacks数组，再根据条件执行宏任务或者微任务
	* 在下一个tick执行flushCallbacks
	*/
  	/**
	 * tick执行flushCallbacks
	 * 		这里使用callbacks而不是直接在nextTick中执行回调函数的原因是保证在同一个tick内多次执行
	 * nextTick，不会开启多个异步任务，而把这些异步任务都压成一个同步任务，在下一个tick执行完毕。
	 */
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}

let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

### vue3
![avatar](https://ibb.co/RDsycn7)
```JavaScript
// packages/runtime-core/src/scheduler
const resolvedPromise: Promise<any> = Promise.resolve()
let currentFlushPromise: Promise<void> | null = null

export function nextTick(
  this: ComponentPublicInstance | void,
  fn?: () => void
): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

export function queueJob(job: SchedulerJob) {
  // the dedupe search uses the startIndex argument of Array.includes()
  // by default the search index includes the current job that is being run
  // so it cannot recursively trigger itself again.
  // if the job is a watch() callback, the search will start with a +1 index to
  // allow it recursively trigger itself - it is the user's responsibility to
  // ensure it doesn't end up in an infinite loop.

  // 重复数据消除搜索使用Array.includes（）的startIndex参数默认情况下，搜索索引包含正在运行的当前作业，因此它不能再次递归触发自身。
  // 如果作业是watch（）回调，则搜索将从一个+1索引开始
  // 允许它递归地触发自身-这是用户的责任
  // 确保它不会以无限循环结束。
  if (
    (!queue.length ||
      !queue.includes(
        job,
        isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
      )) &&
    job !== currentPreFlushParentJob
  ) {
    const pos = findInsertionIndex(job)
    if (pos > -1) {
      queue.splice(pos, 0, job)
    } else {
      queue.push(job)
    }
    queueFlush()
  }
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

// #2768
// Use binary-search to find a suitable position in the queue,
// so that the queue maintains the increasing order of job's id,
// which can prevent the job from being skipped and also can avoid repeated patching.
// 使用二进制搜索在队列中找到合适的位置，
// 使队列保持作业id的递增顺序，
// 这样可以防止作业被跳过，也可以避免重复修补。
function findInsertionIndex(job: SchedulerJob) {
  // the start index should be `flushIndex + 1`
  let start = flushIndex + 1
  let end = queue.length
  const jobId = getId(job)

  while (start < end) {
    const middle = (start + end) >>> 1
    const middleJobId = getId(queue[middle])
    middleJobId < jobId ? (start = middle + 1) : (end = middle)
  }

  return start
}

const getId = (job: SchedulerJob | SchedulerCb) =>
  job.id == null ? Infinity : job.id
```

* flushJobs
  处理队列，先处理flushPreFlushCbs，然后对队列进行排序，执行 queue 中的 job,处理完后再处理 flushPostFlushCbs，如果队列没有被清空会递归调用 flushJobs 清空队列

```JavaScript
function flushJobs(seen?: CountMap) {
  isFlushPending = false
  isFlushing = true
  if (__DEV__) {
    seen = seen || new Map()
  }

  flushPreFlushCbs(seen)

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child so its render effect will have smaller
  //    priority number)
  // 2. If a component is unmounted during a parent component's update,
  //    its update can be skipped.
  // 刷新前对队列排序。
  // 这可确保：
  // 1. 组件从父级更新到子级(因为父级总是在子级之前创建的，所以其渲染效果的优先级将更小）
  // 2. 如果在父组件更新期间卸载了组件，则可以跳过其更新。
  queue.sort((a, b) => getId(a) - getId(b))

  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      if (job && job.active !== false) {
        if (__DEV__ && checkRecursiveUpdates(seen!, job)) {
          continue
        }
        callWithErrorHandling(job, null, ErrorCodes.SCHEDULER)
      }
    }
  } finally {
    flushIndex = 0
    queue.length = 0

    flushPostFlushCbs(seen)

    isFlushing = false
    currentFlushPromise = null
    // some postFlushCb queued jobs!
    // keep flushing until it drains.
    // 一些postFlushCb排队作业！
    // 继续刷新知道为空
    if (
      queue.length ||
      pendingPreFlushCbs.length ||
      pendingPostFlushCbs.length
    ) {
      flushJobs(seen)
    }
  }
}

export function flushPreFlushCbs(
  seen?: CountMap,
  parentJob: SchedulerJob | null = null
) {
  if (pendingPreFlushCbs.length) {
    currentPreFlushParentJob = parentJob
    activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
    pendingPreFlushCbs.length = 0
    if (__DEV__) {
      seen = seen || new Map()
    }
    for (
      preFlushIndex = 0;
      preFlushIndex < activePreFlushCbs.length;
      preFlushIndex++
    ) {
      if (
        __DEV__ &&
        checkRecursiveUpdates(seen!, activePreFlushCbs[preFlushIndex])
      ) {
        continue
      }
      activePreFlushCbs[preFlushIndex]()
    }
    activePreFlushCbs = null
    preFlushIndex = 0
    currentPreFlushParentJob = null
    // recursively flush until it drains
    flushPreFlushCbs(seen, parentJob)
  }
}


export function flushPostFlushCbs(seen?: CountMap) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)]
    pendingPostFlushCbs.length = 0

    // #1947 already has active queue, nested flushPostFlushCbs call
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped)
      return
    }

    activePostFlushCbs = deduped
    if (__DEV__) {
      seen = seen || new Map()
    }

    activePostFlushCbs.sort((a, b) => getId(a) - getId(b))

    for (
      postFlushIndex = 0;
      postFlushIndex < activePostFlushCbs.length;
      postFlushIndex++
    ) {
      if (
        __DEV__ &&
        checkRecursiveUpdates(seen!, activePostFlushCbs[postFlushIndex])
      ) {
        continue
      }
      activePostFlushCbs[postFlushIndex]()
    }
    activePostFlushCbs = null
    postFlushIndex = 0
  }
}
```

### react
Scheduler（调度器）—— 调度任务的优先级，高优任务优先进入 Reconciler

react 通过 scheduler 调度任务

每当需要调度任务时，React 会调用 Scheduler 提供的方法 runWithPriority

该方法接收一个优先级常量与一个回调函数作为参数。回调函数会以优先级高低为顺序排列在一个定时器中并在合适的时间触发

对于更新来讲，传递的回调函数一般为 render 的入口函数


## Scheduler的原理与实现
### 时间切片原理
时间切片的本质是模拟实现requestIdleCallback

除去"浏览器重排/重绘"
```
一个task（宏任务） -- 队列中全部job（微任务）-- requestAnimationFrame -- 浏览器重排/重绘 -- requestIdleCallback
```

requestIdleCallback是在"浏览器重排/重绘"后如果当前帧还有空余时间时被调用

浏览器并没有提供其它API能够在同样的时机（浏览器重排/重绘后）调用以模拟其实现。

唯一能精准控制调用时机的API是requestAnimationFrame，他能让我们在"浏览器重排/重绘"之前执行JS。

这也是为什么我们通常用这个API实现JS动画 —— 这是浏览器渲染前的最后时机，所以动画能快速被渲染

Scheduler的事件切片功能是通过task（宏任务）实现的。

最常见的task当属setTimeout。但是有个task比setTimeout执行时机更靠前，那就是MessageChannel

所以Scheduler将需要被执行的回调函数作为MessageChannel的回调执行。如果当前宿主环境不支持MessageChannel，则使用setTimeout。

在React的render阶段，开启Concurrent Mode时，每次遍历前，都会通过Scheduler提供的shouldYield方法判断是否需要中断遍历，使浏览器有时间渲染。
```JavaScript
// packages/react-reconciler/src/ReactFiberWorkLoop.new.js
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

### 优先级调度
Scheduler是独立于React的包，所以他的优先级也是独立于React的优先级的

Scheduler对外暴露了一个方法unstable_runWithPriority

这个方法接受一个优先级与一个回调函数，在回调函数内部调用获取优先级的方法都会取得第一个参数对应的优先级
```JavaScript
function unstable_runWithPriority(priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
    case LowPriority:
    case IdlePriority:
      break;
    default:
      priorityLevel = NormalPriority;
  }

  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}
```

### 优先级的意义
Scheduler 对外暴露最重要的方法便是unstable_scheduleCallback。该方法用于以某个优先级注册回调函数。

不同优先级意味着不同时长的任务过期时间：
```JavaScript
var timeout;
switch (priorityLevel) {
  case ImmediatePriority:
    timeout = IMMEDIATE_PRIORITY_TIMEOUT;
    break;
  case UserBlockingPriority:
    timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
    break;
  case IdlePriority:
    timeout = IDLE_PRIORITY_TIMEOUT;
    break;
  case LowPriority:
    timeout = LOW_PRIORITY_TIMEOUT;
    break;
  case NormalPriority:
  default:
    timeout = NORMAL_PRIORITY_TIMEOUT;
    break;
}

var expirationTime = startTime + timeout;
```

```JavaScript
var IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out
var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000;
// Never times out
var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;
```

Scheduler存在俩个队列：
* timerQueue:保存未就绪任务
* taskQueue:保存已就绪任务

每当有新的未就绪的任务被注册，我们将其插入timerQueue并根据开始时间重新排列timerQueue中的任务的顺序。

当timerQueue中有任务就绪，即startTime <= currentTime，我们将其取出并加入taskQueue。

取出taskQueue中最早过期的任务并执行

为了能在O(1)复杂度找到俩个队列中时间最早的那个任务，Scheduler使用小顶堆实现了优先级队列。

那么当shouldYield为true，以至于performUnitOfWork被中断后是如何重新启动的呢？
```JavaScript
const continuationCallback = callback(didUserCallbackTimeout);
currentTime = getCurrentTime();
if (typeof continuationCallback === 'function'){
  // continuationCallback是函数
  currentTask.callback = continuationCallback;
  markTaskYield(currentTask, currentTime);
} else {
  if (enableProfiling) {
    markTaskCompleted(currentTask, currentTime);
    currentTask.isQueued = false;
  }
  if (currentTask === peek(taskQueue)) {
    // 将当前任务清除
    pop(taskQueue);
  }
}
advanceTimers(currentTime);

```

当注册的回调函数执行后的返回值continutationCallback为function，会将continutaionCallback作为当前任务的回调函数。

如果返回值不是function，则将当前被执行的任务清除出taskQueue

render阶段被调度的函数为performConcurrentWorkOnRoot，在该函数末尾有这样一段代码
```JavaScript
if (root.callbackNode === oriinalCallbackNode) {
  // The task node scheduled for this root is the same one that's
  // currently executed.Need to return a continuation.
  return performConcurrentWorkOnRoot.bind(null, root);
}
```

### 总结
1. 异步操作：vue3在vue2的基础上做了简化、用promise.then取代了其它可能的异步操作，例如setTimeout，react则使用setImmediate或者postMessage实现。
   
2. 任务队列：vue2、vue3都采用单个queue数组存储队列，react根据时间对任务进行了区分，分为taskQueue就绪任务和timerQueue未就绪任务;vue2对queue数组进行sort排序，vue3在这个基础上进行优化，使用重复数据消除搜索，避免重复执行，react Scheduler使用小顶堆实现了优先级队列。
   
3. nextTick:vue2、vue3中nextTick函数对应react中unstable_scheduleCallback函数，vue中按顺序执行，react中按优先级