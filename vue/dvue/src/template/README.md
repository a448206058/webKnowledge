template是编译成render function的过程
```JavaScript
function baseCompile (
	template: string,
	options: CompilerOptions
): CompiledResult {
	/*parse解析得到ast树*/
	const ast = parse(template.trim(), options)
	/**
	 * 将AST树进行优化
	 * 优化的目标：生成模版AST树，检测不需要进行DOM改变的静态子树。
	 * 一旦检测到这些静态树，我们就能做以下事情：
	 * 1.把它们变成常数，这样我们就再也不需要每次重新渲染时创建新的节点了。
	 * 2.在patch的过程中直接跳过。
	 */
	optimize(ast, options) {
		/*根据ast树生成所需的code(内部包含render与staticRenderFns)*/
		const code = generate(ast, options)
		return {
			ast, 
			render: code.render,
			staticRenderFns: code.staticRenderFns
		}
	}
}
```

### parse
parse会用正则等方式解析template模版中的指令、class、style等数据，形成AST语法树

### optimize
optimize的主要作用是标记static静态节点，这是Vue在编译过程中的一处优化，后面当update
更新界面时，会有一个patch的过程，diff算法会直接跳过静态节点，从而减少了比较的过程，
优化了patch的性能。

### generate
generate是将AST语法树转化成render function字符串的过程，得到结果是render的字符串
以及staticRenderFns字符串。

[](https://github.com/answershuto/learnVue/blob/master/docs/%E8%81%8A%E8%81%8AVue%E7%9A%84template%E7%BC%96%E8%AF%91.MarkDown)