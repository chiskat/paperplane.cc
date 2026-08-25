import dayjs from 'dayjs'
import type { Metadata } from 'next'
import Link from 'next/link'

import { articleList } from './(blog)/post/article-list'
import { ArticleTitleLink } from './article-title-link'

export const metadata: Metadata = {
  title: '首页 - PaperPlane.cc',
}

interface PostListItem {
  slug: string
  title: string
  dateText: string
  year: number
  categories: string[]
  tags: string[]
  draft: boolean
  timestamp: number
}

function getPostList(): PostListItem[] {
  const list = articleList.map(article => {
    const parsedDate = dayjs(article.date)

    return {
      slug: article._meta.path,
      title: article.title,
      dateText: parsedDate.format('YYYY年 M月 D日'),
      year: parsedDate.year(),
      categories: article.categories,
      tags: article.tags,
      draft: article.draft ?? false,
      timestamp: parsedDate.valueOf(),
    }
  })

  return list.sort((a, b) => b.timestamp - a.timestamp || a.slug.localeCompare(b.slug))
}

function groupPostsByYear(posts: PostListItem[]) {
  const grouped = new Map<string, PostListItem[]>()

  for (const post of posts) {
    const key = String(post.year)
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(post)
  }

  return [...grouped.entries()].sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
}

export default async function HomePage() {
  const posts = getPostList()
  const groupedPosts = groupPostsByYear(posts)

  return (
    <div className="mb-8 space-y-10">
      {groupedPosts.map(([year, items]) => (
        <section key={year}>
          <h2 className="font-title-serif mb-3 text-[30px] text-[#4a5665]">
            <Link href={`/archives/${year}`} className="hover:text-primary transition-colors">
              {year}
            </Link>
          </h2>
          <ul className="ml-1 space-y-6 border-l border-[#ddd] pl-5">
            {items.map(item => (
              <ArticleTitleLink key={item.slug} article={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
