import { allArticles } from 'content-collections'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export interface ArchivePostItem {
  slug: string
  title: string
  dateText: string
  timestamp: number
  year: number
  month: number
  categories: string[]
  tags: string[]
}

export const archivePosts = allArticles
  .map<ArchivePostItem>(item => {
    const parsedDate = dayjs(item.date)

    return {
      slug: item._meta.path,
      title: item.title,
      dateText: parsedDate.format('YYYY年 M月 D日'),
      timestamp: parsedDate.valueOf(),
      year: parsedDate.year(),
      month: parsedDate.month() + 1,
      categories: item.categories ?? [],
      tags: item.tags ?? [],
    }
  })
  .sort((a, b) => b.timestamp - a.timestamp || a.slug.localeCompare(b.slug))

export function groupPostsByYear(posts: ArchivePostItem[]) {
  const grouped = new Map<number, ArchivePostItem[]>()

  for (const post of posts) {
    if (!grouped.has(post.year)) {
      grouped.set(post.year, [])
    }
    grouped.get(post.year)!.push(post)
  }

  return [...grouped.entries()].sort(([yearA], [yearB]) => yearB - yearA)
}

export function getYearArchivePosts(year: number) {
  return archivePosts.filter(post => post.year === year)
}

export function getMonthArchivePosts(year: number, month: number) {
  return archivePosts.filter(post => post.year === year && post.month === month)
}

export function getArchiveYears() {
  const years = new Set<number>()
  for (const post of archivePosts) {
    years.add(post.year)
  }
  return [...years].sort((a, b) => b - a)
}

export function getArchiveYearMonths(year: number) {
  const monthCount = new Map<number, number>()

  for (const post of archivePosts) {
    if (post.year !== year) {
      continue
    }
    monthCount.set(post.month, (monthCount.get(post.month) ?? 0) + 1)
  }

  return [...monthCount.entries()]
    .sort(([monthA], [monthB]) => monthB - monthA)
    .map(([month, count]) => ({ month, count }))
}

export function formatMonthParam(month: number) {
  return String(month).padStart(2, '0')
}

export function parseYearParam(input: string) {
  const parsed = dayjs(input, 'YYYY', true)
  if (!parsed.isValid()) {
    return null
  }

  return parsed.year()
}

export function parseMonthParam(input: string) {
  const parsed = dayjs(input, ['M', 'MM'], true)
  if (!parsed.isValid()) {
    return null
  }

  return parsed.month() + 1
}
