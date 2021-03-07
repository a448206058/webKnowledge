// configurable state
export let warn
let delimiters
let transforms
let preTransforms
let postTransforms
let platformIsPreTag
let platformMustUseProp
let platformGetTagNamespace
let maybeComponent

export const unicodeRegExp =
	/a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute =
	/^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

const no = (a, b, c) => false

export function parse(
	template,
	options
) {
	// 从options中获取方法和配置
	getFnsAndConfigFromOptions(options)

	parseHTML(template, {
		// options ...
		start(tag, attrs, unary) {
			let element = createASTElement(tag, attrs)
			processElement(element)
			treeManagement()
		},

		end() {
			treeManagement()
			closeElement()
		},

		chars(text) {
			handleText()
			createChildrenASTOfText()
		},
		comment(text) {
			createChildrenASTOfComment()
		}
	})
	return astRootElement
}

function getFnsAndConfigFromOptions(options) {
	warn = options.warn

	platformIsPreTag = options.isPreTag || no
	platformMustUseProp = options.mustUseProp || no
	platformGetTagNamespace = options.getTagNamespace || no

	transforms = pluckModuleFunction(options.modules, 'transformNode')
	preTransforms = pluckModuleFunction(options.modules, 'preTransformNode')
	postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')

	delimiters = options.delimiters
}

export function pluckModuleFunction(
	modules,
	key
) {
	return modules ?
		modules.map(m => m[key]).filter(_ => _) : []
}

export function parseHTML(html, options) {
	const stack = []
	let lastTag
	let index = 0
	const expectHTML = options.expectHTML
	const isUnaryTag = options.isUnaryTag || no
	while (html) {
		if (!lastTag || !isPlainTextElement(lastTag)) {
			let textEnd = html.indexOf('<')
			if (textEnd === 0) {
				if (comment.test(html)) {
					const commentEnd = html.indexOf('-->')

					if (commentEnd >= 0) {
						if (options.shouldKeepComment) {
							options.comment(html.substring(4, commentEnd))
						}
						advance(commentEnd + 3)
						continue
					}
				}

				if (conditionalComment.test(html)) {
					const conditionalEnd = html.indexOf(']>')

					if (conditionalEnd >= 0) {
						advance(conditionalEnd + 2)
						continue
					}
				}

				// Doctype:
				const doctypeMatch = html.match(doctype)
				if (doctypeMatch) {
					advance(doctypeMatch[0].length)
					continue
				}
				// End tag:
				const endTagMatch = html.match(endTag)
				if (endTagMatch) {
					const curIndex = index
					advance(endTagMatch[0].length)
					parseEndTag(endTagMatch[1], curIndex, index)
					continue
				}

				// Start tag:
				const startTagMatch = parseStartTag()
				if (startTagMatch) {
					handleStartTag(startTagMatch)
					if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
						advance(1)
					}
					continue
				}
			}
			handleText()
			advance(textLength)
		} else {
			handlePlainTextElement()
			parseEndTag()
		}
	}

	function parseStartTag() {
		const start = html.match(startTagOpen)
		if (start) {
			const match = {
				tagName: start[1],
				attrs: [],
				start: index
			}
			advance(start[0].length)
			let end, attr
			while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
				attr.start = index
				advance(attr[0].length)
				attr.end = index
				match.attrs.push(attr)
			}
			if (end) {
				match.unarySlash = end[1]
				advance(end[0].length)
				match.end = index
				return match
			}
		}
	}

	function advance(n) {
		index += n
		html = html.substring(n)
	}

	function handleStartTag(match) {
		const tagName = match.tagName
		const unarySlash = match.unarySlash

		if (expectHTML) {
			if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
				parseEndTag(lastTag)
			}
			if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
				parseEndTag(tagName)
			}
		}

		const unary = isUnaryTag(tagName) || !!unarySlash

		const l = match.attrs.length
		const attrs = new Array(l)
		for (let i = 0; i < l; i++) {
			const args = match.attrs[i]
			const value = args[3] || args[4] || args[5] || ''
			const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href' ?
				options.shouldDecodeNewlinesForHref :
				options.shouldDecodeNewlines
			attrs[i] = {
				name: args[1],
				value: decodeAttr(value, shouldDecodeNewlines)
			}
			if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
				attrs[i].start = args.start + args[0].match(/^\s*/).length
				attrs[i].end = args.end
			}
		}

		if (!unary) {
			stack.push({
				tag: tagName,
				lowerCasedTag: tagName.toLowerCase(),
				attrs: attrs,
				start: match.start,
				end: match.end
			})
			lastTag = tagName
		}

		if (options.start) {
			options.start(tagName, attrs, unary, match.start, match.end)
		}
	}

}

// 通过createASTElement方法创建一个AST元素，每一个AST元素就是一个普通的JavaScript对象
export function createASTElement(
	tag,
	attrs,
	parent
){
	return {
		// AST元素类型
		type: 1,
		// 标签名
		tag,
		// 属性列表
		attrsList: attrs,
		// 属性印社表
		attrsMap: makeAttrsMap(attrs),
		// 父的AST元素
		parent,
		// 子AST元素集合
		children: []
	}
}

 function makeAttrsMap (attrs) {
    var map = {};
    for (var i = 0, l = attrs.length; i < l; i++) {
      if (
        
        map[attrs[i].name] && !isIE && !isEdge
      ) {
        warn$1('duplicate attribute: ' + attrs[i].name, attrs[i]);
      }
      map[attrs[i].name] = attrs[i].value;
    }
    return map
  }
  
function processElement (
    element,
    options
  ) {
    processKey(element);

    // determine whether this is a plain element after
    // removing structural attributes
    element.plain = (
      !element.key &&
      !element.scopedSlots &&
      !element.attrsList.length
    );

    processRef(element);
    processSlotContent(element);
    processSlotOutlet(element);
    processComponent(element);
    for (var i = 0; i < transforms.length; i++) {
      element = transforms[i](element, options) || element;
    }
    processAttrs(element);
    return element
  }
  
 function processKey (el) {
   const exp = getBindingAttr(el, 'key')
   if (exp) {
     if (process.env.NODE_ENV !== 'production') {
       if (el.tag === 'template') {
         warn(
           `<template> cannot be keyed. Place the key on real elements instead.`,
           getRawBindingAttr(el, 'key')
         )
       }
       if (el.for) {
         const iterator = el.iterator2 || el.iterator1
         const parent = el.parent
         if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
           warn(
             `Do not use v-for index as key on <transition-group> children, ` +
             `this is the same as not using keys.`,
             getRawBindingAttr(el, 'key'),
             true /* tip */
           )
         }
       }
     }
     el.key = exp
   }
 }
 
 export function getBindingAttr (
   el,
   name,
   getStatic
 ) {
   const dynamicValue =
     getAndRemoveAttr(el, ':' + name) ||
     getAndRemoveAttr(el, 'v-bind:' + name)
   if (dynamicValue != null) {
     return parseFilters(dynamicValue)
   } else if (getStatic !== false) {
     const staticValue = getAndRemoveAttr(el, name)
     if (staticValue != null) {
       return JSON.stringify(staticValue)
     }
   }
 }
 

export function getAndRemoveAttr (
  el,
  name,
  removeFromMap
){
  let val
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1)
        break
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name]
  }
  return val
}

function processRef (el) {
  const ref = getBindingAttr(el, 'ref')
  if (ref) {
    el.ref = ref
    el.refInFor = checkInFor(el)
  }
}

function processSlotContent (el) {
  let slotScope
  if (el.tag === 'template') {
    slotScope = getAndRemoveAttr(el, 'scope')
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && slotScope) {
      warn(
        `the "scope" attribute for scoped slots have been deprecated and ` +
        `replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
        `can also be used on plain elements in addition to <template> to ` +
        `denote scoped slots.`,
        el.rawAttrsMap['scope'],
        true
      )
    }
    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
  } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && el.attrsMap['v-for']) {
      warn(
        `Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
        `(v-for takes higher priority). Use a wrapper <template> for the ` +
        `scoped slot to make it clearer.`,
        el.rawAttrsMap['slot-scope'],
        true
      )
    }
    el.slotScope = slotScope
  }

  // slot="xxx"
  const slotTarget = getBindingAttr(el, 'slot')
  if (slotTarget) {
    el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
    el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot'])
    // preserve slot as an attribute for native shadow DOM compat
    // only for non-scoped slots.
    if (el.tag !== 'template' && !el.slotScope) {
      addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'))
    }
  }

  // 2.6 v-slot syntax
  if (process.env.NEW_SLOT_SYNTAX) {
    if (el.tag === 'template') {
      // v-slot on <template>
      const slotBinding = getAndRemoveAttrByRegex(el, slotRE)
      if (slotBinding) {
        if (process.env.NODE_ENV !== 'production') {
          if (el.slotTarget || el.slotScope) {
            warn(
              `Unexpected mixed usage of different slot syntaxes.`,
              el
            )
          }
          if (el.parent && !maybeComponent(el.parent)) {
            warn(
              `<template v-slot> can only appear at the root level inside ` +
              `the receiving component`,
              el
            )
          }
        }
        const { name, dynamic } = getSlotName(slotBinding)
        el.slotTarget = name
        el.slotTargetDynamic = dynamic
        el.slotScope = slotBinding.value || emptySlotScopeToken // force it into a scoped slot for perf
      }
    } else {
      // v-slot on component, denotes default slot
      const slotBinding = getAndRemoveAttrByRegex(el, slotRE)
      if (slotBinding) {
        if (process.env.NODE_ENV !== 'production') {
          if (!maybeComponent(el)) {
            warn(
              `v-slot can only be used on components or <template>.`,
              slotBinding
            )
          }
          if (el.slotScope || el.slotTarget) {
            warn(
              `Unexpected mixed usage of different slot syntaxes.`,
              el
            )
          }
          if (el.scopedSlots) {
            warn(
              `To avoid scope ambiguity, the default slot should also use ` +
              `<template> syntax when there are other named slots.`,
              slotBinding
            )
          }
        }
        // add the component's children to its default slot
        const slots = el.scopedSlots || (el.scopedSlots = {})
        const { name, dynamic } = getSlotName(slotBinding)
        const slotContainer = slots[name] = createASTElement('template', [], el)
        slotContainer.slotTarget = name
        slotContainer.slotTargetDynamic = dynamic
        slotContainer.children = el.children.filter((c) => {
          if (!c.slotScope) {
            c.parent = slotContainer
            return true
          }
        })
        slotContainer.slotScope = slotBinding.value || emptySlotScopeToken
        // remove children as they are returned from scopedSlots now
        el.children = []
        // mark el non-plain so data gets generated
        el.plain = false
      }
    }
  }
}

// handle <slot/> outlets
function processSlotOutlet (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
    if (process.env.NODE_ENV !== 'production' && el.key) {
      warn(
        `\`key\` does not work on <slot> because slots are abstract outlets ` +
        `and can possibly expand into multiple elements. ` +
        `Use the key on a wrapping element instead.`,
        getRawBindingAttr(el, 'key')
      )
    }
  }
}

function processComponent (el) {
  let binding
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true
  }
}

function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, rawName, value, modifiers, syncGen, isDynamic
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name
    value = list[i].value
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true
      // modifiers
      modifiers = parseModifiers(name.replace(dirRE, ''))
      // support .foo shorthand syntax for the .prop modifier
      if (process.env.VBIND_PROP_SHORTHAND && propBindRE.test(name)) {
        (modifiers || (modifiers = {})).prop = true
        name = `.` + name.slice(1).replace(modifierRE, '')
      } else if (modifiers) {
        name = name.replace(modifierRE, '')
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '')
        value = parseFilters(value)
        isDynamic = dynamicArgRE.test(name)
        if (isDynamic) {
          name = name.slice(1, -1)
        }
        if (
          process.env.NODE_ENV !== 'production' &&
          value.trim().length === 0
        ) {
          warn(
            `The value for a v-bind expression cannot be empty. Found in "v-bind:${name}"`
          )
        }
        if (modifiers) {
          if (modifiers.prop && !isDynamic) {
            name = camelize(name)
            if (name === 'innerHtml') name = 'innerHTML'
          }
          if (modifiers.camel && !isDynamic) {
            name = camelize(name)
          }
          if (modifiers.sync) {
            syncGen = genAssignmentCode(value, `$event`)
            if (!isDynamic) {
              addHandler(
                el,
                `update:${camelize(name)}`,
                syncGen,
                null,
                false,
                warn,
                list[i]
              )
              if (hyphenate(name) !== camelize(name)) {
                addHandler(
                  el,
                  `update:${hyphenate(name)}`,
                  syncGen,
                  null,
                  false,
                  warn,
                  list[i]
                )
              }
            } else {
              // handler w/ dynamic event name
              addHandler(
                el,
                `"update:"+(${name})`,
                syncGen,
                null,
                false,
                warn,
                list[i],
                true // dynamic
              )
            }
          }
        }
        if ((modifiers && modifiers.prop) || (
          !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
        )) {
          addProp(el, name, value, list[i], isDynamic)
        } else {
          addAttr(el, name, value, list[i], isDynamic)
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        isDynamic = dynamicArgRE.test(name)
        if (isDynamic) {
          name = name.slice(1, -1)
        }
        addHandler(el, name, value, modifiers, false, warn, list[i], isDynamic)
      } else { // normal directives
        name = name.replace(dirRE, '')
        // parse arg
        const argMatch = name.match(argRE)
        let arg = argMatch && argMatch[1]
        isDynamic = false
        if (arg) {
          name = name.slice(0, -(arg.length + 1))
          if (dynamicArgRE.test(arg)) {
            arg = arg.slice(1, -1)
            isDynamic = true
          }
        }
        addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i])
        if (process.env.NODE_ENV !== 'production' && name === 'model') {
          checkForAliasModel(el, value)
        }
      }
    } else {
      // literal attribute
      if (process.env.NODE_ENV !== 'production') {
        const res = parseText(value, delimiters)
        if (res) {
          warn(
            `${name}="${value}": ` +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.',
            list[i]
          )
        }
      }
      addAttr(el, name, JSON.stringify(value), list[i])
      // #6887 firefox doesn't update muted state if set via attribute
      // even immediately after element creation
      if (!el.component &&
          name === 'muted' &&
          platformMustUseProp(el.tag, el.attrsMap.type, name)) {
        addProp(el, name, 'true', list[i])
      }
    }
  }
}