/* @flow */

import {parse} from './parse/index.js'
import {optimize} from './optimizer'
import {generate} from './codegen/index.js'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
// createCompilerCreator 允许创建编译器使用替代方法
// parser/optimizer/codegen,例如SSR优化编译器
// 在这里，我们只是使用默认部分导出一个默认编译器。

//实际上是通过调用createCompilerCreator方法返回的，该方法传入的参数是一个函数，真正的编译过程都在这个baseCompile函数里执行
export const createCompiler = createCompilerCreator(function baseCompile (
  template,
  options
) {
  // 解析模版字符串生成ast
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    // 优化语法树
    optimize(ast, options)
  }
  // 生成代码
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
