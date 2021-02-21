# reactivity 实现

## reactive

- reactive
- shallowReactive
- readonly
- shallowReadonly

## effect

> 相当于 vue2.x 的 watcher

响应式数据收集对应的 effect，
Proxy 的 get 中 track()
Proxy 的 set 中 trigger()触发收集的 effect 执行，数组修改 length，修改下标时特殊处理；

proxy 中的

## ref

普通值 defineProperty
对象深的时：reactive(val)

### shallowRef

### toRef
