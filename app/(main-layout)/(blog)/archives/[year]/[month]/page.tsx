import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleTitleLink } from '../../../../ArticleTitleLink'
import {
  formatMonthParam,
  getArchiveYearMonths,
  getArchiveYears,
  getMonthArchivePosts,
  parseMonthParam,
  parseYearParam,
} from '../../archive-data'

export const dynamicParams = false

export function generateStaticParams() {
  return getArchiveYears().flatMap(year =>
    getArchiveYearMonths(year).map(item => ({
      year: String(year),
      month: formatMonthParam(item.month),
    }))
  )
}

export default async function ArchiveMonthPage({ params }: PageProps<'/archives/[year]/[month]'>) {
  const { year: rawYear, month: rawMonth } = await params
  const year = parseYearParam(rawYear)
  const month = parseMonthParam(rawMonth)

  if (year === null || month === null) {
    notFound()
  }

  const posts = getMonthArchivePosts(year, month)
  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="mb-8 space-y-8">
      <section className="w-fit max-w-full rounded-2xl">
        <div className="text-[14px] text-[#7a8797]">按年份和月份归档</div>
        <h1 className="font-title-serif mt-1 text-[32px] text-[#2f3a49]">
          {year} 年 {month} 月
        </h1>
      </section>

      <ul className="ml-1 space-y-3 border-l border-[#ddd] pl-5">
        {posts.map(item => (
          <li key={item.slug} className="relative rounded-sm px-2 py-1.5">
            <span className="pointer-events-none absolute top-3 -left-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-white bg-[#b7c0cc]" />
            <div className="font-en-sans mb-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#7a8797]">
              <span>{item.dateText}</span>
              <Link href={`/archives/${year}`}>{year} 年归档</Link>
            </div>
            <ArticleTitleLink
              href={`/post/${item.slug}`}
              title={item.title}
              className="font-title-serif hover:text-primary text-[24px] text-[#2f3a49] transition-colors"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
