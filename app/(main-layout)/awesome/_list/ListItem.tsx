import { IconMichelinStar, IconPointFilled } from '@tabler/icons-react'
import Link from 'next/link'

import { AwesomeItemResult } from '@/apis/awesome/items'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSession } from '@/lib/auth-client'
import { ListItemLinks } from './ListItemLinks'
import { ListItemTags } from './ListItemTags'
import { AwesomeDeleteButton } from '../_item/AwesomeDeleteButton'
import { AwesomeEditButton } from '../_item/AwesomeEditButton'

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
  const { user, isPending } = useSession()
  const softButtonClassName =
    'border-slate-200 bg-slate-50 text-[12px] leading-none text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700'

  const stars = item.stars || 0
  const starMarkTooltip = awesomeStarLevel(stars)

  const displayUrl = item.homepage
    ?.replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')

  return (
    <li className="flex items-center rounded-md px-2 py-0.5 text-[18px] text-slate-900 transition-colors hover:bg-[#f1f3f5]">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="mr-2 inline-flex cursor-pointer">
            {stars >= 5 ? (
              <IconMichelinStar size={13} className="text-[#f01879]" />
            ) : stars >= 4 ? (
              <IconMichelinStar size={13} className="text-[#adb5bd]" />
            ) : (
              <IconPointFilled size={13} className="text-[#adb5bd]" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>{starMarkTooltip}</TooltipContent>
      </Tooltip>

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

      <ListItemLinks awesome={item} />
      <ListItemTags awesome={item} />

      {!isPending && user ? (
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 pl-3">
          <AwesomeEditButton
            type="button"
            variant="outline"
            size="xs"
            className={softButtonClassName}
            id={item.id}
          >
            编辑
          </AwesomeEditButton>

          <AwesomeDeleteButton
            awesomeId={item.id}
            awesomeName={item.label}
            type="button"
            variant="outline"
            size="xs"
            className={softButtonClassName}
          >
            删除
          </AwesomeDeleteButton>
        </span>
      ) : null}
    </li>
  )
}
