import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { archivePosts } from '@/app/(main-layout)/(blog)/archives/archive-data'
import { ArticleTitleLink } from '@/app/(main-layout)/ArticleTitleLink'

export const dynamicParams = false

export function generateStaticParams() {
  const categories = new Set<string>()

  for (const post of archivePosts) {
    for (const category of post.categories) {
      categories.add(category)
    }
  }

  return [...categories].sort((a, b) => a.localeCompare(b)).map(category => ({ category }))
}

export async function generateMetadata({
  params,
}: PageProps<'/categories/[category]'>): Promise<Metadata> {
  const { category } = await params

  return { title: `${category} - 博文分类 - PaperPlane.cc` }
}

export default async function CategoryPage({ params }: PageProps<'/categories/[category]'>) {
  const { category } = await params

  const posts = archivePosts.filter(post => post.categories.includes(category))

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="mb-8 space-y-8">
      <section className="w-fit max-w-full rounded-2xl">
        <div className="text-[14px] text-[#7a8797]">按分类归档</div>
        <h1 className="font-title-serif mt-1 text-[32px] text-[#2f3a49]">{category}</h1>
      </section>

      <ul className="ml-1 space-y-3 border-l border-[#ddd] pl-5">
        {posts.map(item => (
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
    </div>
  )
}
