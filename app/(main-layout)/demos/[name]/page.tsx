import { IconCpu, IconFileCode, IconHome, IconServer } from '@tabler/icons-react'
import { allDemos } from 'content-collections'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import demoMDX from '@/app/(main-layout)/demos/mdx-render'
import { KVPairs, KVPairsItem } from '@/components/data/kv-pairs'
import { GiteaIcon, GithubIcon } from '@/components/icon/tech-icons'
import { getTechTagByName } from '@/components/tag/tech-tags'
import { Highlight } from '@/components/text/Highlight'
import { cn } from '@/utils/style'
import { filterAndSortByDemoOrder } from '../sort'

export const dynamicParams = false

const sortedDemos = filterAndSortByDemoOrder(allDemos)
const mdxComponent = demoMDX()

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
  return sortedDemos.map(item => ({
    name: item._meta.path,
  }))
}

export default async function DemoItemPage({ params }: PageProps<'/demos/[name]'>) {
  const { name } = await params
  const project = sortedDemos.find(item => item._meta.path === name)
  if (!project) {
    notFound()
  }

  const githubLink = `https://github.com/${project.repo}`
  const giteaLink = `https://git.paperplane.cc/${project.repo}`
  const backendGithubLink = project.backendRepo
    ? `https://github.com/${project.backendRepo}`
    : undefined
  const backendGiteaLink = project.backendRepo
    ? `https://git.paperplane.cc/${project.backendRepo}`
    : undefined
  const repoLabel = project.backendRepo ? '前端仓库' : '源代码'

  const techTags = (project.techs ?? [])
    .map(tech => {
      const Tag = getTechTagByName(tech)
      return Tag ? { name: tech, Tag } : null
    })
    .filter(
      (item): item is { name: string; Tag: NonNullable<ReturnType<typeof getTechTagByName>> } =>
        item !== null
    )

  const { default: DemoContent } = await import(`@/app/(main-layout)/demos/_list/${name}.mdx`)

  return (
    <div className="min-w-0 pb-4">
      <h1 className="font-title-serif mb-4 text-3xl text-slate-900">{project.title}</h1>

      <KVPairs colon="：">
        {project.href ? (
          <KVPairsItem label="演示地址" icon={<IconHome />}>
            <ExternalLink href={project.href} className="underline">
              <Highlight text={project.href} keywords={project.hrefHighlight} />
            </ExternalLink>
          </KVPairsItem>
        ) : null}

        <KVPairsItem label={repoLabel} icon={<IconFileCode />}>
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

        {backendGithubLink && backendGiteaLink ? (
          <KVPairsItem label="后端仓库" icon={<IconServer />}>
            <div className="flex items-center gap-4">
              <ExternalLink
                href={backendGithubLink}
                className="inline-flex items-center gap-2 hover:underline"
              >
                <GithubIcon />
                GitHub
              </ExternalLink>

              <ExternalLink
                href={backendGiteaLink}
                className="inline-flex items-center gap-2 hover:underline"
              >
                <GiteaIcon />
                Gitea
              </ExternalLink>
            </div>
          </KVPairsItem>
        ) : null}

        {techTags.length > 0 ? (
          <KVPairsItem label="技术栈" icon={<IconCpu />}>
            <div className="flex flex-wrap items-center gap-2">
              {techTags.map(({ name: techName, Tag }, index) => (
                <Tag key={`${techName}-${index}`} className="h-6" />
              ))}
            </div>
          </KVPairsItem>
        ) : null}
      </KVPairs>

      <div className="mt-8">
        <DemoContent components={mdxComponent} />
      </div>
    </div>
  )
}
