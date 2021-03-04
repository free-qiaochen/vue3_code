import { hasChanged, isObject } from "@vue/shared/src"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOrTypes } from "./operators"
import { reactive } from "./reactive"

export function ref(value) { // value 可以是普通类型也可以是对象，但一般value是普通类型，对象使用reactive
  // 将普通类型变成一个对象（RefImpl类的实例）
  return createRef(value)
}

export function toRef(target,key){
  
}

const convert = (val) => (isObject(val) ? reactive(val) : val)
// beta版本之前的版本，ref就是个对象，由于对象不方便扩展改成了类
class RefImpl {
  public _value
  public __v_isRef
  constructor(public rawValue, public shallow) {
    this._value = shallow ? rawValue : convert(rawValue)
  }
  get value(){  // 类的属性访问器，取value属性时会代理到_value上
    track(this,TrackOpTypes.GET,'value')  // 收集依赖
    return this._value
  }
  set value(newValue){
    if (hasChanged(newValue,this.rawValue)) { // 值发生变化
      this.rawValue = newValue; // 新值会作为老值
      this._value = this.shallow?newValue:convert(newValue);
      trigger(this,TriggerOrTypes.SET,'value',newValue)
    }
  }
}

function createRef(rawValue,shallow=false){
  return new RefImpl(rawValue,shallow)
}


