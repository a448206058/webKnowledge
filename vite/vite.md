## vite原理
webpack时代，我们所写的代码一般都是基于ES Module规范
这些构建工具在本地开发调试的时候，也都会提前把你的模块先打包成浏览器可读取的js bundle，
虽然有懒加载等优化手段，但懒加载并不代表懒构建，webpack还是需要把你的异步路由用到的模块提前构建好

Vite利用了浏览器的原生ES Module支持，直接在html中写import

## 依赖预编译
在vite2.0为用户启动开发服务器之前，先用esbuild把检测到的依赖预先构建了一遍

esbuild在启动的时候预先把debounce所用到的所有内部模块全部打包成一个传统的js bundle

esbuild 使用 go编写，并且比以JavaScript编写的打包器预构建依赖快10-100倍

在httpServer.listen 启动开发服务器之前，会先把这个函数劫持改写，放入依赖预构建的前置步骤
```JavaScript
// server/index.ts
const listen = httpServer.listen.bind(httpServer)
httpServer.listen = (async (port: number, ...args: any[]) => {
    try {
        await container.buildStart({})
        // 这里会进行依赖的预构建
        await runOptimize()
    } catch(e) {
        httpServer.emit('error', e)
        return
    }
    return listen(port, ...args)
}) as any
```

runOptimize
首先根据本次运行的入口，来扫描其中的依赖：
```JavaScript
let deps: Record<string, string>, missing: Record<string, string>
if (!newDeps) {
    ;({ deps, missing }) = await scanImports(config)
}
```

scanImports利用了Esbuild构建时提供的钩子去扫描文件中的依赖，收集到deps变量里，在扫描到入口文件中依赖的模块后，
```
{
    "lodash-es": "node_modules/lodash-es"
}
```
之后在根据分析出来的依赖，使用Esbuild把它们提前打包成单文件的bundle
```JavaScript
const esbuildService = await ensureService()
await esbuildService.build({
    entryPoints: Object.keys(flatIdDeps),
    bundle: true,
    format: 'esm',
    external: config.optimizeDeps?.exclude,
    logLevel: 'error',
    splitting: true,
    sourcemap: true,
    outdir: cacheDir,
    treeShaking: 'ignore-annotations',
    metafile:   esbuildMetaPath,
    define,
    plugins: [esbuildDepPlugin(flatIdDeps, flatIdToExports, config)]
})
```
在浏览器请求相关模块时，返回这个预构建好的模块。这样，当浏览器请求lodash-es中的debounce模块的时候，就狂野抱枕
只发生一次接口请求了。

在预构建这个步骤中，还会对CommonJS模块进行分析，方便后面需要统一处理成浏览器可以执行的ES Module

## 插件机制
兼容Rollup

参考资料：https://juejin.cn/post/6932367804108800007#heading-9
