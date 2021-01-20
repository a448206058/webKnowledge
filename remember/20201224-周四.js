/**
 * Convert an Array-like object to a real Array.
 */
/**
 * 将类似数组对象转换为一个真实的数组
 */
function toArray(list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while(i--){
        ret[i] = list[i + start];
    }
    return ret;
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
/**
 * 检查俩个值是否大致相等
 * 如果他们是普通的对象，他们是否有相同的模型？
 */
function looseEqual (a, b) {
    if (a === b) {return true}
    var isObjectA = isObject(a);
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB){
        try {
            var isArrayA = Array.isArray(a);
            var isArrayB = Array.isArray(b);
            if (isArrayA && isArrayB) {
                return a.length === b.length && a.every(function(e, i){
                    return looseEqual(e, b[i]);
                })
            } else if(a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime()
            } else if (!isArrayA && !isArrayB){
                var keysA = Object.keys(a);
                var keysB = Object.keys(b);
                return keysA.length === keysB.length && keysA.every(function(key){
                    return looseEqual(a[key], b[key])
                })
            } else {
                /* istanbul ignore next */
                return false;
            }
        } catch (e) {
            /* istanbul ignore next */
            return false;
        }
    } else if (!isObjectA && !isObjectB){
        return String(a) === String(b);
    } else {
        return false;
    }
}

Object.defineProperty
