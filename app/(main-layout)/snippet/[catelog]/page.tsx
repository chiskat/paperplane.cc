import { notFound, redirect } from 'next/navigation'

import { list } from '../list'

function getSnippetDirSlug(dir: string) {
  return dir.replace(/^_+/, '')
}

const catalogMap = new Map(
  Array.from(
    new Map(
      list
        .flatMap(group => group.children)
        .filter(category => category.children.length > 0)
        .map(category => [getSnippetDirSlug(category.dir), category] as const)
    ).entries()
  )
)

export default async function SnippetCatalogIndexPage({ params }: PageProps<'/snippet/[catelog]'>) {
  const { catelog } = await params
  const currentCatalog = catalogMap.get(decodeSegment(catelog))

  if (!currentCatalog) {
    notFound()
  }

  const firstArticle = currentCatalog.children[0]
  if (!firstArticle) {
    notFound()
  }

  redirect(`/snippet/${getSnippetDirSlug(currentCatalog.dir)}/${encodeURIComponent(firstArticle)}`)
}

function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}
