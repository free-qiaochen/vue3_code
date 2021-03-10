import { createVNode } from './vnode'

export function createAppAPI(render) {
  return function createApp(rootComponent, rootProps) {
    // 用户创建app的参数
    const app = {
      _props: rootProps,
      _component: rootComponent,
      _container: null,
      mount(container) {
        console.log('core中的mount,挂载。。。')
        // 1. 根据组件创建虚拟节点，
        // 2. 将虚拟节点和容器传给render方法，进行渲染
        // let vnode = {}
        const vnode = createVNode(rootComponent, rootProps)
        // console.log('vnode', vnode)
        // 调用render
        render(vnode, container)

        // ?
        app._container = container
      },
    }
    return app
  }
}
