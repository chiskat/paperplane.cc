import { existsSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { NextResponse } from 'next/server'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'

import { articleList } from '../../article-list'

export { generateStaticParams } from '../page'

interface AstNode {
  type: string
  url?: string
  name?: string
  value?: unknown
  position?: { start: { offset?: number }; end: { offset?: number } }
  children?: AstNode[]
  attributes?: AstNode[]
  data?: {
    estree?: {
      body?: {
        type: string
        source?: { value?: unknown; start: number; end: number }
      }[]
    }
  }
}

export async function GET(_request: Request, { params }: RouteContext<'/post/[filename]/md'>) {
  const { filename } = await params
  const article = articleList.find(item => item._meta.path === filename)

  if (!article) {
    return new NextResponse('Not Found', { status: 404 })
  }

  return new NextResponse(articleToMd(article), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

function articleToMd(article: (typeof articleList)[number]) {
  const tree = remark().use(remarkMdx).parse(article.content)
  const articleFilePath = `app/(main-layout)/(blog)/_articles/posts/${article._meta.filePath}`
  const replacements: { start: number; end: number; value: string }[] = []

  function visit(node: AstNode) {
    if (node.type === 'image' && node.url && node.position) {
      addReplacement(node.url, node.position.start.offset, node.position.end.offset)
    }

    if (
      node.type === 'mdxJsxAttribute' &&
      node.name === 'src' &&
      typeof node.value === 'string' &&
      node.position
    ) {
      addReplacement(node.value, node.position.start.offset, node.position.end.offset)
    }

    node.children?.forEach(visit)
    node.attributes?.forEach(visit)
  }

  function addReplacement(src: string, start?: number, end?: number) {
    if (start === undefined || end === undefined) return

    const githubUrl = getGithubImageUrl(src, articleFilePath)
    if (!githubUrl) return

    const urlStart = article.content.indexOf(src, start)
    if (urlStart === -1 || urlStart + src.length > end) return

    replacements.push({ start: urlStart, end: urlStart + src.length, value: githubUrl })
  }

  visit(tree as AstNode)
  addImportReplacements(tree.children[0] as AstNode | undefined, articleFilePath, replacements)

  return replacements
    .sort((a, b) => b.start - a.start)
    .reduce((content, replacement) => {
      return `${content.slice(0, replacement.start)}${replacement.value}${content.slice(replacement.end)}`
    }, article.content)
}

function addImportReplacements(
  node: AstNode | undefined,
  articleFilePath: string,
  replacements: { start: number; end: number; value: string }[]
) {
  if (node?.type !== 'mdxjsEsm') return

  for (const declaration of node.data?.estree?.body ?? []) {
    if (declaration.type !== 'ImportDeclaration' || typeof declaration.source?.value !== 'string')
      continue

    const rawUrl = getGithubImportUrl(declaration.source.value, articleFilePath)
    if (!rawUrl) continue

    replacements.push({
      start: declaration.source.start + 1,
      end: declaration.source.end - 1,
      value: rawUrl,
    })
  }
}

function getGithubImportUrl(source: string, articleFilePath: string) {
  if (!source.startsWith('./') && !source.startsWith('../') && !source.startsWith('@/')) return

  const importPath = source.startsWith('@/')
    ? resolve(process.cwd(), source.slice(2))
    : resolve(dirname(resolve(articleFilePath)), source)
  const sourceExtensions = ['', '.tsx', '.ts', '.jsx', '.js', '.mdx']
  const resolvedPath = sourceExtensions
    .map(extension => `${importPath}${extension}`)
    .find(existsSync)

  if (!resolvedPath) return

  const repositoryPath = relative(process.cwd(), resolvedPath).split(sep).join('/')
  const encodedPath = repositoryPath.split('/').map(encodeURIComponent).join('/')

  return `https://raw.githubusercontent.com/chiskat/paperplane.cc/main/${encodedPath}`
}

function getGithubImageUrl(src: string, articleFilePath: string) {
  if (!src.startsWith('./') && !src.startsWith('../')) return

  const [pathname, ...suffixParts] = src.split(/(?=[?#])/)
  const articleDirectory = dirname(articleFilePath)
  const imagePath = resolve(articleDirectory, decodeURIComponent(pathname))
  const repositoryPath = relative(process.cwd(), imagePath).split(sep).join('/')
  const encodedPath = repositoryPath.split('/').map(encodeURIComponent).join('/')
  const suffix = suffixParts.join('')

  return `https://raw.githubusercontent.com/chiskat/paperplane.cc/main/${encodedPath}${suffix}`
}
