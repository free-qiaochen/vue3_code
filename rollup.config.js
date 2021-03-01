//  rollup 配置

import path from 'path';
import json from '@rollup/plugin-json';
import resolvePlugin from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-typescript2'

// 根据环境变量中的target属性，获取对应模块中的package.json

const packagesDir = path.resolve(__dirname, 'packages');
// packageDir 打包的基准目录，如shared
const packageDir = path.resolve(packagesDir, process.env.TARGET)  // 找到要打包的某个包

// 某个target包模块下资源查找
const resolve = (p) => path.resolve(packageDir, p)

// 取某个包下的资源
const pkg = require(resolve('package.json'))
const name = path.basename(packageDir); // 取文件名

// 对打包类型先做一个自定义的映射表，根据你提供的formats来格式化需要打包的内容
const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife' // 立即执行函数
  }
}
const options = pkg.buildOptions; // 自己在package.json中定义的选项


function createConfig (format, output) {
  output.name = options.name;
  output.sourcemap = true;
  return {
    input: resolve(`src/index.ts`),
    output,
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      resolvePlugin() // 解析第三方模块插件
    ]
  }
}
console.log('-', pkg, options)
// 导出rollup最终的配置
export default options.formats.map(format => createConfig(format, outputConfig[format]))