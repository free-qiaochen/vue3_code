// createVNode 创建虚拟节点

import { isArray, isObject, isString, ShapeFlags } from '@vue/shared/src'

export function isVnode(vnode) {
  return vnode.__v_isVnode
}

export const createVNode = (type, props, children = null) => {
  // 可以根据type来区分是组件还是普通元素，

  // 给虚拟节点加一个类型
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0

  const vnode = {
    // 虚拟节点：一个对象来描述对应的内容，有跨平台的能力
    __v_isVnode: true, // 标识是一个vnode节点
    type, // 目前type是rootComponent,
    props,
    children,
    component: null, // 存放组件对应的实例
    el: null, // 虚拟节点对应的真实节点
    key: props && props.key, // diff算法会用到key
    shapeFlag, // 判断出当前自己的类型 (和 儿子的类型 ,在normalizeChildren处理)（借助位运算）
  }
  normalizeChildren(vnode, children) // 根据子节点计算孩子类型
  return vnode
}

function normalizeChildren(vnode, children) {
  let type = 0
  if (children == null) {
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN  // 数组
  } else {
    type = ShapeFlags.TEXT_CHILDREN // 文本
  }
  vnode.shapeFlag |= type // 相当于交集？
}

export const Text = Symbol('Text')

export function normalizeVNode(child){
  if (isObject(child)) {
    return child
  }
  return createVNode(Text,null,String(child))
}