/* @flow */

// import { warn } from 'core/util/index'

export default function on (el, dir) {
  if (process.env.NODE_ENV !== 'production' && dir.modifiers) {
    warn(`v-on without argument does not support modifiers.`)
  }
  el.wrapListeners = (code) => `_g(${code},${dir.value})`
}


let warn = (msg, vm) => {
  // const trace = vm ? generateComponentTrace(vm) : ''

  // if (config.warnHandler) {
  //   config.warnHandler.call(null, msg, vm, trace)
  // } else if (hasConsole && (!config.silent)) {
  //   console.error(`[Vue warn]: ${msg}${trace}`)
  // }
  console.error(`[Vue warn]: ${msg}${trace}`)
}
