## 前端组件化
```JavaScript
class LikeButton {
	constructor () {
		this.state = { isLiked: false }
	}
	
	changeLikeText () {
		const likeText = this.el.querySelector('.like-text')
		this.state.isLiked = !this.state.isLiked
		likeText.innerHTML = this.state.isLiked ? '取消' : '点赞'
	}
	
	render () {
		this.el = createDOMFromString(`
			<button class='like-button'>
				<span class='like-text'>点赞</span<
				<span>👍</span>
			</button
		`)
		this.el.addEventListener('click', this.changeLikeText.bind(this), false)
		return this.el
	}
}

```
### 状态改变 -> 构建新的DOM元素更新页面
一旦状态发生改变，就重新调用render方法，构建一个新的DOM元素。
好处就是你可以在render方法里面使用最新的this.state来构造不同HTML结构的字符串，并且通过这个字符串构造不同的DOM元素。

```JavaScript
class LikeButton {
	constructor () {
		this.state = { isLiked: false}
	}
	
	setState (state) {
		this.state = state
		this.el = this.render()
	}
	
	changeLikeText () {
		this.setState({
			isLiked: !this.state.isLiked
		})
	}
	
	render () {
		this.el = createDOMFromString(`
			<button class='like-button'>
				<span class='like-text'>点赞</span<
				<span>👍</span>
			</button
		`)
		this.el.addEventListener('click', this.changeLikeText.bind(this), false)
		return this.el
	}
}
```

### 重新插入新的DOM元素
重新渲染的dom元素并没有插入到页面当中。所以在这个组件外面，你需要直到这个组件发生了改变，并且把新的DOM元素更新到页面当中。
```JavaScript
setState (state) {
	const oldEl = this.el
	this.state = state
	this.el = this.render()
	if (this.onStateChange) this.onStateChange(oldEl, this.el)
}

// 使用
const likeButton = new LikeButton()
wrapper.appendChild(likeButton.render()) // 第一次插入DOM元素
likeButton.onStateChange = (oldEl, newEl) => {
	wrapper.insertBefore(newEl, oldEl) // 插入新的元素
	wrapper.removeChild(oldEL) // 删除旧的元素
}
```

### 抽象出公共组件类
为了让代码更灵活，可以写更多的组件，把这种模式抽象出来，放到一个Component类当中：
```JavaScript
class Component {
	constructor (props = {}) {
		this.props = props
	}
	
	setState (state) {
		const oldEl = this.el
		this.state = state
		this._renderDOM()
		if (this.onStateChange) this.onStateChange(oldEl, this.el)
	}
	
	_renderDOM () {
		this.el = createDOMFromString(this.render())
		if (this.onClick) {
			this.el.addEventListener('click', this.onClick.bind(this), false)
		}
		return this.el
	}
}

// 额外的mount 方法，把组件的DOM元素插入页面，并且在setState的时候更新页面：
const mount = (component, wrapper) => {
	wrapper.appendChild(component._renderDOM())
	component.onStateChange = (oldEl, newEl) => {
		wrapper.insertBefore(newEl, oldEl)
		wrapper.removeChild(oldEl)
	}
}

class LikeButton extends Component {
	// 实现传参
	constructor(props) {
		super(props)
		this.state = { isLiked: false }
	}
	
	onClick () {
		this.setState({
			isLiked: !this.state.isLiked
		})
	}
	
	render () {
		return `
			 <button class='like-btn' style="background-color: ${this.props.bgColor}">
			          <span class='like-text'>${this.state.isLiked ? '取消' : '点赞'}</span>
			          <span>👍</span>
			        </button>
		`
	}
	
	mount(new LikeButton(bgColor: 'red'), wrapper)
}

// 实现更改颜色
class RedBlueButton extends Component {
	constructor (props) {
		super(props)
		this.state = {
			color: 'red'
		}
	}
	
	onClick () {
		this.setState({
			color: 'blue'
		})
	}
	
	render () {
		return `
			<div style='color: ${this.state.color};'>${this.state.color}</div>
		`
	}
}
```

## JSX描述ui信息
### JSX原理
用javaScript对象来表现一个DOM元素的结构
标签名，属性，子元素 {tag: '', attrs:{} ,children: []}

```JavaScript
class Header extends Component {
	render () {
		return (
			<div>
				<h1 className="title">React 小书</h1>
			</div>
		)
	}
}

ReactDOM.render(
	<Header />,
	document.getElementById('root')
)

// 编译之后
class Header extends Component {
	render () {
		return (
			React.createElement(
				"div",
				null,
				React.createElement(
					"h1",
					{ className: 'title' },
					"React 小书"
				)
			)
		)
	}
}

ReactDOM.render(
	React.createElement(Header, null)
	document.getElementById('root')
)
```

JSX其实就是JavaScript对象
ReactDOM.render功能就是把组件渲染并且构造DOM树，然后插入到页面上某个特定的元素上。
JSX babel编译+React.js构造 生成javaScript对象结构 通过reactDOM.render生成DOM元素 插入到页面


## render方法
render方法必须要返回一个JSX元素。必须要用一个外层的JSX元素把所有内容包裹起来。

### 表达式插入
使用{}
```JavaScript
render () {
	const word = 'is good'
	return (
		<div>
			<h1>React {word} </h1>
			<h2><{(function () { return 'is good'})()}/h2>
			<label htmlFor='mal'></label>
		</div>
	)
}
```

## 组件的组合、嵌套和组件树
```JavaScript
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Title extends Component {
	render () {
		return (
			<h1>React</h1>
		)
	}
}

class Header extends Component {
	render () {
		return (
			<div>
				<Title />
				<h2>This is Header</h2>
			</div>
		)
	}
}

class Main extends Component {
	render () {
		return (
			<div>
				<h2>This is main content</h2>
			</div>
		)
	}
}

class Footer extends Component {
	render () {
		return (
			<div>
				<h2>This is footer</h2>
			</div>
		)
	}
}

class Index extends Component {
	render () {
		return (
			<div>
				<Header />
				<Main />
				<Footer />
			</div>
		)
	}
}

ReactDOM.render(
	<Index />,
	document.getElementById('root')
)

```

## 事件监听
在React.js不需要手动调用浏览器原生的addEventListener进行事件监听。React封装了一系列on的属性
```JavaScript
class Title extends Component {
	handleClickOnTitle () {
		console.log('Click on title.')
	}
	
	render () {
		return (
			<h1 onClick={this.handleClickOnTitle}>React</h1>
		)
	}
}
```

### event对象
react.js将浏览器原生的event对象封装了一下，对外提供统一的API和属性。
这个人event对象是符合W3C标准的，event.stopPropagation、event.preventDefault。
```JavaScript
class Title extends Component {
	handleClickOnTitle (e) {
		console.log(e.target.innerHTML)
	}
	
	render () {
		return (
			<h1 onClick={this.handleClickOnTitle}>React</h1>
		)
	}
}
```
### 关于事件中的this
需要手动传递 this.way 是直接通过函数调用
```JavaScript
class Title extends Component {
	handleClickOnTitle (word, e) {
		console.log(this, word)
	}
	
	render () {
		return (
			<h1 onClick={this.handleClickOnTitle.bind(this, 'hellp')}>React</h1>
		)
	}
}
```

## 组件的state和setState
### state 
用来存储可变化的状态

### setState
接受对象参数
setState方法由父类Component提供。当我们调用这个函数的时候，React.js会更新组件的状态state，并且重新调用
render方法，然后再把render方法所渲染的最新的内容显示到页面上

### setState接受函数参数
调用setState，React.js并不会马上修改state。而是把这个对象放到一个更新队列里面
```JavaScript
handleClickOnLikeButton () {
	this.setState((prevState)=> {count: 0})
	
	this.setState((prevState)=>{count: prevState.count + 1})
	
	this.setState((prevState)=>{count: prevState.count + 2})
}
```

## setState 合并
React.js内部会把JavaScript事件循环中的消息队列的同一个消息中的setState都进行合并以后再重新渲染组件

## 配置组件的props
组件是相互独立、可复用的单元，一个组件可能在不同地方被用到。
每个组件都可以接受一个props参数，它是一个对象，包含了所有你对这个组件的配置，也可以是一个函数
通过this.props获取

### 默认配置defaultProps
```JavaScript
	class LikeButton extends Component {
		static defaultProps = {
			likedText: '',
			unlikedText: ''
		}
	}
```

### props不可变

### 通过setState的重新渲染的特性 重新渲染组件 然后传输props

尽量少用state,尽量多用props
没有state的组件叫无状态组件，设置来state的叫做有状态组件

函数式组件
一个函数就是一个组件
函数式组件就是一种只能接受props和提供render方法的类组件
```JavaScript
const HelloWorld = (props) => {
	const sayHi = (event) => alert('Hello World')
	return (
		<div onClick={sayHi}>Hello World</div>
	)
}
```

## 渲染列表数据
```JavaScript
const users = [
	{ username: 'Jerry', age: 21, gender: 'male'},
	{ username: 'Tomy', age: 22, gender: 'male'},
	{ username: 'Lily', age: 19, gender: 'female'}
]

class User extends Component {
	render () {
		const { user } = this.props
		return (
			<div>
				<div>姓名：{user.username}</div>
			</div>
		)
	}
}

class Index extends Component {
	render () {
		return (
			<div>
				{users.map((user, i) => <User key={i} user={user} />)}
			</div>
		)
	}
}

ReactDOM.rener(
	<Index />,
	document.getElementById('root')
)
```

## 状态提升
子组件的值交给父组件管理

## 挂载阶段的组件生命周期
constructor: 组件自身的状态的初始化工作

componentWillMount：组件挂载开始之前，也就是在组件调用render方法之前调用
组件的启动工作，例如Ajax数据拉取、定时器的启动

componentDidMount: 组件挂载完成以后，也就是DOM元素已经插入页面后调用

componentWillUnmount: 组件对应的DOM元素从页面中删除之前调用
数据的清理

更新阶段的组件生命周期：

shouldComponentUpdate(nextProps, nextState): 你可以通过这个方法控制组件是否重新渲染。
如果返回false组件就不会重新渲染。这个生命周期在React.js性能优化上非常有用。

componentWillReceiveProps(nextProps): 组件从父组件接收到新的props之前调用

componentWillUpdate(): 组件开始重新渲染之前调用

componentDidUpdate(): 组件重新渲染并且把更改变更到真实的DOM以后调用。

## ref和react.js中的dom操作

## props.children 和 容器类组件

## dangerouslySetHTML和style属性
为了防止XSS攻击，在React.js当中所有的表达式插入的内容都会被自动转义

dangerouslySetInnerHTML可以实现innerHTML的功能
```JavaScript
render () {
	return (
		<div
			className='editor-wrapper'
			dangerouslySetInnerHTML={{__html: this.state.content}} />
	)
}
```

## PropTypes和组件参数验证

## 什么是高阶组件
高阶组件就是一个函数，传给它一个组件，它返回一个新的组件。新的组件使用传入的组件作为子组件

主要是为了组件之间的代码复用。组件可能有着某些相同的逻辑，把这些逻辑抽离出来，放到高阶组件中进行复用。
高阶组件内部的包装组件和被包装组件之间通过props传递数据

```JavaScript
import React, { Component } from 'react'

export default (WrappedComponent, name) => {
	class NewComponent extends Component {
		constructor () {
			super()
			this.state = { data: null }
		}
		
		componentWillMount () {
			ajax.get('/data/' + name, (data) => {
				this.setState({ data })
			})
		}
		
		render () {
			return <WrappedComponent data={this.state.data} />
		}
	}
	return NewComponent
}
```

### React.js 的 context
一个组件的context只有它的子组件能够访问，它的父组件是不能访问到
 
### 动手实现Redux
Redux 是一种架构模式。React-redux 是把Redux和React.js结合起来的一个库

第一步 规定只有通过dispatch才能修改状态

第二步 抽离store和监控数据变化
定义订阅模式进行监听

### 纯函数
函数的返回结果只依赖于它的参数
函数执行过程没有副作用
一个函数执行过程对产生了外部可观察的变化那么就说这个函数是有副作用的



参考资料：React.js 小书
[](https://github.com/huzidaha/react-naive-book)
