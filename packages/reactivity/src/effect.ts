import { isArray, isIntegerKey } from '@vue/shared/src'
import { TriggerOrTypes } from './operators'

// effect 类似vue2的watcher
export function effect(fn, options: any = {}) {
  // 我需要让这个effect变成响应的effect，可以做到数据变化重新执行
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    // 默认的effect会先执行
    effect() // 响应式的effect默认会先执行
  }
  return effect
}

let uid = 0
let activeEffect // 存储当前的effect
const effectStack = []
function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      // 保证effect没有加入到effectStack中过
      try {
        console.log('effect调用')
        effectStack.push(effect)
        activeEffect = effect
        return fn() // 函数执行时会取值，会执行get方法
      } catch (error) {
        console.log(error)
      } finally {
        console.log('finally')
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  effect.id = uid++ // 制作一个effect标识，用于区分effect
  effect._isEffect = true // 标识这个是响应式effect
  effect.raw = fn // 保留efect对应的原函数（传入的）
  effect.options = options //在effect上保存用户的属性
  return effect
}

// 依赖收集
// 让某个对象中的某个属性，收集当前它对应的effect函数
const targetMap = new WeakMap()
export function track(target, type, key) {
  // activeEffect 是当前正在运行的effect，
  if (activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // WeakMap结构：{target：Map{key:Set[effect]}}
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set())) // Map 结构key:Set[effect]
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect) // Set 结构存储effect
  }
}

// 数据变化，找属性对应的effect让其执行（）
export function trigger(target, type, key?, newValue?, oldValue?) {
  // 如果这个属性没有收集过effect，那就不需要做任何操作
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const effects = new Set() // 这里对effect去重
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect) => effects.add(effect))
    }
  }
  // 我要将所有的要执行的effect，全部存到一个新的集合中，最终一起执行
  // 1.看修改的是不是数组长度，因为改长度影响比较大
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, mkey) => {
      // ???
      if (mkey == 'length' || mkey > newValue) {
        add(dep)
      }
    })
  } else {
    // 可能是对象
    if (key !== undefined) {
      add(depsMap.get(key)) // 如果是新增
    }
    // 如果修改数组中的某一个索引，怎么办？
    switch (type) {
      case TriggerOrTypes.ADD:
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get('length'))
        }
    }
  }
  // 上边分条件汇总已收集的effects
  // effects.forEach((effect: any) => effect())
  // computed的实现修改effect调用
  effects.forEach((effect: any) => {
    console.log('effects call')
    if (effect.options.scheduler) {
      // effect.options.scheduler(effect);
      effect.options.scheduler()
    } else {
      effect()
    }
  })
}
