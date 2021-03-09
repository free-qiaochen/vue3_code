/**
 * style的patch，
 * 1. 新的没有，直接全部清空
 * 2. 老的有，新的里边没有对应的，直接从style中删除
 * 3. 把新的里边的添加到style中
 * @param el
 * @param prev
 * @param next
 */
export const patchStyle = (el, prev, next) => {
  const style = el.style // 获取样式
  if (next == null) {
    el.removeAttribute('style') // {style:{}}
  } else {
    // 老的里有，新的没有
    if (prev) {
      for (const key in prev) {
        if (next[key] == null) {
          style[key] = ''
        }
      }
    }
    // 新的里边的需要赋值到style上
    for (let key in next) {
      // {style:{color}} => {style:{background}}
      style[key] = next[key]
    }
  }
}
