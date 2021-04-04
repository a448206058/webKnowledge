/* @flow */

import { cached } from '../../shared/util'
import { parseFilters } from './filter-parser'

//{{0x0D - 0x0A}}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
// 匹配其中一个字符-.*+?^${}()|[]/\
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

// text 待解析的文本内容text
// delimiters 包裹变量的符号
// 将{{item}}:{{index}}转换为{expression: '_s(item'+":"+_s(index)', tokens: [{'@binding':'item'}, ':', {'@binding': 'index'}]}
export function parseText (
  text,
  delimiters
){
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  if (!tagRE.test(text)) {
    return
  }
  const tokens = []
  const rawTokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    // tag token
    const exp = parseFilters(match[1].trim())
    tokens.push(`_s(${exp})`)
    rawTokens.push({ '@binding': exp })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}
