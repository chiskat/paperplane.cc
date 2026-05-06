import GithubSlugger from 'github-slugger'
import type { Heading, PhrasingContent } from 'mdast'
import { remark } from 'remark'
import remarkFrontmatter from 'remark-frontmatter'

import TocClient from './TocClient'

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
  return <TocClient title={title} tocItems={tocItems} />
}
