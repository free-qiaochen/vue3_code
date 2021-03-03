// 实现 new Proxy(target, handler) 的handler

import { extend, hasChanged, hasOwn, isArray, isIntegerKey, isObject } from '@vue/shared/src'
import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOrTypes } from './operators'
import { reactive, readonly } from './reactive'

const get = createGetter()
const shallowGet = createGetter(false,true)
const readonlyGet= createGetter(true)
const shallowReadonlyGet = createGetter(true,true)
const set = createSetter()
const shallowSet = createSetter(true)

export const mutableHandlers = {
  get,
  set,
}
export const shallowReactiveHandlers = {
  get:shallowGet,
  set:shallowSet
}
let readonlyObj={
  set:(target,key)=>{
    console.warn(`set on key ${key} failed,beacuse readonly`)
  }
}

export const readonlyHandlers= extend({
  get:readonlyGet,
},readonlyObj)
export const shallowReadonlyHandlers = extend({
  get :shallowReadonlyGet
},readonlyObj)

// 是不是仅读的，仅读的属性set时会报异常
// 是不是深度的
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    console.log('获取get:', target, key, receiver)
    const res = Reflect.get(target, key, receiver) // target[key]
    if (!isReadonly) {
      // 收集依赖，等会数据变化后更新对应的视图
      console.log('执行effect时会取值，收集对应effect')
      track(target,TrackOpTypes.GET,key)
    }
    if (shallow) {
      return res
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

// 以前target[key] = value 方式设置值可能会失败 ， 并不会报异常 ，也没有返回值标识
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const oldValue = target[key] // 获取老的值
    let hadKey =
      isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver) //target[key] = value
    if (!hadKey) {
      // 新增
      console.log('新增')
      trigger(target,TriggerOrTypes.ADD,key,value)
    } else if (hasChanged(oldValue, value)) {
      // 修改
      console.log('修改')
      trigger(target,TriggerOrTypes.SET,key,value,oldValue)
    }
    return result
  }
}
