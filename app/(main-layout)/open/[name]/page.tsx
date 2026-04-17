import {
  IconCpu,
  IconFileDescription,
  IconHome,
  IconPackage,
  IconVersions,
} from '@tabler/icons-react'
import { allOpens } from 'content-collections'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { KVPairs, KVPairsItem } from '@/components/data/kv-pairs'
import { PackageIcon } from '@/components/icon/package-icon'
import { GiteaIcon, GithubIcon } from '@/components/icon/tech-icons'
import openMDX from '@/components/mdx/open'
import { getTechTagByName } from '@/components/tag/tech-tags'
import { cn } from '@/utils/style'
import { VersionBadgeImage } from './VersionBadgeImage'
import { filterAndSortByOpenOrder } from '../sort'

export const dynamicParams = false

const sortedOpens = filterAndSortByOpenOrder(allOpens)
const mdxComponent = openMDX()

function ExternalLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'text-[#2f629d] decoration-[#2f629d]/40 underline-offset-[3px] transition-all duration-200 hover:text-[#c0332f] hover:decoration-[#c0332f]/60',
        className
      )}
    >
      {children}
    </Link>
  )
}

export function generateStaticParams() {
  return sortedOpens.map(item => ({
    name: item._meta.path,
  }))
}

export default async function OpenItemPage({ params }: PageProps<'/open/[name]'>) {
  const { name } = await params
  const project = sortedOpens.find(item => item._meta.path === name)
  if (!project) {
    notFound()
  }
  const packageLink =
    project.type === 'npm'
      ? `https://www.npmjs.com/package/${project.name}`
      : project.type === 'docker'
        ? `https://hub.docker.com/r/${project.name}`
        : `https://pypi.org/project/meme-generator/${project.name}`
  const githubLink = `https://github.com/${project.repo}`
  const giteaLink = `https://git.paperplane.cc/${project.repo}`

  const shieldsName = project.override?.shields || project.name
  const shieldsImg =
    project.type === 'npm'
      ? `https://shields.paperplane.cc/npm/v/${shieldsName}?logo=npm&sort=semver&cacheSeconds=86400`
      : project.type === 'docker'
        ? `https://shields.paperplane.cc/docker/v/${shieldsName}?logo=docker&sort=semver&cacheSeconds=86400`
        : `https://shields.paperplane.cc/pypi/v/${shieldsName}?logo=pypi&sort=semver&cacheSeconds=86400`
  const shieldsAlt =
    project.type === 'npm'
      ? `package version on npm`
      : project.type === 'docker'
        ? `image version on docker hub`
        : 'package version on pypi'

  const techTags = (project.techs ?? [])
    .map(tech => {
      const Tag = getTechTagByName(tech)
      return Tag ? { name: tech, Tag } : null
    })
    .filter(
      (item): item is { name: string; Tag: NonNullable<ReturnType<typeof getTechTagByName>> } =>
        item !== null
    )

  const { default: OpenContent } = await import(`@/app/(main-layout)/open/_list/${name}.mdx`)

  return (
    <div className="min-w-0 pb-4">
      <h1 className="font-title-serif mb-4 text-3xl text-slate-900">{project.name}</h1>
      <KVPairs colon="：">
        {project.homepage ? (
          <KVPairsItem label="主页" icon={<IconHome />}>
            <ExternalLink href={project.homepage} className="underline">
              {project.homepage}
            </ExternalLink>
          </KVPairsItem>
        ) : null}

        <KVPairsItem label="软件包" icon={<IconPackage />}>
          <ExternalLink
            href={packageLink}
            className="inline-flex items-center gap-2 font-mono hover:underline"
          >
            <PackageIcon type={project.type} />
            {project.name}
          </ExternalLink>
        </KVPairsItem>

        <KVPairsItem label="源代码" icon={<IconFileDescription />}>
          <div className="flex items-center gap-4">
            <ExternalLink
              href={githubLink}
              className="inline-flex items-center gap-2 hover:underline"
            >
              <GithubIcon />
              GitHub
            </ExternalLink>

            <ExternalLink
              href={giteaLink}
              className="inline-flex items-center gap-2 hover:underline"
            >
              <GiteaIcon />
              Gitea
            </ExternalLink>
          </div>
        </KVPairsItem>

        <KVPairsItem
          label="版本"
          icon={<IconVersions />}
          contentClassName="self-center flex items-center"
        >
          <VersionBadgeImage src={shieldsImg} alt={shieldsAlt} />
        </KVPairsItem>

        {techTags.length > 0 ? (
          <KVPairsItem label="技术栈" icon={<IconCpu />}>
            <div className="flex flex-wrap items-center gap-2">
              {techTags.map(({ name, Tag }, index) => (
                <Tag key={`${name}-${index}`} className="h-6" />
              ))}
            </div>
          </KVPairsItem>
        ) : null}
      </KVPairs>

      <div className="mt-8">
        <OpenContent components={mdxComponent} />
      </div>
    </div>
  )
}
