// 该文件针对的是属性的操作，一系列的属性操作

import { patchAttr } from './modules/attr'
import { patchClass } from './modules/class'
import { patchEvent } from './modules/events'
import { patchStyle } from './modules/style'

export const patchProp = (el, key, prevValue, nextValue) => {
  switch (key) {
    case 'class':
      patchClass(el, nextValue)
      break
    case 'style':
      patchStyle(el, prevValue, nextValue)
      break
    default:
      // 如果不是事件，才是属性
      if (/^on[^a-z]/.test(key)) {
        // 事件的添加或删除
        patchEvent(el, key, nextValue)
      } else {
        // 属性操作
        patchAttr(el, key, nextValue)
      }
      break
  }
}
