import { readdir } from 'fs/promises'
import path from 'path'
import dayjs from 'dayjs'

import { ArticleTitleLink } from './ArticleTitleLink'

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
  const files = await readdir(path.join(process.cwd(), './articles/posts'), { recursive: true })
  const mdxFiles = (files as string[]).filter(file => /\.mdx$/.test(file))

  const list = await Promise.all(
    mdxFiles.map(async file => {
      const normalizedPath = file.split(path.sep).join('/')
      const slug = normalizedPath.replace(/\.mdx$/, '')
      const articleModule = (await import(`@/articles/posts/${normalizedPath}`)) as {
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
          <h2 className="font-title-serif mb-3 text-[30px] text-[#4a5665]">{year}</h2>
          <ul className="ml-1 space-y-3 border-l border-[#ddd] pl-5">
            {items.map(item => (
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
