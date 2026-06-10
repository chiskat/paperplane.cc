import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  formatMonthParam,
  getArchiveYearMonths,
  getArchiveYears,
  getMonthArchivePosts,
  parseMonthParam,
  parseYearParam,
} from '@/app/(main-layout)/(blog)/archives/archive-data'
import { ArticleTitleLink } from '@/app/(main-layout)/article-title-link'

export const dynamicParams = false

export function generateStaticParams() {
  return getArchiveYears().flatMap(year =>
    getArchiveYearMonths(year).map(item => ({
      year: String(year),
      month: formatMonthParam(item.month),
    }))
  )
}

export async function generateMetadata({
  params,
}: PageProps<'/archives/[year]/[month]'>): Promise<Metadata> {
  const { year: rawYear, month: rawMonth } = await params
  const year = parseYearParam(rawYear)
  const month = parseMonthParam(rawMonth)

  return {
    title:
      year === null || month === null
        ? '博文归档 - PaperPlane.cc'
        : `${year}年${month}月 - 博文归档 - PaperPlane.cc`,
  }
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

      <ul className="ml-1 space-y-6 border-l border-[#ddd] pl-5">
        {posts.map(item => (
          <ArticleTitleLink
            key={item.slug}
            href={`/post/${item.slug}`}
            title={item.title}
            dateText={item.dateText}
            categories={item.categories}
            tags={item.tags}
            metaExtra={
              <Link href={`/archives/${year}`} className="hover:text-primary transition-colors">
                {year} 年归档
              </Link>
            }
          />
        ))}
      </ul>
    </div>
  )
}
