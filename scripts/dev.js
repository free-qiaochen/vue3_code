//  只针对具体的某个包打包

const fs = require('fs');
const execa = require('execa');

// const target = 'reactivity'
const target = 'runtime-dom'

// 对我们的目标进行打包

build(target)

async function build (target) {
  await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], { stdio: 'inherit' })// 当前子进程打包的信息共享给父进程
}