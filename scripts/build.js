// 把package目录下的所有包都进行打包

const fs = require('fs')
const execa = require('execa')  // 开启子进程进行打包

// 过滤packages目录下所有模块
const targets = fs.readdirSync('packages').filter((f) => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false
  }
  return true
})
console.log(targets)

async function runParallel (source, iteratorFn) {
  const ret = []
  try {
    for (const item of source) {
      const p = iteratorFn(item)
      ret.push(p)
    }
    return Promise.all(ret)
  } catch (error) {
    console.log('-e:', error)
  }

}

async function build (target) {// rollup  -c --environment TARGET:shated
  await execa('rollup', ['-c', '--environment', `TARGET:${target}`], { stdio: 'inherit' })// （stdio）当前子进程打包的信息共享给父进程
}

// 开始并行打包
runParallel(targets, build)