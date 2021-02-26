export default class VNode{
    constructor(tag, data, children, text, elm, context){
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.context = context;
    }
}

export const createEmptyVNode = (text) => {
    const node = new VNode()
    node.text = text
    node.isComment = true
    return node
}

export function createTextVNode (val) {
    return new VNode(undefined, undefined, undefined, String(val))
}
