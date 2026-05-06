'use client'

import { IconCode, IconMichelinStar, IconPackage, IconPointFilled } from '@tabler/icons-react'
import { motion } from 'motion/react'
import Link from 'next/link'

import { AwesomeItemResult } from '@/apis/awesome/items'
import dockerIcon from '@/assets/tech-icons/docker.svg'
import githubIcon from '@/assets/tech-icons/github.svg'
import npmFlatIcon from '@/assets/tech-icons/npm-flat.svg'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/utils/style'
import { awesomeStarLevel } from './ListItem'

export type AwesomeDetailMode = 'auto' | 'page' | 'modal'

export interface AwesomeDetailProps {
  awesome: AwesomeItemResult
  mode?: AwesomeDetailMode
  className?: string
}

export interface AwesomeDetailSkeletonProps {
  mode?: AwesomeDetailMode
  className?: string
}

type AwesomeTagLike = AwesomeItemResult['tags'][number]
type LinkKind = 'github' | 'npm' | 'docker' | 'other'
type HighlightLinkType = 'source' | 'registry'

interface HighlightLink {
  href: string
  label: string
  type: HighlightLinkType
  kind: LinkKind
  displayUrl: string
}

const CONTAINER_ANIMATE = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: 'easeOut' },
  },
} as const

const DETAIL_SECTION_CLASSNAME = 'space-y-6 border-t border-blue-200/70 px-5 py-6 sm:px-8 sm:py-7'
const NPM_HOSTS = new Set(['www.npmjs.com', 'npmjs.com'])

function resolveLinkKind(host: string): LinkKind {
  if (host === 'github.com') {
    return 'github'
  }

  if (NPM_HOSTS.has(host)) {
    return 'npm'
  }

  if (host === 'hub.docker.com') {
    return 'docker'
  }

  return 'other'
}

function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//i, '')
}

function resolveGithubDisplay(segments: string[]) {
  const owner = segments[0]?.replace(/\.git$/i, '')
  if (!owner) {
    return 'github.com'
  }

  const repo = segments[1]?.replace(/\.git$/i, '')
  return repo ? `${owner}/${repo}` : owner
}

function resolveNpmDisplay(segments: string[]) {
  const nameOrScope = segments[1]!
  if (nameOrScope.startsWith('@')) {
    return `${nameOrScope.slice(1)}/${segments[2]!}`
  }
  return nameOrScope
}

function resolveDockerDisplay(segments: string[]) {
  if (segments[0] === 'r') {
    return `${segments[1]!}/${segments[2]!}`
  }

  if (segments[0] === '_') {
    return segments[1]!
  }

  return `${segments[2]!}/${segments[3]!}`
}

function resolveLinkMeta(rawUrl: string) {
  const parsed = new URL(rawUrl)
  const kind = resolveLinkKind(parsed.hostname.toLowerCase())
  const segments = parsed.pathname.split('/').filter(Boolean)

  if (kind === 'github') {
    return { kind, displayUrl: resolveGithubDisplay(segments) }
  }

  if (kind === 'npm') {
    return { kind, displayUrl: resolveNpmDisplay(segments) }
  }

  if (kind === 'docker') {
    return { kind, displayUrl: resolveDockerDisplay(segments) }
  }

  return {
    kind,
    displayUrl: stripProtocol(rawUrl),
  }
}

function resolveHighlightLabel(type: HighlightLinkType, kind: LinkKind) {
  if (type === 'source') {
    return kind === 'github' ? 'GitHub' : '源代码'
  }

  if (kind === 'npm') {
    return 'npm'
  }

  if (kind === 'docker') {
    return 'Docker Hub'
  }

  return '软件包'
}

function createHighlightLink(type: HighlightLinkType, href: string): HighlightLink {
  const { kind, displayUrl } = resolveLinkMeta(href)

  return {
    href,
    type,
    kind,
    displayUrl,
    label: resolveHighlightLabel(type, kind),
  }
}

function buildHighlightLinks(sourceUrl?: string | null, registryUrl?: string | null) {
  const links: HighlightLink[] = []

  if (sourceUrl) {
    links.push(createHighlightLink('source', sourceUrl))
  }

  if (registryUrl) {
    links.push(createHighlightLink('registry', registryUrl))
  }

  return links
}

function resolveCategoryPath(awesome: AwesomeItemResult) {
  const catelog = awesome.catelog
  if (!catelog) {
    return '未分类'
  }

  if (catelog.parent?.name) {
    return `${catelog.parent.name} / ${catelog.name}`
  }

  return catelog.name
}

function renderTagVisual(tag: AwesomeTagLike) {
  const content = tag.icon ? (
    <img src={tag.icon} alt="" aria-hidden className="h-5 w-5 object-cover" />
  ) : tag.color ? (
    <IconPointFilled
      size={20}
      className="text-slate-500"
      aria-hidden
      style={{ color: tag.color }}
    />
  ) : (
    <IconPointFilled size={20} className="text-slate-500" aria-hidden />
  )

  return (
    <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center">
      {content}
    </span>
  )
}

function DetailHighlightLinkCard({ link }: { link: HighlightLink }) {
  const iconNode =
    link.type === 'source' ? (
      link.kind === 'github' ? (
        <img src={githubIcon.src} alt="" aria-hidden className="h-5 w-5" />
      ) : (
        <IconCode size={18} />
      )
    ) : (
      <span className="inline-flex items-center justify-center">
        {link.kind === 'npm' ? (
          <img src={npmFlatIcon.src} alt="" aria-hidden className="h-5 w-5" />
        ) : link.kind === 'docker' ? (
          <img src={dockerIcon.src} alt="" aria-hidden className="h-5 w-5" />
        ) : (
          <IconPackage size={18} />
        )}
      </span>
    )

  return (
    <Link
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className="group w-full border border-[#a8b7ca] bg-[linear-gradient(180deg,#fdfefe_0%,#eef3f8_54%,#e3eaf2_100%)] px-6 py-5 whitespace-nowrap shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(136,154,180,0.36),0_2px_0_rgba(122,143,170,0.36),0_11px_22px_-18px_rgba(30,41,59,0.55)] transition-all hover:-translate-y-0.5 hover:border-[#8ea8c6] hover:bg-[linear-gradient(180deg,#ffffff_0%,#edf3f9_57%,#dde7f1_100%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(112,132,160,0.46),0_3px_0_rgba(97,119,150,0.42),0_14px_24px_-18px_rgba(15,23,42,0.66)] active:translate-y-px active:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(110,130,158,0.5),0_1px_0_rgba(97,119,150,0.42)] sm:w-auto"
    >
      <div className="flex items-center gap-2">
        {iconNode}
        <p className="font-en-sans ml-1 text-[16px] leading-5 font-medium tracking-[0.01em] text-slate-500">
          {link.label}
        </p>
      </div>

      <p className="mt-2 font-mono text-[16px] leading-6 text-slate-700">{link.displayUrl}</p>
    </Link>
  )
}

export function AwesomeDetail({ awesome, mode = 'auto', className }: AwesomeDetailProps) {
  const isModal = mode === 'modal'
  const stars = awesome.stars ?? 0

  const categoryPath = resolveCategoryPath(awesome)
  const tags = [...awesome.tags].sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  const highlightLinks = buildHighlightLinks(awesome.source, awesome.registry)

  return (
    <motion.article
      variants={CONTAINER_ANIMATE}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative overflow-hidden rounded-3xl border border-blue-200/70 bg-white',
        'shadow-[0_20px_70px_-38px_rgba(30,64,175,0.3)]',
        className
      )}
    >
      <div className={cn('relative', isModal && 'max-h-[min(84vh,920px)] overflow-y-auto')}>
        <div className={cn('px-5 py-6 sm:px-8 sm:py-7', isModal && 'sticky top-0 z-20 bg-white')}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="font-title-serif mb-2 text-[1.72rem] leading-tight wrap-break-word text-slate-900 sm:text-[1.95rem]">
                {awesome.label}
              </h1>

              <Link
                href={awesome.homepage}
                target="_blank"
                rel="noreferrer"
                className="font-en-sans mb-6 block text-[18px] leading-6 break-all text-[#2f629d] underline decoration-[#2f629d]/35 underline-offset-[3px] transition-colors hover:text-[#c0332f] hover:decoration-[#c0332f]/60"
              >
                {awesome.homepage}
              </Link>

              <p className="font-en-sans text-sm leading-relaxed text-slate-600 sm:text-[16px]">
                {awesome.desc || '暂无描述。'}
              </p>
            </div>

            <div className="relative w-full shrink-0 sm:ml-auto sm:w-55 sm:self-stretch sm:before:pointer-events-none sm:before:absolute sm:before:-top-7 sm:before:-bottom-7 sm:before:left-0 sm:before:w-px sm:before:bg-blue-200/70">
              <div className="flex h-full border-t border-blue-200/70 pt-4 sm:border-t-0 sm:pt-0 sm:pl-6">
                <div className="w-full min-w-47.5 space-y-4 text-left">
                  <div className="space-y-1">
                    <p className="font-en-sans text-[14px] text-slate-400 uppercase">类别</p>
                    <p className="text-[14px] leading-6 text-slate-600">{categoryPath}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-en-sans text-[14px] text-slate-400 uppercase">星级</p>
                    <p className="text-[14px] text-slate-600">{awesomeStarLevel(stars)}</p>

                    <div className="inline-flex items-center gap-1 text-[#f01879]">
                      {Array.from({ length: Math.max(stars, 1) }).map((_, index) => (
                        <IconMichelinStar
                          key={`star-${index}`}
                          size={13}
                          className={stars > 0 ? '' : 'text-slate-300'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {highlightLinks.length > 0 ? (
          <section className={DETAIL_SECTION_CLASSNAME}>
            <h2 className="font-title-serif text-xl text-slate-900">源码 / 软件包</h2>

            <div className="flex flex-wrap gap-3">
              {highlightLinks.map(link => (
                <DetailHighlightLinkCard key={link.href} link={link} />
              ))}
            </div>
          </section>
        ) : null}

        {tags.length > 0 ? (
          <section className={DETAIL_SECTION_CLASSNAME}>
            <h2 className="font-title-serif text-xl text-slate-900">标签</h2>

            <div className="mt-3 flex flex-wrap gap-4">
              {tags.map(tag => (
                <Tooltip key={tag.id}>
                  <TooltipTrigger
                    className={cn(
                      'group inline-flex cursor-pointer items-center gap-2 border border-slate-300 px-2 py-1 text-[14px] text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900',
                      tag.icon ? 'pr-3' : ''
                    )}
                  >
                    {renderTagVisual(tag)}
                    <span>{tag.label}</span>
                  </TooltipTrigger>

                  <TooltipContent>{tag.desc || tag.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </motion.article>
  )
}

export function AwesomeDetailSkeleton({ mode = 'auto', className }: AwesomeDetailSkeletonProps) {
  const isModal = mode === 'modal'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-blue-200/80 bg-white',
        'shadow-[0_18px_55px_-35px_rgba(29,78,216,0.28)]',
        className
      )}
    >
      <div
        className={cn(
          'relative z-10 space-y-5 p-5 sm:p-8',
          isModal && 'max-h-[min(80vh,760px)] overflow-y-auto'
        )}
      >
        <Skeleton className="h-8 w-3/5 rounded-xl" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    </div>
  )
}
