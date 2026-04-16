import { redirect } from 'next/navigation'

import { allRegistries } from '@/.content-collections/generated'
import registryMDX from '@/components/mdx/registry'

export const dynamicParams = false

const mdxComponent = registryMDX()

export function generateStaticParams() {
  return allRegistries.map(item => ({
    slug: item._meta.path,
  }))
}

export default async function RegistrySlugPage({ params }: PageProps<'/registry/[slug]'>) {
  const { slug } = await params
  const registry = allRegistries.find(item => item._meta.path === slug)
  if (!registry) {
    redirect('/registry')
  }

  const { default: RegistryContent } = await import(
    `@/app/(main-layout)/registry/_list/${slug}.mdx`
  )

  return (
    <div className="min-w-0 pb-4">
      <RegistryContent components={mdxComponent} />
    </div>
  )
}
