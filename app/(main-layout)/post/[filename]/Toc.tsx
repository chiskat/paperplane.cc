import GithubSlugger from 'github-slugger'
import type { Heading, PhrasingContent } from 'mdast'
import { remark } from 'remark'
import remarkFrontmatter from 'remark-frontmatter'

import { cn } from '@/utils/style'

export interface TocItem {
  depth: number
  id: string
  text: string
}

function extractHeadingText(children: PhrasingContent[]): string {
  return children
    .map(node => {
      if (node.type === 'text' || node.type === 'inlineCode') return node.value
      if ('children' in node) return extractHeadingText(node.children as PhrasingContent[])
      return ''
    })
    .join('')
}

export interface ExtractTocFromMdxOptions {
  depth?: number
}

export function extractTocFromMdx(
  source: string,
  options: ExtractTocFromMdxOptions = {
    depth: 2,
  }
): TocItem[] {
  const { depth } = options as Required<ExtractTocFromMdxOptions>

  const slugger = new GithubSlugger()
  const tree = remark().use(remarkFrontmatter).parse(source)
  const result: TocItem[] = []

  for (const node of tree.children) {
    if (node.type !== 'heading') {
      continue
    }

    const heading = node as Heading
    if (heading.depth < 1 || heading.depth > depth) {
      continue
    }

    const text = extractHeadingText(heading.children)
    if (!text) {
      continue
    }

    result.push({
      depth: heading.depth as TocItem['depth'],
      id: slugger.slug(text),
      text,
    })
  }

  return result
}

export interface ArticleTocProps {
  title: string
  tocItems: TocItem[]
}

export function Toc({ title, tocItems }: ArticleTocProps) {
  return (
    <aside className="mb-6 lg:absolute lg:inset-y-0 lg:right-0 lg:mb-0 lg:w-68">
      <div className="relative overflow-hidden rounded-sm border border-[#d6dce5] px-4 py-3 shadow-[0px_0px_3px_1px_#eee] backdrop-blur-xs before:pointer-events-none before:absolute before:top-0 before:right-0 before:left-0 before:h-8 before:bg-linear-to-b before:from-white/60 before:to-transparent lg:sticky lg:top-36 lg:flex lg:max-h-[calc(100vh-10rem)] lg:flex-col">
        <h2 className="font-title-serif relative mb-4 pb-3 text-base text-[18px] text-[#4a5665] after:absolute after:-right-4 after:bottom-0 after:-left-4 after:border-b after:border-dashed after:border-[#356daa]/40">
          <a href="#">{title}</a>
        </h2>

        <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:rounded-xs [&::-webkit-scrollbar]:bg-[#eee] [&::-webkit-scrollbar-thumb]:rounded-xs [&::-webkit-scrollbar-thumb]:bg-[#ccc] [&::-webkit-scrollbar-track]:rounded-xs [&::-webkit-scrollbar-track]:bg-transparent">
          <ol className="space-y-1">
            {tocItems.map(item => (
              <li
                key={`${item.id}-${item.text}`}
                className={cn(
                  'min-w-0 leading-5',
                  item.depth === 2 && 'ml-2',
                  item.depth === 3 && 'ml-4'
                )}
              >
                <a
                  href={`#${item.id}`}
                  className="font-en-sans block truncate py-px text-[13px] text-[#4a5665] hover:text-[#c0332f]"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  )
}
