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
