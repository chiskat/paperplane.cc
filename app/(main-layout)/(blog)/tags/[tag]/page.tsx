import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { archivePosts } from '@/app/(main-layout)/(blog)/archives/archive-data'
import { ArticleTitleLink } from '@/app/(main-layout)/ArticleTitleLink'

export const dynamicParams = false

export function generateStaticParams() {
  const tags = new Set<string>()

  for (const post of archivePosts) {
    for (const tag of post.tags) {
      tags.add(tag)
    }
  }

  return [...tags].sort((a, b) => a.localeCompare(b)).map(tag => ({ tag }))
}

export async function generateMetadata({ params }: PageProps<'/tags/[tag]'>): Promise<Metadata> {
  const { tag } = await params

  return { title: `${tag} - 博文标签 - PaperPlane.cc` }
}

export default async function TagPage({ params }: PageProps<'/tags/[tag]'>) {
  const { tag } = await params

  const posts = archivePosts.filter(post => post.tags.includes(tag))

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="mb-8 space-y-8">
      <section className="w-fit max-w-full rounded-2xl">
        <div className="text-[14px] text-[#7a8797]">按标签归档</div>
        <h1 className="font-title-serif mt-1 text-[32px] text-[#2f3a49]">{tag}</h1>
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
