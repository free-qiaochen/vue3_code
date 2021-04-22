# vue3.x 上课流程

3028213607

## Vue3 和 vue2 的重大更新，区别？

## 源码采用 monorepo（yarn 的 workspace）管理项目，

一个仓库中管理 多个包（有自己 package.json，可以独立发包（可以独立仓库的））

## Vue3 项目结构

## 自己模仿写源码

1. 目录，初始化

```sh
mkdir -p zf-vue3
yarn init -y
# ts 初始化
npx tsc --init
```

```json
// package.json 添加workspaces，实现monorepo管理多个包
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

2. 安装依赖

```sh
yarn add typescript rollup rollup-plugin-typescript2 @rollup/plugin-node-resolve @rollup/plugin-json execa -D --??
# 注意以上执行有packages目录时可能报错，添加对应参数即可安装依赖在根目录；
```

目录结构配置

```
C:.
│ package.json # 配置运行命令
│ rollup.config.js # rollup 配置文件
│ tsconfig.json # ts 配置文件 更改为 esnext
│ yarn.lock
│
├─packages # N 个 repo
│ └─reactivity
│ │ package.json
│ └─src
│ index.ts
│
└─scripts # 打包命令
    build.js
```

3. 新建 packages 目录，放置各个包源码

yarn install 会建立软链

4. rollup 打包配置

### 构建环境搭建

> #1.对 packages 下 多个模块进行打包
> scripts/build.js

```js
const fs = require('fs')
const execa = require('execa')
// 过滤packages目录下所有模块
const targets = fs.readdirSync('packages').filter((f) => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false
  }
  return true
})
// 开始并行打包
runParallel(targets, build)
async function runParallel(source, iteratorFn) {
  const ret = []
  for (const item of source) {
    const p = iteratorFn(item)
    ret.push(p)
  }
  return Promise.all(ret)
}
async function build(target) {
  await execa('rollup', ['-c', '--environment', `TARGET:${target}`], { stdio: 'inherit' })
}
```

公用的 rrollup 配置在 rollup.config.js

> 开发环境打包某一个包模块在 scripts/dev.js

5. 开始撸代码：写响应式部分 reactivity （详见 reactivity 包模块）

- reactive

- effect：
  effect 中的所有属性都会收集 effect 函数

# 20210224 开课 es6 的一些 api

symbol： 可以元编程
Reflect
set map

## 利用 Set 结构求数组的交集，并集，差集

JSON.stringfy 实现深拷贝还是有一些地方值得注意，总结下来主要有这几点：

拷贝的对象的值中如果有函数、undefined、symbol 这几种类型，经过 JSON.stringify 序列化之后的字符串中这个键值对会消失；

拷贝 Date 引用类型会变成字符串；

无法拷贝不可枚举的属性；

无法拷贝对象的原型链；

拷贝 RegExp 引用类型会变成空对象；

对象中含有 NaN、Infinity 以及 -Infinity，JSON 序列化的结果会变成 null；

无法拷贝对象的循环应用，即对象成环 (obj[key] = obj)

## question??

- vnode subtree?

## 响应式部分 api

> v3 响应式原理梳理：

- 响应式 api 的实现
- createReactiveObject 实现
- effect 实现
- track 依赖收集 (effect中render执行时触发get)
- trigger 触发更新
- 响应式 Api：Ref 实现（reactive 不能代理普通类型，故使用 ref 响应式处理普通值）
- 实现 computed

1. 响应式 api 的实现

```js
// 使用：
const { reactive, shallowReactive, readonly, shallowReadonly } = VueReactivity
let obj = { name: 'zf', age: { n: 11 } }
const state = reactive(obj)
const state = shallowReactive(obj)
const state = readonly(obj)
const state = shallowReadonly(obj)
// 针对不同的API创建不同的响应式对象，它们都走createReactiveObject()函数，但是传递不同的xxxHandlers()拦截函数；

export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}
export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}
// ...等等
/**
 *
 * @param target 拦截的目标
 * @param isReadonly 是不是仅读属性
 * @param baseHandlers 对应的拦截函数
 */
function createReactiveObject(target, isReadonly, baseHandlers) {}
```

2. createReactiveObject 实现
   > Vue3 中采用 proxy 实现数据代理, 核心就是拦截 get 方法和 set 方法，当获取值时收集 effect 函数，当修改值时触发对应的 effect 重新执行

```js
import { isObject } from '@vue/shared'
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
function createReactiveObject(target, isReadonly, baseHandlers) {
  // 1.如果不是对象直接返回
  if (!isObject(target)) {
    return target
  }
  const proxyMap = isReadonly ? readonlyMap : reactiveMap // 获取缓存对象
  const existingProxy = proxyMap.get(target)
  // 2.代理过直接返回即可
  if (existingProxy) {
    return existingProxy
  }
  // 3.代理的核心
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy) // 缓存代理过的对象
  // 4.返回代理对象
  return proxy
}
// baseHandlers实现（mutableHandlers）
export const mutableHandlers = {
  get,
  set,
}
const get = createGetter()
const set = createSetter()
/**
 * @param isReadonly 是不是仅读
 * @param shallow 是不是浅响应
 */
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    // 取值：res = target[key]
    if (!isReadonly) {
      // 如果是仅读的无需收集依赖
      // effect函数执行时，进行取值操作，让属性记住对应的effect函数
      console.log('依赖收集')
      track(target, TrackOpTypes.GET, key)
    }
    if (shallow) {
      // 浅无需返回代理
      return res
    }
    if (isObject(res)) {
      // 取值时，值是对象或数组就递归代理
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    // 。。。
    return result
  }
}
```

3. effect 实现
   > 响应式 effect 实现，effect 作用类似 vue2 中的 watcher

```js
export function effect(fn, options: any = {}) {
  // 创建响应式effect
  const effect = createReactiveEffect(fn, options)
  // 默认会让effect先执行一次
  if (!options.lazy) {
    effect()
  }
  return effect
}
let uid = 0
function createReactiveEffect(fn, options) {
  // 返回响应式effect
  const effect = function reactiveEffect() {
    // todo...
    // 利用栈型结构存储effect，保证依赖关系，（因为effect存在嵌套使用的情况）
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect)
        activeEffect = effect // 记录当前的effect
        return fn() // 执行用户传递的fn -> 取值操作
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  effect.id = uid++ // 用于做标识的
  effect._isEffect = true // 标识是响应式effect
  effect.raw = fn // 记录原本的fn
  effect.deps = [] // 用于收集effect对应的相关属性
  effect.options = options
  return effect
}
```

4. track 依赖收集

```js
// effect函数执行时，走render函数，进行取值操作，触发get拦截方法，调用track收集依赖；
const targetMap = new WeakMap()
export function track(target, type, key) {
  if (activeEffect === undefined) {
    // 如果不在effect中取值，则无需记录
    return
  }
  let depsMap = targetMap.get(target)
  // WeakMap({name:'zf',age:11},{name:{Set},age:{Set}})
  if (!depsMap) {
    // 构建存储结构,没收集过依赖的数据对象
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect) // 收集数据所在的effect
    activeEffect.deps.push(dep)
  }
}
// WeakMap({name:'zf',age:11},{name:{Set},age:{Set}})
// 收集依赖的存储结构：weakMap{key是target数据对象，value是map对象，map内是获取数据key以及其依赖effect的set结构，effect存在数据对应key的set结构中，如上所示}
```

5. trigger 触发更新
   > 对新增属性和修改属性做分类

```js
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const oldValue = target[key]
    const hadKey =
      isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    if (!hadKey) {
      // 新增属性
      trigger(target, TriggerOpTypes.ADD, key, value)
    } else if (hasChanged(value, oldValue)) {
      // 修改属性
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }
    return result
  }
}
```

> 将需要触发的 effect 找到依次执行

```js
export function trigger(target, type, key?, newValue?, oldValue?) {
  // targetMap是get时建立的依赖收集结构
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // 属性没有对应的effect
    return
  }
  const effects = new Set() // 设置集合
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect) => {
        effects.add(effect)
      })
    }
  }
  if (key === 'length' && isArray(target)) {
    // 如果修改的是长度
    depsMap.forEach((dep, key) => {
      // 如果有长度的依赖要更新  如果依赖的key小于设置的长度也要更新
      if (key == 'length' || key >= newValue) {
        add(dep)
      }
    })
  } else {
    if (key !== void 0) {
      // 修改key
      add(depsMap.get(key))
    }
    switch (type) {
      case TriggerOpTypes.ADD:
        if (isArray(target)) {
          if (isIntegerKey(key)) {
            // 给数组新增属性，直接触发length即可
            add(depsMap.get('length'))
          }
        }
        break
      default:
        break
    }
  }
  // 遍历收集的effects执行
  effects.forEach((effect: any) => {
    effect()
  })
}
```

### 响应式小结：
？？？
reactive调用返回数据对象的代理对象Proxy，后边render取值时再触发依赖收集（取哪个值得时候再深层代理？懒代理？），再然后数据变更触发trigger更新，

6.  响应式 Api：Ref 实现（reactive 不能代理普通类型，故使用 ref 响应式处理普通值）
    > ref 本质就是通过类的属性访问器来实现的(相当于 vue2 的 defineProperty)，可以将一个普通值类型进行包装。

```js
import { hasChanged, isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";
import { reactive } from "./reactive";

export function ref(value) { // ref Api
    return createRef(value);
}

export function shallowRef(value) { // shallowRef Api
    return createRef(value, true);
}
function createRef(rawValue, shallow = false) {
    return new RefImpl(rawValue, shallow)
}
// ref传递的值是对象或数组会自动调用reactive进行代理；
const convert = (val) => isObject(val) ? reactive(val) : val; // 递归响应式

class RefImpl {
    private _value;
    public readonly __v_isRef = true; // 标识是ref
    constructor(private _rawValue, public readonly _shallow) {
        this._value = _shallow ? _rawValue : convert(_rawValue)
    }
    get value() {
        track(this, TrackOpTypes.GET, 'value');
        return this._value;
    }
    set value(newVal) {
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal; // 保存值
            this._value = this._shallow ? newVal : convert(newVal);
            trigger(this, TriggerOpTypes.SET, 'value', newVal);
        }
    }
}
```

```js
// reactive 响应式 api
// ref reactive 不能代理普通类型，故使用 ref 响应式
// 想解构 reactive -> toRefs, 解构某一个属性使用 toRef

// effect 副作用更新，track 收集依赖，trigger 触发更新
```

- ref 和 reactive 的区别 reactive 内部采用 proxy ref 中内部使用的是 defineProperty(class 的 get 和 set babel 编译后还是 defineProperty)

8.  实现 computed
    > computed 的整体思路和 Vue2.0 源码基本一致，也是基于缓存来实现的。

## computed 部分功能，参加 example 用例

- computed 中使用了响应式数据 ref，
- effect 中使用 computed 中返回的数据，
- 流程梳理：
- 1.响应式数据 ref 定时改变后出发 ref 的 set
- 2.set 判断数据改变了，修改 ref 类的 this.\_value，再触发 trigger()（trigger(this, TriggerOrTypes.SET, 'value', newValue)}）
- 到 trigger 里触发更新，找到 ref 对象收集的 effect：computed 中的那个 effect（有 scheduler 方法，并调用 scheduler 方法），
- ComputedRefImpl 类中的 scheduler 方法执行，再次触发 trigger 更新（trigger(this, TriggerOrTypes.SET, 'value')），
- 这时计算属性收集的 effect 执行（计算属性是在页面的 effect 函数的 fn 读取使用的），effect 执行会走 fn(),fn 是 effect 中传的函数，
- fn 执行，读取计算属性的 value，接下来调用 ComputedRefImpl 的 get value()获取计算属性值，
- get 获取时是脏的，会调用 this.effect(),走的是 computedRefImpl 的 effect(),effect()执行再次调用其 fn（这个 fn 是在 computed 中传给自己 effect 的 getter 函数）
- fn()执行，返回计算属性变化后的值，
- setTimeout->ref 的 set -> trigger -> scheduler -> trigger -> effect -> reactiveEffect 页面 effect 的 fn()读值-> computed 的 get-> get 中的 effect() ->fn()计算属性的 fn 计算新值，
- 接下来函数该出栈了---
-

## 待完成 list

- 响应式源码调试 ？？？
- vue3 初始化流程，组件初始化流程
- 组件更新，diff，最长递增子序列
- vue3 生命周期
- vue3 源码，runtime-dom 和 runtime-core 调试，熟悉流程

> ts

## runtime：新加包模块：runtime-core,runtime-dom

### 组件的初始化：

- vue3 的 runtime 模块= runtime-core+runtime-dom
  > 在 packages 目录下新建文件夹包名，在新的包下 yarn init -y，初始化 package.json,添加 src 目录，开始源码编写
- 介绍 VueRuntimeDOM
  > Vue 中将 runtime 模块分为 runtime-core 核心代码 及 其他平台对应的运行时，那么 VueRuntimeDOM 无疑就是解决浏览器运行时的问题，此**包中提供了 DOM 属性操作和节点操作一系列接口**。

### patchProp 实现，主要针对不同的属性提供不同的 patch 操作

```js
// runtime-dom/src/patchProp.ts
import { patchClass } from './modules/class' // 类名处理
import { patchStyle } from './modules/style' // 样式处理
import { patchEvent } from './modules/events' // 事件处理
import { patchAttr } from './modules/attrs' // 属性处理
import { isOn } from '@vue/shared'
export const patchProp = (el, key, prevValue, nextValue) => {
  switch (key) {
    // 先处理特殊逻辑
    case 'class':
      patchClass(el, nextValue)
      break
    case 'style':
      patchStyle(el, prevValue, nextValue)
      break
    default:
      if (isOn(key)) {
        // 如果是事件
        patchEvent(el, key, nextValue)
      } else {
        patchAttr(el, key, nextValue)
      }
      break
  }
}
```

### nodeOps 实现：主要是所有节点操作的方法

```js
// runtime-dom/src/nodeOps.ts
export const nodeOps = {
  insert: (child, parent, anchor) => {
    // 增加
    parent.insertBefore(child, anchor || null)
  },
  remove: (child) => {
    // 删除
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  // 创建元素
  createElement: (tag) => document.createElement(tag),
  // 创建文本
  createText: (text) => document.createTextNode(text),
  // 设置元素内容
  setElementText: (el, text) => {
    el.textContent = text
  },
  // 设置文本内容
  setText: (node, text) => {
    node.nodeValue = text
  },
  parentNode: (node) => node.parentNode, // 获取父节点
  nextSibling: (node) => node.nextSibling, // 获取下个兄弟
  querySelector: (selector) => document.querySelector(selector),
}
```

### runtimeDom 的入口文件主要实现

> 用户调用的 createApp 函数就在这里被声明

```js
// runtime-dom/src/index.ts
import { createRenderer } from '@vue/runtime-core/src'
import { extend } from '@vue/shared/src'
import { patchProp } from './patchProp'
import { nodeOps } from './nodeOps'

console.log('runtime-dom')

// runtimeDom中对dom操作的所有选项
const rendererOptions = extend({ patchProp }, nodeOps)
console.log(rendererOptions)
// vue 中runtime-core 提供了核心的方法，
export function createApp(rootComponent, rootProps = null) {
  // 高阶函数createRenderer，-这些逻辑移动到core中与平台代码无关
  const app = createRenderer(rendererOptions).createApp(rootComponent, rootProps)
  const { mount } = app
  app.mount = function (container) {
    container = document.querySelector(container)
    container.innerHTML = ''
    console.log('dom中的mount,清空容器')
    const proxy = mount(container) // 执行挂载逻辑
    return proxy
  }
  return app
}

export * from '@vue/runtime-core'
```

### runtimeCore 中的(主要流程)代码实现

```js
// runtime-core/src/renderer.ts
import { createAppAPI } from './apiCreateApp'

export function createRenderer(rendererOptions) {
  // 渲染时所到的api
  const render = (vnode, container) => {
    // 
    // 核心渲染方法
    // 将虚拟节点转化成真实节点插入到容器中
    patch(null, vnode, container) // 初始化逻辑老的虚拟节点为null
  }
  return {
    createApp: createAppAPI(render),
  }
}
```

```ts
// runtime-core/src/apiCreateApp.ts
import { createVNode } from './vnode'

export function createAppAPI(render) {
  return function createApp(rootComponent, rootProps = null) {
    const app = {
      _props: rootProps, // 属性
      _component: rootComponent, // 组件
      _container: null,
      mount(rootContainer) {
        // 1.通过rootComponent 创建vnode
        // 2.调用render方法将vnode渲染到rootContainer中
        const vnode = createVNode(rootComponent, rootProps)
        render(vnode, rootContainer)  // 真实render执行在组件的update函数（effect函数里边执行render函数，触发依赖收集）
        app._container = rootContainer
      },
    }
    return app
  }
}
```

### Vnode 实现

```ts
// runtime-core/src/vnode.ts
import { isObject, isString, ShapeFlags } from '@vue/shared/src'
export const createVNode = (type, props, children = null) => {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0
  const vnode = {
    type,
    props,
    children,
    key: props && props.key, // 用于diff算法
    el: null, // 虚拟节点对应的真实节点
    shapeFlag, // 自己是什么类型
  }
  normalizeChildren(vnode, children) // 根据子节点计算孩子类型
  return vnode
}
```
### 组件初始化流程小结：
？？？
createApp(rootComponent,rootProps)dom包中的-->createRenderer(rendererOptions).createApp(rootComponent, rootProps);core包中的，返回app,

--->调用app中mount()方法-->createVNode(rootComponent, rootProps)--1.通过rootComponent 创建vnode,然后触发render方法
--->render执行在组件的update函数（effect函数里边执行render函数，触发依赖收集）
--->render(vnode, rootContainer)// 2.调用render方法将vnode渲染到rootContainer中
渲染：--->patch(null, vnode, container)// 将虚拟节点转化成真实节点插入到容器中

### 组件初次渲染，渲染流程：

> 初次调用 render 方法时，虚拟节点的类型为组件

- mount()->render()->patch()->processComponent()->mountComponent()->
- const instance = createComponentInstance()---为组件创造实例-->
- setupComponent(instance)--给 instance 赋值，注意这里有分叉--->
  - setupStatefulComponent()---(提供 instance.proxy, 代理实例上一系列属性,)---->
  - PublicInstanceProxyHandlers --------->
  - createSetupContext,setup()--->
  - handleSetupResult()---- 处理返回值-->
  - finishComponentSetup()----确保实例上有 render 函数---->
- setupRenderEffect()----给组件增加渲染 effect------->

  - instance.update = effect()----->
  - subTree = (instance.subTree = instance.render.call(proxyToUse,proxyToUse));-->render 函数（用户写的 render 函数）执行，返回的是虚拟节点（组件要渲染的元素的虚拟节点）
    > 例如：`const App = {render : (r) =>h('div', {}, 'hello zf')}`
  - patch(null,subTree,container); 渲染子树，形成递归渲染到最底层，
    > initialVNode.el = subTree.el; // 组件的 el 和子树的 el 是同一个
    > instance.isMounted = true; 组件已经挂载完毕

- 元素创建流程：

  1. h 方法的实现：创建并返回 vnode，主要是调用 createVNode()
  2. 创建真实节点:

  ```ts
  const mountElement = (vnode, container) => {
    // 创建节点保存到vnode中
    const { props, shapeFlag, type, children } = vnode
    let el = (vnode.el = hostCreateElement(type))

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本直接插入即可
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el) // 对子节点进行处理
    }

    if (props) {
      // 处理属性
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    hostInsert(el, container)
  }
  ```

```ts
// runtime-core/src/renderer.ts
// createRenderer方法中的核心patch方法，
const patch = (n1, n2, container) => {
  // 针对不同类型，做初始化操作
  const { shapeFlag, type } = n2
  switch (type) {
    case Text:
      processText(n1, n2, container)
      break

    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 标签
        processElement(n1, n2, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 组件
        processComponent(n1, n2, container)
      }
      break
  }
}
```

## diff
