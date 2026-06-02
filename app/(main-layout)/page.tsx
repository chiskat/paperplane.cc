import { readdir } from 'fs/promises'
import path from 'path'
import dayjs from 'dayjs'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticleTitleLink } from './ArticleTitleLink'

export const metadata: Metadata = {
  title: '首页 - PaperPlane.cc',
}

interface PostFrontmatter {
  title: string
  date: string
  tags?: string[]
  categories?: string[]
}

interface PostListItem {
  slug: string
  title: string
  dateText: string
  year: number
  categories: string[]
  tags: string[]
  timestamp: number
}

async function getPostList(): Promise<PostListItem[]> {
  const files = await readdir(
    path.join(process.cwd(), './app/(main-layout)/(blog)/_articles/posts'),
    { recursive: true }
  )
  const mdxFiles = (files as string[]).filter(file => /\.mdx$/.test(file))

  const list = await Promise.all(
    mdxFiles.map(async file => {
      const normalizedPath = file.split(path.sep).join('/')
      const slug = normalizedPath.replace(/\.mdx$/, '')
      const articleModule = (await import(
        `@/app/(main-layout)/(blog)/_articles/posts/${normalizedPath}`
      )) as {
        frontmatter: PostFrontmatter
      }
      const frontmatter = articleModule.frontmatter
      const parsedDate = dayjs(frontmatter.date)

      return {
        slug,
        title: frontmatter.title,
        dateText: parsedDate.format('YYYY年 M月 D日'),
        year: parsedDate.year(),
        categories: frontmatter.categories ?? [],
        tags: frontmatter.tags ?? [],
        timestamp: parsedDate.valueOf(),
      } satisfies PostListItem
    })
  )

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
  const posts = await getPostList()
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
          <ul className="ml-1 space-y-3 border-l border-[#ddd] pl-5">
            {items.map(item => (
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
