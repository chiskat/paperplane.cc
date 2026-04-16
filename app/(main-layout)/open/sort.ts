export const sort = [
  'use-upgrade',
  'omn',
  'docker-deps',
  'mp-websocket-polyfill',
  'cra-template-antd',
  'cra-template-mui',
  'baseline-node',
  'artalk-go-full',
  'docker-api',
]

export function filterAndSortByOpenOrder<T extends { _meta: { path: string } }>(items: T[]): T[] {
  const openOrderMap = new Map(sort.map((name, index) => [name, index]))

  return items
    .filter(item => openOrderMap.has(item._meta.path))
    .sort((a, b) => openOrderMap.get(a._meta.path)! - openOrderMap.get(b._meta.path)!)
}
