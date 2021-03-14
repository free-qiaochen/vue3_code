
import { isFunction, isObject, ShapeFlags } from '@vue/shared/src'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'

// 为组件创建实例
export function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type, // 组件对象
    props: {}, // 组件属性
    attrs: {}, // 元素本身的属性
    slots: {}, // 组件的插槽
    ctx: {}, // 组件的上下文
    data: {},
    setupState: {}, // 如果setup返回一个对象，这个对象会作为setUpstate
    render: null,
    subTree: null, // 组件要渲染的子元素；render函数的返回结果就是subTree，
    isMounted: false,
  }
  instance.ctx = { _: instance } // instance.ctx._
  return instance
}
// 给instance赋值
export function setupComponent(instance) {
  const { props, children } = instance.vnode

  // 根据props解析出props和attrs，将其放到instance上，此处功能欠缺
  instance.props = props
  instance.children = children

  // 需要看下当前组件是不是有状态的组件，函数组件
  let isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
  if (isStateful) {
    // 带状态的组件
    // 调用 当前实例的setup方法，用setup的返回值 填充 setupState和对应的render方法
    setupStatefulComponent(instance)
  }
}
function setupStatefulComponent(instance) {
  // 1. 代理 传递给render函数的参数
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers as any)
  // 2. 获取组件的类型，拿到组件的setup方法，
  let Component = instance.type
  let { setup } = Component
  if (setup) {
    let setupContext = createSetupContext(instance)
    const setupResult = setup(instance.props, setupContext)
    handleSetupResult(instance, setupResult)
  } else {
    // 完成组件的启动
    finishComponentSetup(instance)  // 确保实例上有render函数
  }
}

function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult // render优先取setup中返回函数
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
  let Component = instance.type
  if (!instance.render) {
    // 此处说明setup中没返回函数，
    // 如果用户也没写render函数（外部render ）
    // 对template模板进行编译，产生render函数，并放到实例上
    if (!Component.render && Component.template) {
      // 编译 将结果 赋值给Component.render
    }
    instance.render = Component.render
  }
}

function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {},
  }
}

// instance，context，proxy之间的关系？？
// instance 表示组件的状态，各种各样的状态，组件的相关信息，
// context 就4个参数（attrs,slots.emit,expose），是为了开发时使用的
// proxy 主要是为了取值方便 =》 proxy.xxx
