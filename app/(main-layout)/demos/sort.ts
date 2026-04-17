export const sort = [
  'website-nextjs',
  'website-fullstack',
  'blog-hexo',
  'careerintlinc-tech-share',
  'cfda',
  'offwork',
  'kiny',
]

export function filterAndSortByDemoOrder<T extends { _meta: { path: string } }>(items: T[]): T[] {
  const demoOrderMap = new Map(sort.map((name, index) => [name, index]))

  return items
    .filter(item => demoOrderMap.has(item._meta.path))
    .sort((a, b) => demoOrderMap.get(a._meta.path)! - demoOrderMap.get(b._meta.path)!)
}
