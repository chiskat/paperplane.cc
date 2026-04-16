import { notFound } from 'next/navigation'

import { allSnippets } from '@/.content-collections/generated'
import snippetMDX from '@/components/mdx/snippet'

interface SnippetRouteMeta {
  catelog: string
  section: string
  filePath: string
}

const mdxComponent = snippetMDX()
const snippetRouteMetaList = allSnippets
  .map(getSnippetRouteMeta)
  .filter((item): item is SnippetRouteMeta => item !== null)

const snippetRouteMap = new Map(
  snippetRouteMetaList.map(item => [getSnippetKey(item.catelog, item.section), item] as const)
)

export const dynamicParams = false

export function generateStaticParams() {
  return snippetRouteMetaList.map(item => ({
    catelog: item.catelog,
    section: item.section,
  }))
}

export default async function SnippetSectionPage({
  params,
}: PageProps<'/snippet/[catelog]/[section]'>) {
  const { catelog, section } = await params
  const currentCatelog = decodeSegment(catelog)
  const currentSection = decodeSegment(section)

  const snippet = snippetRouteMap.get(getSnippetKey(currentCatelog, currentSection))
  if (!snippet) {
    notFound()
  }

  const normalizedFilePath = snippet.filePath.replaceAll('\\', '/')
  const { default: SnippetContent } = await import(
    `@/app/(main-layout)/snippet/_snippet/${normalizedFilePath}`
  )

  return (
    <div className="min-w-0 pb-4">
      <SnippetContent components={mdxComponent} />
    </div>
  )
}

function getSnippetRouteMeta(item: (typeof allSnippets)[number]): SnippetRouteMeta | null {
  const normalizedPath = item._meta.path.replaceAll('\\', '/')
  const [rawCatelog, ...sectionParts] = normalizedPath.split('/')
  const section = sectionParts.join('/')

  if (!rawCatelog || !section) {
    return null
  }

  return {
    catelog: rawCatelog.replace(/^_+/, ''),
    section,
    filePath: item._meta.filePath,
  }
}

function getSnippetKey(catelog: string, section: string) {
  return `${catelog}/${section}`
}

function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}
