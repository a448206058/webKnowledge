/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
/**
 * 将一个输入值变为一个数字以进行持久性。
 * 如果转换失败，则返回原始字符串类型
 *
 * 理解：isNaN
 * The isNaN() function determines whether a value is NaN or not.Note, coercion inside the
 * isNaN function has interesting rules;you may alternatively want to use Number.isNaN(),
 * as defined in ECMASript 2015.
 *
 * parseFloat
 * The parseFloat() function parses an argument(converting it to a string first if needed) and returns a float point number.
 * parseFloat()函数的作用是分析一个参数（如果需要，首先将其转换为字符串）并返回一个浮点数
 *
 * 函数的作用是：确定一个值是否为NaN。注意，isNaN函数中的强制有一些有趣的规则；你也可以选择使用ECMAScript 2015中定义的Number.isNaN()方法
 * NaN属性是代表非数字值的特殊值。
 */
function toNumber (val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n;
}

/**
 * Make a map and return a function for checking if a key
 * is in that map
 */
/**
 *
 * 生成一个map并返回一个函数用于检查这个key在这个map中
 *
 * 理解：Object.create toLowerCase
 */
function makeMap(
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(",");
  for (var i = 0; i < list.length;i++){
    map[list[i]] = true;
  }
  return expectsLowerCase
  ? function (val) { return map[val.toLowerCase()]; }
  : function (val) { return map[val]; }
}
