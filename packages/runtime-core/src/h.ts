// 1.  只有两个参数  类型 + 孩子  / 类型 + 属性
// 2.  三个参数 最后一个不是数组
// 3.  超过三个 多个参数

import { isArray, isObject } from '@vue/shared/src'
import { createVNode, isVnode } from './vnode'

// h函数主要是调用createVNode,这里要适应h函数传递各种参数的情况
export function h(type, propsOrChildren, children) {
  const l = arguments.length
  if (l == 2) {
    // 类型+属性、类型+孩子
    // 如果propsOrChildren不是数组，???
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }
      return createVNode(type, propsOrChildren)
    } else {
      // 第二个参数不是对象，那一定是children
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2)
    } else if (l == 3 && isVnode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}
