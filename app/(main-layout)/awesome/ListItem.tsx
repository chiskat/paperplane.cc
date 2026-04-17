import { IconMichelinStar, IconPointFilled } from '@tabler/icons-react'
import Link from 'next/link'

import { AwesomeItemResult } from '@/apis/awesome/items'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip'
import { ListItemLinks } from './ListItemLinks'
import { ListItemTags } from './ListItemTags'

export function awesomeStarLevel(stars: number) {
  return stars >= 5
    ? `5星 · 不可错过 & 强烈推荐！`
    : stars >= 4
      ? `4星 · 推荐尝试！`
      : stars >= 1
        ? `${stars}星`
        : '未分级'
}

export function Separator() {
  return (
    <span
      className="mx-1.5 shrink-0 cursor-default text-[12px] leading-[1.3] text-slate-300 select-none"
      aria-hidden
    >
      ·
    </span>
  )
}

export interface ListItemProps {
  item: AwesomeItemResult
}

export function ListItem({ item }: ListItemProps) {
  const stars = item.stars || 0
  const starMarkTooltip = awesomeStarLevel(stars)

  const displayUrl = item.homepage
    ?.replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')

  return (
    <li className="flex items-center rounded-md px-2 py-0.5 text-[18px] text-slate-900 transition-colors hover:bg-[#f1f3f5]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="mr-2 cursor-pointer">
            {stars >= 5 ? (
              <IconMichelinStar size={13} className="text-[#f01879]" />
            ) : stars >= 4 ? (
              <IconMichelinStar size={13} className="text-[#adb5bd]" />
            ) : (
              <IconPointFilled size={13} className="text-[#adb5bd]" />
            )}
          </TooltipTrigger>
          <TooltipContent>{starMarkTooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Link className="leading-[1.3]" href={`/awesome/${item.id}`}>
        {item.label}
      </Link>

      <Separator />

      <Link
        href={item.homepage}
        target="_blank"
        className="text-[16px] leading-[1.3] text-[#00b5ff] underline-offset-1 hover:underline"
      >
        {displayUrl}
      </Link>

      <TooltipProvider>
        <ListItemLinks awesome={item} />
        <ListItemTags awesome={item} />
      </TooltipProvider>
    </li>
  )
}
