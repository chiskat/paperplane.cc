import { readdir, readFile } from 'fs/promises'
import path from 'path'
import dayjs from 'dayjs'
import { notFound } from 'next/navigation'

import absurdityBg from '@/assets/article-page/absurdity.png'
import { articleMDX } from './article-mdx'
import Commet from './Commet'
import History from './History'
import { extractTocFromMdx, Toc } from './Toc'

export const dynamicParams = false

export async function generateStaticParams() {
  const files = await readdir(path.join(process.cwd(), './articles/posts'), { recursive: true })
  return (files as string[])
    .filter(f => /\.mdx$/.test(f))
    .map(f => ({
      filename: f
        .replace(/\.mdx$/, '')
        .split(path.sep)
        .join('/'),
    }))
}

export interface PostFrontmatter {
  title: string
  date: string
  tags?: string[]
  categories?: string[]
  old_filename?: string
}

const articleComponents = articleMDX()

export default async function ArticlePage({ params }: PageProps<'/post/[filename]'>) {
  const { filename } = await params
  const articleRelativePath = `${filename}.mdx`
  const articleAbsolutePath = path.join(process.cwd(), 'articles', 'posts', `${filename}.mdx`)
  const { Article, frontmatter } = await import(`@/articles/posts/${articleRelativePath}`)
    .then(m => ({ Article: m.default, frontmatter: m.frontmatter as PostFrontmatter }))
    .catch(() => notFound())

  const articleSource = await readFile(articleAbsolutePath, 'utf8').catch(() => '')
  const tocItems = extractTocFromMdx(articleSource)

  const publishDate = dayjs(frontmatter.date).format('YYYY年 M月 D日')
  const publishDateISO = dayjs(frontmatter.date).format('YYYY-MM-DD')
  const category = frontmatter.categories?.[0] ?? ''
  const articleGithubUrl = `https://github.com/chiskat/paperplane.cc/blob/main/articles/posts/${filename
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/')}.mdx`

  return (
    <div id="article-top" className="relative my-8 scroll-mt-40">
      <Toc title={frontmatter.title} tocItems={tocItems} />

      <div className="lg:mr-75">
        <div
          style={{
            background:
              'repeating-linear-gradient(-45deg, #c0332f 0, #c0332f 12.5%, #eee 0, #eee 25%, #356daa 0, #356daa 37.5%, #eee 0, #eee 50%) 0/6em 6em',
            boxShadow: '0px 0px 5px 1px #ccc',
          }}
          className="border-border overflow-hidden rounded-lg"
        >
          <div
            className="relative m-2.25 rounded-[3px] px-7.5 py-5"
            style={{
              backgroundColor: 'white',
              backgroundImage: `url(${absurdityBg.src})`,
            }}
          >
            <img
              className="pointer-events-none absolute top-1.25 right-0 z-2 h-43.75 rotate-25"
              src={require('@/assets/article-page/postmark.png').default.src}
              alt=""
            />
            <h1 className="font-title-serif mt-2.5 mb-7.5 pr-[200px] text-4xl">
              {frontmatter.title}
            </h1>

            <div className="font-title-serif mb-7.5 flex items-center gap-7 border-y border-[#ddd] py-1.5 text-[18px] text-[#999] *:cursor-pointer [&>*+*]:relative [&>*+*]:before:absolute [&>*+*]:before:top-1/2 [&>*+*]:before:-left-3.5 [&>*+*]:before:h-5 [&>*+*]:before:w-[1.5px] [&>*+*]:before:-translate-y-1/2 [&>*+*]:before:bg-[#ddd] [&>*+*]:before:content-['']">
              <time dateTime={publishDateISO}>{publishDate}</time>
              <span>分类: {category}</span>
              <a href="#comments">
                留言: <span className="artalk-comment-count">...</span>
              </a>
              <a href={articleGithubUrl} target="_blank" rel="noreferrer">
                GitHub 源码
              </a>
            </div>

            <Article components={articleComponents} />

            <History filename={filename} oldFilename={frontmatter.old_filename} />
          </div>
        </div>

        <Commet />
      </div>
    </div>
  )
}
