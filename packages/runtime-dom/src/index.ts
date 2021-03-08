import { createRenderer } from "@vue/runtime-core/src"
import { extend } from "@vue/shared/src"

console.log('runtime-dom')

const rendererOptions = extend({},'nodeOps')
// vue 中runtime-core 提供了核心的方法，
export function createApp(rootComponent, rootProps = null) {
  const app = createRenderer(rendererOptions).createApp(rootComponent,rootProps)

  return app
}
