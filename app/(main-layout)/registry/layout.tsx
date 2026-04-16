'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { allRegistries } from '@/.content-collections/generated'
import { Tabs, TabsList, TabsTrigger } from '@/components/animate-ui/components/radix/tabs'
import { DockerIcon, NpmIcon, PypiIcon } from '@/components/icon/tech-icons'

type TypeValue = 'docker' | 'npm' | 'pypi'
type RepositoryValue = 'mirror' | 'registry'

const DEFAULT_SLUG = 'docker-mirror'
const DEFAULT_TITLE = 'PaperPlane.cc Docker Hub 官方源镜像'
const TITLE_BY_SLUG = new Map(allRegistries.map(item => [item._meta.path, item.title] as const))

export default function RegistryLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const { type: currentType, repository: currentRepository, slug } = parseRoute(pathname)
  const title = getRegistryTitle(slug)

  const updateRoute = (nextType: TypeValue, nextRepository: RepositoryValue) => {
    router.replace(`/registry/${getSlug(nextType, nextRepository)}`, { scroll: false })
  }

  return (
    <section className="relative pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-0 h-72 w-72 rounded-full bg-linear-to-br from-sky-200/35 via-orange-100/30 to-transparent blur-3xl"
      />

      <div className="space-y-6">
        <div className="bg-white/70 backdrop-blur-sm">
          <div className="flex items-end gap-4">
            <div className="flex shrink-0 flex-wrap items-end gap-4">
              <div className="space-y-2">
                <h2 className="text-sm font-medium tracking-wide text-[#58677a]">类型</h2>

                <Tabs
                  value={currentType}
                  onValueChange={value => updateRoute(parseType(value), currentRepository)}
                  className="gap-0"
                >
                  <TabsList>
                    <TabsTrigger
                      value="docker"
                      fill={false}
                      aria-label="Docker"
                      title="Docker"
                      className="h-7.5 cursor-pointer"
                    >
                      <DockerIcon size={20} />
                      <span className="sr-only">Docker</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="npm"
                      fill={false}
                      aria-label="npm"
                      title="npm"
                      className="h-7.5 cursor-pointer"
                    >
                      <NpmIcon size={20} />
                      <span className="sr-only">npm</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="pypi"
                      fill={false}
                      aria-label="PyPI"
                      title="PyPI"
                      className="h-7.5 cursor-pointer"
                    >
                      <PypiIcon size={20} />
                      <span className="sr-only">PyPI</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-medium tracking-wide text-[#58677a]">仓库</h2>

                <Tabs
                  value={currentRepository}
                  onValueChange={value => updateRoute(currentType, parseRepository(value))}
                  className="gap-0"
                >
                  <TabsList>
                    <TabsTrigger value="mirror" fill={false} className="h-7.5 cursor-pointer">
                      源镜像
                    </TabsTrigger>
                    <TabsTrigger value="registry" fill={false} className="h-7.5 cursor-pointer">
                      私有制品库
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <h1 className="font-title-serif min-w-0 flex-1 text-[24px] whitespace-nowrap text-[#2d394a]">
              {title}
            </h1>
          </div>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

function parseType(value: string | null): TypeValue {
  return parseEnum(value, ['docker', 'npm', 'pypi'], 'docker')
}

function parseRepository(value: string | null): RepositoryValue {
  return parseEnum(value, ['mirror', 'registry'], 'mirror')
}

function getRegistryTitle(slug: string): string {
  return TITLE_BY_SLUG.get(slug) ?? TITLE_BY_SLUG.get(DEFAULT_SLUG) ?? DEFAULT_TITLE
}

function parseRoute(pathname: string): {
  type: TypeValue
  repository: RepositoryValue
  slug: string
} {
  const segment = pathname.split('/').filter(Boolean).at(-1)
  if (!segment || segment === 'registry') {
    return { type: 'docker', repository: 'mirror', slug: DEFAULT_SLUG }
  }

  const [rawType, rawRepository] = segment.split('-', 2)
  const type = parseType(rawType ?? null)
  const repository = parseRepository(rawRepository ?? null)
  return {
    type,
    repository,
    slug: getSlug(type, repository),
  }
}

function getSlug(type: TypeValue, repository: RepositoryValue): string {
  return `${type}-${repository}`
}

function parseEnum<T extends string>(value: string | null, values: readonly T[], fallback: T): T {
  return value && values.includes(value as T) ? (value as T) : fallback
}
