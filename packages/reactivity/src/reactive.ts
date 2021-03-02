import { mutableHandlers } from "./baseHandler"

export function reactive(target){
  return createReactiveObject(target,false,mutableHandlers)
}
export function shallowResctive(target){

}

export function readonly(target){

}

export function shallowReadonly(target){

}

export function createReactiveObject(target,isReadonly,baseHandlers){

  const proxy = new Proxy(target,baseHandlers)
  
  return proxy
}