// 元素 操作的一些常用api
// 此处先考虑浏览器平台下dom操作
export const nodeOps = {
  createElement: (tagName) => document.createElement(tagName),
  remove: (child) => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  insert: (child, parent, anchor = null) => {
    // 插入
    parent.insertBefore(child, anchor) // 如果参照物为空，则相当于appendChild
  },
  setElementText: (el, text) => (el.textContent = text), // 设置元素内容
  // 文本操作
  createText: (text) => document.createTextNode(text), // 创建文本
  setText: (node, text) => (node.nodeValue = text), //设置文本内容
  nextSibling: (node) => node.nextSibling, // 获取下个兄弟
  parentNode: (node) => node.parentNode, // 获取父节点
  querySelector: (selector) => document.querySelector(selector),
}
