## 计算属性和监听属性

### 计算属性和监听属性是指的什么
计算属性指的是computed，本质上是computed watch 
监听属性指的是watch，本质上是use watch

### 计算属性和监听属性的相同点和不同点是什么，适用于哪些地方
相同点：本质相同，都是依靠watch实现

不同点：1.使用场景不同

适用场景：

    计算属性适合用在模板渲染中，某个值是依赖了其它的响应式对象甚至是计算属性计算而来
    
    监听属性适用于观测某个值的变化去完成一段复杂的逻辑业务
    
之所以这么设计是vue想确保不仅仅是计算属性依赖的值发生变化，
而是当计算属性最终计算的值发生变化才会触发渲染watcher重新渲染

### 计算属性computed的实现
计算属性的初始化的过程是发生在实例的初始化阶段的initState函数中

实现过程：initState -> initComputed -> defineComputed -> createComputedGetter

具体流程分析：

initState是做什么的？
	
initState主要是对props、methods、data、computed和watcher等属性做了初始化操作。
	
```JavaScript
export function initState (vm: Component) {
	vm._watchers = []
	const opts = vm.$options
	if (opts.props) = initProps(vm, opts.methods)
	if (opts.method) = initMethod(vm, opts.methods)
	if (opts.data) {
		initData(vm)
	} else {
		observe(vm._data = {}, true /* asRootData */)
	}
	if (opts.computed) initComputed(vm, opts.computed)
	if (opts.watch && opts.watch !== nativeWith) {
		initWatch(vm, opts.watch)
	}
}
```

### initComputed 初始化computed
首先创建vm._computedWatchers为一个空对象

然后遍历computed对象，拿到计算属性的每一个userDef，然后尝试获取这个userDef对应的getter

接下来为每一个getter创建一个watcher,不是渲染watcher 而是一个computed watcher

如果key不是vm的属性，则调用defineComputed(vm, key, userDef) 

```JavaScript
const computedWatchOptions = { computed: true }

function initComputed (vm: Component, computed: Object) {
    //首先创建vm._computedWatchers为一个空对象
    const watchers = vm._computedWatchers = Object.create(null)

    // computed properties are just getters during SSR
    const isSSO = isServerRendering();
    
    //对computed对象做遍历，拿到计算属性的每一个userDef，然后尝试获取这个userDef对应的getter函数
    for (const key in computed) {
        const userDef = computed[key];
        const getter = typeof userDef === 'function' ? userDef : userDef.get
        if(process.env.NODE_ENV !== 'production' && getter !== null) {
            warn(
                `Getter is missing for computed property "${key}".`,
                vm
            )
        }

        //接下来为每一个getter创建一个watcher,不是渲染watcher 而是一个computed watcher
        if(!isSSO) {
            // create internal watcher for the computed property.
            watchers[key] = new Watcher(
                vm,
                getter || noop,
                noop,
                computedWatchOptions
            )
        }

        //如果key不是vm的属性，则调用defineComputed(vm, key, userDef) 
        if(!(key in vm)){
            defineComputed(vm, key, userDef)
        } else if (process.env.NODE_ENV !== 'production'){
            if (key in vm.$data){
                warn(`The computed property "${key}" is already defined in data.`, vm)
            }else if(vm.$options.props && key in vm.$options.data) {
                warn(`The computed property "${key}" is already defined as a prop.`, vm)
            }
        } 
    }
}
```

继续往下走
### defineComputed 的实现
利用Object.defineProperty给计算属性对应的key添加getter和setter，setter通常是计算属性的一个对象，
并且拥有set方法的时候才有，否则是一个空函数
```JavaScript
export function defineComputed (
    target: any,
    key: string,
    userDef: Object | Function
) {
    const shouldCache = !isServerRending()
    if (typeof userDef === 'function') {
        sharedPropertyDefinition.get = shouldCache
            ? createComputedGetter(key)
            : userDef
        sharedPropertyDefinition.set = noop
    } else {
        sharedPropertyDefinition.get = userDef.get
            ? shouldCache && userDef.cache !== false
                ? createComputedGetter(key)
                : userDef.get
            : noop
        sharedPropertyDefinition.set = userDef.set
            ? userDef.set
            : noop
    }
    if (process.env.NODE_ENV !== 'production' &&
        sharedPropertyDefinition.set === noop) {
            sharedPropertyDefinition.set = function(){
                warn(
                    `Computed property "${key}" was assigned to but it has no setter.`,
                    this
                )       
            }
        }
        Object.defineProperty(target, key, sharedPropertyDefinition)   
}
```

然后是createComputedGetter
createComputedGetter返回一个函数computedGetter，它就是计算属性对应的getter。
```JavaScript
function createComputedGetter (key) {
    return function computedGetter() {
        const watcher = this._computedWatchers && 
        this._computedWatchers[key]
        if (watcher) {
            watcher.depend()
            return watcher.evaluate()
        }
    }
}
```

### 侦听属性watch 的实现
侦听属性的初始化也是发生在实例的初始化阶段的initState函数中，在computed初始化之后执行

实现过程：initWatch -> createWatcher -> vm.$watch
