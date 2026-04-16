import { notFound } from 'next/navigation'

import { SnippetCatalogLayoutClient, type SnippetCatalogOption } from './SnippetCatalogLayoutClient'
import { list } from '../list'

function getSnippetDirSlug(dir: string) {
  return dir.replace(/^_+/, '')
}

function getSnippetIconKey(dir: string) {
  return getSnippetDirSlug(dir).replace(/\./g, '-')
}

const catalogOptions = Array.from(
  new Map(
    list
      .flatMap(group => group.children)
      .filter(category => category.children.length > 0)
      .map(category => [
        getSnippetDirSlug(category.dir),
        {
          slug: getSnippetDirSlug(category.dir),
          title: category.title,
          iconKey: category.icon ?? getSnippetIconKey(category.dir),
          children: category.children,
        } satisfies SnippetCatalogOption,
      ])
  ).values()
)

const catalogMap = new Map(catalogOptions.map(option => [option.slug, option] as const))

export const dynamicParams = false

export function generateStaticParams() {
  return catalogOptions.map(option => ({ catelog: option.slug }))
}

export default async function SnippetCatalogLayout({
  children,
  params,
}: LayoutProps<'/snippet/[catelog]'>) {
  const { catelog } = await params
  const currentCatalog = catalogMap.get(catelog)

  if (!currentCatalog) {
    notFound()
  }

  return (
    <SnippetCatalogLayoutClient currentCatalog={currentCatalog}>
      {children}
    </SnippetCatalogLayoutClient>
  )
}
