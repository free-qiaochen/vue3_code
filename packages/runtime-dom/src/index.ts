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
