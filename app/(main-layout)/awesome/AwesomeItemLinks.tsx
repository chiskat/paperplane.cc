import { IconCode } from '@tabler/icons-react'
import Link from 'next/link'

import { AwesomeItemResult } from '@/apis/awesome/items'
import githubIcon from '@/assets/tech-icons/github.svg'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip'
import { fromURL, PackageIcon } from '@/components/icon/package-icon'
import { Separator } from './AwesomeItem'

export interface AwesomeItemLinksProps {
  awesome: AwesomeItemResult
}

function normalizeUrl(url?: string | null) {
  const value = url?.trim()
  return value ? value : null
}

function isGithubSource(url: string) {
  return url.toLowerCase().startsWith('https://github.com')
}

export function AwesomeItemLinks({ awesome }: AwesomeItemLinksProps) {
  const registryUrl = normalizeUrl(awesome.registry)
  const sourceUrl = normalizeUrl(awesome.source)

  if (!registryUrl && !sourceUrl) {
    return null
  }

  return (
    <>
      <Separator />

      <span className="inline-flex items-center gap-1 leading-0">
        {sourceUrl ? (
          <Tooltip>
            <TooltipTrigger>
              <Link
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-[#868e96] transition-colors hover:text-[#343a40]"
                title="Source"
                aria-label="打开 Source 链接"
              >
                {isGithubSource(sourceUrl) ? (
                  <img src={githubIcon.src} alt="" aria-hidden className="h-4 w-4" />
                ) : (
                  <IconCode size={16} />
                )}
              </Link>
            </TooltipTrigger>

            <TooltipContent>{isGithubSource(sourceUrl) ? `GitHub` : `源代码`}</TooltipContent>
          </Tooltip>
        ) : null}

        {registryUrl ? (
          <Tooltip>
            <TooltipTrigger>
              <Link
                href={registryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-[#868e96] transition-colors hover:text-[#343a40]"
                title="Registry"
                aria-label="打开 Registry 链接"
              >
                <PackageIcon type={fromURL(registryUrl)} className="h-4 w-4" />
              </Link>
            </TooltipTrigger>

            <TooltipContent>
              {fromURL(registryUrl) === 'npm'
                ? `npm`
                : fromURL(registryUrl) === 'docker'
                  ? `Docker Hub`
                  : fromURL(registryUrl) === 'pypi'
                    ? 'PyPI'
                    : `软件包`}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </span>
    </>
  )
}
