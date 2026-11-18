import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai'
import { ChevronDownIcon, ServerIcon, WrenchIcon } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ai-elements/deps/collapsible'
import { getStatusBadge, ToolInput, ToolOutput } from '@/components/ai-elements/tool'

export interface ToolCallMcpProps {
  part: ToolUIPart | DynamicToolUIPart
}

export function ToolCallMcp({ part }: ToolCallMcpProps) {
  const [serverName, ...toolNameParts] = getToolName(part).split('__')
  const toolName = toolNameParts.join(' / ') || serverName

  return (
    <Collapsible
      className="group not-prose w-full overflow-hidden rounded-md border"
      defaultOpen={false}
    >
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left">
        <span className="flex min-w-0 items-center gap-2">
          <ServerIcon aria-hidden className="text-muted-foreground size-4 shrink-0" />
          <span className="min-w-0 truncate text-sm font-medium">
            <span className="text-muted-foreground">{serverName}</span>
            <span className="text-muted-foreground px-1">/</span>
            <span>{toolName}</span>
          </span>
          {getStatusBadge(part.state)}
        </span>
        <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 border-t p-3">
        {part.state === 'input-streaming' && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <WrenchIcon aria-hidden className="size-4" />
            正在准备工具调用...
          </div>
        )}
        <ToolInput input={part.input ?? ''} />
        <ToolOutput errorText={part.errorText} output={part.output ?? ''} />
      </CollapsibleContent>
    </Collapsible>
  )
}
