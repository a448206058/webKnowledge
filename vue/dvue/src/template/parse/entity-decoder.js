/* @flow */

let decoder

// 创建div并插入元素
export default {
  decode (html) {
    decoder = decoder || document.createElement('div')
    decoder.innerHTML = html
    return decoder.textContent
  }
}
