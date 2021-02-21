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
