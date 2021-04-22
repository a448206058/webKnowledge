## component 组件实现
component的实现和普通元素的实现过程都要经过$mount挂载返回vnode，
然后通过createElement,创建元素

## $mount的实现过程
在上一节的template分析过了，简单来说就是
在$mount内部判断是否含有render
	
	有的话直接走render函数过程，
	没有的走template函数过程

## createElement的过程
在_createElement函数内部需要通过 createComponent创建vnode
分为俩步：

1.通过resolveAsset判断是否为自定义组件的标签
```
export function resolveAsset (
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
 
  // 首先检查vue实例本身有无该组件
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
 
  // 如果实例上没有找到，去查找原型链
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}
```

## createComponent
```
// createComponent
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }
 
  // 获取Vue的构造函数
  const baseCtor = context.$options._base
 
  // 如果Ctor是一个选项对象，需要使用Vue.extend使用选项对象，创建将组件选项对象转换成一个Vue的子类
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }
 
  // 如果Ctor还不是一个构造函数或者异步组件工厂函数，不再往下执行。
  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${String(Ctor)}`, context)
    }
    return
  }
 
  // 异步组件
  let asyncFactory
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor)
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }
 
  data = data || {}
 
  // 重新解析构造函数的选项对象，在组件构造函数创建后，Vue可能会使用全局混入造成构造函数选项对象改变。
  resolveConstructorOptions(Ctor)
 
  // 处理组件的v-model
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }
 
  // 提取props
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)
 
  // 函数式组件
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }
 
  const listeners = data.on
  data.on = data.nativeOn
 
  if (isTrue(Ctor.options.abstract)) {
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }
 
  // 安装组件hooks
  installComponentHooks(data)
 
  // 创建 vnode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
 
  return vnode
}
  
```

由于Vue允许通过一个选项对象定义组件，Vue需要使用Vue.extend将组件的选项对象转换成一个构造函数
```JavaScript
/**
   * Vue类继承，以Vue的原型为原型创建Vue组件子类。继承实现方式是采用Object.create()，在内部实现中，加入了缓存的机制，避免重复创建子类。
   */
  Vue.extend = function (extendOptions: Object): Function {
    // extendOptions 是组件的选项对象，与vue所接收的一样
    extendOptions = extendOptions || {}
    // Super变量保存对父类Vue的引用
    const Super = this
    // SuperId 保存父类的cid
    const SuperId = Super.cid
    // 缓存构造函数
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
 
    // 获取组件的名字
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }
 
    // 定义组件的构造函数
    const Sub = function VueComponent (options) {
      this._init(options)
    }
 
    // 组件的原型对象指向Vue的选项对象
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
 
    // 为组件分配一个cid
    Sub.cid = cid++
 
    // 将组件的选项对象与Vue的选项合并
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    // 通过super属性指向父类
    Sub['super'] = Super
    
    // 将组件实例的props和computed属代理到组件原型对象上，避免每个实例创建的时候重复调用Object.defineProperty。
    if (Sub.options.props) {
      initProps(Sub)
    }
 
    if (Sub.options.computed) {
      initComputed(Sub)
    }
 
    // 复制父类Vue上的extend/mixin/use等全局方法
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use
 
    // 复制父类Vue上的component、directive、filter等资源注册方法
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
 
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }
 
    // 保存父类Vue的选项对象
    Sub.superOptions = Super.options
    // 保存组件的选项对象
    Sub.extendOptions = extendOptions
    // 保存最终的选项对象
    Sub.sealedOptions = extend({}, Sub.options)
 
    // 缓存组件的构造函数
    cachedCtors[SuperId] = Sub
    return Sub
  }
}
```

通过installComponentHooks为组件vnode的data添加组件钩子，这些钩子在组件的不同阶段被调用
```
function installComponentHooks (data: VNodeData) {
 const hooks = data.hook || (data.hook = {})
 for (let i = 0; i < hooksToMerge.length; i++) {
   const key = hooksToMerge[i]
   // 外部定义的钩子
   const existing = hooks[key]
   // 内置的组件vnode钩子
   const toMerge = componentVNodeHooks[key]
   // 合并钩子
   if (existing !== toMerge && !(existing && existing._merged)) {
     hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
   }
 }
}
 
// 组件vnode的钩子。
const componentVNodeHooks = {
 // 实例化组件
 init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
   if (
     vnode.componentInstance &&
     !vnode.componentInstance._isDestroyed &&
     vnode.data.keepAlive
   ) {
     // kept-alive components, treat as a patch
     const mountedNode: any = vnode // work around flow
     componentVNodeHooks.prepatch(mountedNode, mountedNode)
   } else {
     // 生成组件实例
     const child = vnode.componentInstance = createComponentInstanceForVnode(
       vnode,
       activeInstance
     )
     // 挂载组件，与vue的$mount一样
     child.$mount(hydrating ? vnode.elm : undefined, hydrating)
   }
 },
 
 prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
   const options = vnode.componentOptions
   const child = vnode.componentInstance = oldVnode.componentInstance
   updateChildComponent(
     child,
     options.propsData, // updated props
     options.listeners, // updated listeners
     vnode, // new parent vnode
     options.children // new children
   )
 },
 
 insert (vnode: MountedComponentVNode) {
   const { context, componentInstance } = vnode
   if (!componentInstance._isMounted) {
     componentInstance._isMounted = true
     // 触发组件的mounted钩子
     callHook(componentInstance, 'mounted')
   }
   if (vnode.data.keepAlive) {
     if (context._isMounted) {
       queueActivatedComponent(componentInstance)
     } else {
       activateChildComponent(componentInstance, true /* direct */)
     }
   }
 },
 
 destroy (vnode: MountedComponentVNode) {
   const { componentInstance } = vnode
   if (!componentInstance._isDestroyed) {
     if (!vnode.data.keepAlive) {
       componentInstance.$destroy()
     } else {
       deactivateChildComponent(componentInstance, true /* direct */)
     }
   }
 }
}
 
const hooksToMerge = Object.keys(componentVNodeHooks)
 
```


