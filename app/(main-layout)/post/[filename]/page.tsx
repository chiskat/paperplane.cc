import { allArticles } from 'content-collections'
import dayjs from 'dayjs'
import { notFound } from 'next/navigation'

import absurdityBg from '@/assets/article-page/absurdity.png'
import postmarkImg from '@/assets/article-page/postmark.png'
import articleMDX from '@/components/mdx/article'
import Commet from './Commet'
import History from './History'
import { extractTocFromMdx, Toc } from './Toc'

export const dynamicParams = false

export function generateStaticParams() {
  return allArticles.map(item => ({
    filename: item._meta.path,
  }))
}

const mdxComponent = articleMDX()

export default async function ArticlePage({ params }: PageProps<'/post/[filename]'>) {
  const { filename } = await params
  const article = allArticles.find(item => item._meta.path === filename)
  if (!article) {
    notFound()
  }

  const { default: ArticleContent } = await import(`@/articles/posts/${filename}.mdx`)

  const tocItems = extractTocFromMdx(article.content)
  const publishDate = dayjs(article.date).format('YYYY年 M月 D日')
  const publishDateISO = dayjs(article.date).format('YYYY-MM-DD')
  const category = article.categories[0] ?? ''
  const articleGithubUrl = `https://github.com/chiskat/paperplane.cc/blob/main/articles/posts/${filename
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/')}.mdx`

  return (
    <div id="article-top" className="relative my-8 scroll-mt-40">
      <Toc title={article.title} tocItems={tocItems} />

      <div className="lg:mr-75">
        <div
          style={{
            background:
              'repeating-linear-gradient(-45deg, #c0332f 0, #c0332f 12.5%, #eee 0, #eee 25%, #2f629d 0, #2f629d 37.5%, #eee 0, #eee 50%) 0/6em 6em',
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
              src={postmarkImg.src}
              alt=""
              aria-hidden
            />
            <h1 className="font-title-serif mt-2.5 mb-7.5 pr-[200px] text-4xl">{article.title}</h1>

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

            <ArticleContent components={mdxComponent} />

            <History filename={filename} oldFilename={article.old_filename} />
          </div>
        </div>

        <Commet />
      </div>
    </div>
  )
}
