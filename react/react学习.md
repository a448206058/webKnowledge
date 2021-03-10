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


参考资料：React.js 小书
[](https://github.com/huzidaha/react-naive-book)
