import type { ToolUIPart } from 'ai'
import { WrenchIcon } from 'lucide-react'

import { getStatusBadge } from '@/components/ai-elements/tool'
import { cn } from '@/utils/style'

export interface ToolCallReadSkillProps {
  className?: string
  part: ToolUIPart
}

function getSkillName(input: ToolUIPart['input']) {
  if (!input || typeof input !== 'object') {
    return undefined
  }

  const name = (input as Record<string, unknown>).name
  return typeof name === 'string' && name.trim() ? name.trim() : undefined
}

export function ToolCallReadSkill({ className, part }: ToolCallReadSkillProps) {
  const skillName = getSkillName(part.input)

  return (
    <div className={cn('not-prose w-fit max-w-full rounded-md border', className)}>
      <div className="flex max-w-full items-center gap-2 p-2 px-3">
        <WrenchIcon className="text-muted-foreground size-4" />
        <span className="min-w-0 text-sm font-medium wrap-break-word">
          {skillName ? `读取 Skill「${skillName}」` : '读取 Skill'}
        </span>
        {getStatusBadge(part.state)}
      </div>
    </div>
  )
}
