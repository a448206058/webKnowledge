##造轮子系列：虚拟dom
Virtual DOM就是用一个原生的JS对象去描述一个DOM节点

VNode是对真实DOM的一种抽象描述，它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等，其它属性都是用来扩展VNode
的灵活性以及实现一些特殊feature的。由于VNode只是用来映射到真实DOM的渲染，不需要包含操作DOM的方法，因此它是非常轻量和简单的。

Virtual DOM除了它的数据结构的定义，映射到真实DOM实际上要经历VNode的create、diff、patch等过程




[](https://juejin.cn/post/6844903895467032589)

##造轮子系列：compile

## 造轮子系列： 数据渲染
思路：通过虚拟节点VNode对节点进行构建，构建DOM Tree
在通过遍历DOM Tree 通过createElement创建元素

https://github.com/answershuto/learnVue
    
		
