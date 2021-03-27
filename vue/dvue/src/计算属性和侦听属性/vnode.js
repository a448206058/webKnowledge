export default class VNode{
    constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory){
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
		this.elm = elm
		this.context = context
		this.componentOptions = componentOptions
		this.asyncFactory = asyncFactory
    }

}

// export default class VNode{
//     constructor(tag, data, children, text){
//         this.tag = tag;
//         this.data = data;
//         this.children = children;
//         this.text = text;
//     }

// }
