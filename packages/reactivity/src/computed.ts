import { isFunction } from '@vue/shared/src'
import { effect, track, trigger } from './effect'
import { TrackOpTypes, TriggerOrTypes } from './operators'

// vue3和vue2的computed原理不一样 ？？
export function computed(getterOrOptions) {
  let getter
  let setter
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = () => {
      console.warn('computed value must be readonly,cannot set?')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter)
}

class ComputedRefImpl {
  public _dirty = true // 默认取值时不要用缓存,计算
  public _value
  public effect
  constructor(getter, public setter) {
    // ts中public默认会挂载到this上
    this.effect = effect(getter, {
      lazy: true, // 默认不执行
      scheduler: () => {
        // ???
        console.log('scheduler')
        if (!this._dirty) {
          this._dirty = true
          trigger(this, TriggerOrTypes.SET, 'value')
        }
      },
    })
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect() // 会将用户的返回值返回
      this._dirty = false
    }
    // 计算属性也要收集依赖
    track(this, TrackOpTypes.GET, 'value')
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}
