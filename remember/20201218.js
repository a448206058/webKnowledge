// 1． 第一个记忆周期：5分钟
// 2． 第二个记忆周期：30分钟 20201218 19:30
// 3． 第三个记忆周期：12小时 20201219 07:00
// 4． 第四个记忆周期：1天 20201219 19:00
// 5． 第五个记忆周期：2天 20201220 19:00
// 6． 第六个记忆周期：4天 20201222 19:00
// 7． 第七个记忆周期：7天 20201225 19:00
// 8． 第八个记忆周期：15天 20210103 19:00


/**
 *  基础
 *      promise A+ 规范  09:09
 *      An open standard for sound,interoperable JavaScript promises - by implementers, for implementers
 *      一个开放的标准，为开发者提供了一个良好的可互相操作的JavaScript promise
 *
 *      A promise represents the eventual result of an asynchronous operation.The primary way of interacting with
 *      a promise is through its then method, which registers callbacks to receive either a promise's eventual value
 *      or the reason why the promise cannnot be fulfilled
 *      一个promise表示异步操作的最终结果。与promise交互的主要方式是通过其then方法，该方法注册回调以接收promise的最终值或promise无法实现的原因。
 *
 *      This specification details the behaviors of the then method,providing an interoperable base which all Promises/A+
 *      conformant promise implementations can be depended on to provide.As such,the specification should be considered very
 *      stable.Although the Promises/A+ organization may occasionally revise this specification with minor backward-compatible changes to address
 *      newly-discovered corner cases,we will integrate large or backward-incompatible changes only after careful considerration,
 *      discussion, and testing.
 *      该规范详细描述了then方法的行为，提供了一个可互相操作的基础，所有的promise/A+一致的promise实现都可以依赖于它。因此规范应该被考虑的非常稳定。
 *      尽管Promises/A+组织偶尔会修改本规范，对其进行微小的向后兼容更改，以解决新发现的角落情况，但只有经过仔细考虑、讨论和测试后，我们才会集成较大或向
 *      后不兼容的更改。
 *
 *      Historically,Promises/A+ clarifies the behavioral clauses of the earlier Promises/A proposal,extending it to cover de facto behaviors
 *      and omitting parts that areunderspecified or problematic.
 *      历史上，Promises/A+澄清了早期Promise/A提案的行为条款，将其扩展到涵盖事实上的行为，并省略了未指定或有问题的部分
 *
 *      Finally,the core Promises/A+ specification does not deal with how to create,fulfill,or reject promises,choosing
 *      instead to focus on providing an interoperable then method.Future work in companion specifications may touch on these subjects.
 *      最后，核心Promises/A+规范不涉及如何创建fulfill或者reject promises,选择而是专注于提供一个可互相操作的方法。未来相关规范中的工作可能涉及到这些主题。
 *
 *      1.Terminology
 *      1.术语
 *
 *      1.1. "promise" is an object or function with a then method whose behavior conforms to this specification.
 *      promise 是一个具有then方法的对象或者函数，其行为符合此规范
 *
 *      1.2. "thenable" is an object or function that defines a then method.
 *      thenable 是一个定义then方法的对象或者函数
 *
 *      1.3. "value" is any legal JavaScript value (including undefined, a thenable, or a promise).
 *      value 是任何合法的JavaScript值（包括undefined,thenable或者promise).
 *
 *      1.4. "reason" is a value that indicates why a promise was rejected.
 *      reason 是一个值，它说明了promise被终止的原因
 *
 *      2.Requirements
 *      要求
 *
 *      2.1 Promise States
 *      A promise must be in one of three states：pending, fuilfilled，or rejected.
 *      promise状态值
 *      一个promise必须是三种状态之一：pending, fulfilled 或者 rejected
 *
 *      2.1.1. When pending, a promise:
 *          2.1.1.1. may transition to either the fulfilled or rejected state.
 *      当一个promise处于pending状态时：
 *          可能会进入到fulfilled或者rejected状态
 *
 *      2.1.2. When fulfilled, a promise:
 *          2.1.2.1. must not transition to any other state.
 *          2.1.2.2. must have a value, which must not change
 *      当一个promise处于fulfilled状态时：
 *          不得转换到任何其他状态
 *          必须有一个值value，该值不能更改
 *
 *      2.1.3. When rejected, a promise:
 *          2.1.3.1. must not transition to any other state.
 *          2.1.3.2. must have a reason, which must not change.
 *      当一个promise处于rejected状态时：
 *          不能转换到任何其他状态
 *          必须有一个reason原因，该值不能更改
 *
 *      Here, "must not change" means immutable identity (i.e. === ), but does not imply deep immutability.
 *      这里，"不得改变"意味着不变的定义即（===），但是不意味着深度不变性
 *
 *      2.2. The then Method
 *      A promise must provide a then method to access its current or eventual value or reason.
 *      A promise's then method accepts two arguments:
 *          promise.then(onFulfilled, onRejected)
 *
 *      then 方法
 *      一个promise必须提供一个then方法去访问其当前或最终的value或reason
 *      一个promise的then方法接收俩个参数
 *
 *      2.2.1. Both onFulfilled and onRejected are optional arguments:
 *          2.2.1.1. If onFulfilled is not a function, it must be ignored.
 *          2.2.1.2. If onRejected is not a function, it must be ignored.
 *      onFulfilled和onRejected都是可选参数
 *          如果onFulfilled不是一个函数，就必须忽略它
 *          如果onRejected不是一个函数，就必须忽略它
 *
 *      2.2.2. If onFulfilled is a function:
 *          2.2.2.1. it must be called after promise is fulfilled, with promise's value as its first arguments.
 *          2.2.2.2. it must not be called before promise is fulfilled.
 *          2.2.2.3. it must not be called more than once.
 *
 *      如果onFulfilled是一个函数：
 *          必须在promise的状态是fulfilled之后调用它，promise的value作为它的第一个参数。
 *          必须在promise的状态是fulfilled之后调用它
 *          不能多次调用
 *
 *      2.2.3. If onRejected is a function
 *          2.2.3.1. it must be called after promise is rejected, with promise's reason as its first argument.
 *          2.2.3.2. it must not be called before promise is rejected.
 *          2.2.3.3. it must not be called more than once.
 *
 *      如果onRejected是一个函数：
 *          必须在promise的状态是rejected之后调用它，promise的reason作为它的第一个参数。
 *          必须在promise的状态是rejected之后调用它
 *          不能多次调用
 *
 *      2.2.4. onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
 *          onFulfilled 和 onRejected 只有在执行环境堆栈仅包含平台代码时才可被调用
 *          execution context: 执行上下文
 *              When control is transferred to ECMAScript executable code, control is entering an execution context.Active
 *              execution contexts logically form a stack.The top execution context on this logical stack is the running execution
 *              context.A new execution context is created whenever control is transferred from the executable code associated
 *              with the currently running execution context to executable code that is not associated with that execution context.
 *              The newly created execution context is pushed onto the stack and becomes the running execution context.
 *              当控制转移到ECMAScript可执行代码时，control正在进入执行内容。活动执行上下文逻辑上形成一个堆栈。这逻辑堆栈上的最上层上下文是正在
 *              运行的执行上下文。当控制从当前正在运行的执行上下文转移到与之无关的执行上下文时会创建一个新的执行上下文。新创建的执行上下文被推进到
 *              堆栈中成为正在运行的执行上下文。
 *
 *              An execution context contains whatever state is necessary to track the execution progress of its associated code.
 *              In addition, each execution context has the state components listed in Table.
 *              一个执行上下文包含跟踪关联代码的执行进度所需的任何状态。此外，每个执行上下文都有表中列出的状态组件。
 *
 *              Execution Context State Components
 *              执行上下文状态组件
 *
 *              Component   Purpose
 *              LexicalEnvironment    Identifies the Lexical Environment used to resolve identifier references made by code within this execution context.
 *              词法环境    标识用于解析在此执行上下文中由代码生成的标识符引用的词法环境
 *
 *              VariableEnvironment    Identifies the Lexical Environment whose environment record holds bindings created by VariableStatements and FunctionDeclarations
 *              within this execution context.
 *              变量环境    标识其环境记录保存在此执行上下文中由变量声明和函数声明创建的绑定的词法环境
 *
 *              ThisBinding    The value associated with the this keyword within ECMAScript code associated with this execution context.
 *
 *              An execution context contains whatever state is necessary to track the execution progress of its associated code.
 *              In addition,each execution context has the state components listed in Table 19.
 *
 *      2.2.5. onFulfilled and onRejected must be called as functions (i.e. with no this value).
 *
 *      2.3 The Promise Resolution Procedure
 *      promise 解析过程
 *
 *      The promise resolution procedure is an abstract operation taking as input a promise and a value,
 *      which we debnote as [[Resolve]](promise, x).If x is a thenable,it attempts to make promise adopt the
 *      state of x,under the assumption that x behaves at least somewhat like a promise.Otherwise,it fulfills
 *      promise with the value x.
 *      promise解析过程是一个抽象操作，它将promise和value作为输入，我们将其表示为[[Resolve]](promise, x)
 *      如果x是一个thenable,假设x的行为至少有点像promise，它会尝试让promise采用x的状态。不然就会用x来完成promise.
 *
 *      This treatment of thenables allows promise implementations to interoperate, as long as they expose a
 *      Promises/A+-compliant then method.It also allows Promises/A+ implementations to "assimilate" nonconformant
 *      implementations with reasonable then methods.
 *      只要它们公开一个Promises/A+兼容的方法，对thenables的这种处理允许promise实现互操作，它还允许Promises/A+实现使用合理的then方法
 *      "同化"不一致的实现。
 *
 *      To run [[Resolve]](promise, x),perform the following steps:
 *      运行[[Resolve]](promise, x)，执行以下步骤：
 *
 *      2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
 *      如果promise和x引用同一个对象，返回一个TypeError作为reject promise的原因
 *
 *      2.3.2. If x is a promise, adopt its state [3.4]:
 *          2.3.2.1. If x is pending, promise must remain pending until x is fulfilled or rejected.
 *          2.3.2.2. If/when x is fulfilled, fulfill promise with the same value.
 *          2.3.2.3. If/when x is fulfilled, fulfill promise with the same reason.
 *      如果x是一个promise,采用这些状态
 *          如果x是一个pending,promise必须保持pending状态直到x变成fulfilled或者rejected状态
 *          如果/当x是一个fulfilled，fulfill状态时，promise使用形同的value
 *          如果/当x是一个fulfilled，fulfill状态时，promise使用相同的reason
 *
 *      2.3.3. Otherwise, if x is an object or function,
 *          2.3.3.1. Let then be x.then. [3.5]
 *          2.3.3.2. If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
 *          2.3.3.3. If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise,where:
 *              2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
 *              2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r.
 *              2.3.3.3.3. If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call
 *              takes precedence, and any further calls are ignored.
 *          2.3.3.4. If calling then throws an exception e,
 *              2.3.3.4.1. If resolvePromise or rejectPromise have been called, ignore it.
 *              2.3.3.4.2. Otherwise, reject promise with e as the reason.
 *          2.3.3.4. If then is not a function, fulfill promise with x.
 *      另外，如果x是一个对象或者函数
 *          让then成为x.then的方法
 *          如果查找到x.then的结果是thrown 一个异常e，promise的reject的reason设为e
 *          如果then是一个函数，把x当做this来调用它，第一个参数为resolvePromise,第二个参数为rejectPromise,其中：
 *              如果/当resolvePromise被一个值y调用，运行[[Resolve]](promise, y)
 *              如果/当 rejectPromise被一个reason r调用，用r reject promise
 *              如果resolvePromise和rejectPromise都被调用，或者对同一个参数进行多次调用，第一次调用执行，任何进一步的调用都被忽略
 *          如果调用then抛出一个异常e
 *              如果resolvePromise或者rejectPromise已经被调用，忽略。
 *              否则，用e作为reason拒绝(reject) promise
 *          如果then不是一个函数，用x完成(fulfill)promise
 *
 *      2.3.4. If x is not an object or function, fulfill promise with x.
 *      如果x既不是也不是函数，用x完成promise
 *
 *      If a promise is resolved with a thenable that participates in a circular thenable chain, such that the recursive
 *      nature of [[Resolve]](promise, thenable) eventually causes [[Resolve]](promise, thenable) to be called again,
 *      following the above algorithm will lead to infinite recursion.Implementations are encouraged,but not required,
 *      to detect such recursion and reject promise with an informative TypeError as the reason.
 *      如果一个promise用一个参与循环thenable链的thenable解析，因为[[Reolve]](promise, thenable)的递归性质最终导致再次调用
 *      [[Resolve]](promise, thenable),遵循上述算法最终无限递归。鼓励实施，但不是必须的，检测这种递归并以信息类型错误作为原因拒绝promise
 *
 *      3.Notes
 *      注意
 *
 *      3.1. Here "platform code" means engine, environment, and promise implementation code. In practice, this requirement
 *      ensures that onFulfilled and onRejected execute asynchronously, after the event loop turn in which then is called,
 *      and with a fresh stack.This can be implemented with either a "macro-task" mechanism such as setTimeout or setImmediate,
 *      or with a "micro-task" mechanism such as MutationObserver or process.nextTick.Since the promise implementation is
 *      considered platform code, it may itself contain a task-scheduling queue or "trampoline" in which the handlers are called.
 *      这里的"平台代码"指的是引擎，环境和promise执行代码。在实践中，此要求确保onFulfilled和onRejected能够异步执行，在then被调用之后传入事件，
 *      并使用新的栈。这可以使用诸如setTimeout或setImmediate之类的"宏任务"机制，或者使用诸如MutationObserver或process.nextTick之类的"微任务"机制来实现。
 *      由于promise实现被认为是平台代码，因此它本身可能包含一个任务调度队列或调用处理程序的"trampoline".
 *
 *      3.2. That is, in strict mode this will be undefined inside of them; in sloppy mode, it will be the global object.
 *      没有this的情况，也就是说，在严格模式下，this是未定义的；在宽松模式下，它将成为全局对象。
 *
 *      3.3. Implementations may allow promise2 === promise1, provided the implementation meets all requirements.Each implementation
 *      should document whether it can produce promise2 === promise1 and under what conditions.
 *      then必须返回promise
 *          在实例满足所有要求的情况下，可以允许promise2 === promise1.每个实例都必须声明是否能够实现，以及在什么情况下,promise2 === promise1
 *
 *      3.4. Generally, it will only be known that x is a true promise if it comes from the current implementation.This clause
 *      allows the use of implementation-specific means to adopt the state of known-conformant promises.
 *      关于x
 *          通常，当x来自当前的实例时，x才是真正的prommise.这条固定允许使用特定于实现的方法来采用已知一致的promise状态
 *
 *      3.5. This procedure of first storing a reference to x.then, then testing that reference,and then calling that reference,
 *      avoids multiple accesses to the x.then property.Such precautions are important for ensuring consistency in the face of
 *      an accessor property,whose value could change between retrievals.
 *      关于x.then
 *          这个流程首先保存x.then的引用，然后测试这个引用，避免多次获取x.then属性。这些预防措施对于确保访问者属性的一致性非常重要，访问者属性的
 *          值可能在检索之间发生变化。
 *
 *      3.6. Implementations should not set arbitrary limits on the depth of thenable chains, and assume that beyond that arbitrary
 *      limit the recursion will be infinite.Only true cycles should lead to a TypeError;if an infinite chain of distinct thenables
 *      is encountered, recursing forever is the correct behavior.
 *      如何对待thenable chain
 *          实例不应该对thenable链的深度设置任意限制，并假设递归超出任意限制，递归会无穷。只有真正的循环才会导致TypeError.如果遇到thenables的无限链，
 *          那么永远递归就是正确的行为。
 *
 */

/*
 * standard 标准 sound 良好的 interoperable 互相操作的 implementers 开发者
 * represents  代表 eventual 最终的 asynchronous 异步的 operation 操作 primary 初级的 interacting 互相作用的
 * specification 规范的 interoperable 可互相操作 conformant 合规的 implementations 实施 depended 依赖于 as such 像这样 stable 稳定的
 * organization 组织 occasionally 偶尔的 revise 修改 minor 少数的 backward-compatible 向后兼容 newly-discovered 新发现的 corner 角
 * integrate 整合 discussion 讨论
 * Historically 历史上 clarifies 澄清 clauses 条款 proposal 建议 extending 延伸 facto 事实上 omitting 省略 areunderspecified 未指定 problematic 有问题的
 * core 核心 instead 相反 companion 同伴 specifications 规格
 * Terminology 术语
 * conforms 符合 specification 规范
 * legal 合法的
 */
