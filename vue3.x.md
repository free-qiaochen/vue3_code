# vue3.x 上课流程

3028213607@qq.com

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

## 响应式部分 api

```js
// reactive 响应式 api
// ref reactive 不能代理普通类型，故使用 ref 响应式
// 想解构 reactive -> toRefs, 解构某一个属性使用 toRef

// effect 副作用更新，track 收集依赖，trigger 触发更新
```

- ref 和 reactive 的区别 reactive 内部采用 proxy ref 中内部使用的是 defineProperty(class 的 get 和 set babel 编译后还是 defineProperty)

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
