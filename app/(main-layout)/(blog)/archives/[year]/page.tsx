import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleTitleLink } from '@/app/(main-layout)/ArticleTitleLink'
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

export async function generateMetadata({
  params,
}: PageProps<'/archives/[year]'>): Promise<Metadata> {
  const { year: rawYear } = await params
  const year = parseYearParam(rawYear)

  return {
    title: year === null ? '博文归档 - PaperPlane.cc' : `${year}年 - 博文归档 - PaperPlane.cc`,
  }
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
          <ul className="ml-1 space-y-6 border-l border-[#ddd] pl-5">
            {monthPosts.map(item => (
              <ArticleTitleLink
                key={item.slug}
                href={`/post/${item.slug}`}
                title={item.title}
                dateText={item.dateText}
                categories={item.categories}
                tags={item.tags}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
