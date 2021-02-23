import Watcher from './Watch'
/**
 * 主要就是用来操作dom
 * 负责编译模板，解析指令/插值表达式
 * 负责页面的首次渲染
 * 当数据变化后重新渲染视图
 */

export default class Compiler {
    constructor(vm) {
        this.el = vm.$el // vue实例下的模板
        this.vm = vm // vm就是vue实例
        this.compile(this.el) // compiler实例对象创建后，会立即调用这个方法
    }

    // 编译模板，处理文本节点和元素节点
    compile (el) {
        let childNodes = el.childNodes // 是个伪数组
        Array.from(childNodes).forEach((node) => {
            if (this.isTextNode(node)) {
                // 编译文本节点，处理差值表达式{{}}
                this.compileText(node)
            } else if (this.isElementNode(node)) {
                // 编译元素节点，处理指令
                this.compileElement(node)
            }

            // 递归调用compile，把所有的子节点都处理掉，也就是嵌套的节点都处理掉
            if (node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })

    }
    // 编译元素节点，处理指令，这里只处理v-text和v-model
    compileElement (node) {
        // console.dir(node.attributes)
        Array.from(node.attributes).forEach((attr) => {
            // console.log(attr.name)
            let attrName = attr.name // 指令属性名 v-modelv-texttypev-count
            // 判断是否是vue指令
            if (this.isDirective(attrName)) {
                // v-text ==> text
                attrName = attrName.substr(2) // textmodelon:clickhtml
                let key = attr.value // 指令属性值 // msgcounttextclickBtn()

                // 处理v-on指令
                if (attrName.startsWith('on')) {
                    const event = attrName.replace('on:', ''); // 获取事件名
                    // 事件更新
                    this.onUpdater(node, key, event);
                } else {
                    this.update(node, key, attrName);
                }
            }

        })
    }

    update (node, key, attrName) {
        let updateFn = this[attrName + 'Updater'] // textUpdater(){} 或者 modelUpdater(){}
        // this 是compiler对象
        updateFn && updateFn.call(this, node, this.vm[key], key) // updateFn的名字存在才会执行后面的函数

    }

    // 处理v-text指令
    textUpdater (node, value, key) {
        // console.log(node)
        node.textContent = value

        // 创建watcher对象，当数据改变去更新视图
        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }

    // 处理v-html指令
    htmlUpdater (node, value, key) {
        // console.log(node)
        node.innerHTML = value

        // 创建watcher对象，当数据改变去更新视图
        // this.vm: vue的实例对象 key:data中的属性名称 ()=>{}: 回调函数，负责更新视图
        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }

    // 处理v-model指令
    modelUpdater (node, value, key) {
        // console.log(node, value)
        node.value = value
        // console.log(node.value)
        // 创建watcher对象，当数据改变去更新视图
        new Watcher(this.vm, key, (newValue) => {
            node.value = newValue
        })

        // 双向数据绑定
        node.addEventListener('input', () => {
            this.vm[key] = node.value
        })
    }


    // 处理v-on指令
    onUpdater (node, key, event) {
        // console.log(node ,key, event)
        node.addEventListener(event, () => {
            // 判断函数名称是否有()
            if (key.indexOf('(') > 0 && key.indexOf(')') > 0) {
                this.vm.$options.methods[key.slice(0,-2)]()
            } else {
                this.vm.$options.methods[key]()
            }
        })
    }


    // 编译文本节点，处理差值表达式{{  msg }}
    compileText (node) {
        // console.dir(node)
        let reg = /{{(.+?)}}/
        let value = node.textContent // 获取文本节点内容：{{ msg }}

        if (reg.test(value)) {
            let key = RegExp.$1.trim() // 把差值表达式{{  msg }}中的msg提取出来
            // 把{{  msg }}替换成 msg对应的值，this.vm[key] 是vue实例对象内的msg
            node.textContent = value.replace(reg, this.vm[key])

            // 创建watcher对象，当数据改变去更新视图
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = newValue
            })
        }
    }

    // 判断元素属性是否是vue指令
    isDirective (attrName) {
        return attrName.startsWith('v-')
    }

    // 判断节点是否是文本节点(元素节点1属性节点2文本节点3)
    isTextNode (node) {
        return node.nodeType === 3
    }

    // 判断节点是否是元素节点(元素节点1属性节点2文本节点3)
    isElementNode (node) {
        return node.nodeType === 1
    }
}
