/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson (MPL-1.1 OR Apache-2.0 OR GPL-2.0-or-later)
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

// import { makeMap, no } from '../../shared/util'
// import { isNonPhrasingTag } from 'web/compiler/util'
// import { unicodeRegExp } from 'core/util/lang'

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * 创建一个map然后返回一个能检查传入的key是否在这个map中的函数
 */
//  export function makeMap (
//   str,
//   expectsLowerCase
// ) {
//   const map = Object.create(null)
//   const list = str.split(',')
//   for (let i = 0; i < list.length; i++) {
//     map[list[i]] = true
//   }
//   return expectsLowerCase
//     ? val => map[val.toLowerCase()]
//     : val => map[val]
// }

export function makeMap(
  str,
  expectsLowerCase
) {
  const map = new Map();
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map.set(list[i])
  }
  return expectsLowerCase
    ? val => map.has(val.toLowerCase())
    : val => map.has(val)
}

/**
 * Always return false.
 * 总是返回false
 */
export const no = (a, b, c) => false

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
// 是否是HTML5内包含的标签
export const isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
)

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 * 用于解析html标记、组件名称和属性路径的unicode字母
 */
 export const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/

// Regular Expressions for parsing tags and attributes
// 属性值的匹配
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

// 动态属性值(包含@、:、v-等Vue专有的匹配)
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/


// console.log('v-:[kk]'.match(dynamicArgAttribute))

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`

// 匹配</后面加上字母然后再接数字或字母
const startTagOpen = new RegExp(`^<${qnameCapture}`)

// 只匹配 空格/>或者空格>
const startTagClose = /^\s*(\/?)>/

// 匹配</后面加上字母加任意加>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

// 匹配<!DOCTYPE后面接任意字符串再接>
const doctype = /^<!DOCTYPE [^>]+>/i

// #7298: escape - to avoid being passed as HTML comment when inlined in page
// 转义-避免在页面内联时作为HTML注释传递
// 匹配<!--
const comment = /^<!\--/

// 匹配<![
const conditionalComment = /^<!\[/

// Special Elements (can contain anything)
// 可以包含大小写的
export const isPlainTextElement = makeMap('script,style,textarea', true)
const reCache = {}

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
}
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g

// #5992
// 只要传入的字符是pre,textarea  可以忽略大小写
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
// 如果是传入的tag是pre或者textarea，而且html第一个字符是\n换行，返回true
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

function decodeAttr (value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
  return value.replace(re, match => decodingMap[match])
}

export function parseHTML (html, options) {
  const stack = []
  const expectHTML = options.expectHTML
  const isUnaryTag = options.isUnaryTag || no
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no
  let index = 0
  let last, lastTag
  while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    // 确保我们没有像脚本/样式这样的纯文本内容元素
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      // 如果<符号存在且在第一位
      if (textEnd === 0) {
        // Comment:
        // 匹配<!--
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->')

          // 如果包含-->
          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3)
            }
            //跳到-->后面一位
            advance(commentEnd + 3)
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        // 如果匹配<![
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>')

          if (conditionalEnd >= 0) {
            // 继续往后移动俩位
            advance(conditionalEnd + 2)
            continue
          }
        }

        // Doctype:
        // 匹配<!DOCTYPE后面接任意字符串再接>
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          // 跳到<!DOCTYPE xx>后面
          advance(doctypeMatch[0].length)
          continue
        }

        // End tag:
        // 匹配</后面加上字母加任意加>
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          const curIndex = index
          // 跳到结束标签之后
          advance(endTagMatch[0].length)
          // 编译结束标签
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // Start tag:
        // 编译开始标签
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          handleStartTag(startTagMatch)
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1)
          }
          continue
        }
      }

      let text, rest, next
      if (textEnd >= 0) {
        rest = html.slice(textEnd)
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          // 在纯文本中将其视为文本
          next = rest.indexOf('<', 1)
          if (next < 0) break
          textEnd += next
          rest = html.slice(textEnd)
        }
        text = html.substring(0, textEnd)
      }

      if (textEnd < 0) {
        text = html
      }

      if (text) {
        advance(text.length)
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index)
      }
    } else {
      // 如果lastTag为script、style、textarea
      let endTagLength = 0
      const stackedTag = lastTag.toLowerCase()
      const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
      const rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298 <!--x-->
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1') // <!x>
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1)
        }
        if (options.chars) {
          options.chars(text)
        }
        return ''
      })
      index += html.length - rest.length
      html = rest
      //清理所有剩余的标签
      parseEndTag(stackedTag, index - endTagLength, index)
    }

    // html文本到最后
    if (html === last) {
      options.chars && options.chars(html)
      if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`, { start: index + html.length })
      }
      break
    }
  }

  // Clean up any remaining tags
  // 清理所有剩余的标签
  parseEndTag()

  // index是全局变量，传入n来进行跳，html进行删除
  function advance (n) {
    index += n
    html = html.substring(n)
  }

  function parseStartTag () {
    const start = html.match(startTagOpen)
    if (start) {
      // 记录匹配标记
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      // 跳到开始标记之后
      advance(start[0].length)
      let end, attr
      // 匹配开始标记且属性值或者动态属性值能匹配上
      // 把属性值存入match中并跳到所有匹配的最后
      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index
        advance(attr[0].length)
        attr.end = index
        match.attrs.push(attr)
      }
      // 如果开始闭合标签还存在，则跳到开始闭合标签之后
      if (end) {
        match.unarySlash = end[1]
        advance(end[0].length)
        match.end = index
        return match
      }
    }
  }

  // 处理开始标签
  function handleStartTag (match) {
    const tagName = match.tagName
    const unarySlash = match.unarySlash

    if (expectHTML) {
      // 如果最后标签是p 且开始标签是h5内的元素标签
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag)
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }

    // 一元判断
    const unary = isUnaryTag(tagName) || !!unarySlash

    const l = match.attrs.length
    const attrs = new Array(l)
    // 解析开始标签的属性名和属性值，转换为{name:'',value:''}
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      const value = args[3] || args[4] || args[5] || ''
      const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      }
      if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
        attrs[i].start = args.start + args[0].match(/^\s*/).length
        attrs[i].end = args.end
      }
    }
    // 推入stack中
    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end })
      lastTag = tagName
    }

    // 触发options.start方法
    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    // Find the closest opened tag of the same type
    // 查找同一类型的最近打开的标记
    if (tagName) {
      // 转化成小写
      lowerCasedTagName = tagName.toLowerCase()
      // 遍历stack 从后往前找出最近的闭合标签，赋值给pos
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      // 如果没有提供标签名称，清理
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      // 关闭所有打开的元素
      for (let i = stack.length - 1; i >= pos; i--) {
        if (process.env.NODE_ENV !== 'production' &&
          (i > pos || !tagName) &&
          options.warn
        ) {
          // 警告没有匹配的结束标签
          options.warn(
            `tag <${stack[i].tag}> has no matching end tag.`,
            { start: stack[i].start, end: stack[i].end }
          )
        }
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      // Remove the open elements from the stack
      // 从stack移除打开的标签
      stack.length = pos
      // lastTag等于末尾匹配的结束标签
      lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}
