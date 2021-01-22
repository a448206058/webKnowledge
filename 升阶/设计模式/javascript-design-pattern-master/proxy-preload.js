// 这个PreloadImage 违反了设计原则中的`单一职责原则`
// 不仅要负责图片的加载，还要负责DOM层面的操作（img节点的初始化和后续改变））
/*class PreloadImage {
	// 占位图的url地址
	static LOADING_URL= 'https://dss0.bdstatic.com/5aV1bjqh_Q23odCf/static/mantpl/img/news/hot_search/top_1@1x-d1e660cf3b.png';

	constructor(imgNode) {
		// 获取该实例对应的DOM节点
		this.imgNode = imgNode;
	}

	setSrc(targetUrl) {
		// img节点初始化时展示的是一个占位图
		this.imgNode.src = PreloadImage.LOADING_URL;
		// 创建一个帮我们加载图片的Image实例
		const image = new Image();
		// 监听目标图片加载的情况，完成时再将DOM上的img节点的src属性设置为目标图片的url
		image.onload = () => {
			this.imgNode.src = targetUrl;
		}
		// 设置src属性，Image实例开始加载图片
		image.src = targetUrl;
	}
}*/

// 好的做法是将两个逻辑分离，让`PreloadImage`专心做DOM层面的事情（真实DOM节点的获取、img节点的链接设置）
// 再找一个对象来专门搞加载——代理器
class PreloadImage {
	constructor(imgNode) {
		this.imgNode = imgNode;
	}

	setSrc(imgUrl) {
		this.imgNode.src = imgUrl;
	}
}

class ProxyImage {
	// 占位图
	static LOADING_URL = 'https://dss0.bdstatic.com/5aV1bjqh_Q23odCf/static/mantpl/img/news/hot_search/top_1@1x-d1e660cf3b.png';

	constructor(targetImage) {
		// 目标Image，即PreloadImage实例
		this.targetImage = targetImage;
	}

	setSrc(targetUrl) {
		// 真实img节点初始化展示的是一个占位图
		this.targetImage.setSrc(ProxyImage.LOADING_URL);
		// 创建一个帮我们加载图片的虚拟Image实例
		const virtualImage = new Image();
		virtualImage.onload = () => {
			this.targetImage.setSrc(targetUrl);
		}
		// 设置src属性，虚拟Image实例开始加载图片
		virtualImage.src = targetUrl;
	}
}