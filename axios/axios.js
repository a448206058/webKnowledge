/**
 * 参考文档：https://juejin.cn/post/6844903824583294984#heading-7
 *
 *  axios 源码解析
 *      Axios是什么？
 *          Axios是一个基于promise的HTTP库，可以用在浏览器和node.js中
 *
 *      Axios功能
 *          从浏览器中创建XMLHttpRequests
 *          从node.js创建http请求
 *          支持Promise API
 *          拦截请求和响应
 *          转换请求数据和响应数据
 *          取消请求
 *          自动转换JSON数据
 *          客户端支持防御XSRF
 *
 *     Axios使用
 *          执行GET请求
 */
            axios.get('')
                .then(function (response) {
                    console.log(response)
                })
 /**
  *         执行POST请求
  */
            axios.post('', {
              data: data
            })
            .then(function (response){
                console.log(response)
            })

/**
 *   源码解读：
 *          lib/axios.js
 */
 'use strict';

 var utils = require('./utils');
 var bind = require('./helers/bind');
 var Axios = require('./core/Axios');
 var mergeConfig = require('./core/mergeConfig');
 var defaults = require('./defaults');

 // 重点 createInstance 方法
 function createInstance(defaultConfig) {
     // 实例化Axios
     var context = new Axios(defaultConfig);
     // 自定义bind方法 返回一个函数 () => {Axios.prototype.request.apply(context, args)}
     var instance = bind(Axios.prototype.request, context);
     // Axios 源码的工具类
     utils.extend(instance, Axios.prototype, context);
     utils.extend(instance, context);
     return instance;
 }

 // 传入一个默认配置  defaults配置先不管，后面会有具体的细节
 var axios = createInstance(defaults);

 // 下面都是为axios实例化的对象增加不同的方法。
 axios.Axios = Axios;
 axios.create = function create(instanceConfig) {
     return createInstance(mergeConfig(axios.defaults, instanceConfig))
 };
 axios.Cancel = require('./cancel/Cancel');
 axios.CancelToken = require('./cancel/CancelToken');
 axios.isCancel = require('./cancel/isCancel');
 axios.all = function all(promises) {
     return Promise.all(promises);
 };
 axios.spread = require('./helpers/spread');
 module.exports = axios;
 module.exports.default = axios;

/**
 * lib/util.js 工具方法
 */
module.exports = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    deepMerge: deepMerge,
    extend: extend,
    trim: trim
}

// a, b, thisArg 参数都为一个对象
function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key){
        // 如果指定了thisArg那么绑定执行上下文到thisArg
        if(thisArg && typeof val === 'function') {
            a[key] = bind(val, thisArg);
        } else {
            a[key] = val;
        }
    });
    return a;
}

/**
 *  自定义forEach方法遍历基本数据，数组，对象。
 */
function forEach(obj, fn) {
    if (obj === null || typeof obj === 'undefined') {
        return;
    }
    if (typeof obj !== 'object') {
        obj = [obj];
    }
    if (isArray(obj)) {
        for (var i = 0, l = obj.length;i < l;i++){
            fn.call(null, obj[i], i, obj);
        }
    } else {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                fn.call(null, obj[key], key, obj);
            }
        }
    }
}

/**
 * merge 合并对象的属性，相同属性后面的替换前面的
 */
function merge(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
            result[key] = merge(result[key], val)
        } else {
            result[key] = val;
        }
    }

    for (var i = 0, l = arguments.length; i < l;i++){
        forEach(arguments[i], assignValue);
    }
    return result;
}

/**
 * bind -> lib/helpers/bind.js
 *  返回一个函数，并且传入的方法执行上下文绑定到thisArg上。
 */
 module.exports = function bind(fn, thisArg) {
     return function wrap() {
         var args = new Array(arguments.length);
         for (var i = 0; i < args.length; i++) {
             args[i] = arguments[i];
         }
         return fn.apply(thisArg, args)
     }
 }

/**
 *  createInstance函数返回了一个函数instance
 *      1.instance是一个函数Axios.prototype.request且执行上下文绑定到context。
 *      2.instance里面还有Axios.prototype上面的所有方法，并且这些方法的执行上下文也绑定到context。
 *      3.instance里面还有context上的方法。
 */

function createInstance(defaultConfig) {
     // 实例化 Axios
     var context = new Axios(defaultConfig);

     // 将Axios.prototype.request 的执行上下文绑定到context
     // bind 方法返回的是一个函数
     var instance = bind(Axios.prototype.request, context);

     // 将Axios.prototype 上的所有方法的执行上下文绑定到context, 并且继承给instance
     utils.extend(instance, Axios.prototype, context);

     // 将context继承给instance
     utils.extend(instance, context);

     return instance;
 }
 // 传入一个默认配置
var axios = createInstance(defaults);

/**
 * Axios 实例源码
 */
'use strict';
var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    }
}

// 核心方法 request
/**
 * 使用了Promise的链式调用，也使用到了中间件的思想
 */
Axios.prototype.request = function request(config) {
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
    } else {
        config = config || {};
    }

    // 合并配置
    config = mergeConfig(this.defaults, config);
    // 请求方式，没有默认为get
    config.method = config.method ? config.method.toLowerCase() : 'get';

    // 重点 这个就是拦截器的中间件
    var chain = [dispatchRequest, undefined];
    // 生成一个promise对象
    var promise = Promise.resolve(config);

    // 将请求前方法置入chain数组的前面 一次置入俩个  成功的，失败的
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected)
    })

    // 将请求后的方法置入chain数组的后面 一次置入俩个 成功的，失败的
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor){
        chain.push(interceptor.fulfilled, interceptor.rejected);
    })

    // chain = [请求拦截器的成功方法，请求拦截器的失败方法，dispatchRequest, undefined, 响应拦截器的成功方法， 响应拦截器的失败方法】。


    // 通过shift方法把第一个元素从其中删除，并返回第一个元素。
    while (chain.length) {
        /**
         *  promise.then(请求拦截器的成功方法，请求拦截器的失败方法）
         *      .then(dispatchRequest, undefined)
         *      .then(响应拦截器的成功方法， 响应拦截器的失败方法）
         */
        promise = promise.then(chain.shift(), chain.shift())
    }

    return promise;
}

Axios.prototype.getUri = function getUri(config) {
    config = mergeConfig(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};
// 这个就是给Axios.prototype 上面增加delete,get,head,options 方法
// 这样我们就可以使用 axios.get(), axios.post()等方法
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    Axios.prototype[method] = function(url, config) {
        // 都是调用了 this.request 方法
        return this.request(utils.merge(config || {}, {
            method: method,
            url: url
        }));
    };
});
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    Axios.prototype[method] = function(url, data, config) {
        return this.request(utils.merge(config || {}, {
            method: method,
            url: url,
            data: data
        }))
    };
});

module.exports = Axios;

/**
 * InterceptorManager 拦截器源码
 *      lib/core/InterceptorManage.js
 */

'use strict';
var utils = require('../../utils');

function InterceptorManage() {
    // 存放方法的数组
    this.handlers = [];
}

// 通过use方法来添加拦截方法
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
    });
    return this.handlers.length - 1
};
// 通过 eject 方法来删除拦截方法
InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
        this.handlers[id] = null;
    }
};
// 添加一个forEach 方法，这就是上述说的forEach
InterceptorManager.prototype.forEach = function forEach(fn) {
    // 里面还是依旧使用了utils的forEach
    // 明白他们干了什么就可以
    utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
            fn(h);
        }
    });
};

module.exports = InterceptorManager;

/**
 * dispatchRequest 源码
 *      lib/core/dispatchRequest.js
 */

'use strict';
var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');
// 请求取消时候的方法
function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
}

module.exports = function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    // 请求没有取消 执行下面的请求
    if (config.baseURL && !isAbsoluteURL(config.url)) {
        config.url = combineURLs(config.baseURL, config.url);
    }
    config.headers = config.headers || {};
    // 转换数据
    config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
    );
    // 合并配置
    config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers || {}
    );
    utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
            delete config.headers[method];
        }
    );
    // 这里是重点，获取请求的方式
    var adapter = config.adapter || defaults.adapter;
    return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);
        // 拦截了请求的数据，转换data
        response.data = transformData(
            response.data,
            response.headers,
            config.transformResponse
        );
        return response;
    }, function onAdapterRejection(reason) {
        // 失败处理
        if (!isCancel(reason)) {
            throwIfCancellationRequested(config);

            // Transform response data
            if (reason && reason.response) {
                reason.response.data = transformData(
                    reason.response.data,
                    reason.response.headers,
                    config.transformResponse
                );
            }
        }
        return Promise.reject(reason);
    })
}

/**
 * var axios = createInstance(defaults)
 *      lib/defaults.js
 */
'use strict';

var utils = requires('./utils');
var normalizaHeaderName = require('./helpers/normalizaHeaderName');

var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
    }
}

// getDefaultAdapter 方法是来获取请求的方式
function getDefaultAdapter() {
    var adapter;
    // process 是node环境的全局变量
    if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // 如果是node环境那么久通过node http的请求方法
        adapter = require('./adapters/http');
    } else if (typeof XMLHTTPRequest !== 'undefined') {
        // 如果是浏览器环境 有XMLHttpRequest的就用XMLHttpRequest
        adapter = require('./adapters/xhr');
    }
    return adapter;
}

var defaults = {
    // adapter 就是请求的方法
    adapter: getDefaultAdapter(),
    // 下面一些请求头，转换数据，请求详情的数据
    // 这也就是为什么我们可以直接拿到请求的数据是一个对象，如果用ajax我们拿到的都是json格式的字符串
    // 然后每次都通过 JSON.stringify(data)来处理结果
    transformRequest: [function transformRequest(data, headers) {
        normalizaHeaderName(headers, 'Accept');
        normalizaHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
            utils.isArrayBuffer(data) ||
            utils.isBuffer(data) ||
            utils.isStream(data) ||
            utils.isFile(data) ||
            utils.isBlob(data)
        ) {
            return data;
        }
        if (utils.isArrayBufferView(data)) {
            return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
            setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
            return data.toString();
        }
        if (utils.isObject(data)) {
            setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
            return JSON.stringify(data);
        }
        return data;
    }],

    transformResponse: [function transformResponse(data) {
        /* eslint no-param-reassign: 0 */
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch(e) {
                /* Ignore */
            }
        }
        return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,

    validateStatus: function validateStatus(status) {
        return status >= 200 & status < 300;
    }
};

defaults.headers = {
    common: {
        'Accept': 'application/json, text/plain, */*'
    }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function nforEachMethodWithData(method) {
   defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;
