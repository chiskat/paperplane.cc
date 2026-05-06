import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleTitleLink } from '../../../ArticleTitleLink'
import {
  formatMonthParam,
  getArchiveYears,
  getYearArchivePosts,
  parseYearParam,
} from '../archive-data'

export const dynamicParams = false

export function generateStaticParams() {
  return getArchiveYears().map(year => ({
    year: String(year),
  }))
}

export default async function ArchiveYearPage({ params }: PageProps<'/archives/[year]'>) {
  const { year: rawYear } = await params
  const year = parseYearParam(rawYear)

  if (year === null) {
    notFound()
  }

  const posts = getYearArchivePosts(year)
  if (posts.length === 0) {
    notFound()
  }

  const monthGroups = posts.reduce<Map<number, typeof posts>>((acc, post) => {
    if (!acc.has(post.month)) {
      acc.set(post.month, [])
    }
    acc.get(post.month)!.push(post)

    return acc
  }, new Map())

  const groupedPosts = [...monthGroups.entries()].sort(([monthA], [monthB]) => monthB - monthA)

  return (
    <div className="mb-8 space-y-8">
      <section className="w-fit max-w-full rounded-2xl">
        <div className="text-[14px] text-[#7a8797]">按年份归档</div>
        <h1 className="font-title-serif mt-1 text-[32px] text-[#2f3a49]">{year} 年</h1>
      </section>

      {groupedPosts.map(([month, monthPosts]) => (
        <section key={`${year}-${month}`} className="space-y-3">
          <div className="flex items-end gap-3">
            <Link
              href={`/archives/${year}/${formatMonthParam(month)}`}
              className="hover:text-primary font-title-serif text-[26px] text-[#4a5665] transition-colors"
            >
              {month} 月
            </Link>
          </div>
          <ul className="ml-1 space-y-3 border-l border-[#ddd] pl-5">
            {monthPosts.map(item => (
              <li key={item.slug} className="relative rounded-sm px-2 py-1.5">
                <span className="pointer-events-none absolute top-3 -left-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-white bg-[#b7c0cc]" />
                <div className="font-en-sans mb-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#7a8797]">
                  <span>
                    {item.dateText}
                    {item.categories.length > 0 ? ` · ${item.categories.join(' / ')}` : ''}
                  </span>
                </div>
                <ArticleTitleLink
                  href={`/post/${item.slug}`}
                  title={item.title}
                  className="font-title-serif hover:text-primary text-[24px] text-[#2f3a49] transition-colors"
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
