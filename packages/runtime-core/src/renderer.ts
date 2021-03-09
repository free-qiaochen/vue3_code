export function createRenderer(rendererOptions) {
  return {
    createApp(rootComponent, rootProps) {
      // 用户创建app的参数
      const app = {
        mount(container) {
          console.log('core中的mount,挂载。。。')
        },
      }
      return app
    },
  }
}
