/** 重写原版的比较算法，兼容 Date 对象 */
function isEqual(a: any, b: any): boolean {
  if (a instanceof Date && b instanceof Date) {
    return a.valueOf() === b.valueOf()
  }

  return a === b
}

/**
 * @tanstack/react-query 默认的 structuralSharing 结构化共享功能无法解析 Date 等对象
 * 而 trpc 用到了 superjson 自动反序列化数据，会导致结果中存在 Date，导致即便相同的结果也会触发 useEffect
 * 因此需要重写 @tanstack/react-query 的 structuralSharing，对 Date 进行兼容
 *
 * 相关 GitHub 建议 Issus： https://github.com/trpc/trpc/issues/6306
 *
 * 此段代码来自 https://github.com/TanStack/query/blob/main/packages/query-core/src/utils.ts
 * 覆写了其中等比较的判断
 */
export function replaceEqualDeep(a: any, b: any): any {
  // 此处重写
  if (isEqual(a, b)) {
    return a
  }

  const array = isPlainArray(a) && isPlainArray(b)

  if (!array && !(isPlainObject(a) && isPlainObject(b))) return b

  const aItems = array ? a : Object.keys(a)
  const aSize = aItems.length
  const bItems = array ? b : Object.keys(b)
  const bSize = bItems.length
  const copy: any = array ? new Array(bSize) : {}

  let equalItems = 0

  for (let i = 0; i < bSize; i++) {
    const key: any = array ? i : bItems[i]
    const aItem = a[key]
    const bItem = b[key]

    // 此处重写
    if (isEqual(aItem, bItem)) {
      copy[key] = aItem
      if (array ? i < aSize : Object.prototype.hasOwnProperty.call(a, key)) equalItems++
      continue
    }

    if (
      aItem === null ||
      bItem === null ||
      typeof aItem !== 'object' ||
      typeof bItem !== 'object'
    ) {
      copy[key] = bItem
      continue
    }

    const v = replaceEqualDeep(aItem, bItem)
    copy[key] = v
    // 此处重写
    if (isEqual(v, aItem)) equalItems++
  }

  return aSize === bSize && equalItems === aSize ? a : copy
}

function isPlainArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value) && value.length === Object.keys(value).length
}

function isPlainObject(o: any): o is Record<PropertyKey, unknown> {
  if (!hasObjectPrototype(o)) {
    return false
  }

  const ctor = o.constructor
  if (ctor === undefined) {
    return true
  }

  const prot = ctor.prototype
  if (!hasObjectPrototype(prot)) {
    return false
  }

  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false
  }

  if (Object.getPrototypeOf(o) !== Object.prototype) {
    return false
  }

  return true
}

function hasObjectPrototype(o: any): boolean {
  return Object.prototype.toString.call(o) === '[object Object]'
}
