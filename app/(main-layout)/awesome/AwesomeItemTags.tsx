import { AwesomeItemResult } from '@/apis/awesome/items'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip'
import { Separator } from './AwesomeItem'

export interface AwesomeItemTagsProps {
  awesome: AwesomeItemResult
}

function normalizeText(value?: string | null) {
  const text = value?.trim()
  return text ? text : null
}

function isPureWhiteColor(color?: string | null) {
  const value = normalizeText(color)?.toLowerCase()
  if (!value) {
    return false
  }

  const compact = value.replace(/\s+/g, '')
  return (
    compact === 'white' ||
    compact === '#fff' ||
    compact === '#ffffff' ||
    compact === '#ffffffff' ||
    /^rgb\(255,255,255\)$/.test(compact) ||
    /^rgba\(255,255,255,1(?:\.0+)?\)$/.test(compact)
  )
}

function tagSortValue(index?: number | null) {
  return index ?? Number.MAX_SAFE_INTEGER
}

export function AwesomeItemTags({ awesome }: AwesomeItemTagsProps) {
  const tags = [...(awesome.tags ?? [])].sort(
    (a, b) => tagSortValue(a.index) - tagSortValue(b.index)
  )

  if (tags.length === 0) {
    return null
  }

  return (
    <>
      <Separator />

      <span className="inline-flex items-center gap-0 leading-0">
        {tags.map(tag => {
          const icon = normalizeText(tag.icon)
          const color = normalizeText(tag.color)
          const useColorBlock = !icon && color && !isPureWhiteColor(color)
          const firstCharacter = normalizeText(tag.label)?.[0]?.toUpperCase() ?? '?'

          return (
            <Tooltip key={tag.id}>
              <TooltipTrigger
                className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm text-[11px] text-[#495057]"
                aria-label={`标签：${tag.label}`}
              >
                {icon ? (
                  <img src={icon} alt="" aria-hidden className="h-4 w-4 rounded-xs object-cover" />
                ) : useColorBlock ? (
                  <span
                    aria-hidden
                    className="h-3 w-3 rounded-xs border border-[#dee2e6]"
                    style={{ backgroundColor: color }}
                  />
                ) : (
                  <span aria-hidden className="font-en-sans text-[11px] leading-none">
                    {firstCharacter}
                  </span>
                )}
              </TooltipTrigger>

              <TooltipContent>{tag.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </span>
    </>
  )
}
