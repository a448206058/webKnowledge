## 轮子哥说过，检验学习的最好办法就是造轮子，定个计划，造起来
	本系列文章最主要的目的是为了巩固学习的vue源码知识，提高自身的开发水平，
	加强开发思路，熟悉造轮子的过程
	
## vue轮子系列一：双向绑定
## 开发的道是思想、思路，术是代码，所以造轮子之前，先想清楚思路

首先我们要了解什么是双向绑定？
	首先要了解什么MVVM?
	MVVM是指，Model、View、ViewModel
	双向绑定是指 Model的数据变化会重新渲染View
	而View的变更也会重新导致Model的修改
	ViewModel是Model和View之间的桥梁

ViewModel是怎么实现这一过程的呢？
	主要是通过Object.defineProperty 设置一个getter和一个setter
	分俩步：
		第一步是Model的变化重新渲染view,每次对数据进行修改的时候都会触发setter，从而导致页面重新渲染
		第二步是View的变化导致Model的修改，通过watcher观察，重新修改Model

分析完了，开始造轮子的步骤。
	如何实现步骤一呢？
		首先了解下Object.defineProperty，不了解的同学可以通过MDN进行了解
		通过Object.defineProperty劫持一个自定义的对象，设置自定义的setter和getter
		Setter做哪些事情呢？
			1.监听对象变化，变化的时候触发对应的修改函数
			2.定义修改函数，修改DOM
	如何实现步骤二呢？
		对初始对象的getter进行observe watch
	
	如何造轮子？
		我们最终目的是要发布到网上供自己或他人使用，所以需要使用node的npm包管理工具进行发布
		通过npm init 初始化
		定义目录结构
			src
				main.js
				index.html
		
		main.js中如何定义
			定义初始化对象
			通过export导出
			
## 造轮子系列： 响应式原理
### 什么是响应式？
    就是数据发生变化能够马上知晓并发生变更。
    
### 怎么实现？
    主要是通过Object.defineProperty的get和set属性
    第一步：
        定义一个函数，返回
    
		
