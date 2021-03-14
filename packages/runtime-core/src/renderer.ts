import { effect } from '@vue/reactivity'
import { ShapeFlags } from '@vue/shared/src'
import { createAppAPI } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
import { queueJob } from './scheduler'
import { normalizeVNode, Text } from './vnode'

export function createRenderer(rendererOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
  } = rendererOptions

  // -------组件--------
  const setupRenderEffect = (instance, container) => {
    // 需要创建一个effect，在effect中调用render方法，这样render方法中的数据取值时会收集这个effect（组件的update的effect），数据更新时effect会重新执行
    instance.update = effect(
      function componentEffect() {
        if (!instance.isMounted) {
          // 初次渲染
          let proxyToUse = instance.proxy
          // v2->v3:$vnode->_vnode,vnode->subTree;
          // 调用render函数，
          let subTree = (instance.subTree = instance.render.call(proxyToUse, proxyToUse))

          // 用render函数的返回值，继续渲染
          patch(null, subTree, container) // 调用patch形成递归
          instance.isMounted = true
        } else {
          // 更新，diff
          console.log('update component')
        }
      },
      {
        // scheduler: (job) => {
        //   console.log('scheduler', job)
        // },
        scheduler:queueJob
      }
    )
  }
  const mountComponent = (initialVNode, container) => {
    // 组件的渲染流程：最核心的是调用setup拿到返回值，获取render函数返回的结果来进行渲染
    // 1. 先有实例,依据vnode创建的instance，
    const instance = (initialVNode.component = createComponentInstance(initialVNode))
    // 2. 需要的数据解析到实例上
    setupComponent(instance) // state props attrs render ...
    // 3. 创建一个effect，让render函数执行
    setupRenderEffect(instance, container)
  }
  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      mountComponent(n2, container)
    } else {
      // 组件更新流程
      console.log('component update')
    }
  }

  // ---------元素-------
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      let child = normalizeVNode(children[i])
      patch(null, child, container)
    }
  }
  const mountElement = (vnode, container) => {
    // 元素渲染
    const { props, type, shapeFlag, children } = vnode
    let el = (vnode.el = hostCreateElement(type))
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children) // 文本操作，
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el) // 渲染子节点
    }
    hostInsert(el, container)
  }
  const processElement = (n1, n2, container) => {
    console.log('element patch:', n1, n2, container)
    if (n1 == null) {
      // 元素挂载
      mountElement(n2, container)
    } else {
      // 元素更新
      console.log('element update')
    }
  }

  // --------文本处理--------
  const processText = (n1, n2, container) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    }
  }

  const patch = (n1, n2, container) => {
    // 针对不同类型，做初始化操作
    const { shapeFlag, type } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 标签
          processElement(n1, n2, container)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 组件
          processComponent(n1, n2, container)
        }
        break
    }
  }
  const render = (vnode, container) => {
    // 核心渲染方法，将虚拟节点转化为真实节点插入到容器中
    console.log('渲染vnode:', vnode, container)
    // 默认调用render，可能是初始化流程 ???
    patch(null, vnode, container)
  }
  return {
    createApp: createAppAPI(render),
  }
}
