import { isObject } from '@vue/shared/src'
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers,
} from './baseHandler'

export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}
export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers)
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}

// 是不是仅读的，是不是深度，  new Proxy() 最核心的需要拦截 get和set
const reactiveMap = new WeakMap() // 存储的key只能是对象，会自动垃圾回收
const readonlyMap = new WeakMap()

export function createReactiveObject(target, isReadonly, baseHandlers) {
  // 如果目标不是对象，没法拦截，reactive（Proxy）这个api只能拦截对象类型
  if (!isObject(target)) {
    return target
  }
  // 如果某个对象已经被代理过了，就不要再次代理了；可能一个对象， 被深度代理，又被只读代理
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const exitProxy = proxyMap.get(target)
  if (exitProxy) {
    return exitProxy // 如果已经代理了，直接返回即可
  }

  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy) // 将要代理的对象，和对应代理的结果缓存起来

  return proxy
}
