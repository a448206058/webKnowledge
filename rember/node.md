### Nodejs模块机制
Node的模块实现
* 路径分析
    模块的引用会映射到一个js文件路径
    一是Node提供的模块，称为核心模块（内置模块），内置模块公开了一些常用的API给开发者，并且它们在Node进程开始的时候就预加载了。
    另一类是用户编写的模块，称为文件模块。如通过NPM安装的第三方模块（third-party modules）或本地模块（local modules），每个模块都会暴露一个公开的API。以便开发者可以导入

    核心模块是Node源码在编译过程中编译进了二进制执行文件。在Node启动时这些模块就被加载进内存中，所以核心模块引入时省去了文件定位和编译执行俩个步骤，并且在路径分析中优先判断，因此核心模块的加载速度是最快的。文件模块则是在运行时动态加载，速度比核心模块慢。

    1. 载入内置模块
    2. 载入文件模块
    3. 载入文件目录模块
    4. 载入node_modules里的模块
    5. 自动缓存已载入模块

* 文件定位
  1. 文件扩展名分析
    调用require()方法时若参数没有文件扩展名，Node会按.js、.json、.node的顺序
    调用fs模块阻塞式地判断文件是否存在
  2. 目录分析和包
    如果require绝对路径的文件，查找时不会去遍历每一个node_modules目录，其速度最快。
    
* 编译执行
  每个模块文件模块都是一个独享
  对于不同扩展名，其载入方法也有所不同：
  .js通过fs模块同步读取文件后编译执行
  .node这是C/C++编写的扩展文件，通过dlopen()方法加载最后编译生成的文件
  .json通过fs模块同步读取文件后，用JSON.parse()解析返回结果
  其他当做.js
  每一个编译成功的模块都会将其文件路径作为索引缓存在Module._cache对象上
  json文件的编译
  .json文件调用的方法如下：其实就是调用JSON.parse
  Module._extensions会被赋值给require()的extensions属性，所以可以用：console.log(require.extensions)；输出系统中已有的扩展加载方式。当然也可以自己增加一些特殊的加载：

  js模块的编译在编译的过程中，Node对获取的javascript文件内容进行了头尾包装，将文件内容包装在一个function钟：
  
  包装之后的代码会通过vm原生模块的runInThisContext()方法执行（具有明确上下文，不污染全局），返回一个具体的function对象，最后传参执行，执行后返回module.exports。

  * 核心模块编译
  核心模块分为C/C++编写和JavaScript编写的俩个部分，其中C/C++文件放在Node项目的src目录下，JavaScript文件放在lib目录下。

* 加入内存

### import 和 require
import 是ES6的模块规范，require是commonjs的模块规范
import是静态加载模块，require是动态加载
静态加载是代码在编译的时候已经执行了
动态加载是编译后再代码运行的时候再执行

### nodejs清除require缓存
```JavaScript
delete require.cache[require.resolve('./server.js')];
app = require('./server.js');
```

### require原理
模块的加载实质上就是，注入exports、require、module三个全局变量，然后执行模块的源码，然后将模块的exports变量的值输出。

Node定义了一个构造函数Module，所有的模块都是Module的实例。可以看到，当前模块（module.js）也是Module的一个实例。

每个模块实例都有一个require方法
```JavaScript
Module.prototype.require = function(path) {
  return Module._load(path, this);
}
```

require并不是全局性命令，而是每个模块提供的一个内部方法，也就是说，只有在模块内部才能使用require命令
```JavaScript
Module._load = function(request, parent, isMain) {
  
  // 计算绝对路径
  var filename = Module._resolveFilename(request, parent);

  // 第一步：如果有缓存，取出缓存
  var cachedModule = Module._cache[filename];
  if (cachedModule) {
    return cachedModule.exports;
  }

  // 第二步：是否为内置模块
  if (NativeModule.exists(filename)) {
    return NativeModule.require(filename);
  }

  // 第三步：生成模块实例，存入缓存
  var module = new Module(filename, parent);
  Module._cache[filename] = module;

  // 第四步：加载模块
  try {
    module.load(filename);
    hadException = false;
  } finally {
    if (hadException) {
      delete Module._cache[filename];
    }
  }

  // 第五步：输出模块的exports属性
  return module.exports;
}
```

Module._resolveFilename
```JavaScript
Module._resolveFilename = function(request, parent) {
  // 第一步：如果是内置模块，不含路径返回
  if (NativeModule.exists(request)) {
    return request;
  }

  // 第二步：确定所有可能的路径
  var resolvedModule = Module._resolveLookupPaths(request, parent);
  var id = resolvedModule[0];
  var paths = resolvedModule[1];

  // 第三步：确定哪一个路径为真
  var filename = Module._findPath(request, paths);
  if (!filename) {
    var err = new Error("Cannot find module'" + request + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  }
  return filename;
}
```

Module._findPath
```JavaScript
Module._findPath = function(request, paths) {
  // 列出所有可能的后缀名：.js，.json,.node
  var exts = Object.keys(Module._extensions);

  // 如果是绝对路径，就不再搜索
  if (request.charAt(0) === '/') {
    paths = [''];
  }

  // 是否有后缀的目录斜杠
  var trailingSlash = (request.slice(-1) === '/');

  // 第一步：如果当前路径已在缓存中，就直接返回缓存
  var cacheKey = JSON.stringify({request: request, paths: paths});
  if (Module._pathCache[cacheKey]) {
    return Module._pathCache[cacheKey];
  }

  // 第二步：依次遍历所有路径
  for (var i = 0, PL = paths.length; i < PL; i++) {
    var basePath = path.resolve(paths[i], request);
    var filename;

    if (!trailingSlash) {
      // 第三步：是否存在该模块文件
      filename = tryFile(basePath);

      if (!filename && !trailingSlash) {
        // 第四步：该模块文件加上后缀名，是否存在
        filename = tryExtensions(basePath, exts);
      }
    }

    // 第五步：目录中是否存在 package.json
    if (!filename) {
      filename = tryPackage(basePath, exts);
    }

    if (!filename) {
      // 第六步：是否存在目录名 + index + 后缀名
      filename = tryExtensions(path.resolve(basePath, 'index'), exts);
    }

    // 第七步：将找到的文件路径存入返回缓存，然后返回
    if (filenmae) {
      Module._pathCache[cacheKey] = filename;
      return filename;
    }
  }

  // 第八步：没有找到文件，返回false
  return false;
}
```

require.resolve 供外部调用，用于从模块名取到绝对路径
```JavaScript
require.resolve = function(request) {
  return Module._resolveFilename(request, self);
}

// 用法
require.resolve('a.js')
```

module.load
```JavaScript
Module.prototype.load = function(filename) {
  var extension = path.extname(filename) || '.js';
  if (!Module._extensions[extension]) extension = '.js';
  Module._extensions[extension](this, filename);
  this.loaded = true;
}


Module._extensions['.js'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  module._compile(stripBOM(content), filename);
}

Module._extensions['.json'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  try {
    module.exports = JSON.parse(stripBOM(content));
  } catch (err) {
    err.message = filename + ':' + err.message;
    throw err;
  }
}
```

module._compile 方法用于模块的编译
```JavaScript
Module.prototype._compile = function(content, filename) {
  var self = this;
  var args = [self.exports, require, self, filename, dirname];
  return compiledWrapper.apply(self.exports, args);
}
```

