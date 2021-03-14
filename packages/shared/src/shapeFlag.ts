export const enum ShapeFlags {
  ELEMENT = 1, //1
  FUNCTIONAL_COMPONENT = 1 << 1, //2
  STATEFUL_COMPONENT = 1 << 2, //4
  TEXT_CHILDREN = 1 << 3, //8
  ARRAY_CHILDREN = 1 << 4, // 2^4=16
  SLOTS_CHILDREN = 1 << 5, // 2^5
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEEP_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}

// 位运算是前人总结出来，做权限判断和类型 方面的最佳实践

// 想判断他是不是组件
// 00000100 &  00000110  全1 才是1  =》 00000100  true
// 00001000 &  00000110  => 00000000 false

// | 有一个是1 就是1
// & 都是1 才是1

// 待小结？
